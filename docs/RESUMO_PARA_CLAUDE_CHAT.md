# Sistema da Lucauto: resumo completo para revisão

Documento para ler com calma (e para colar no Claude Chat). Descreve o objetivo, tudo o que já foi feito, como foi validado, o que falta e o que precisa de decisão ou aprovação de cada pessoa. Linguagem simples de propósito.

## 1. Objetivo
Um sistema único da Lucauto Empreendimentos (Euclides da Cunha/BA), instalável pelo navegador (celular e computador), com login por pessoa. Começa pelos **contratos em Word e PDF** e cresce em módulos: Imóveis, Painel e Automações (ainda "em breve").
Regra principal desta etapa: o contrato gerado tem de sair **igual ao Word que a Lucauto já usa** (logo, marca d'água dourada de casa, rodapé, fonte, margens, numeração e quebras de página), com "Ctrl+C, Ctrl+V" do texto: só entram os dados de cada contrato.

## 2. O que já está pronto
**App (Next.js + TypeScript + Tailwind, PWA, mobile first)**
- Menu lateral, bloco do usuário, três perfis (gerente, corretor, marketing). Cada perfil só vê o que pode usar (menu e servidor).
- Início (atalhos, contratos do mês e de hoje, últimos contratos), Gerador de PDFs, Configurações (dados da empresa, só leitura, só gerente).
- Visual azul marinho e dourado, fonte única (Plus Jakarta Sans), botões de 44 px, funciona no celular.
- Formulário em etapas (Partes, Imóvel/Valores, Revisar) com **prévia do contrato em páginas A4** (com logo, casinha dourada e rodapé), zoom e tela cheia.
- Campos numéricos só aceitam números (telefone, CEP, CPF, RG, matrícula, agência, valor); e-mail de qualquer provedor; datas conferidas; CPF com dígito verificador.
- Preenchimento automático: cidades do Brasil (IBGE; escolher a cidade preenche o estado), estados, estado civil, profissão, banco, cartório, nacionalidade, favorecido.
- Valor por extenso automático (testado com 100; 1.001; 101.101; 1.000.000; 1.250.000,50), data da assinatura automática (editável), comissão de 5% (urbano) ou 8% (rural) com o percentual trocando sozinho.
- Histórico dos contratos gerados (molde, cliente, valor, data, quem gerou, arquivos Word e PDF).

**Os 6 moldes** (cada um: Word com marcadores, campos, regras, testes e validação página por página)
| Molde | Páginas original × gerado | Observação |
|---|---|---|
| 1 Intermediação com exclusividade | 7 × 7 | páginas 4 a 7 idênticas pixel a pixel |
| 2 Intermediação sem exclusividade | 6 × 6 | páginas 4 a 6 idênticas |
| 3 Intermediação de locação | 6 × 6 | páginas 2 a 5 idênticas |
| 4 Locação residencial | 6 × 6 | RG e endereço opcionais; segundo fiador opcional; **o Word recebido não tem logo, marca d'água nem rodapé** |
| 5 Sinal e reserva | 8 × 8 | sinal e reserva de 90 dias vêm do modelo |
| 6 Compra e venda | 6 × 6 | forma de pagamento marcada com X; saldo calculado |
As páginas que diferem são só as que têm campos preenchidos (o texto fictício tem tamanho diferente do exemplo do Word).

**Segurança e banco de dados (nunca executado em banco real)**
- Migrações SQL: espaços (`workspace_id`), perfis, pessoas, imóveis, contratos e arquivos (bucket privado), com regras de acesso por perfil (RLS). Marketing não acessa CPF, RG nem contratos; corretor só vê os contratos que ele mesmo gerou; um espaço nunca enxerga outro. 22 verificações automáticas passam num Postgres local descartável.
- Login de teste só em desenvolvimento/demonstração; o login real (Supabase Auth, convite por e-mail) está pronto no código, mas ainda não foi ligado.

**Testes:** 138 testes automáticos (valor por extenso, comissão, campos, cada molde, "nenhuma palavra acrescentada ao original", integridade do cabeçalho/rodapé/imagens). Todos com dados fictícios.

## 3. Como o texto dos moldes foi tratado
- Os Word originais ficam intactos em `moldes/originais/`. Os modelos com marcadores ficam em `moldes/modelos/`. Cabeçalho, rodapé, marca d'água, imagens e estilos são **byte a byte iguais** aos originais (teste automático).
- Teste automático: o modelo **não acrescenta nenhuma palavra** ao texto do original (só campos no lugar dos exemplos e dos colchetes).
- Nenhuma cláusula jurídica foi alterada. Erros de digitação do original **não foram corrigidos**.

## 4. Precisa de aprovação (Denilson e/ou advogado)
1. **Comissão:** os moldes trazem 8% fixo no texto; o sistema troca por 5% (urbano) ou 8% (rural) (confirmado pelo Lucas em 03/11). Nos moldes 5 e 6 o texto só tem o número ("8%"); no molde 2 também o extenso.
2. **Trechos de instrução do modelo que o sistema retira:** "(Escolher uma das opções)" (molde 6) e "(Adicionar segundo fiador se houver)" (molde 4). O segundo fiador virou um bloco opcional (com a assinatura dele).
3. **Pontuação que o original não tinha:** nos moldes 1, 2 e 6 o original escreve "CNPJ nº  CRECI Jurídico nº" sem vírgula; como foi pedido texto idêntico, o sistema mantém sem vírgula quando preenche.
4. **"Localizada no bairro..."** (moldes 1 e 2): a frase do exemplo está no feminino; para terreno/fazenda ficaria "Localizada" também. O campo de localização começa por "no bairro", "no povoado" ou "na fazenda".
5. **Erros de digitação do original (mantidos):**
   - Molde 1: "O CONTRATO declara" (1.2; provavelmente CONTRATANTE); "CREC nº" (provavelmente CRECI).
   - Molde 2: "O CONTRATANTEO CONTRATANTE" (2.2); ponto duplo no fim da 2.1 ("imóvel..").
   - Molde 4: a cláusula 6 começa em 6.2 (falta a 6.1); "CLÁUSULA 11 DA ENTREGA" sem travessão; espaço sobrando em " d) protesto"; "b)  juros" com espaço duplo.
   - Molde 5: não foi feita a leitura jurídica completa.
   - Molde 6: "1.2. 1.2."; colchetes duplos "[[" no objeto; "CLÁUSULA 5 –DOS" sem espaço; o texto de abertura diz "CONTRATO DE SINAL E RESERVA DE IMÓVEL" dentro de um contrato de compra e venda.
   - Moldes 3 a 6: falta uma leitura jurídica completa; foi feita só a revisão dos trechos variáveis.
6. **Molde 4 sem papel timbrado:** o arquivo recebido não tem logo, marca d'água nem rodapé. O sistema o gera idêntico ao recebido. Se existir uma versão com timbre, enviar; ou aprovar aplicar o timbre dos outros moldes.
7. **Molde com exclusividade:** o texto fala em "venda, locação ou administração". Querem um só para venda?
8. **Molde 3:** o texto cita a "comissão ajustada neste instrumento" sem número (a regra de 5%/8% não se aplica; a comissão é o 1º aluguel). Confirmar se é isso mesmo.
9. **Quem vê o quê:** corretor vê só os contratos que gerou (gerente vê todos). A Pollyana precisa ver todos? Marketing não vê contratos nem dados pessoais.
10. **RG opcional:** mantido opcional por causa do contrato real sem RG (só CPF). Se preferirem obrigatório, é uma troca simples. Se preenchido, só aceita números.

## 5. Pendências que dependem da Lucauto (sem isso sai "[A CONFIRMAR]")
- CNPJ da Lucauto, CRECI jurídico e CRECI da Pollyana.
- Telefone do rodapé dos contratos, (75) 9.9947-1011, que difere do WhatsApp do site, (75) 99942-1482: qual é qual? O rodapé segue como no Word original.
- CEP "48450-000" do modelo: agora é campo da pessoa (o da sede é 48500-000).
- Logo oficial em PNG transparente (a versão para fundo escuro foi recebida; falta decidir onde usar). O app usa um logo provisório recortado do contrato.
- Se o Filipe é sócio ou dono.
- Domínio e contas **em nome da Lucauto/dono**, nunca do desenvolvedor.

## 6. O que falta construir / ligar
1. **Supabase da Lucauto (projeto novo):** aplicar as migrações, desligar cadastro público, convite por e-mail, uma conta por pessoa, recuperação de senha, backup diário. Nunca pedir nem receber senha de ninguém.
2. **PDF online:** por enquanto o app entrega só o Word (sem botão de PDF) e a pessoa usa "Salvar como PDF" no Word. O PDF automático precisa de um serviço de conversão (ver `docs/PDF_EM_PRODUCAO.md`) e pode ser ligado depois.
3. **Salvar pessoas e imóveis cadastrados** para reaproveitar (módulo Imóveis, etapa 2: planilha do Google Sheets e fotos no Drive).
4. Painel e Automações (n8n/Sofia): depois.
5. Edição dos dados da empresa pela tela de Configurações (hoje é por variáveis de ambiente).

## 7. Decisões que dependem do dono/Lucas
- Hospedagem do serviço de PDF e seu custo mensal; contas em nome da empresa.
- Preço e prazo do projeto (nada disso está em arquivos do projeto).

## 8. Como rodar
`npm install`, copiar `.env.example` para `.env.local` e `npm run dev`. Testes: `npm test`. Validação página por página de um molde: `npm run test:visual -- <molde>`. Regras de acesso do banco: `npm run test:rls`. Detalhes no `README.md`.
