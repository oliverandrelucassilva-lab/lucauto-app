// Máscaras e formatos dos campos numéricos (só números; pontuação é colocada pelo sistema).

export const soDigitos = (t: string) => t.replace(/\D/g, "");

/** Remove acentos e põe em minúsculas, para buscar "sao paulo" e achar "São Paulo". */
export const normalizar = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/** 11144477735 -> 111.444.777-35 (se não tiver 11 dígitos, devolve como veio). */
export function formatarCpf(txt: string): string {
  const d = soDigitos(txt);
  return d.length === 11 ? `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}` : txt;
}

/** Máscara enquanto digita: 07599... -> (75) 99999-9999 */
export function mascaraTelefone(txt: string): string {
  const d = soDigitos(txt).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  const ddd = d.slice(0, 2), resto = d.slice(2);
  const corte = d.length > 10 ? 5 : 4; // celular (9 dígitos) ou fixo (8)
  return resto.length <= corte ? `(${ddd}) ${resto}` : `(${ddd}) ${resto.slice(0, corte)}-${resto.slice(corte)}`;
}

export function mascaraCep(txt: string): string {
  const d = soDigitos(txt).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export function mascaraCpf(txt: string): string {
  const d = soDigitos(txt).slice(0, 11);
  const p = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9)].filter(Boolean).join(".");
  return d.length > 9 ? `${p}-${d.slice(9)}` : p;
}

/** RG, matrícula e agência: só números e a pontuação comum (. - /). Letras são apagadas. */
export const mascaraNumerica = (txt: string) => txt.replace(/[^\d.\-/\s]/g, "").replace(/\s+/g, " ");

export type Mascara = "telefone" | "cep" | "cpf" | "numerico";
export function aplicarMascara(m: Mascara | undefined, txt: string): string {
  switch (m) {
    case "telefone": return mascaraTelefone(txt);
    case "cep": return mascaraCep(txt);
    case "cpf": return mascaraCpf(txt);
    case "numerico": return mascaraNumerica(txt);
    default: return txt;
  }
}
