# Pendências e aprovações

## Precisa de aprovação do Denilson (texto do contrato)
- **Percentual da comissão no texto:** o molde trazia 8% fixo; o sistema troca por 5% (urbano) ou 8% (rural), com o extenso. Confirmar que o texto pode mudar.
- **"nascido(a) em"** foi acrescentado antes da data de nascimento do proprietário, e um ponto final após o e-mail e após o CRECI da corretora. No original havia só o aviso "[NOME, estado civil, ..., data de nascimento, ...".
- **"Localizado em ..."** foi acrescentado antes da localização do imóvel (no original só havia "Localizada no bairro, ..." dentro da casa de exemplo).
- **Erro de digitação (não corrigido):** cláusula 1.2 diz "O CONTRATO declara"; provavelmente "O CONTRATANTE declara".
- **"CREC nº"** na linha da corretora (provavelmente "CRECI nº"). Mantido como no original.
- O molde diz "venda, locação ou administração". Se a Lucauto quiser um molde só para venda, definir o trecho.

## [A CONFIRMAR] (nunca inventados; saem assim no contrato)
- CNPJ da Lucauto, CRECI jurídico e CRECI da Pollyana (variáveis `EMPRESA_*`).
- Telefone do rodapé, (75) 9.9947-1011, que difere do WhatsApp do site, (75) 99942-1482. O rodapé segue como no original.
- Se o Filipe é sócio ou dono.

## Decisões tomadas por padrão (podem mudar)
- Dados da empresa pendentes **não bloqueiam** o PDF (saem como [A CONFIRMAR] e o sistema avisa). Campos da pessoa e do imóvel bloqueiam.
- RG é opcional (o trecho do RG some do contrato quando vazio), como no contrato real de 04/11.
- Corretor vê só os contratos que ele gerou; gerente vê todos. Marketing não vê contratos.
- Data da assinatura sai com dois dígitos no dia ("05 de novembro de 2026"), como no Word original.

## Ainda não feito
- Moldes 2 a 6 (já estão em `moldes/originais/`, falta transformar em modelo e validar página por página).
- Logo oficial (`logo_lucauto_dourado_transparente.png`): ainda não chegou. O app usa um logo provisório recortado do cabeçalho do contrato.
- Ícone do app provisório (letra L).
- Conexão real com o Supabase (código pronto, nunca executado contra um banco real) e serviço Gotenberg para o PDF em produção.
- Backup do banco, domínio e contas em nome da Lucauto.

## Cuidado com o repositório
- Os moldes e o protótipo contêm dados pessoais reais do representante legal (RG, CPF, endereço), que fazem parte do contrato original. Manter o repositório **privado**.
