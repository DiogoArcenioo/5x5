# 5x5 API

Backend NestJS e PostgreSQL do 5x5.

## Modelo de dados

O domínio foi reduzido a cinco áreas:

- regiões;
- países;
- times;
- jogadores e suas skills;
- vínculo do jogador com um time em um ano entre 2017 e 2026.

A lineup de um time em determinado ano é formada diretamente pelos registros de
`player_team_years`. Não existem tabelas separadas de temporada, versão ou lineup.

As skills do jogador são `firepower`, `entrying`, `trading`, `opening`,
`clutching`, `sniping` e `utility`, todas de 0 a 100. O `overall` é calculado
automaticamente pela média arredondada das sete skills.

Os campos textuais do domínio são normalizados e armazenados em uppercase. A
regra não é aplicada a usuário, senha, hashes, tokens, datas ou enums técnicos.

## Executar localmente

```powershell
npm install
npm run start:dev
```

- API: `http://localhost:3000/api`;
- saúde: `http://localhost:3000/api/health`;
- Swagger: `http://localhost:3000/docs`.

## Banco

```powershell
npm run db:migrate
npm run db:verify
```

Para apagar e reconstruir todas as tabelas:

```powershell
$env:DB_RESET_CONFIRM='RESET'
npm run db:reset
npm run db:migrate
Remove-Item Env:DB_RESET_CONFIRM
```

O reset remove também usuários e sessões. As migrações reinserem as 8 regiões e
os 51 países representados nos Majors desde 2017.

## Administrador inicial

```powershell
$env:ADMIN_SEED_USERNAME='admin'
$env:ADMIN_SEED_PASSWORD='defina-uma-senha-segura'
npm run db:seed-admin
```

## API pública

- `GET /api/catalog/summary`;
- `GET /api/catalog/players`;
- `GET /api/catalog/players/:slug`;
- `GET /api/catalog/teams`;
- `GET /api/catalog/teams/:slug`.

## API administrativa

- `GET/POST/PATCH/DELETE /api/admin/data/regions`;
- `GET/POST/PATCH/DELETE /api/admin/data/countries`;
- `GET/POST/PATCH/DELETE /api/admin/data/teams`;
- `GET/POST/PATCH/DELETE /api/admin/data/player-team-years`;
- `GET/POST /api/admin/players`;
- `GET/PATCH/DELETE /api/admin/players/:id`.
