# Sistema Lucauto

Sistema interno da Lucauto Empreendimentos (app instalável pelo navegador). Etapa atual: **contratos em PDF e Word**, a partir dos moldes originais da Lucauto.

## Como rodar

```bash
npm install
cp .env.example .env.local      # AUTH_MODE=mock já serve para testar
npm run dev                      # http://localhost:3000
```

No modo de teste, a tela de entrada mostra três pessoas fictícias (gerente, corretor, marketing), sem senha.
Para o PDF é preciso ter o **LibreOffice** instalado (`soffice`). Contratos gerados em desenvolvimento ficam em `.dev-data/` (não vai para o git).

## Testes

```bash
npm test               # valor por extenso, comissão, modelo × original, Word e PDF
npm run test:rls       # regras de acesso do banco (precisa do Postgres local; usa um banco descartável)
npm run test:visual    # gera saida-teste/ para comparar original × gerado página por página
```

## Moldes

- `moldes/originais/`: os Word da Lucauto, sem nenhuma alteração.
- `moldes/modelos/`: os mesmos arquivos com marcadores `{assim}` nos trechos variáveis. Para mudar uma cláusula, edite o Word do modelo (mantenha os marcadores).
- `npm run molde:preparar` refaz o modelo 1 a partir do original; `npm run molde:conferir` mostra o que mudou.

## Produção

- **PDF:** funções serverless não rodam LibreOffice. Rode um serviço de conversão próprio (por exemplo Gotenberg) e use `PDF_CONVERSOR=gotenberg` com `GOTENBERG_URL`. Tudo isso fica atrás de `converterParaPdf()` em `src/lib/contratos/converter-pdf.ts`.
- **Banco:** aplicar `supabase/migrations/` num projeto Supabase novo, em nome da Lucauto. Desligar o cadastro público (signup); entrar só por convite. Ativar backup diário.
- `AUTH_MODE=supabase`. O login de teste é recusado em produção.

Veja `docs/PLANO.md` e `docs/PENDENCIAS.md`.
