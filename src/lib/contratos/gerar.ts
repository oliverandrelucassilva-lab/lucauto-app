import { configEmpresa } from "@/config/empresa";
import { montarDados, type Entrada, type Problema } from "./dados";
import { converterParaPdf } from "./converter-pdf";
import { gerarDocx } from "./modelo";
import { moldePorSlug } from "./moldes";

export class DadosIncompletos extends Error {
  constructor(public problemas: Problema[]) {
    super("Faltam dados para gerar o contrato.");
  }
}

export interface ContratoGerado {
  docx: Buffer;
  pdf: Buffer;
  dados: Record<string, string>;
  pendenciasEmpresa: string[];
}

/** Valida, preenche o Word e converte para PDF. Só gera com tudo preenchido. */
export async function gerarContrato(slug: string, entrada: Entrada): Promise<ContratoGerado> {
  const molde = moldePorSlug(slug);
  if (!molde || !molde.ativo) throw new Error("Este molde ainda não está disponível.");
  const { dados, problemas, pendenciasEmpresa } = montarDados(entrada, configEmpresa());
  if (problemas.length) throw new DadosIncompletos(problemas);
  const docx = gerarDocx(slug, dados);
  const pdf = await converterParaPdf(docx);
  return { docx, pdf, dados, pendenciasEmpresa };
}
