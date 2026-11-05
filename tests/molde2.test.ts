import { describe, expect, it } from "vitest";
import { montarDados } from "@/lib/contratos/dados";
import { gerarDocx } from "@/lib/contratos/modelo";
import { ENTRADA_FICTICIA, EMPRESA_PREENCHIDA } from "./fixtures/dados-ficticios";
import { textosDoDocx } from "./helpers";

const SLUG = "2_intermediacao_sem_exclusividade";
const gerar = (extra: Record<string, string> = {}) => {
  const r = montarDados(SLUG, { ...ENTRADA_FICTICIA, ...extra }, EMPRESA_PREENCHIDA);
  expect(r.problemas).toEqual([]);
  return textosDoDocx(gerarDocx(SLUG, r.dados));
};
const achar = (ts: string[], comeco: string) => ts.find((t) => t.startsWith(comeco)) ?? "";

describe("Intermediação sem exclusividade (molde 2)", () => {
  it("sem marcadores nem exemplos", () => {
    const todo = gerar().join("\n");
    expect(todo).not.toMatch(/[{}]/);
    expect(todo).not.toContain("360m²");
    expect(todo).not.toContain("novembro de 2025");
  });
  it("comissão 5% urbano e 8% rural, com extenso", () => {
    expect(achar(gerar({ tipo_imovel: "urbano" }), "4.1.")).toContain("o percentual de 5% (cinco por cento)");
    expect(achar(gerar({ tipo_imovel: "rural" }), "4.1.")).toContain("o percentual de 8% (oito por cento)");
  });
  it("valor, banco e data", () => {
    const ts = gerar();
    expect(achar(ts, "3.1.")).toContain("R$ 350.000,00 (trezentos e cinquenta mil reais).");
    expect(ts).toContain("Banco: Banco Exemplo");
    expect(ts).toContain("Euclides da Cunha/BA, 05 de novembro de 2026");
  });
  it("texto de 'sem exclusividade' e erros de digitação do original ficam como estão", () => {
    const todo = gerar().join("\n");
    expect(todo).toContain("firmada sem exclusividade");
    expect(todo).toContain("O CONTRATANTEO CONTRATANTE, contudo");
  });
});
