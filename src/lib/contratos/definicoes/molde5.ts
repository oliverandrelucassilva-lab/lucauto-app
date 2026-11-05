import { campoDataAssinatura, campoTipoImovel, campoValor, camposBanco, pessoaPorCidade, type Campo } from "../campos";
import { lerValor } from "../extenso";
import { comissaoPorTipo } from "../regras";
import type { Definicao, Problema } from "./tipos";

const C = (c: Campo) => c;

export const molde5: Definicao = {
  slug: "5_sinal_e_reserva_venda_sem_escritura",
  titulo: "Sinal e reserva",
  clienteChave: "comprador_nome",
  valorChave: "sinal",
  temFundo: true,
  linhasPorPagina: 31,
  etapas: [
    {
      id: "partes",
      titulo: "Partes",
      descricao: "Vendedor(a) (proprietário) e comprador(a) (pretendente). O RG é opcional.",
      campos: [...pessoaPorCidade("vendedor", "Vendedor(a) (proprietário)"), ...pessoaPorCidade("comprador", "Comprador(a) (pretendente)")],
    },
    {
      id: "imovel",
      titulo: "Imóvel",
      descricao: "Tipo do imóvel (define a comissão) e endereço.",
      campos: [campoTipoImovel(), C({ chave: "imovel_endereco", rotulo: "Endereço completo do imóvel", tipo: "area", obrigatorio: true, semPontoFinal: true, dica: "Rua, número, bairro, cidade (ou povoado/fazenda)." })],
    },
    {
      id: "valores",
      titulo: "Valores",
      descricao: "Sinal (reserva de 90 dias), dados bancários e valor total do imóvel.",
      campos: [
        campoValor("sinal", "Valor do sinal (R$)"),
        ...camposBanco("vendedor_nome"),
        campoValor("valor", "Valor total do imóvel (R$)"),
        campoDataAssinatura(),
      ],
    },
  ],
  calcular: (l) => {
    const c = comissaoPorTipo(l.tipo_imovel === "rural" ? "rural" : "urbano");
    return { comissao_pct: c.pct };
  },
  conferir: (l) => {
    const p: Problema[] = [];
    const v = lerValor(l.valor), s = lerValor(l.sinal);
    if (v && s && s > v) p.push({ chave: "sinal", rotulo: "Valor do sinal", motivo: "invalido", mensagem: "O sinal não pode ser maior que o valor total do imóvel." });
    return p;
  },
};
