# Deploy da API no Easypanel

Este repositório publica somente o backend NestJS. O frontend é implantado separadamente a partir de [DiogoArcenioo/5x5-front](https://github.com/DiogoArcenioo/5x5-front).

## Serviço do backend

Crie um serviço de aplicativo com estas opções:

- nome sugerido: `5x5-back`;
- repositório: `https://github.com/DiogoArcenioo/5x5.git`;
- branch: `main`;
- método de build: Dockerfile;
- Dockerfile: `Dockerfile`;
- porta interna/proxy: `3000`.

Variáveis:

```dotenv
NODE_ENV=production
API_HOST=0.0.0.0
API_PORT=3000
DB_HOST=host-interno-do-postgres
DB_PORT=5432
DB_NAME=counter_db
DB_USER=usuario-do-postgres
DB_PASSWORD=senha-do-postgres
DB_SSL=false
DB_LOGGING=false
API_CORS_ORIGIN=https://dominio-do-frontend
```

Use preferencialmente o host e a porta internos do PostgreSQL. Salve as variáveis antes de implantar.

## Validação

Depois do deploy, valide:

```text
https://dominio-do-backend/api/health
https://dominio-do-backend/docs
```

A raiz do domínio retorna `404` intencionalmente. Este serviço não entrega páginas HTML.

No serviço do frontend, configure:

```dotenv
BACKEND_URL=http://nome-interno-do-servico-backend:3000
```

## Segurança

- não publique arquivos `.env`;
- nunca armazene senhas de usuários em variáveis do frontend;
- não exponha a porta do PostgreSQL sem necessidade;
- prefira a rede interna entre PostgreSQL, Nest e Next;
- troque qualquer credencial que já tenha aparecido em capturas de tela.
