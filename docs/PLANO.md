# Plano da etapa 1 (contratos) — stack, pastas e banco

1. **Stack:** Next.js (App Router) + TypeScript + Tailwind, instalável como app (PWA), mobile first. Supabase (Auth, Postgres, Storage) em projeto novo da Lucauto.
2. **Contrato:** o próprio `.docx` é o molde. `moldes/originais/` guarda o Word da Lucauto; `moldes/modelos/` guarda a cópia com marcadores `{assim}`. O preenchimento usa docxtemplater e o PDF sai do LibreOffice, atrás de `converterParaPdf()`.
3. **Produção:** funções serverless não rodam LibreOffice. Rodar a conversão num serviço próprio (Gotenberg). Já está previsto em `PDF_CONVERSOR=gotenberg`.
4. **Pastas:** `src/app` (telas e rotas), `src/lib/contratos` (regras, campos, Word e PDF), `src/lib/auth` (perfis), `src/config` (dados da empresa), `supabase/migrations` (banco), `tests` e `scripts`.
5. **Login:** 3 perfis (`gerente`, `corretor`, `marketing`). Em desenvolvimento, login de teste com pessoas fictícias. Pronto para o Supabase Auth (`AUTH_MODE=supabase`).
6. **Banco:** `workspaces`, `profiles`, `pessoas`, `imoveis`, `contratos`, todas com `workspace_id` e RLS por perfil. Marketing não acessa pessoas nem contratos.
7. **Dados pessoais:** só para pessoas logadas, do mesmo espaço, com perfil gerente ou corretor. Arquivos no bucket privado `contratos`.
8. **Telas:** início com cartões de módulos; Contratos (lista de moldes, formulário, prévia, Word/PDF, histórico).
9. **Regras:** comissão 5% urbano e 8% rural, valor por extenso, data de hoje automática, PDF só com tudo preenchido.
10. **Testes:** valor por extenso, comissão, integridade do modelo × original, Word preenchido, PDF, comparação visual e regras de acesso do banco.
