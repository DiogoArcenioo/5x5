# 5x5 Admin API

API NestJS + TypeORM para cadastrar e manter os dados competitivos usados pelos minigames.

Para publicar no Easypanel, consulte [DEPLOY_EASYPANEL.md](DEPLOY_EASYPANEL.md).

## Executar

```powershell
npm install
npm run db:migrate
npm run start:dev
```

- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/docs`
- Saúde e banco: `GET http://localhost:3000/api/health`
- Jogo HTML: `http://localhost:3000/5x5.dc.html`
- Painel administrativo: `http://localhost:3000/admin.html`

O catálogo público não contém mocks. Contadores, jogadores, times, temporadas, campeonatos e perfis são consultados nos endpoints `/api/catalog/*`. Na ausência de registros, o frontend mostra um estado vazio e direciona para o painel administrativo.

Endpoints públicos principais:

- `GET /api/catalog/summary`
- `GET /api/catalog/players`
- `GET /api/catalog/players/:slug`
- `GET /api/catalog/teams`
- `GET /api/catalog/teams/:slug`
- `GET /api/catalog/seasons`
- `GET /api/catalog/tournaments`

O TypeORM usa `synchronize: false`. Mudanças estruturais devem ser feitas por novas migrações SQL em `database/migrations`.

## Painel administrativo HTML

O Nest também serve os arquivos do frontend em `frontend/`. O painel administrativo usa a API pelo mesmo domínio, com URLs relativas iniciadas por `/api`.

Fluxo recomendado para começar a cadastrar:

1. Regiões e países;
2. Temporada;
3. Time;
4. Jogador;
5. Passagem do jogador pelo time;
6. Versão competitiva naquela temporada;
7. Funções, ratings e demais dados pelo cadastro avançado.

As telas dedicadas de time e jogador possuem criação, listagem, edição, busca e exclusão protegida pelas constraints do banco. Nenhum campo de imagem é exibido nesta etapa.

## Jogadores e coaches

Estes endpoints tratam a identidade compartilhada em `people` dentro de uma transação:

- `GET/POST /api/admin/players`
- `GET/PATCH/DELETE /api/admin/players/:id`
- `GET/POST /api/admin/coaches`
- `GET/PATCH/DELETE /api/admin/coaches/:id`

O cadastro de jogador também pode receber aliases. Campos de imagem não fazem parte dos contratos atuais.

Exemplo de jogador:

```json
{
  "displayName": "Gabriel Toledo",
  "birthDate": "1991-05-30",
  "nationalityCode": "BR",
  "nickname": "FalleN",
  "slug": "fallen",
  "debutDate": "2005-01-01",
  "careerStatus": "active",
  "aliases": [
    { "alias": "FalleN", "aliasType": "nickname" }
  ]
}
```

## CRUD administrativo

`GET /api/admin/data/resources` retorna os 28 recursos cadastráveis, campos, tipos e chaves. Isso permite que o frontend administrativo construa formulários a partir dos metadados.

Operações:

- `GET /api/admin/data/:resource`
- `POST /api/admin/data/:resource/find-one`
- `POST /api/admin/data/:resource`
- `PATCH /api/admin/data/:resource`
- `DELETE /api/admin/data/:resource`

Criação:

```json
{
  "data": {
    "code": "SA",
    "name": "América do Sul"
  }
}
```

Atualização com chave simples:

```json
{
  "key": { "id": 1 },
  "data": { "name": "América do Sul" }
}
```

Tabelas associativas usam chave composta:

```json
{
  "key": {
    "playerVersionId": "uuid-da-versao",
    "roleId": 1
  },
  "data": {
    "proficiency": 95,
    "isPrimary": true
  }
}
```

Listagens aceitam:

- `page` e `pageSize`;
- `search`;
- `sort` e `order`;
- `filters` como objeto JSON codificado na URL.

Exemplo:

```text
GET /api/admin/data/player-versions?page=1&pageSize=25&sort=referenceDate&order=DESC&filters={"seasonId":"uuid"}
```

## Recursos cadastráveis

- regiões, países, temporadas, times, funções e mapas;
- map pool por temporada;
- aliases, passagens e versões de jogadores/coaches;
- funções, ratings internos e desempenho por mapa;
- lineups e seus membros;
- campeonatos, edições, participações e rosters;
- fontes e referências externas;
- períodos estatísticos e atributos observados;
- métricas extensíveis e valores;
- tipos de dicas.

## Segurança

Os endpoints administrativos ainda não possuem autenticação. A API deve permanecer local ou atrás de uma rede protegida até a implementação de usuários, papéis e autenticação JWT. Não publique a porta da API diretamente na internet nesta etapa.
