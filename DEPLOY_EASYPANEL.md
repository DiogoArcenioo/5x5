# Deploy do 5x5 no Easypanel

O backend NestJS serve a API, o site público e o painel administrativo no mesmo container e na mesma porta.

## 1. Criar o serviço

No projeto que já contém o PostgreSQL:

1. Clique em **+ Serviço**.
2. Selecione **Aplicativo**.
3. Use o nome `5x5-app`.
4. Em **Source**, escolha GitHub/Git Repository.
5. Repositório: `https://github.com/DiogoArcenioo/5x5.git`.
6. Branch: `main`.
7. Build method: **Dockerfile**.
8. Dockerfile path: `Dockerfile`.

## 2. Variáveis de ambiente

Cadastre no serviço de aplicação:

```dotenv
NODE_ENV=production
API_HOST=0.0.0.0
API_PORT=3000
DB_HOST=host-do-postgres
DB_PORT=5432
DB_NAME=counter_db
DB_USER=usuario-do-postgres
DB_PASSWORD=senha-do-postgres
DB_SSL=false
DB_LOGGING=false
ADMIN_USERNAME=seu-usuario-admin
ADMIN_PASSWORD=uma-senha-longa-e-exclusiva
API_CORS_ORIGIN=https://seu-dominio
```

Preferencialmente, use o host e a porta da conexão **interna** exibida pelo serviço PostgreSQL no Easypanel. Se usar a conexão externa existente, mantenha o host e a porta externa que já funcionam no `.env` local.

Não coloque essas credenciais no GitHub.

`ADMIN_USERNAME` e `ADMIN_PASSWORD` protegem:

- `/admin.html`;
- `/api/admin/*`;
- `/docs` e `/docs-json`.

A aplicação recusa iniciar em produção se essas duas variáveis estiverem ausentes.

## 3. Domínio e proxy

Na área **Domains & Proxy**:

1. Adicione um domínio gerado pelo Easypanel ou seu domínio próprio.
2. Configure o proxy para a porta interna `3000`.
3. Marque o domínio como primário.
4. Ative HTTPS/Let's Encrypt.

Não é necessário publicar manualmente uma porta do container.

## 4. Banco de dados

O banco atual já possui a migração inicial. Se estiver usando um banco novo, abra o console do serviço da aplicação e execute:

```sh
npm run db:migrate
```

Não é necessário criar volume para a aplicação. Os dados persistentes ficam no PostgreSQL.

## 5. Deploy e validação

Clique em **Deploy** e acompanhe os logs. Depois valide:

```text
https://seu-dominio/api/health
https://seu-dominio/
https://seu-dominio/admin.html
```

O healthcheck do container também consulta `/api/health` automaticamente.

## 6. Atualizações automáticas

Depois do primeiro deploy funcionar, habilite **Auto Deploy** para que pushes futuros na branch `main` iniciem um novo deploy.

## Segurança antes de publicar

- Troque a senha do PostgreSQL que apareceu em capturas de tela anteriores.
- Use uma senha administrativa diferente da senha do banco.
- Não exponha a porta externa do PostgreSQL se ela não for necessária.
- Prefira a rede interna do Easypanel entre aplicação e banco.
