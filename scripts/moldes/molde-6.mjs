import { editarImobiliaria, editarParte, substituir } from "./lib.mjs";

export const slug = "6_compra_e_venda";

export const edicoes = [
  [3, "[NOME", editarParte("vendedor")],
  [6, "[NOME", editarParte("comprador")],
  [9, "LUCAUTO EMPREENDIMENTOS LTDA", editarImobiliaria],
  [13, "1.1.", (p) => substituir(p, /\[\[endereço completo[^\]]*\]/, "{imovel_descricao}")],
  [24, "2.1.", (p) => substituir(p, "R$ [valor] (por extenso)", "{valor} ({valor_extenso})")],
  [26, "a) sinal", (p) => substituir(substituir(p, "R$ [valor]", "{sinal}"), "XX/XX/XXX", "{data_sinal}")],
  [27, "b) saldo", (p) => substituir(substituir(p, "R$ [valor]", "{saldo}"), " (Escolher uma das opções)", "")],
  [28, "( )", (p) => substituir(p, "( )", "({marca_avista})")],
  [29, "( )", (p) => substituir(p, "( )", "({marca_financiamento})")],
  [30, "( )", (p) => substituir(p, "( )", "({marca_parcelado})")],
  [31, "( )", (p) => substituir(substituir(p, "( )", "({marca_outra})"), "outra forma: ", "outra forma: {forma_outra}")],
  [54, "6.2.", (p) => substituir(p, "comissão de 8%", "comissão de {comissao_pct}%")],
  [94, "Euclides da Cunha/BA,", (p) => substituir(p, "01 de dezembro de 2025", "{data_assinatura}")],
];
