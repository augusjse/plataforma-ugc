This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Login com Google e usuários

1. Execute `supabase/migrations/20260904_users.sql` no SQL Editor do projeto Supabase.
2. No Google Cloud Console, configure a tela de consentimento OAuth e crie uma credencial OAuth Client ID do tipo Web application. Em **Authorized redirect URIs**, adicione o callback do Supabase: `https://xzlzifoeprjwvinsiznd.supabase.co/auth/v1/callback` (não `/auth/callback` da aplicação).
3. No Supabase, abra **Authentication → Providers → Google**, habilite o provedor e cole o Client ID e Client Secret do Google.
4. Em **Authentication → URL Configuration**, defina **Site URL** como `https://plataforma-ugc.vercel.app` e, em **Redirect URLs**, use `https://plataforma-ugc.vercel.app/**`. Remova entradas `localhost` do ambiente de produção.
5. Configure na Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` e, opcionalmente, `NEXT_PUBLIC_APP_URL`.

O primeiro login cria o usuário com papel `criadora`. Para promover a primeira pessoa administradora, execute `update public.users set role = 'admin' where email = 'seu@email.com';` no SQL Editor. Depois disso, administradores podem gerenciar usuários em `/admin/usuarios`. Client Secret e service role key devem permanecer apenas no servidor.
