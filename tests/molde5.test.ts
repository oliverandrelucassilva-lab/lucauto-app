import { describe, expect, it } from "vitest";
import { montarDados } from "@/lib/contratos/dados";
import { gerarDocx } from "@/lib/contratos/modelo";
import { ENTRADA_SINAL, EMPRESA_PREENCHIDA } from "./fixtures/dados-ficticios";
import { textosDoDocx } from "./helpers";

const SLUG = "5_sinal_e_reserva_venda_sem_escritura";
const gerar = (extra: Record<string, string> = {}) => {
  const r = montarDados(SLUG, { ...ENTRADA_SINAL, ...extra }, EMPRESA_PREENCHIDA);
  expect(r.problemas).toEqual([]);
  return textosDoDocx(gerarDocx(SLUG, r.dados));
};
const achar = (ts: string[], comeco: string) => ts.find((t) => t.startsWith(comeco)) ?? "";

describe("Sinal e reserva (molde 5)", () => {
  it("sem marcadores nem colchetes de exemplo", () => {
    const todo = gerar().join("\n");
    expect(todo).not.toMatch(/[{}]/);
    expect(todo).not.toContain("[valor]");
    expect(todo).not.toContain("[endereço completo]");
  });
  it("objeto: endereço entra e a vírgula do modelo continua", () => {
    expect(achar(gerar({ imovel_endereco: "Fazenda Teste," }), "1.1.")).toBe("1.1. O objeto deste contrato é o imóvel situado em Fazenda Teste, atualmente sem escritura definitiva, mas de posse mansa e pacífica do VENDEDOR, que declara ser o legítimo possuidor do bem.");
  });
  it("sinal com extenso e o prazo de 90 dias do próprio modelo", () => {
    expect(achar(gerar(), "2.1.")).toContain("a quantia de R$ 10.000,00 (dez mil reais), a título de sinal e princípio de pagamento, com a finalidade de reservar o imóvel por 90 (noventa) dias.");
  });
  it("banco, agência e favorecido", () => {
    const ts = gerar();
    expect(ts).toContain("Banco: Banco Exemplo");
    expect(ts).toContain("Agência: 0000");
    expect(ts).toContain("Favorecido: Vendedora Exemplo de Teste");
  });
  it("valor total com extenso", () => {
    expect(achar(gerar(), "4.1.")).toBe("4.1. O valor total do imóvel será de R$ 350.000,00 (trezentos e cinquenta mil reais).");
  });
  it("comissão 5% urbano e 8% rural", () => {
    expect(achar(gerar({ tipo_imovel: "urbano" }), "7.1.")).toContain("comissão de 5% sobre o valor final da venda");
    expect(achar(gerar({ tipo_imovel: "rural" }), "7.1.")).toContain("comissão de 8% sobre o valor final da venda");
  });
  it("data automática, sem a data antiga", () => {
    const ts = gerar({ data_assinatura: "2026-11-05" });
    expect(ts).toContain("Euclides da Cunha/BA, 05 de novembro de 2026");
    expect(ts.join("\n")).not.toContain("dezembro de 2025");
  });
  it("sinal maior que o total é recusado", () => {
    expect(montarDados(SLUG, { ...ENTRADA_SINAL, sinal: "999.999,00" }, EMPRESA_PREENCHIDA).problemas.map((p) => p.chave)).toContain("sinal");
  });
});
