import { editarImobiliaria, pessoaLocador, substituir, substituirTudo } from "./lib.mjs";

export const slug = "3_intermediacao_locacao_com_exclusividade";
export const edicoes = [
  [4, "NOME, estado civil", (p) => substituirTudo(p, "NOME, estado civil", pessoaLocador("locador"))],
  [7, "LUCAUTO EMPREENDIMENTOS LTDA", editarImobiliaria],
  [12, "[endereço completo", (p) => substituir(p, "[endereço completo, descrição, área, benfeitorias e características]", "{imovel_descricao}")],
  [94, "Euclides da Cunha/BA,", (p) => substituir(p, "07 de janeiro de 2026", "{data_assinatura}")],
];
