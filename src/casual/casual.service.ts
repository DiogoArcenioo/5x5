import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomInt, randomUUID } from 'node:crypto';
import { DataSource, EntityManager } from 'typeorm';
import { RankedFieldEntry } from '../ranked/ranked-cycle.service';
import { RankedCampaign, RankedSimulationService } from '../ranked/ranked-simulation.service';
import { attachSimulationContext, campaignDiagnosticContext } from '../shared/simulation-diagnostics';

type CasualRunRow = {
  id: string;
  status: 'in_progress'|'completed';
  campaign: RankedCampaign;
  campaignRevision: number;
  expiresAt: Date;
  createdAt: Date;
  completedAt: Date|null;
};

@Injectable()
export class CasualService {
  constructor(private readonly dataSource:DataSource,private readonly simulation:RankedSimulationService){}

  start(){return this.dataSource.transaction(async manager=>{
    const field=await this.drawField(manager),campaign=this.simulation.create(field),id=randomUUID();
    const [run]=await manager.query<CasualRunRow[]>(`INSERT INTO casual_runs(id,campaign,expires_at) VALUES($1,$2::jsonb,now()+interval '48 hours') RETURNING id,status,campaign,campaign_revision AS "campaignRevision",expires_at AS "expiresAt",created_at AS "createdAt",completed_at AS "completedAt"`,[id,JSON.stringify(campaign)]);
    return run;
  });}

  async get(id:string){const [run]=await this.dataSource.query<CasualRunRow[]>(`${this.select()} WHERE id=$1 AND expires_at>=now()`,[id]);if(!run)throw new NotFoundException('Campanha normal não encontrada ou expirada.');return run;}

  strategy(id:string,revision:number,roles:string[]){return this.mutate(id,revision,'strategy',(manager,campaign)=>this.simulation.strategy(manager,campaign,roles));}
  reroll(id:string,revision:number){return this.mutate(id,revision,'draft.reroll',(manager,campaign)=>this.simulation.reroll(manager,campaign));}
  pick(id:string,revision:number,slug:string,slot:number){return this.mutate(id,revision,'draft.pick',(manager,campaign)=>this.simulation.pick(manager,campaign,slug,slot));}
  layout(id:string,revision:number,slugs:Array<string|null>,roles:string[]){return this.mutate(id,revision,'draft.layout',(manager,campaign)=>this.simulation.layout(manager,campaign,slugs,roles));}
  finalize(id:string,revision:number){return this.mutate(id,revision,'draft.finalize',(manager,campaign)=>this.simulation.finalize(manager,campaign));}

  advance(id:string,revision:number){return this.dataSource.transaction(async manager=>{
    let run:CasualRunRow|undefined;
    try {
    run=await this.lock(manager,id,revision);const result=this.simulation.advance(run.campaign),nextRevision=run.campaignRevision+1,completed=result.campaign.stage==='completed';
    await manager.query(`UPDATE casual_runs SET campaign=$2::jsonb,campaign_revision=$3,status=CASE WHEN $4 THEN 'completed' ELSE status END,completed_at=CASE WHEN $4 THEN COALESCE(completed_at,now()) ELSE completed_at END,updated_at=now() WHERE id=$1`,[id,JSON.stringify(result.campaign),nextRevision,completed]);
    const [updated]=await manager.query<CasualRunRow[]>(`${this.select()} WHERE id=$1`,[id]);
    return{run:updated,campaign:result.campaign,matches:result.matches,awarded:0,eventType:null};
    } catch(error) { throw attachSimulationContext(error,campaignDiagnosticContext(id,'advance',run?.campaign)); }
  });}

  private mutate(id:string,revision:number,action:string,change:(manager:EntityManager,campaign:RankedCampaign)=>RankedCampaign|Promise<RankedCampaign>){return this.dataSource.transaction(async manager=>{
    let run:CasualRunRow|undefined;
    try {
    run=await this.lock(manager,id,revision);const campaign=await change(manager,run.campaign),nextRevision=run.campaignRevision+1;
    await manager.query('UPDATE casual_runs SET campaign=$2::jsonb,campaign_revision=$3,updated_at=now() WHERE id=$1',[id,JSON.stringify(campaign),nextRevision]);
    const [updated]=await manager.query<CasualRunRow[]>(`${this.select()} WHERE id=$1`,[id]);return{run:updated,campaign};
    } catch(error) { throw attachSimulationContext(error,campaignDiagnosticContext(id,action,run?.campaign)); }
  });}

  private async lock(manager:EntityManager,id:string,revision:number){const [run]=await manager.query<CasualRunRow[]>(`${this.select()} WHERE id=$1 AND expires_at>=now() FOR UPDATE`,[id]);if(!run)throw new NotFoundException('Campanha normal não encontrada ou expirada.');if(run.status!=='in_progress')throw new ConflictException('Esta campanha normal já foi encerrada.');if(run.campaignRevision!==revision)throw new ConflictException({code:'CAMPAIGN_REVISION_CONFLICT',message:'A campanha foi atualizada em outra solicitação.',mode:'casual',run});return run;}
  private select(){return`SELECT id,status,campaign,campaign_revision AS "campaignRevision",expires_at AS "expiresAt",created_at AS "createdAt",completed_at AS "completedAt" FROM casual_runs`;}

  private async drawField(manager:EntityManager):Promise<RankedFieldEntry[]>{
    const rows=await manager.query<Array<{teamSlug:string;year:number}>>(`SELECT t.slug AS "teamSlug",pty.year::integer AS year FROM teams t JOIN player_team_years pty ON pty.team_id=t.id WHERE t.active=true GROUP BY t.id,t.slug,pty.year HAVING count(DISTINCT pty.player_id)>=5 ORDER BY t.slug,pty.year`);
    const byTeam=new Map<string,number[]>();for(const row of rows){const years=byTeam.get(row.teamSlug)||[];years.push(Number(row.year));byTeam.set(row.teamSlug,years);}if(byTeam.size<15)throw new ConflictException('O catálogo precisa ter ao menos 15 times ativos com lineups completas.');
    const teams=this.shuffle([...byTeam.keys()]).slice(0,15);return teams.map(teamSlug=>{const years=byTeam.get(teamSlug)!;return{teamSlug,year:years[randomInt(years.length)]};});
  }
  private shuffle<T>(items:T[]){const result=[...items];for(let index=result.length-1;index>0;index--){const selected=randomInt(index+1);[result[index],result[selected]]=[result[selected],result[index]];}return result;}
}
