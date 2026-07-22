import { ConflictException, Injectable } from '@nestjs/common';
import { randomInt } from 'node:crypto';
import { EntityManager } from 'typeorm';
import { RankedFieldEntry } from './ranked-cycle.service';

const ROLES = ['entry', 'awper', 'support', 'rifler', 'lurker', 'trader'] as const;
type RoleCode = typeof ROLES[number];
type SkillKey = 'firepower'|'entrying'|'trading'|'opening'|'clutching'|'sniping'|'utility';
type PlayerHistory = {teamSlug:string;teamName:string;year:number};
type PlayerVersion = Record<SkillKey, number> & { slug:string; nick:string; overall:number; code:string; countryName:string; year:number; teamSlug:string; teamName:string; history:PlayerHistory[] };
type FitEffect = {key:SkillKey;label:string;value:number;target:number;delta:number;status:'elite'|'good'|'critical'|'weak'};
type EvaluationPlayer = { player:Omit<PlayerVersion,'history'>; role:RoleCode; roleLabel:string; fit:{score:number;weighted:number;modifier:number;status:string;effects:FitEffect[]}; contribution:number };
type TeamEvaluation = { strength:number; base:number; compositionBonus:number; chemistryBonus:number; players:EvaluationPlayer[] };
type ChemistryPair = {playerA:string;playerB:string;teammateTeams:Array<{teamSlug:string;teamName:string}>;sameCountry:boolean;countryCode:string;countryName:string;teamBonus:number;countryBonus:number;totalBonus:number;reason:string};
export type LineupAnalysis = {evaluation:TeamEvaluation;strength:number;base:number;strengthBeforeChemistry:number;compositionBonus:number;chemistryBonus:number;chemistry:number;pairCount:number;teammatePairCount:number;countryPairCount:number;totalPairs:number;chemistryPairs:ChemistryPair[];chemistryPairSummary:string;strengths:string[];weaknesses:string[]};
type CampaignTeam = { id:string; name:string; tag:string; year:number|string; strength:number; evaluation:TeamEvaluation; wins:number; losses:number; status:'playing'|'qualified'|'eliminated'; opponents:string[]; isUser?:boolean };
type DraftRosterEntry = { slug:string; year:number; teamSlug:string };
type DraftPool = { year:number; teamSlug:string; slugs:string[] };
type RoundEvent = { aWon:boolean; chanceA:number; deathsA:number[]; deathsB:number[]; killsA:number[]; killsB:number[]; assistsA:number[]; assistsB:number[]; scoreA:number; scoreB:number; period:'regulation'|'overtime'; overtimePeriod:number };
type MapResult = { name:string; aScore:number; bScore:number; winnerId:string; mapStrengthA:number; mapStrengthB:number; overtimePeriods:number; rounds:RoundEvent[] };
type CampaignMatch = { aId:string;bId:string;teamA:string;teamB:string;winnerId:string;loserId:string;format:'BO1'|'BO3'|'MD5';score:string;chanceA:number;effectiveA:number;effectiveB:number;isUser:boolean;pool:string;mapResults:MapResult[] };
export type RankedCampaign = {
  version:2; seed:number; stage:'strategy'|'draft'|'swiss'|'playoffs'|'completed'; roles:RoleCode[];
  draft:{roster:Array<DraftRosterEntry|null>;currentPool:DraftPool|null;rerolls:number}; field:RankedFieldEntry[];
  analysis:LineupAnalysis|null;
  teams:CampaignTeam[]; swissRound:number; swissHistory:Array<{round:number;matches:CampaignMatch[]}>;
  playoffBracket:Array<{key:'quarter'|'semi'|'final';label:string;matches:Array<{a:CampaignTeam|null;b:CampaignTeam|null;result:CampaignMatch|null}>}>;
  playoffStage:'quarter'|'semi'|'final'; outcome:null|{
    kind:'eliminated'|'champion'; championName:string;
    eliminationStage?:'swiss'|'quarter'|'semi'|'final'; eliminationRound?:number; eliminationRecord?:string;
  };
};

const ROLE_WEIGHTS:Record<RoleCode,Partial<Record<SkillKey,number>>> = {
  awper:{sniping:.38,opening:.20,firepower:.15,clutching:.10,trading:.07,utility:.06,entrying:.04},entry:{entrying:.30,firepower:.25,opening:.20,trading:.10,utility:.07,clutching:.05,sniping:.03},
  support:{utility:.30,trading:.22,firepower:.15,clutching:.12,entrying:.08,opening:.08,sniping:.05},lurker:{clutching:.28,firepower:.20,trading:.18,opening:.12,utility:.10,entrying:.07,sniping:.05},
  rifler:{firepower:.30,trading:.22,opening:.15,entrying:.13,clutching:.10,utility:.07,sniping:.03},trader:{trading:.32,firepower:.22,entrying:.14,utility:.10,opening:.09,clutching:.08,sniping:.05},
};
const ROLE_REQUIREMENTS:Record<RoleCode,Array<[SkillKey,number,number,number,number,number]>>={
  awper:[['sniping',60,30,85,9,4],['opening',50,25,75,4,2],['clutching',45,20,75,2,1]],entry:[['entrying',55,25,80,6,3],['opening',55,25,80,5,3],['firepower',50,25,78,4,2]],
  support:[['utility',55,25,80,6,3],['trading',50,25,75,4,2],['firepower',40,15,70,3,1]],lurker:[['clutching',55,25,82,7,4],['firepower',48,22,75,4,2],['trading',45,20,72,3,1]],
  rifler:[['firepower',55,25,82,7,4],['trading',50,25,76,4,2],['opening',42,18,72,3,1]],trader:[['trading',55,25,82,8,4],['firepower',48,22,75,4,2],['entrying',42,18,72,3,1]],
};
const MAPS:Record<string,Partial<Record<SkillKey,number>>> = {
  Mirage:{opening:.24,sniping:.20,clutching:.18,firepower:.16,trading:.12,utility:.10}, Inferno:{utility:.25,trading:.22,firepower:.16,clutching:.14,entrying:.13,opening:.10},
  Nuke:{utility:.24,trading:.22,clutching:.17,firepower:.15,opening:.12,entrying:.10}, Ancient:{firepower:.23,opening:.21,trading:.19,utility:.15,entrying:.13,clutching:.09},
  Anubis:{entrying:.22,firepower:.21,trading:.18,opening:.16,utility:.13,clutching:.10},
};
const BALANCED:RoleCode[]=['entry','awper','support','rifler','lurker'];
const CORE_ROLES:RoleCode[]=['entry','awper','support'];
const ROLE_LABELS:Record<RoleCode,string>={entry:'Entry Fragger',awper:'AWPer',support:'Support',rifler:'Rifler',lurker:'Lurker',trader:'Trader'};
const SKILL_LABELS:Record<SkillKey,string>={firepower:'Firepower',entrying:'Entrying',trading:'Trading',opening:'Opening',clutching:'Clutching',sniping:'Sniping',utility:'Utility'};
const REGULATION_MAX_ROUNDS=24;
const REGULATION_WIN_SCORE=13;
const OVERTIME_MAX_ROUNDS=6;
const OVERTIME_WIN_ROUNDS=4;

@Injectable()
export class RankedSimulationService {
  create(field:RankedFieldEntry[]):RankedCampaign {
    return {version:2,seed:randomInt(1,2_147_483_647),stage:'strategy',roles:[...BALANCED],draft:{roster:[null,null,null,null,null],currentPool:null,rerolls:0},field,analysis:null,teams:[],swissRound:0,swissHistory:[],playoffBracket:[],playoffStage:'quarter',outcome:null};
  }

  async strategy(manager:EntityManager,campaign:RankedCampaign,roles:string[]):Promise<RankedCampaign>{
    this.assertStage(campaign,['strategy','draft']);
    if(campaign.stage==='draft'&&campaign.draft.roster.some(Boolean)) throw new ConflictException('A formação não pode ser reiniciada depois da primeira escolha.');
    campaign.roles=this.validRoles(roles); campaign.analysis=null;
    if(campaign.stage==='strategy'){campaign.stage='draft';campaign.draft.currentPool=await this.drawPool(manager,campaign.draft.roster);}
    return campaign;
  }
  async reroll(manager:EntityManager,campaign:RankedCampaign):Promise<RankedCampaign>{
    this.assertStage(campaign,['draft']); if(campaign.draft.rerolls>=2) throw new ConflictException('Os dois novos sorteios já foram usados.');
    campaign.draft.rerolls++; campaign.draft.currentPool=await this.drawPool(manager,campaign.draft.roster); return campaign;
  }
  async pick(manager:EntityManager,campaign:RankedCampaign,slug:string,slot:number):Promise<RankedCampaign>{
    this.assertStage(campaign,['draft']); if(!Number.isInteger(slot)||slot<0||slot>4||campaign.draft.roster[slot]) throw new ConflictException('Posição do draft inválida.');
    const pool=campaign.draft.currentPool; if(!pool?.slugs.includes(slug)) throw new ConflictException('Este jogador não pertence ao sorteio oficial atual.');
    if(campaign.draft.roster.some(item=>item?.slug===slug)) throw new ConflictException('Este jogador já foi escolhido.');
    campaign.draft.roster[slot]={slug,year:pool.year,teamSlug:pool.teamSlug};
    const complete=campaign.draft.roster.every(Boolean); campaign.draft.currentPool=complete?null:await this.drawPool(manager,campaign.draft.roster); campaign.analysis=complete?await this.analyzeRoster(manager,campaign):null; return campaign;
  }
  async layout(manager:EntityManager,campaign:RankedCampaign,slugs:Array<string|null>,roles:string[]):Promise<RankedCampaign>{
    this.assertStage(campaign,['draft']); const validRoles=this.validRoles(roles),selected=slugs.filter((slug):slug is string=>typeof slug==='string'&&Boolean(slug)); if(slugs.length!==5||new Set(selected).size!==selected.length) throw new ConflictException('Layout inválido.');
    const bySlug=new Map(campaign.draft.roster.filter((item):item is DraftRosterEntry=>Boolean(item)).map(item=>[item.slug,item]));
    if(bySlug.size!==selected.length||selected.some(slug=>!bySlug.has(slug))) throw new ConflictException('O layout contém jogadores que não foram sorteados.');
    campaign.draft.roster=slugs.map(slug=>slug?bySlug.get(slug)!:null); campaign.roles=validRoles; campaign.analysis=campaign.draft.roster.every(Boolean)?await this.analyzeRoster(manager,campaign):null; return campaign;
  }
  async finalize(manager:EntityManager,campaign:RankedCampaign):Promise<RankedCampaign>{
    this.assertStage(campaign,['draft']); if(!campaign.draft.roster.every(Boolean)) throw new ConflictException('Escolha cinco jogadores antes de disputar o Major.');
    const all=await this.loadPlayers(manager),byKey=new Map(all.map(player=>[`${player.slug}:${player.year}:${player.teamSlug}`,player]));
    const userPlayers=campaign.draft.roster.map(item=>byKey.get(`${item!.slug}:${item!.year}:${item!.teamSlug}`)).filter((item):item is PlayerVersion=>Boolean(item));
    if(userPlayers.length!==5) throw new ConflictException('A lineup possui jogador ou temporada que não está mais ativa no catálogo.');
    const analysis=this.analyze(userPlayers,campaign.roles); campaign.analysis=analysis; const userEvaluation=analysis.evaluation;
    const teams:CampaignTeam[]=[{id:'user',name:'SEU TIME · MISTO',tag:'VOCÊ',year:'MISTO',strength:userEvaluation.strength,evaluation:userEvaluation,wins:0,losses:0,status:'playing',opponents:[],isUser:true}];
    for(const field of campaign.field){
      const players=all.filter(player=>player.teamSlug===field.teamSlug&&player.year===Number(field.year)); if(players.length<5) throw new ConflictException(`A lineup ${field.teamSlug} ${field.year} deixou de ser elegível.`);
      const evaluation=this.bestEvaluation(players.slice(0,5)),teamName=players[0]?.teamName||field.teamSlug; teams.push({id:field.teamSlug,name:`${teamName.toUpperCase()} · ${field.year}`,tag:field.teamSlug.slice(0,6).toUpperCase(),year:field.year,strength:evaluation.strength,evaluation,wins:0,losses:0,status:'playing',opponents:[]});
    }
    campaign.teams=teams;campaign.stage='swiss';campaign.swissRound=0;campaign.swissHistory=[];return campaign;
  }

  advance(campaign:RankedCampaign):{campaign:RankedCampaign;matches:CampaignMatch[];awarded:number;eventType:string|null}{
    if(campaign.stage==='swiss') return this.advanceSwiss(campaign);
    if(campaign.stage==='playoffs') return this.advancePlayoffs(campaign);
    throw new ConflictException('A campanha não possui uma rodada disponível.');
  }

  private advanceSwiss(campaign:RankedCampaign){
    const round=campaign.swissRound+1,matches=this.buildSwiss(campaign,round); this.applyMatches(campaign.teams,matches); campaign.swissRound=round;campaign.swissHistory.push({round,matches});
    const userMatch=matches.find(match=>match.isUser),won=userMatch?.winnerId==='user',awarded=won?10:0,user=campaign.teams.find(team=>team.id==='user')!;
    if(user.status!=='playing'){
      while(campaign.swissRound<5&&campaign.teams.some(team=>team.status==='playing')){const nextRound=campaign.swissRound+1,next=this.buildSwiss(campaign,nextRound);this.applyMatches(campaign.teams,next);campaign.swissRound=nextRound;campaign.swissHistory.push({round:nextRound,matches:next});}
      if(user.status==='qualified'){campaign.stage='playoffs';this.startPlayoffs(campaign);}else{campaign.stage='playoffs';this.startPlayoffs(campaign);this.finishPlayoffs(campaign,'quarter',{stage:'swiss',round,record:`${user.wins}-${user.losses}`});}
    }
    return {campaign,matches,awarded,eventType:won?'swiss_win':null};
  }
  private advancePlayoffs(campaign:RankedCampaign){
    const current=campaign.playoffBracket.find(round=>round.key===campaign.playoffStage)!; const format=current.key==='final'?'MD5':'BO3';
    const matches=current.matches.filter(match=>match.a&&match.b).map((match,index)=>({...this.series(match.a!,match.b!,this.hash(`${campaign.seed}:playoff:${current.key}:${index}`),format),pool:'PLAYOFFS'}));
    current.matches.forEach(match=>{match.result=matches.find(result=>(result.aId===match.a?.id&&result.bId===match.b?.id)||(result.aId===match.b?.id&&result.bId===match.a?.id))||null;});
    const userResult=matches.find(match=>match.isUser),won=userResult?.winnerId==='user'; let awarded=0,eventType:string|null=null;
    if(won){awarded=current.key==='final'?50:30;eventType=current.key==='quarter'?'quarterfinal_win':current.key==='semi'?'semifinal_win':'final_win';}
    if(!won){this.finishPlayoffs(campaign,current.key,{stage:current.key});return{campaign,matches,awarded,eventType};}
    if(current.key==='final'){campaign.stage='completed';campaign.outcome={kind:'champion',championName:'SEU TIME · MISTO'};return{campaign,matches,awarded,eventType};}
    const winners=matches.map(result=>campaign.teams.find(team=>team.id===result.winnerId)!).filter(Boolean),nextKey=current.key==='quarter'?'semi':'final',next=campaign.playoffBracket.find(round=>round.key===nextKey)!;
    next.matches=nextKey==='semi'?[{a:winners[0],b:winners[1],result:null},{a:winners[2],b:winners[3],result:null}]:[{a:winners[0],b:winners[1],result:null}];campaign.playoffStage=nextKey;return{campaign,matches,awarded,eventType};
  }

  private startPlayoffs(campaign:RankedCampaign){
    const qualified=[...campaign.teams.filter(team=>team.status==='qualified')].sort((a,b)=>b.wins-a.wins||a.losses-b.losses||a.id.localeCompare(b.id)).slice(0,8);
    const pairs=[[qualified[0],qualified[7]],[qualified[3],qualified[4]],[qualified[1],qualified[6]],[qualified[2],qualified[5]]];
    campaign.playoffBracket=[{key:'quarter',label:'QUARTAS DE FINAL',matches:pairs.map(([a,b])=>({a,b,result:null}))},{key:'semi',label:'SEMIFINAIS',matches:[{a:null,b:null,result:null},{a:null,b:null,result:null}]},{key:'final',label:'FINAL',matches:[{a:null,b:null,result:null}]}];campaign.playoffStage='quarter';
  }
  private finishPlayoffs(campaign:RankedCampaign,start:'quarter'|'semi'|'final',elimination:{stage:'swiss'|'quarter'|'semi'|'final';round?:number;record?:string}){
    let key:'quarter'|'semi'|'final'=start;
    while(true){
      const current=campaign.playoffBracket.find(round=>round.key===key)!;
      const format=current.key==='final'?'MD5':'BO3';
      current.matches.forEach((match,index)=>{if(match.a&&match.b&&!match.result)match.result={...this.series(match.a,match.b,this.hash(`${campaign.seed}:playoff:${current.key}:${index}`),format),pool:'PLAYOFFS'};});
      const winners=current.matches.map(match=>campaign.teams.find(team=>team.id===match.result?.winnerId)!).filter(Boolean);
      if(current.key==='final'){const champion=winners[0];campaign.playoffStage='final';campaign.stage='completed';campaign.outcome={kind:'eliminated',championName:champion?.name||'Campeão definido',eliminationStage:elimination.stage,eliminationRound:elimination.round,eliminationRecord:elimination.record};return;}
      const nextKey:'semi'|'final'=current.key==='quarter'?'semi':'final',next=campaign.playoffBracket.find(round=>round.key===nextKey)!;
      next.matches=nextKey==='semi'?[{a:winners[0],b:winners[1],result:null},{a:winners[2],b:winners[3],result:null}]:[{a:winners[0],b:winners[1],result:null}];
      campaign.playoffStage=nextKey;key=nextKey;
    }
  }
  private buildSwiss(campaign:RankedCampaign,round:number){
    const pools=new Map<string,CampaignTeam[]>();for(const team of campaign.teams.filter(team=>team.status==='playing')){const key=`${team.wins}-${team.losses}`,items=pools.get(key)||[];items.push(team);pools.set(key,items);}
    const ordered=[...pools.entries()].sort(([a],[b])=>{const[aw,al]=a.split('-').map(Number),[bw,bl]=b.split('-').map(Number);return bw-aw||al-bl;});const matches:CampaignMatch[]=[];let floating:CampaignTeam|null=null;
    for(const[,items]of ordered){
      const poolItems:CampaignTeam[]=floating?[floating,...items]:[...items];
      const available:CampaignTeam[]=this.shuffle(poolItems,this.rng(this.hash(`${campaign.seed}:${round}:${items[0]?.id}`)));
      floating=null;
      while(available.length>1){
        const a=available.shift()!;
        const fresh:number[]=available.map((team:CampaignTeam,index:number)=>a.opponents.includes(team.id)?-1:index).filter((index:number)=>index>=0);
        const index=(fresh.length?fresh:[0])[0];
        const b=available.splice(index,1)[0];
        const format:'BO1'|'BO3'=a.wins===2||a.losses===2||b.wins===2||b.losses===2?'BO3':'BO1';
        matches.push({...this.series(a,b,this.hash(`${campaign.seed}:${round}:${a.id}:${b.id}`),format),pool:`${a.wins}–${a.losses}`});
      }
      if(available.length)floating=available[0];
    }
    if(floating) throw new ConflictException('Não foi possível parear todos os times desta rodada.');return matches;
  }
  private applyMatches(teams:CampaignTeam[],matches:CampaignMatch[]){for(const match of matches){const winner=teams.find(team=>team.id===match.winnerId)!,loser=teams.find(team=>team.id===match.loserId)!;winner.wins++;loser.losses++;winner.opponents.push(loser.id);loser.opponents.push(winner.id);if(winner.wins>=3)winner.status='qualified';if(loser.losses>=3)loser.status='eliminated';}}

  private series(a:CampaignTeam,b:CampaignTeam,seed:number,format:'BO1'|'BO3'|'MD5'):CampaignMatch{
    const rng=this.rng(seed),maps=this.mapOrder(a,b,format,rng),target=format==='MD5'?3:format==='BO3'?2:1,results:MapResult[]=[];let aMaps=0,bMaps=0;
    for(const map of maps){if(aMaps>=target||bMaps>=target)break;const result=this.map(a,b,map,rng);results.push(result);if(result.winnerId===a.id)aMaps++;else bMaps++;}
    const winnerId=aMaps>bMaps?a.id:b.id,isUser=Boolean(a.isUser||b.isUser);if(!isUser)results.forEach(result=>{result.rounds=[];});return{aId:a.id,bId:b.id,teamA:a.name,teamB:b.name,winnerId,loserId:winnerId===a.id?b.id:a.id,format,score:format==='BO1'?`${results[0].aScore}–${results[0].bScore}`:`${aMaps}–${bMaps}`,chanceA:1/(1+Math.pow(10,(b.strength-a.strength)/30)),effectiveA:a.strength,effectiveB:b.strength,isUser,pool:'',mapResults:results};
  }
  private map(a:CampaignTeam,b:CampaignTeam,name:string,rng:()=>number):MapResult{
    const strengthA=this.mapStrength(a,name),strengthB=this.mapStrength(b,name),formA=(rng()+rng()-1)*2.5,formB=(rng()+rng()-1)*2.5;let scoreA=0,scoreB=0;const rounds:RoundEvent[]=[];
    const playRound=(period:'regulation'|'overtime',overtimePeriod:number)=>{const effectiveA=strengthA+formA+(this.roundEdge(a)-this.roundEdge(b))*.08+(rng()+rng()-1)*2.2,effectiveB=strengthB+formB,chanceA=Math.max(.28,Math.min(.72,1/(1+Math.pow(10,(effectiveB-effectiveA)/90)))),aWon=rng()<chanceA;if(aWon)scoreA++;else scoreB++;const loser=3+Math.floor(rng()*3),winner=Math.floor(rng()*Math.min(4,loser)),countA=aWon?winner:loser,countB=aWon?loser:winner,deaths=(count:number)=>this.shuffle([0,1,2,3,4],rng).slice(0,count);rounds.push({aWon,chanceA,deathsA:deaths(countA),deathsB:deaths(countB),killsA:Array.from({length:countB},()=>this.playerIndex(a,rng()<.32?'opening':'firepower',rng)),killsB:Array.from({length:countA},()=>this.playerIndex(b,rng()<.32?'opening':'firepower',rng)),assistsA:Array.from({length:Math.floor(countB*(.25+rng()*.45))},()=>this.playerIndex(a,'trading',rng)),assistsB:Array.from({length:Math.floor(countA*(.25+rng()*.45))},()=>this.playerIndex(b,'trading',rng)),scoreA,scoreB,period,overtimePeriod});return aWon;};
    while(scoreA<REGULATION_WIN_SCORE&&scoreB<REGULATION_WIN_SCORE&&scoreA+scoreB<REGULATION_MAX_ROUNDS)playRound('regulation',0);
    let overtimePeriods=0;
    while(scoreA===scoreB){overtimePeriods++;let overtimeA=0,overtimeB=0;while(overtimeA<OVERTIME_WIN_ROUNDS&&overtimeB<OVERTIME_WIN_ROUNDS&&overtimeA+overtimeB<OVERTIME_MAX_ROUNDS){if(playRound('overtime',overtimePeriods))overtimeA++;else overtimeB++;}}
    return{name,aScore:scoreA,bScore:scoreB,winnerId:scoreA>scoreB?a.id:b.id,mapStrengthA:strengthA,mapStrengthB:strengthB,overtimePeriods,rounds};
  }
  private mapOrder(a:CampaignTeam,b:CampaignTeam,format:string,rng:()=>number){const pool=this.shuffle(Object.keys(MAPS),rng),rank=(team:CampaignTeam,map:string)=>this.mapStrength(team,map);if(format==='MD5')return pool.sort((x,y)=>rank(a,y)+rank(b,y)-rank(a,x)-rank(b,x));if(format==='BO1'){while(pool.length>1){const team=pool.length%2?a:b;pool.splice(pool.reduce((worst,_,index,list)=>rank(team,list[index])<rank(team,list[worst])?index:worst,0),1);}return pool;}const pick=(team:CampaignTeam)=>pool.splice(pool.reduce((best,_,index,list)=>rank(team,list[index])>rank(team,list[best])?index:best,0),1)[0];return[pick(a),pick(b),pool[Math.floor(rng()*pool.length)]];}
  private mapStrength(team:CampaignTeam,map:string){const tactical=Object.entries(MAPS[map]).reduce((sum,[key,weight])=>sum+this.skillAverage(team,key as SkillKey)*(weight||0),0);return Number((team.strength*.72+tactical*.28).toFixed(2));}
  private skillAverage(team:CampaignTeam,key:SkillKey){return team.evaluation.players.reduce((sum,item)=>sum+item.player[key],0)/Math.max(1,team.evaluation.players.length);}
  private roundEdge(team:CampaignTeam){return this.skillAverage(team,'opening')*.25+this.skillAverage(team,'entrying')*.18+this.skillAverage(team,'trading')*.22+this.skillAverage(team,'utility')*.20+this.skillAverage(team,'clutching')*.15;}
  private playerIndex(team:CampaignTeam,key:SkillKey,rng:()=>number){const weights=team.evaluation.players.map(item=>Math.max(5,item.player[key]+item.fit.score*.25));let roll=rng()*weights.reduce((sum,value)=>sum+value,0);for(let index=0;index<weights.length;index++){roll-=weights[index];if(roll<=0)return index;}return weights.length-1;}

  private evaluate(players:PlayerVersion[],roles:RoleCode[]):TeamEvaluation{
    const evaluated=players.slice(0,5).map((player,index)=>{
      const role=roles[index]||'rifler',weights=ROLE_WEIGHTS[role];
      const weighted=Object.entries(weights).reduce((sum,[key,weight])=>sum+player[key as SkillKey]*(weight||0),0);
      const effects:FitEffect[]=ROLE_REQUIREMENTS[role].map(([key,target,critical,elite,penalty,bonus])=>{
        const value=player[key],delta=value<target?-penalty*Math.min(1,(target-value)/Math.max(1,target-critical)):bonus*Math.min(1,(value-target)/Math.max(1,elite-target));
        return{key,label:SKILL_LABELS[key],value,target,delta:Number(delta.toFixed(3)),status:value>=elite?'elite':value>=target?'good':value<=critical?'critical':'weak'};
      });
      const modifier=effects.reduce((sum,effect)=>sum+effect.delta,0),score=Math.round(Math.max(0,Math.min(100,weighted+modifier))),contribution=player.overall*.35+score*.65;
      return{player:this.publicPlayer(player),role,roleLabel:ROLE_LABELS[role],fit:{score,weighted:Math.round(weighted),modifier:Number(modifier.toFixed(1)),status:score>=75?'EXCELENTE':score>=62?'BOM':score>=48?'REGULAR':'RUIM',effects},contribution};
    });
    const base=evaluated.reduce((sum,item)=>sum+item.contribution,0)/evaluated.length,unique=new Set(roles).size;
    let composition=CORE_ROLES.reduce((sum,role)=>sum+(roles.includes(role) ? .65 : -2.25),0); composition+=unique>=5?1.25:unique===4?.6:unique<=2?-1.5:0;
    let chemistry=0;for(let i=0;i<players.length;i++)for(let j=i+1;j<players.length;j++){const teamMate=players[i].history.some(first=>players[j].history.some(second=>first.teamSlug===second.teamSlug));if(teamMate)chemistry+=.4;if(players[i].code&&players[i].code===players[j].code)chemistry+=.2;}
    return{strength:Number((base+composition+chemistry).toFixed(3)),base,compositionBonus:composition,chemistryBonus:chemistry,players:evaluated};
  }
  private analyze(players:PlayerVersion[],roles:RoleCode[]):LineupAnalysis{
    const evaluation=this.evaluate(players,roles),pairs:ChemistryPair[]=[]; let totalPairs=0;
    for(let i=0;i<players.length;i++)for(let j=i+1;j<players.length;j++){
      totalPairs++; const first=players[i],second=players[j],seen=new Set<string>();
      const teammateTeams=first.history.flatMap(history=>second.history.some(other=>other.teamSlug===history.teamSlug)&&!seen.has(history.teamSlug)?(seen.add(history.teamSlug),[{teamSlug:history.teamSlug,teamName:history.teamName}]):[]).sort((a,b)=>a.teamName.localeCompare(b.teamName));
      const sameCountry=Boolean(first.code)&&first.code===second.code;if(!teammateTeams.length&&!sameCountry)continue;
      const teamBonus=teammateTeams.length?.4:0,countryBonus=sameCountry?.2:0,reasons:string[]=[];
      if(teammateTeams.length)reasons.push(`Já defenderam juntos ${teammateTeams.map(team=>team.teamName).join(', ')}, independentemente da temporada (+${teamBonus.toFixed(1)})`);
      if(sameCountry)reasons.push(`Mesma nacionalidade: ${first.countryName||first.code} (+${countryBonus.toFixed(1)})`);
      pairs.push({playerA:first.nick,playerB:second.nick,teammateTeams,sameCountry,countryCode:first.code,countryName:first.countryName,teamBonus,countryBonus,totalBonus:teamBonus+countryBonus,reason:`${reasons.join(' · ')} · bônus total +${(teamBonus+countryBonus).toFixed(1)}`});
    }
    const teammatePairCount=pairs.filter(pair=>pair.teammateTeams.length).length,countryPairCount=pairs.filter(pair=>pair.sameCountry).length,pairCount=pairs.length;
    const strengths:string[]=[],weaknesses:string[]=[],eliteFits=evaluation.players.filter(item=>item.fit.score>=75),weakFits=evaluation.players.filter(item=>item.fit.score<48);
    eliteFits.slice(0,3).forEach(item=>strengths.push(`${item.player.nick} tem encaixe excelente como ${item.roleLabel} (FIT ${item.fit.score}).`));
    evaluation.players.flatMap(item=>item.fit.effects.filter(effect=>effect.status==='elite').map(effect=>({...effect,nick:item.player.nick,role:item.roleLabel}))).sort((a,b)=>(b.value-b.target)-(a.value-a.target)).slice(0,2).forEach(effect=>strengths.push(`${effect.nick}: ${effect.label} ${effect.value}, acima da meta ${effect.target} para ${effect.role}.`));
    if(teammatePairCount)strengths.push(`${teammatePairCount} dupla(s) já jogou(aram) junta(s) em alguma lineup histórica.`);
    if(countryPairCount)strengths.push(`${countryPairCount} dupla(s) compartilha(m) a mesma nacionalidade.`);
    if(evaluation.compositionBonus>0)strengths.push(`A distribuição das funções acrescenta +${evaluation.compositionBonus.toFixed(1)} à força.`);
    const topContribution=[...evaluation.players].sort((a,b)=>b.contribution-a.contribution)[0];if(topContribution)strengths.push(`${topContribution.player.nick} entrega a maior contribuição-base da lineup (${topContribution.contribution.toFixed(1)}).`);
    if(!strengths.length)strengths.push('A lineup não possui bônus técnico relevante, mas está completa para a simulação.');
    weakFits.slice(0,3).forEach(item=>weaknesses.push(`${item.player.nick} tem encaixe baixo como ${item.roleLabel} (FIT ${item.fit.score}).`));
    evaluation.players.flatMap(item=>item.fit.effects.filter(effect=>effect.delta<0).map(effect=>({...effect,nick:item.player.nick,role:item.roleLabel}))).sort((a,b)=>a.delta-b.delta).slice(0,3).forEach(effect=>weaknesses.push(`${effect.nick}: ${effect.label} ${effect.value}, abaixo da meta ${effect.target} para ${effect.role}.`));
    if(!pairCount)weaknesses.push('Nenhuma dupla já jogou junta ou compartilha a mesma nacionalidade; a lineup não recebe bônus de entrosamento.');else if(pairCount<3)weaknesses.push(`Entrosamento limitado: somente ${pairCount} de ${totalPairs} duplas possuem algum vínculo.`);
    const missing=CORE_ROLES.filter(role=>!roles.includes(role)).map(role=>ROLE_LABELS[role]);if(missing.length)weaknesses.push(`Faltam funções centrais na composição: ${missing.join(', ')}.`);
    if(evaluation.compositionBonus<0)weaknesses.push(`A distribuição atual das funções retira ${Math.abs(evaluation.compositionBonus).toFixed(1)} da força.`);if(!weaknesses.length)weaknesses.push('Nenhuma penalidade relevante foi identificada nesta lineup.');
    const maximum=totalPairs*.6,chemistry=maximum?Math.round(100*evaluation.chemistryBonus/maximum):0;
    return{evaluation,strength:evaluation.strength,base:evaluation.base,strengthBeforeChemistry:evaluation.base+evaluation.compositionBonus,compositionBonus:evaluation.compositionBonus,chemistryBonus:evaluation.chemistryBonus,chemistry,pairCount,teammatePairCount,countryPairCount,totalPairs,chemistryPairs:pairs,chemistryPairSummary:`${pairCount} de ${totalPairs} duplas com vínculo · ${teammatePairCount} por histórico de time · ${countryPairCount} por nacionalidade`,strengths,weaknesses};
  }
  private async analyzeRoster(manager:EntityManager,campaign:RankedCampaign):Promise<LineupAnalysis>{
    const all=await this.loadPlayers(manager),byKey=new Map(all.map(player=>[`${player.slug}:${player.year}:${player.teamSlug}`,player]));
    const players=campaign.draft.roster.map(item=>item?byKey.get(`${item.slug}:${item.year}:${item.teamSlug}`):null).filter((item):item is PlayerVersion=>Boolean(item));
    if(players.length!==5)throw new ConflictException('A lineup possui jogador ou temporada que não está mais ativa no catálogo.');return this.analyze(players,campaign.roles);
  }
  private bestEvaluation(players:PlayerVersion[]){let best:TeamEvaluation|null=null;for(const roles of this.permutations(BALANCED)){const result=this.evaluate(players,roles);if(!best||result.strength>best.strength)best=result;}return best!;}
  private permutations(values:RoleCode[]):RoleCode[][]{if(values.length<=1)return[values];return values.flatMap((value,index)=>this.permutations([...values.slice(0,index),...values.slice(index+1)]).map(rest=>[value,...rest]));}
  private publicPlayer(player:PlayerVersion):Omit<PlayerVersion,'history'>{const{history:_,...safe}=player;return safe;}
  private async loadPlayers(manager:EntityManager):Promise<PlayerVersion[]>{
    const rows=await manager.query<Array<Record<string,unknown>>>(`SELECT p.slug,p.nickname AS nick,COALESCE(c.code,'') AS code,COALESCE(c.name,'') AS "countryName",t.slug AS "teamSlug",t.name AS "teamName",pty.year::integer,pty.overall::integer,pty.firepower::integer,pty.entrying::integer,pty.trading::integer,pty.opening::integer,pty.clutching::integer,pty.sniping::integer,pty.utility::integer FROM player_team_years pty JOIN players p ON p.id=pty.player_id JOIN teams t ON t.id=pty.team_id LEFT JOIN countries c ON c.id=p.country_id WHERE t.active=true`);const histories=new Map<string,PlayerHistory[]>();for(const row of rows){const items=histories.get(String(row.slug))||[];items.push({teamSlug:String(row.teamSlug),teamName:String(row.teamName),year:Number(row.year)});histories.set(String(row.slug),items);}return rows.map(row=>({slug:String(row.slug),nick:String(row.nick),code:String(row.code),countryName:String(row.countryName),teamSlug:String(row.teamSlug),teamName:String(row.teamName),year:Number(row.year),overall:Number(row.overall),firepower:Number(row.firepower),entrying:Number(row.entrying),trading:Number(row.trading),opening:Number(row.opening),clutching:Number(row.clutching),sniping:Number(row.sniping),utility:Number(row.utility),history:histories.get(String(row.slug))||[]}));
  }
  private async drawPool(manager:EntityManager,roster:Array<DraftRosterEntry|null>):Promise<DraftPool>{const used=roster.filter((item):item is DraftRosterEntry=>Boolean(item)).map(item=>item.slug),rows=await manager.query<Array<{year:number;teamSlug:string;slugs:string[]}>>(`SELECT pty.year::integer AS year,t.slug AS "teamSlug",array_agg(DISTINCT p.slug ORDER BY p.slug) AS slugs FROM player_team_years pty JOIN players p ON p.id=pty.player_id JOIN teams t ON t.id=pty.team_id WHERE t.active=true AND NOT (p.slug=ANY($1::text[])) GROUP BY pty.year,t.slug HAVING count(DISTINCT p.slug)>0`,[used]);if(!rows.length)throw new ConflictException('Não existem mais jogadores elegíveis para o draft.');const years=[...new Set(rows.map(row=>Number(row.year)))],year=years[randomInt(years.length)],pools=rows.filter(row=>Number(row.year)===year),pool=pools[randomInt(pools.length)];return{year,teamSlug:pool.teamSlug,slugs:pool.slugs};}
  private validRoles(roles:string[]):RoleCode[]{if(!Array.isArray(roles)||roles.length!==5||roles.some(role=>!ROLES.includes(role as RoleCode)))throw new ConflictException('A formação precisa ter cinco funções válidas.');return roles as RoleCode[];}
  private assertStage(campaign:RankedCampaign,stages:RankedCampaign['stage'][]){if(!stages.includes(campaign.stage))throw new ConflictException('Esta ação não pertence à etapa atual da campanha.');}
  private hash(value:string){let hash=0;for(let index=0;index<value.length;index++)hash=(hash*31+value.charCodeAt(index))|0;return hash>>>0;}
  private rng(seed:number){return()=>{let value=seed+=0x6D2B79F5;value=Math.imul(value^value>>>15,value|1);value^=value+Math.imul(value^value>>>7,value|61);return((value^value>>>14)>>>0)/4294967296;};}
  private shuffle<T>(items:T[],rng:()=>number){const result=[...items];for(let index=result.length-1;index>0;index--){const selected=Math.floor(rng()*(index+1));[result[index],result[selected]]=[result[selected],result[index]];}return result;}
}
