// Regras de negócio dos contratos, em português claro.

export type TipoImovel = "urbano" | "rural";

/** Comissão: 5% para imóvel urbano, 8% para rural (confirmado por Lucas em 03/11). */
export function comissaoPorTipo(tipo: TipoImovel): { pct: string; extenso: string } {
  return tipo === "rural" ? { pct: "8", extenso: "oito" } : { pct: "5", extenso: "cinco" };
}

export const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

/** Data de hoje (AAAA-MM-DD) no fuso de Euclides da Cunha/BA. */
export function hojeISO(agora: Date = new Date()): string {
  const partes = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bahia", year: "numeric", month: "2-digit", day: "2-digit" }).format(agora);
  return partes; // en-CA => AAAA-MM-DD
}

/** "2026-11-05" -> "05 de novembro de 2026" (mesmo formato do Word original). */
export function dataPorExtenso(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return "";
  const mes = Number(m[2]);
  if (mes < 1 || mes > 12) return "";
  return `${m[3]} de ${MESES[mes - 1]} de ${m[1]}`;
}

/** "1980-02-01" -> "01/02/1980" */
export function dataCurta(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
}
