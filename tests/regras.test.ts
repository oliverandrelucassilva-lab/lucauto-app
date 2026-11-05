import { describe, expect, it } from "vitest";
import { comissaoPorTipo, dataCurta, dataPorExtenso, hojeISO } from "@/lib/contratos/regras";

describe("regras", () => {
  it("comissão urbana é 5% (cinco)", () => expect(comissaoPorTipo("urbano")).toEqual({ pct: "5", extenso: "cinco" }));
  it("comissão rural é 8% (oito)", () => expect(comissaoPorTipo("rural")).toEqual({ pct: "8", extenso: "oito" }));
  it("data por extenso, igual ao formato do Word", () => {
    expect(dataPorExtenso("2026-11-05")).toBe("05 de novembro de 2026");
    expect(dataPorExtenso("2026-13-05")).toBe("");
    expect(dataCurta("1980-02-01")).toBe("01/02/1980");
  });
  it("a data de hoje entra sozinha (no fuso da Bahia)", () => {
    expect(hojeISO(new Date("2026-11-05T12:00:00Z"))).toBe("2026-11-05");
    // 01h UTC ainda é o dia anterior na Bahia (UTC-3)
    expect(hojeISO(new Date("2026-11-06T01:00:00Z"))).toBe("2026-11-05");
  });
});
