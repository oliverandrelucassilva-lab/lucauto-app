import { configEmpresa } from "@/config/empresa";
import { definicaoPorSlug } from "./definicoes";
import { montarDados, type Entrada, type Problema } from "./dados";
import { converterParaPdf, pdfDisponivel } from "./converter-pdf";
import { lerValor } from "./extenso";
import { gerarDocx } from "./modelo";
import { moldePorSlug } from "./moldes";

export class DadosIncompletos extends Error {
  constructor(public problemas: Problema[]) {
    super("Faltam dados para gerar o contrato.");
  }
}

export interface ContratoGerado {
  docx: Buffer;
  pdf: Buffer | null;
  dados: Record<string, string>;
  pendenciasEmpresa: string[];
  titulo: string;
  valorCentavos: number;
  tipoImovel: "urbano" | "rural" | null;
  dataAssinatura: string;
}

/** Valida, preenche o Word e converte para PDF. Só gera com tudo preenchido. */
export async function gerarContrato(slug: string, entrada: Entrada, opcoes: { pdfOpcional?: boolean } = {}): Promise<ContratoGerado> {
  const molde = moldePorSlug(slug);
  const def = definicaoPorSlug(slug);
  if (!molde || !molde.ativo || !def) throw new Error("Este molde ainda não está disponível.");
  const { dados, problemas, pendenciasEmpresa } = montarDados(slug, entrada, configEmpresa());
  if (problemas.length) throw new DadosIncompletos(problemas);
  const docx = gerarDocx(slug, dados);
  let pdf: Buffer | null = null;
  if (pdfDisponivel()) {
    try {
      pdf = await converterParaPdf(docx);
    } catch (e) {
      if (!opcoes.pdfOpcional) throw e;
    }
  }
  return {
    docx, pdf, dados, pendenciasEmpresa,
    titulo: `${def.titulo} — ${dados[def.clienteChave]}`,
    valorCentavos: def.valorChave ? (lerValor(dados[def.valorChave]) ?? 0) : 0,
    tipoImovel: entrada.tipo_imovel === "rural" ? "rural" : entrada.tipo_imovel === "urbano" ? "urbano" : null,
    dataAssinatura: entrada.data_assinatura ?? "",
  };
}
