import { campoDataAssinatura, campoValor, pessoaComEndereco, type Campo } from "../campos";
import { inteiroPorExtenso } from "../extenso";
import { fimDoPrazo } from "../regras";
import type { Definicao, Problema } from "./tipos";

const C = (c: Campo) => c;

export const molde4: Definicao = {
  slug: "4_contrato_locacao_residencial",
  titulo: "Locação residencial",
  clienteChave: "locatario_nome",
  valorChave: "aluguel",
  temFundo: false, // o Word deste molde não tem logo, marca d'água nem rodapé
  linhasPorPagina: 33,
  etapas: [
    {
      id: "partes",
      titulo: "Partes",
      descricao: "Locador, locatário e fiador. O RG e o endereço são opcionais.",
      campos: [
        ...pessoaComEndereco("locador", "Locador"),
        ...pessoaComEndereco("locatario", "Locatário"),
        ...pessoaComEndereco("fiador", "Fiador", { nacionalidade: true }),
        ...pessoaComEndereco("fiador2", "Segundo fiador (só se houver)", { nacionalidade: true, dependeDe: "fiador2_nome" }),
      ],
    },
    {
      id: "imovel",
      titulo: "Imóvel",
      descricao: "Endereço completo e descrição do imóvel alugado.",
      campos: [C({ chave: "imovel_endereco", rotulo: "Endereço completo e descrição do imóvel", tipo: "area", obrigatorio: true, dica: "Rua, número, bairro, cidade e descrição (ex.: casa com 2 quartos)." })],
    },
    {
      id: "valores",
      titulo: "Prazo e valores",
      descricao: "Prazo, datas, aluguel e vencimento.",
      campos: [
        C({ chave: "prazo_meses", rotulo: "Prazo (em meses)", tipo: "inteiro", obrigatorio: true, mascara: "digitos", dica: "Só números. Ex.: 12", erroInvalido: "Digite o prazo em meses, só números (ex.: 12)." }),
        C({ chave: "data_inicio", rotulo: "Data de início", tipo: "data", obrigatorio: true }),
        C({ chave: "data_fim", rotulo: "Data de término", tipo: "data", obrigatorio: false, dica: "Calculada sozinha a partir do início e do prazo. Só preencha se for diferente." }),
        campoValor("aluguel", "Valor do aluguel mensal (R$)"),
        C({ chave: "dia_vencimento", rotulo: "Dia do vencimento", tipo: "inteiro", obrigatorio: true, mascara: "digitos", dica: "Dia do mês, de 1 a 31.", erroInvalido: "Digite um dia entre 1 e 31." }),
        campoDataAssinatura(),
      ],
    },
  ],
  sugerir: (l) => {
    const fim = fimDoPrazo(l.data_inicio, Number(l.prazo_meses));
    const r: Record<string, string> = {};
    if (fim) r.data_fim = fim;
    return r;
  },
  calcular: (l) => ({
    prazo_extenso: /^\d+$/.test(l.prazo_meses) ? inteiroPorExtenso(Number(l.prazo_meses)) : "",
    dia_vencimento: /^\d+$/.test(l.dia_vencimento) ? l.dia_vencimento.padStart(2, "0") : "",
  }),
  conferir: (l) => {
    const p: Problema[] = [];
    const dia = Number(l.dia_vencimento);
    if (l.dia_vencimento && (dia < 1 || dia > 31)) p.push({ chave: "dia_vencimento", rotulo: "Dia do vencimento", motivo: "invalido" });
    if (l.data_inicio && l.data_fim && l.data_fim <= l.data_inicio) p.push({ chave: "data_fim", rotulo: "Data de término", motivo: "invalido", mensagem: "A data de término deve ser depois da data de início." });
    return p;
  },
};
