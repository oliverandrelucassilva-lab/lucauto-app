import { campoDataAssinatura, pessoaComEndereco, type Campo } from "../campos";
import type { Definicao } from "./tipos";

const C = (c: Campo) => c;

export const molde3: Definicao = {
  slug: "3_intermediacao_locacao_com_exclusividade",
  titulo: "Intermediação de locação",
  clienteChave: "locador_nome",
  temFundo: true,
  linhasPorPagina: 31,
  etapas: [
    { id: "partes", titulo: "Partes", descricao: "Dados do locador (proprietário). O RG e o endereço são opcionais.", campos: pessoaComEndereco("locador", "Locador (proprietário)", { telefone: true }) },
    {
      id: "imovel",
      titulo: "Imóvel",
      descricao: "Endereço completo e descrição do imóvel que será alugado.",
      campos: [C({ chave: "imovel_descricao", rotulo: "Endereço, descrição, área, benfeitorias e características", tipo: "area", obrigatorio: true, semPontoFinal: true, dica: "O ponto final já vem no modelo." })],
    },
    { id: "data", titulo: "Data", descricao: "Data da assinatura do contrato.", campos: [campoDataAssinatura()] },
  ],
};
