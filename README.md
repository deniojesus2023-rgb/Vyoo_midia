# VYOO Mídia

MVP da plataforma de gestão da rede de mídia local VYOO.

## Áreas do produto

- **VYOO Admin:** operação, campanhas, telas, inventário, moderação e parceiros.
- **VYOO Ads:** criação e acompanhamento de campanhas de mídia indoor.
- **VYOO Parceiros:** acompanhamento das telas, conteúdos e repasses.

## Executar localmente

Requer Node.js 20 ou superior.

```bash
npm install
cp .env.example .env.local
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

Preencha em `.env.local` a URL e a chave publicável do projeto Supabase. Nunca coloque uma chave secreta ou `service_role` no navegador.

## Banco de dados

O schema PostgreSQL versionado em `supabase/migrations` inclui organizações, usuários, estabelecimentos, telas, criativos, campanhas, inventário, exibições, pagamentos, repasses, suporte e auditoria.

Todas as tabelas públicas usam Row Level Security. O acesso é isolado por organização e o banco impede reservas acima da capacidade de cada tela.

## Autenticação

O fluxo disponível em `/login` usa Supabase Auth com sessão em cookies. Após confirmar o e-mail, `/onboarding` cria uma conta de anunciante ou parceiro e direciona o usuário somente ao painel permitido. Perfis administrativos não podem ser criados pelo cadastro público.

## Estado atual

Esta versão mantém a interface demonstrativa em memória enquanto a camada Supabase é conectada gradualmente às rotas do produto. O banco real e os clientes tipados para navegador e servidor já estão preparados.

## Tecnologias

- Next.js
- React
- TypeScript
- Supabase PostgreSQL e Auth
- Lucide Icons
- CSS próprio da VYOO
