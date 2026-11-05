# Como o PDF é gerado (e o que falta para funcionar online)

## Decisão atual: Word primeiro
Online, o app entrega o **Word** (idêntico ao modelo da Lucauto) e **não mostra o botão de PDF**. Quem precisa do PDF abre o Word e usa **Arquivo → Salvar como → PDF** (no celular, **Compartilhar → Exportar como PDF**). Como o PDF sai do próprio Word, ele fica igual ao contrato. Não custa nada e não precisa de servidor. O PDF automático pode ser ligado depois, sem mudar mais nada (opção A abaixo). Controle: `PDF_CONVERSOR=nenhum` (padrão na Vercel).

## Como funciona hoje
1. O app preenche o **Word da Lucauto** (o modelo com marcadores) com os dados digitados.
2. Um programa gratuito chamado **LibreOffice** abre esse Word e o salva como PDF. É o mesmo programa usado nas validações página por página, então o PDF sai com o logo, a marca d'água e o rodapé do modelo.
3. No computador de desenvolvimento isso já funciona. **Online (Vercel) não funciona**, porque a Vercel não deixa instalar o LibreOffice nas suas funções. Por isso, no site de demonstração, o botão do PDF avisa "PDF em breve" e só o Word é baixado.

## O que é preciso para o PDF funcionar online
Um **serviço de conversão** separado, que só recebe o Word e devolve o PDF. O app já está pronto para isso: basta preencher duas variáveis (`PDF_CONVERSOR=gotenberg` e `GOTENBERG_URL`). A conversão está isolada em uma única função (`converterParaPdf`).

### Opções
| Opção | Como é | Prós | Contras |
|---|---|---|---|
| **A. Gotenberg num servidor próprio (recomendada)** | Programa livre (empacotado em "Docker") que roda o LibreOffice. Fica num serviço de hospedagem de contêineres (Google Cloud Run, Render, Railway, Fly.io ou um servidor/VPS). | Mesmo motor já validado: PDF idêntico ao que testamos. Dados ficam sob controle da Lucauto. | Tem um custo mensal de hospedagem (varia por provedor e por uso) e alguém precisa manter. |
| **B. Hospedar o app inteiro num servidor (VPS) em vez da Vercel** | Um servidor com o app e o LibreOffice juntos. | Um só lugar. | Mais manutenção (atualizações, segurança, backup). |
| **C. Serviços pagos de conversão (por documento)** | Envia o Word para uma empresa que devolve o PDF. | Nada para manter. | Os contratos (CPF, RG, endereço) sairiam do controle da Lucauto: risco de LGPD. **Não recomendado.** |
| **D. Só Word por enquanto** | A equipe abre o Word e usa "Salvar como PDF". | Custo zero, vale já. | Um passo manual a mais. |

### Cuidados com a opção A
- A conta do provedor deve ser **em nome da Lucauto** (ou do dono), nunca do desenvolvedor.
- O serviço recebe contratos com dados pessoais: ele **não pode ficar aberto na internet**. Deve exigir chave de acesso ou ficar em rede privada, e não guardar os arquivos depois de converter.
- Escolher uma região no Brasil (ou próxima) para ficar rápido.
- Tempo esperado: alguns segundos por contrato.

## Custos
Os valores variam por provedor e mudam com frequência; confirmar nos sites oficiais antes de decidir. Em geral, serviços que cobram por uso (como o Cloud Run) custam muito pouco para o volume de uma imobiliária, e os que mantêm um servidor ligado o tempo todo têm mensalidade fixa. A decisão de contratar é do dono/Lucas.
