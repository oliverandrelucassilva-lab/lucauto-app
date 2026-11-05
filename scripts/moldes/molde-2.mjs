import { editarImobiliaria, editarParte, substituir, substituirTudo } from "./lib.mjs";

export const slug = "2_intermediacao_sem_exclusividade";
export const edicoes = [
  [3, "[NOME", editarParte("proprietario")],
  [6, "LUCAUTO EMPREENDIMENTOS LTDA", editarImobiliaria],
  [11, "Casa residencial", (p) => substituirTudo(p, "Casa residencial",
    "{imovel_descricao} Localizada {imovel_localizacao}. Imóvel matriculado sob o nº {imovel_matricula} do {imovel_cartorio} de Registro de Imóveis de Euclides da Cunha/BA.")],
  [21, "3.1.", (p) => substituir(p, "total de R$ (digite o valor por extenso).", "total de {valor} ({valor_extenso}).")],
  [27, "Banco:", (p) => substituir(p, /Banco: _+/, "Banco: {banco}")],
  [28, "Agência:", (p) => substituir(p, /Agência: _+/, "Agência: {agencia}")],
  [29, "Favorecido:", (p) => substituir(p, /Favorecido: _+/, "Favorecido: {favorecido}")],
  [34, "4.1.", (p) => substituir(p, "8% (oito", "{comissao_pct}% ({comissao_extenso}")],
  [82, "Euclides da Cunha/BA, 07", (p) => substituir(p, "07 de novembro de 2025", "{data_assinatura}")],
];
