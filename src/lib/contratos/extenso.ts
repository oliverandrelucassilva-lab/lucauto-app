// Valor por extenso e formatação de dinheiro.
// Portado do protótipo (docs/referencia/prototipo_gerador_contratos.html).

const U = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
const T = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const H = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

function ate999(n: number): string {
  if (n === 100) return "cem";
  const h = Math.floor(n / 100);
  const r = n % 100;
  const p: string[] = [];
  if (h) p.push(H[h]);
  if (r) {
    if (r < 20) p.push(U[r]);
    else {
      const t = Math.floor(r / 10);
      const u = r % 10;
      p.push(T[t] + (u ? " e " + U[u] : ""));
    }
  }
  return p.join(" e ");
}

export function inteiroPorExtenso(n: number): string {
  if (n === 0) return "zero";
  const grupos = [
    { v: Math.floor(n / 1e9) % 1000, um: "um bilhão", pl: "bilhões" },
    { v: Math.floor(n / 1e6) % 1000, um: "um milhão", pl: "milhões" },
    { v: Math.floor(n / 1e3) % 1000, um: "mil", pl: "mil" },
    { v: n % 1000, um: "", pl: "" },
  ].filter((g) => g.v > 0);
  const partes = grupos.map((g) => {
    if (g.pl === "mil") return g.v === 1 ? "mil" : ate999(g.v) + " mil";
    if (g.pl === "") return ate999(g.v);
    return g.v === 1 ? g.um : ate999(g.v) + " " + g.pl;
  });
  let out = partes[0];
  for (let i = 1; i < partes.length; i++) {
    const v = grupos[i].v;
    const ultimo = i === partes.length - 1;
    out += ultimo && (v < 100 || v % 100 === 0) ? " e " : ", ";
    out += partes[i];
  }
  return out;
}

export function moedaPorExtenso(reais: number, centavos: number): string {
  let s: string;
  if (reais === 0 && centavos > 0) s = "";
  else {
    s = inteiroPorExtenso(reais);
    if (reais >= 1e6 && reais % 1e6 === 0) s += " de reais";
    else s += reais === 1 ? " real" : " reais";
  }
  if (centavos > 0) {
    const c = inteiroPorExtenso(centavos) + (centavos === 1 ? " centavo" : " centavos");
    s = s ? s + " e " + c : c;
  }
  return s;
}

/** Valor em centavos a partir do texto digitado ("350000", "350.000,00", "R$ 1.250.000,50"). */
export function lerValor(txt: string | null | undefined): number | null {
  let t = String(txt ?? "").replace(/[R$\s]/g, "");
  if (!t) return null;
  if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".");
  else if ((t.match(/\./g) ?? []).length > 1 || /\.\d{3}$/.test(t)) t = t.replace(/\./g, "");
  if (!/^\d+(\.\d+)?$/.test(t)) return null;
  const n = Number(t);
  if (!isFinite(n) || n <= 0 || n >= 1e12) return null;
  return Math.round(n * 100);
}

export function formatarBRL(centavos: number): string {
  const r = Math.floor(centavos / 100);
  const c = centavos % 100;
  return "R$ " + String(r).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + String(c).padStart(2, "0");
}

export function valorPorExtenso(centavos: number): string {
  return moedaPorExtenso(Math.floor(centavos / 100), centavos % 100);
}
