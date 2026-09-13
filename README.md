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
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

## Estado atual

Esta versão é um MVP funcional com dados demonstrativos. As alterações feitas durante a execução ficam em memória. O próximo ciclo substituirá essa camada por Supabase PostgreSQL, autenticação e políticas de acesso por organização.

## Tecnologias

- Next.js
- React
- TypeScript
- Lucide Icons
- CSS próprio da VYOO
