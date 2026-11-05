import { describe, expect, it } from "vitest";
import { formatarBRL, lerValor, valorPorExtenso } from "@/lib/contratos/extenso";

// Os mesmos valores do briefing (3.6).
const casos: [string, string, string][] = [
  ["100", "R$ 100,00", "cem reais"],
  ["1.001", "R$ 1.001,00", "mil e um reais"],
  ["101.101", "R$ 101.101,00", "cento e um mil, cento e um reais"],
  ["1.000.000", "R$ 1.000.000,00", "um milhão de reais"],
  ["1.250.000,50", "R$ 1.250.000,50", "um milhão, duzentos e cinquenta mil reais e cinquenta centavos"],
];

describe("valor por extenso", () => {
  it.each(casos)("%s", (digitado, formatado, extenso) => {
    const c = lerValor(digitado)!;
    expect(formatarBRL(c)).toBe(formatado);
    expect(valorPorExtenso(c)).toBe(extenso);
  });

  it("outros casos comuns", () => {
    const e = (t: string) => valorPorExtenso(lerValor(t)!);
    expect(e("1")).toBe("um real");
    expect(e("0,01")).toBe("um centavo");
    expect(e("2.000.000")).toBe("dois milhões de reais");
    expect(e("350000")).toBe("trezentos e cinquenta mil reais");
    expect(e("1.500,00")).toBe("mil e quinhentos reais");
    expect(e("R$ 120.000,00")).toBe("cento e vinte mil reais");
  });

  it("rejeita valor vazio, zero ou inválido", () => {
    for (const t of ["", "0", "abc", "-5", "1.2.3,4,5"]) expect(lerValor(t)).toBeNull();
  });
});
