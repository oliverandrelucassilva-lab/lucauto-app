import { campoDataAssinatura, campoTipoImovel, campoValor, camposBanco, camposImovelPadrao, pessoaPorCidade } from "../campos";
import { comissaoPorTipo } from "../regras";
import type { Definicao } from "./tipos";

export const molde1: Definicao = {
  slug: "1_intermediacao_com_exclusividade",
  titulo: "Intermediação com exclusividade",
  clienteChave: "proprietario_nome",
  valorChave: "valor",
  temFundo: true,
  linhasPorPagina: 31,
  etapas: [
    { id: "partes", titulo: "Partes", descricao: "Dados do proprietário (contratante).", campos: pessoaPorCidade("proprietario") },
    { id: "imovel", titulo: "Imóvel", descricao: "Tipo, descrição e documentação do imóvel.", campos: [campoTipoImovel(), ...camposImovelPadrao()] },
    { id: "valores", titulo: "Valores", descricao: "Valor do imóvel, dados bancários para o sinal e data da assinatura.", campos: [campoValor("valor", "Valor do imóvel (R$)"), ...camposBanco("proprietario_nome"), campoDataAssinatura()] },
  ],
  calcular: (l) => {
    const c = comissaoPorTipo(l.tipo_imovel === "rural" ? "rural" : "urbano");
    return { comissao_pct: c.pct, comissao_extenso: c.extenso };
  },
};
