import { campoDataAssinatura, campoTipoImovel, campoValor, pessoaPorCidade, type Campo } from "../campos";
import { formatarBRL, lerValor } from "../extenso";
import { comissaoPorTipo } from "../regras";
import type { Definicao, Problema } from "./tipos";

const C = (c: Campo) => c;

const FORMAS = [
  { valor: "avista", rotulo: "À vista na assinatura da escritura definitiva" },
  { valor: "financiamento", rotulo: "Mediante financiamento bancário" },
  { valor: "parcelado", rotulo: "Parcelado conforme cronograma anexo" },
  { valor: "outra", rotulo: "Outra forma" },
];

export const molde6: Definicao = {
  slug: "6_compra_e_venda",
  titulo: "Compra e venda",
  clienteChave: "comprador_nome",
  valorChave: "valor",
  temFundo: true,
  linhasPorPagina: 31,
  etapas: [
    {
      id: "partes",
      titulo: "Partes",
      descricao: "Vendedor(a) e comprador(a). O RG é opcional.",
      campos: [
        ...pessoaPorCidade("vendedor", "Vendedor(a)"),
        ...pessoaPorCidade("comprador", "Comprador(a)"),
      ],
    },
    {
      id: "imovel",
      titulo: "Imóvel",
      descricao: "Tipo do imóvel (define a comissão) e descrição completa.",
      campos: [
        campoTipoImovel(),
        C({ chave: "imovel_descricao", rotulo: "Endereço e descrição do imóvel", tipo: "area", obrigatorio: true, semPontoFinal: true, dica: "Endereço completo, matrícula, descrição, confrontações, área construída, área total, benfeitorias e características." }),
      ],
    },
    {
      id: "valores",
      titulo: "Valores",
      descricao: "Valor total, sinal, saldo e forma de pagamento.",
      campos: [
        campoValor("valor", "Valor total da venda (R$)"),
        campoValor("sinal", "Valor do sinal / arras (R$)"),
        C({ chave: "data_sinal", rotulo: "Data até a qual o sinal será pago", tipo: "data", obrigatorio: true }),
        C({ chave: "saldo", rotulo: "Saldo remanescente (R$)", tipo: "dinheiro", obrigatorio: false, dica: "Calculado sozinho (valor total menos o sinal). Só preencha se for diferente.", erroInvalido: "Valor inválido. Digite só números." }),
        C({ chave: "forma_pagamento", rotulo: "Forma de pagamento do saldo", tipo: "opcoes", obrigatorio: true, opcoes: FORMAS }),
        C({ chave: "forma_outra", rotulo: "Qual outra forma?", tipo: "texto", obrigatorio: false, dica: "Preencha só se escolheu \"Outra forma\"." }),
        campoDataAssinatura(),
      ],
    },
  ],
  sugerir: (l) => {
    const v = lerValor(l.valor), s = lerValor(l.sinal);
    const r: Record<string, string> = {};
    if (v && s && v > s) r.saldo = formatarBRL(v - s).replace("R$ ", "");
    return r;
  },
  calcular: (l) => {
    const c = comissaoPorTipo(l.tipo_imovel === "rural" ? "rural" : "urbano");
    const marca = (f: string) => (l.forma_pagamento === f ? "X" : " ");
    return {
      comissao_pct: c.pct,
      marca_avista: marca("avista"), marca_financiamento: marca("financiamento"), marca_parcelado: marca("parcelado"), marca_outra: marca("outra"),
      forma_outra: l.forma_pagamento === "outra" ? l.forma_outra : "",
    };
  },
  conferir: (l) => {
    const p: Problema[] = [];
    const v = lerValor(l.valor), s = lerValor(l.sinal);
    if (v && s && s > v) p.push({ chave: "sinal", rotulo: "Valor do sinal", motivo: "invalido", mensagem: "O sinal não pode ser maior que o valor total." });
    if (l.forma_pagamento === "outra" && !l.forma_outra) p.push({ chave: "forma_outra", rotulo: "Qual outra forma?", motivo: "faltando" });
    return p;
  },
};
