# Direcionamento do ecossistema Lucauto: como tudo se liga

Documento de planejamento (não é código). Responde: o que vem depois dos contratos, como o sistema se liga ao CRM, ao WhatsApp/n8n, ao Google Sheets/Drive e ao site, de onde saem as métricas e como garantir que os números sejam fiéis. Itens marcados **[CONFIRMAR]** dependem de informação que ainda não temos.

## 1. Ideia central: um "cérebro" e vários conectores
O app (com o banco no Supabase da Lucauto) é a **fonte da verdade** de imóveis, pessoas, contratos e eventos. Tudo o mais (planilha, n8n, WhatsApp, CRM, site) **conversa com o cérebro** por conectores. Ninguém digita o mesmo dado em dois lugares.

```
                        ┌──────────────┐
   Corretores/Gerente → │     APP      │ ← Mari (marketing, acesso limitado)
   (celular/computador) │  (Next.js)   │
                        └──────┬───────┘
                               │ lê/escreve
                      ┌────────▼─────────┐
                      │  BANCO (Supabase)│  imóveis · pessoas · contratos · eventos
                      │  + arquivos      │  (cada empresa = um "workspace")
                      └──┬────┬────┬───┬─┘
        exporta (opcional)│    │    │   │webhooks / API com chave
              ┌───────────▼┐ ┌─▼────▼─┐ ▼───────────┐
              │Google Sheets│ │  n8n   │ │  Site     │
              │+ Drive(fotos)│ │(Sofia) │ │ (imóveis) │
              └─────────────┘ └─┬──┬───┘ └───────────┘
                                │  └──────────────► CRM (CV): leads e funil
                                ▼
                         WhatsApp (API)
```

Regras do jogo:
1. **Um código por imóvel (LUC-001, LUC-002…)** em todo lugar: contrato, planilha, pasta de fotos, site, n8n, CRM.
2. **Cada dado tem um dono** (seção 3). Os outros sistemas recebem cópia, nunca "editam por fora".
3. **Tudo que acontece vira um evento** (seção 4). As métricas são contadas a partir dos eventos, não de planilhas feitas à mão.
4. Conectores são trocáveis: se amanhã mudar o CRM ou o provedor de WhatsApp, só o conector muda.

## 2. Qual é a próxima etapa (recomendação)
1. **Fundação de produção** (bloqueia o resto): projeto Supabase novo em nome da Lucauto, login real por convite (um usuário por pessoa), recuperação de senha, contratos gerados guardados no histórico de verdade, backup. *Sem isso o app é só demonstração.*
2. **Módulo Imóveis** (é o centro do ecossistema): cadastro com código LUC, situação (disponível, reservado, vendido, alugado), fotos no Drive com nomes padronizados e cópia leve para o site, caixa "proprietário autorizou o uso das fotos", planilha do Google Sheets como espelho. Já liga com os contratos: escolher o imóvel preenche o contrato; gerar o contrato muda a situação do imóvel.
3. **Eventos + Painel v1** (só com o que já temos: imóveis e contratos).
4. **n8n/WhatsApp (Sofia)**: ler imóveis e fotos do cérebro e registrar eventos de atendimento.
5. **CRM (CV)**: depende da resposta do fornecedor sobre API/webhooks.
6. **Colaboração e modelos salvos**, assinatura digital, lembretes.

Antes de 4 e 5 é preciso fazer o "levantamento" (seção 11): sem ver o fluxo atual do n8n e a documentação do CRM, qualquer desenho seria chute.

## 3. Quem é a fonte da verdade de cada dado
| Dado | Dono (fonte da verdade) | Quem recebe cópia |
|---|---|---|
| Imóveis (código, tipo, valor, situação, fotos) | **App** | Planilha (espelho), site, n8n, CRM (referência pelo código) |
| Contratos gerados, comissões previstas | **App** | CRM (anotação/etapa), Painel |
| Proprietários/pessoas para contrato | **App** (podem ser importadas do CRM) | — |
| Leads, funil de vendas, visitas, propostas | **CRM (CV)** [CONFIRMAR] | App (espelho para métricas) |
| Conversas de WhatsApp | **Provedor do WhatsApp** | App/Painel recebem só os **eventos** (não o texto das conversas) |
| Execuções das automações | **n8n** | App (eventos) |
Se o CRM não oferecer API, o plano B é importar relatórios (CSV) ou digitar menos: ver seção 7.

## 4. Eventos e métricas fiéis (como o número fica "100% igual à realidade")
**Tabela de eventos** (somente adiciona, nunca edita): cada linha = `quando` (fuso Bahia), `tipo`, `imóvel (código)`, `corretor`, `origem` (app, n8n, WhatsApp, CRM, site), `id externo` (para não contar duas vezes) e um resumo sem dados pessoais desnecessários.
Exemplos de tipos: `imovel_cadastrado`, `imovel_situacao_mudou`, `contrato_gerado`, `lead_criado`, `lead_etapa_mudou`, `visita_marcada`, `whatsapp_conversa_iniciada`, `whatsapp_fotos_enviadas`, `atendimento_passou_para_humano`, `site_contato_enviado`.

Para os números serem fiéis:
- **Dicionário de métricas**: para cada número do Painel, um texto curto com *definição, de onde vem, como se calcula, de quando é atualizado e quem confere*. Ex.: "Contratos do mês = contratos gerados com data da assinatura no mês, no fuso da Bahia".
- **Idempotência**: cada evento externo tem um id; se o n8n reenviar, não duplica.
- **Clicar no número mostra a lista** que o compõe (o Denilson confere item a item).
- **Conferência automática** (ex.: imóveis "reservados" sem contrato de sinal; contrato sem imóvel).
- **Quando o dado vem do CRM, o Painel mostra a hora da última atualização** e não "inventa" número se a conexão cair.

## 5. Imóveis ↔ Google Sheets ↔ Drive ↔ site ↔ WhatsApp
- A equipe cadastra **só no app**. O app grava a **planilha** (formato fixo, protegida, colunas do briefing) e organiza as fotos no **Drive** (pasta por código, `LUC-001_01`, `LUC-001_02`…, capa marcada).
- Fotos: reduzir tamanho, manter o original, **apagar GPS**, gerar versão leve para o site.
- Fotos de imóvel **reservado/vendido não vão ao ar** (regra automática pela situação).
- O n8n hoje lê a planilha com os links do Drive: manter assim no começo (zero retrabalho) **[CONFIRMAR o formato do link que o n8n espera]**. Meta posterior: o n8n lê direto do banco (mais rápido e sem limite de planilha); a planilha vira só espelho.
- O site (repositório `lucauto-imobiliaria`) passa a listar os imóveis "com destaque no site" a partir do mesmo cadastro **[CONFIRMAR como o site pega os dados hoje]**.

## 6. Automações (n8n/Sofia) e WhatsApp
**Escolha do canal (decisão importante):**
- **API oficial do WhatsApp Business (Meta)**, direta ou por um provedor homologado: estável, tem webhooks de mensagens e status, métricas confiáveis; exige número verificado e modelos de mensagem aprovados para iniciar conversas.
- **APIs não oficiais** (conexão por "QR code"): mais simples e baratas, porém com risco de bloqueio do número e sem garantia. Para uma imobiliária que depende do número, o risco precisa ser decidido pelo dono. **[CONFIRMAR o que a Sofia usa hoje]**

**Fluxos candidatos (do mais simples ao mais valioso):**
1. Cliente pede fotos do `LUC-001` → n8n busca no cérebro → envia fotos (só de imóvel disponível).
2. Novo contato → cria lead no CRM, avisa o corretor, grava evento.
3. Follow-up automático (cliente sem resposta em X dias).
4. Alertas do app: reserva de 90 dias vencendo, fim de contrato de locação, reajuste anual, contrato gerado sem assinatura.
5. Resumo diário/semanal para o gerente no WhatsApp.

**Métricas das automações (de onde vêm):** o n8n grava um evento a cada passo relevante (conversa iniciada, fotos enviadas, passou para humano, lead criado); os webhooks do provedor de WhatsApp dão entregue/lido/respondido. Com isso: volume de atendimentos, tempo de primeira resposta, % resolvido sem humano, leads gerados, imóveis mais pedidos. Métricas de automação são um serviço à parte, mais para frente (decisão comercial do Lucas).

## 7. CRM (CV)
**O que sabemos:** o CV CRM tem integrações com outras plataformas e usa webhooks em integrações como a com o Sienge, mas **a documentação de API não é pública**: a configuração costuma ser feita pela equipe do próprio CV (veja as fontes ao final). **Não sabemos** se o plano da Lucauto libera API/webhooks nem se o "CV" deles é mesmo o CV CRM **[CONFIRMAR]**.

**Perguntas ao fornecedor:** existe API/webhook no plano? Como se autentica? Quais dados (leads, clientes, imóveis/unidades, etapas do funil, visitas) e em quais direções? Há limites de uso? Existe ambiente de teste?

**Como integrar (em ordem de preferência):**
1. **API/webhooks via n8n**: lead novo/etapa mudou → evento no app; contrato gerado/imóvel reservado → atualiza o CRM.
2. **Importação periódica** (relatório/CSV) se não houver API: menos "tempo real", mas fiel.
3. **Sem integração técnica**: botão "abrir no CV" e conferência manual semanal (último caso).

**Ganhos práticos:** buscar o cliente no CRM e **pré-preencher o contrato** (menos digitação); o Painel mostra funil + contratos no mesmo lugar; o CRM recebe o status do contrato.
**Regra para não bagunçar:** o CRM manda em leads/funil; o app manda em imóveis/contratos. Nunca dois donos para o mesmo campo.

## 8. Painel: o que mostrar (por perfil)
- **Gerente (Denilson/Filipe):** imóveis por situação; contratos do mês e por corretor; comissões previstas (valor × 5% urbano / 8% rural, só contratos gerados); reservas vencendo; imóveis parados (dias sem visita/lead); funil do CRM; atendimento WhatsApp (volume, tempo de resposta, % pelo robô).
- **Corretor:** meus imóveis, minhas tarefas/visitas, meus contratos, leads atribuídos a mim.
- **Marketing (Mari):** imóveis em destaque, fotos pendentes/sem autorização, leads por origem (site, WhatsApp, anúncios), imóveis mais pedidos.
Primeiro entregar o que **já temos 100% confiável** (imóveis e contratos); o resto entra conforme os conectores existirem.

## 9. Corretores interagindo e "modelos salvos" (pessoal × empresa)
Dois escopos, com as mesmas regras de acesso do banco:
- **Pessoal**: só o dono vê (ex.: minhas descrições de imóvel favoritas, meus dados de banco, rascunhos).
- **Da empresa**: todos veem; só gerente edita (ex.: textos-padrão aprovados, lista de bancos/cartórios, modelos de mensagem do WhatsApp).
**O que pode ser salvo:** rascunhos de contrato (continuar depois), dados pré-preenchidos (descrição, banco, cartório), cadastro de pessoas/proprietários recorrentes, modelos de mensagem. **O texto jurídico dos contratos não é editável pelo usuário**: só o gerente/advogado, trocando o Word do modelo.
**Interação entre corretores:** atribuir/transferir imóvel ou lead, anotações por imóvel/cliente (histórico), comentários, notificações (no app e por WhatsApp), "quem mexeu" (auditoria).

## 10. Segurança e LGPD nas integrações
- Cada integração tem **sua própria chave** (n8n, site, CRM), com o mínimo de permissão, guardada em cofre de segredos; nada de chave no código; nunca receber senha de ninguém.
- Webhooks **assinados**; o app confere a assinatura e o id do evento.
- **Dados pessoais (CPF, RG, endereço) não saem do banco** para o n8n/WhatsApp sem necessidade; eventos levam só o essencial.
- Registro de acesso (quem viu/baixou contrato), prazo de guarda, backup, e a Lucauto como controladora dos dados. Contas (Supabase, n8n, domínio, Google) **em nome da Lucauto/dono**.

## 11. Levantamento necessário (perguntas para levar à Lucauto)
1. **CRM:** qual exatamente (CV CRM?), qual plano, quem administra, existe API/webhook? Quais campos usam hoje?
2. **WhatsApp/Sofia:** número, provedor/API, fluxo atual do n8n (exportar o fluxo), onde o n8n está hospedado e em nome de quem.
3. **Planilha e Drive:** quem é o dono das contas Google; modelo atual da planilha; formato do link de fotos que o n8n espera.
4. **Site:** como carrega os imóveis hoje; quem edita.
5. **Números que importam:** quais 8 a 10 números o Denilson/Filipe querem ver toda segunda-feira? Como a comissão é prevista e paga (para "comissões previstas" ficar correto)?
6. **Equipe:** quem são os corretores, quem vê o quê, quem aprova mudanças.
7. **Decisões do dono/Lucas** (preço e prazo ficam fora destes arquivos): hospedagem do PDF/serviços, canal oficial do WhatsApp.

## 12. Roteiro por fases (cada fase entrega algo que se usa)
| Fase | Entrega | Depende de |
|---|---|---|
| 0 | Supabase + login real + histórico guardado | Contas em nome da Lucauto |
| 1 | Imóveis (código LUC, fotos, planilha, situação) + contrato puxa o imóvel | Fase 0; formato da planilha/link do n8n |
| 2 | Eventos + Painel v1 (imóveis e contratos) | Fase 1; os "10 números" |
| 3 | n8n lê imóveis e grava eventos; fotos no WhatsApp | Fluxo atual do n8n; canal de WhatsApp |
| 4 | CRM: leads/funil no Painel; contrato pré-preenchido do CRM | Resposta do fornecedor do CRM |
| 5 | Modelos salvos, colaboração, lembretes, assinatura digital | Fases 0 a 2 |

## 13. Como isso agrega valor ao produto
- Cada imobiliária vira um "espaço" (`workspace_id`) e o sistema é **replicável**: o mesmo produto para outra imobiliária, com conectores diferentes.
- O **Painel confiável** (com lista por trás de cada número) é o que o dono realmente usa e valoriza.
- **Menos digitação** (CRM → contrato; imóvel → contrato; contrato → situação do imóvel → WhatsApp parou de oferecer o imóvel vendido).
- Alertas proativos (reserva vencendo, contrato sem assinatura) que evitam perder negócio.

## Fontes consultadas
- [Integração CV e Sienge (central de ajuda do CV)](https://ajuda.cvcrm.com.br/support/solutions/articles/157000357155): menciona webhooks; a configuração é feita pela equipe do CV.
- [Integração CVCRM e Sienge (blog do Sienge)](https://sienge.com.br/blog/cv-sienge-fique-por-dentro-da-integracao/): informa integrações do CV com outras plataformas.
- A busca não encontrou portal público de desenvolvedores do CV CRM; confirmar com o fornecedor.
