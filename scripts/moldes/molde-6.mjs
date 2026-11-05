import { pessoaPorCidade, substituir } from "./lib.mjs";

export const slug = "6_compra_e_venda";

// Parte "[NOME, estado civil, ... e-mail:" (mesmo texto do molde 1)
const parte = (pre) => (p) => {
  p = substituir(p, "[NOME, estado civil, profissão, data de nascimento, RG sob o nº e CPF de nº", pessoaPorCidade(pre).split(", residente e domiciliado")[0]);
  return substituir(p, /na cidade de\s+, Bahia, CEP: 48450-000, telefone:, e-mail:\s*$/, `na cidade de {${pre}_cidade}, {${pre}_uf}, CEP: {${pre}_cep}, telefone: {${pre}_telefone}, e-mail: {${pre}_email}`);
};

export const edicoes = [
  [3, "[NOME", parte("vendedor")],
  [6, "[NOME", parte("comprador")],
  [9, "LUCAUTO EMPREENDIMENTOS LTDA", (p) => {
    p = substituir(p, "CNPJ nº CRECI Jurídico nº", "CNPJ nº {empresa_cnpj} CRECI Jurídico nº {empresa_creci}");
    return substituir(p, "POLLYANA MALTA MARQUES CUNHA, CREC nº:", "{corretora_nome}, CREC nº: {corretora_creci}");
  }],
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
