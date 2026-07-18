# Segurança do 5x5

## Controles implementados

- JWT HS256 com `issuer`, `audience`, expiração curta para administradores e `jti` aleatório;
- hash SHA-256 do token no banco, validação da sessão a cada requisição e revogação imediata no logout;
- cookie de sessão `HttpOnly`, `Secure` em produção, `SameSite=Strict` e limitado ao caminho `/api`;
- autorização administrativa consultando a função e o status atuais do usuário no banco;
- chave interna separada entre Next.js e NestJS, nunca enviada ao navegador;
- rate limiting global e limites mais severos em login, cadastro e OAuth;
- validação estrita de DTOs, queries parametrizadas e respostas 500 sem detalhes internos;
- Swagger desativado em produção, body limitado a 64 KiB e cabeçalhos Helmet;
- CORS sem curingas e validação de `Origin` no proxy para operações mutáveis;
- senhas com scrypt e novas senhas exigindo ao menos 12 caracteres, letra e número.

## Riscos ainda abertos

### Resultado da ranked ainda é informado pelo cliente

O frontend simula a campanha e chama os eventos de pontuação. Um usuário autenticado pode reproduzir essas chamadas na ordem válida e obter a pontuação máxima sem jogar. JWT, CORS ou API key não comprovam o resultado da partida.

Correção definitiva: executar a simulação ranqueada no backend, persistindo seed, lineup, estado das rodadas e resultados. O cliente deve enviar apenas decisões permitidas e o servidor deve ser a única autoridade capaz de criar eventos de pontuação.

### CSP depende de `unsafe-eval`

O runtime atual de `support.js` usa `new Function`. A CSP bloqueia frames, plugins, origens externas e conteúdo misto, mas precisa permitir `unsafe-eval` enquanto essa arquitetura existir.

Correção definitiva: migrar a tela monolítica para componentes React compilados e então retirar `unsafe-eval` e `unsafe-inline` da política.

### Rate limiting em memória

O limitador atual protege uma instância. Em múltiplas réplicas, use armazenamento compartilhado (Redis) e proteção adicional no proxy/CDN.

## Operação

- rotacione `JWT_SECRET` e `INTERNAL_API_KEY` se houver suspeita de vazamento;
- trocar `JWT_SECRET` encerra todas as sessões imediatamente;
- use um usuário PostgreSQL exclusivo, sem privilégios de superusuário;
- mantenha banco e backend em rede privada;
- aplique atualizações e execute `npm audit --omit=dev` regularmente;
- nunca use uma API key no JavaScript do navegador como controle de acesso.

