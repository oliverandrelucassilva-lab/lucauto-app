import { clonarComTexto, pessoaComEndereco, substituir, substituirTudo } from "./lib.mjs";

export const slug = "4_contrato_locacao_residencial";

// Segundo fiador: bloco opcional. Se {fiador2_nome} ficar vazio, o bloco inteiro some.
const abre = (p) => clonarComTexto(p, "{#fiador2_nome}");
const fecha = (p) => clonarComTexto(p, "{/fiador2_nome}");

export const edicoes = [
  [3, "[Nome]", (p) => substituirTudo(p, "[Nome]", pessoaComEndereco("locador"))],
  [6, "[Nome]", (p) => substituirTudo(p, "[Nome]", pessoaComEndereco("locatario"))],
  [12, "[endereço completo e descrição do imóvel]", (p) => substituir(p, "[endereço completo e descrição do imóvel]", "{imovel_endereco}")],
  [17, "2.1.", (p) => substituir(p, /prazo de _+ \(_+\) meses, iniciando-se em \/\/_+ e encerrando-se em \/\/_+\./, "prazo de {prazo_meses} ({prazo_extenso}) meses, iniciando-se em {data_inicio} e encerrando-se em {data_fim}.")],
  [23, "3.1.", (p) => substituir(p, /R\$ _+ \(por extenso\), vencível todo dia _+ de cada mês\./, "{aluguel} ({aluguel_extenso}), vencível todo dia {dia_vencimento} de cada mês.")],
  [41, "[Nome]", (p) => substituirTudo(p, "[Nome]", pessoaComEndereco("fiador", { nacionalidade: true }))],
  // (Adicionar segundo fiador se houver) -> bloco opcional com os dados do segundo fiador
  [42, "(Adicionar segundo fiador", (p, o) =>
    abre(p) + o[40] + substituirTudo(o[41], "[Nome]", pessoaComEndereco("fiador2", { nacionalidade: true })) + fecha(p)],
  [100, "Euclides da Cunha/BA,", (p) => substituirTudo(p, "Euclides da Cunha/BA,", "Euclides da Cunha/BA, {data_assinatura}.")],
  // assinatura do segundo fiador (só aparece se houver segundo fiador)
  [109, "FIADOR", (p, o) => p + abre(p) + o[107] + o[108] + o[109] + fecha(p)],
];
