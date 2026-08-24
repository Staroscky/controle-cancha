# 01 — Scaffold da stack

**Status:** ✅ Concluído

Criar o projeto em `app/` com a stack definida na seção 1 de `docs/arquitetura.md`:

- `npm create vite@latest app -- --template react-ts`
- Tailwind CSS v4 via `@tailwindcss/vite` (sem `tailwind.config` separado, tudo em `index.css`)
- shadcn/ui (`npx shadcn@latest init`, base Radix, preset Nova) com os aliases remapeados de `@/components`/`@/lib` para `@/ui/components`/`@/ui/lib`, para caber na camada `ui/` da arquitetura
- `vite-plugin-pwa` com manifest e `registerType: 'autoUpdate'`, ícone próprio do projeto (substituindo o ícone padrão do Vite)
- Componentes shadcn instalados: `button`, `input`, `label`, `card`, `tabs`, `badge`, `dialog`, `alert-dialog`, `sheet`, `sonner`, `separator`

Critério de pronto: `npm run build` compila sem erros.
