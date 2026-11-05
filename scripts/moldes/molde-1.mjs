import { pessoaPorCidade, substituir, substituirTudo } from "./lib.mjs";

export const slug = "1_intermediacao_com_exclusividade";
export const edicoes = [
  [3, "[NOME", (p) => {
    p = substituir(p, "[NOME, estado civil, profissão, data de nascimento, RG sob o nº e CPF de nº", pessoaPorCidade("proprietario").split(", residente e domiciliado")[0]);
    return substituir(p, "na cidade de  , Bahia, CEP: 48450-000, telefone:, e-mail: ", "na cidade de {proprietario_cidade}, {proprietario_uf}, CEP: {proprietario_cep}, telefone: {proprietario_telefone}, e-mail: {proprietario_email}");
  }],
  [6, "LUCAUTO EMPREENDIMENTOS LTDA", (p) => {
    p = substituir(p, "CNPJ nº CRECI Jurídico nº", "CNPJ nº {empresa_cnpj} CRECI Jurídico nº {empresa_creci}");
    return substituir(p, "POLLYANA MALTA MARQUES CUNHA, CREC nº:", "{corretora_nome}, CREC nº: {corretora_creci}");
  }],
  [11, "Casa residencial", (p) => substituirTudo(p, "Casa residencial",
    "{imovel_descricao} Localizada {imovel_localizacao}. Imóvel matriculado sob o nº {imovel_matricula} do {imovel_cartorio} de Registro de Imóveis de Euclides da Cunha/BA.")],
  [21, "3.1.", (p) => substituir(p, "total de R$ (digite o valor por extenso).", "total de {valor} ({valor_extenso}).")],
  [27, "Banco:", (p) => substituir(p, /Banco: _+/, "Banco: {banco}")],
  [28, "Agência:", (p) => substituir(p, /Agência: _+/, "Agência: {agencia}")],
  [29, "Favorecido:", (p) => substituir(p, /Favorecido: _+/, "Favorecido: {favorecido}")],
  [34, "4.1.", (p) => substituir(p, "8% (oito", "{comissao_pct}% ({comissao_extenso}")],
  [84, "Euclides da Cunha/BA, 07", (p) => substituir(p, "07 de novembro de 2025", "{data_assinatura}")],
];
