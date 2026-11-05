import { describe, expect, it } from "vitest";
import { montarDados } from "@/lib/contratos/dados";
import { gerarDocx } from "@/lib/contratos/modelo";
import { ENTRADA_INTERMEDIACAO_LOCACAO as BASE, EMPRESA_PREENCHIDA } from "./fixtures/dados-ficticios";
import { textosDoDocx } from "./helpers";

const SLUG = "3_intermediacao_locacao_com_exclusividade";
const gerar = (extra: Record<string, string> = {}) => {
  const r = montarDados(SLUG, { ...BASE, ...extra }, EMPRESA_PREENCHIDA);
  expect(r.problemas).toEqual([]);
  return textosDoDocx(gerarDocx(SLUG, r.dados));
};
const achar = (ts: string[], comeco: string) => ts.find((t) => t.startsWith(comeco)) ?? "";

describe("Intermediação de locação (molde 3)", () => {
  it("sem marcadores nem exemplos", () => {
    const todo = gerar().join("\n");
    expect(todo).not.toMatch(/[{}]/);
    expect(todo).not.toContain("NOME, estado civil");
    expect(todo).not.toContain("janeiro de 2026");
  });
  it("locador completo", () => {
    expect(achar(gerar(), "Locador Exemplo")).toBe("Locador Exemplo de Teste, casado(a), comerciante, RG nº 00.000.000-00, CPF nº 111.444.777-35, Rua Exemplo, 100, Bairro Teste, Cidade Exemplo, telefone (00) 90000-0000, e-mail locador@exemplo.test");
  });
  it("sem RG e sem endereço", () => {
    expect(achar(gerar({ locador_rg: "", locador_endereco: "" }), "Locador Exemplo")).toBe("Locador Exemplo de Teste, casado(a), comerciante, CPF nº 111.444.777-35, telefone (00) 90000-0000, e-mail locador@exemplo.test");
  });
  it("imóvel: o ponto final é o do modelo", () => {
    expect(gerar({ imovel_descricao: "Casa de teste." })).toContain("Casa de teste.");
    expect(gerar({ imovel_descricao: "Casa de teste." }).filter((t) => t === "Casa de teste..").length).toBe(0);
  });
  it("sem valor em dinheiro: o 1º aluguel e os 6 meses são do próprio modelo", () => {
    const todo = gerar().join("\n");
    expect(todo).toContain("comissão correspondente ao 1º (primeiro) aluguel");
    expect(todo).toContain("prazo de 6 (seis) meses");
  });
  it("data de hoje", () => expect(gerar({ data_assinatura: "2026-11-05" })).toContain("Euclides da Cunha/BA, 05 de novembro de 2026"));
  it("telefone com letras é recusado", () => {
    expect(montarDados(SLUG, { ...BASE, locador_telefone: "abc" }, EMPRESA_PREENCHIDA).problemas.map((p) => p.chave)).toContain("locador_telefone");
  });
});
