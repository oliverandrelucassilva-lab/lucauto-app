import { describe, expect, it } from "vitest";
import { montarDados } from "@/lib/contratos/dados";
import { gerarDocx } from "@/lib/contratos/modelo";
import { ENTRADA_COMPRA_VENDA, EMPRESA_PREENCHIDA } from "./fixtures/dados-ficticios";
import { textosDoDocx } from "./helpers";

const SLUG = "6_compra_e_venda";
const gerar = (extra: Record<string, string> = {}) => {
  const r = montarDados(SLUG, { ...ENTRADA_COMPRA_VENDA, ...extra }, EMPRESA_PREENCHIDA);
  expect(r.problemas).toEqual([]);
  return textosDoDocx(gerarDocx(SLUG, r.dados));
};
const achar = (ts: string[], comeco: string) => ts.find((t) => t.startsWith(comeco)) ?? "";

describe("Compra e venda (molde 6)", () => {
  it("sem marcadores, colchetes nem XX/XX de exemplo", () => {
    const todo = gerar().join("\n");
    expect(todo).not.toMatch(/[{}]/);
    expect(todo).not.toContain("[valor]");
    expect(todo).not.toContain("XX/XX");
    expect(todo).not.toContain("Escolher uma das opções");
  });
  it("vendedor e comprador com o mesmo texto do modelo", () => {
    expect(achar(gerar(), "Vendedora Exemplo")).toBe("Vendedora Exemplo de Teste, solteira, professora, 01/02/1980, RG sob o nº 00.000.000-00 e CPF de nº 111.444.777-35, residente e domiciliado (a) na cidade de Cidade Exemplo, Bahia, CEP: 00000-000, telefone: (00) 90000-0000, e-mail: maria@exemplo.test");
    expect(achar(gerar(), "Comprador Exemplo")).toContain("CPF de nº 529.982.247-25");
  });
  it("imóvel: o ponto final do modelo não duplica", () => {
    expect(achar(gerar({ imovel_descricao: "Casa de teste." }), "1.1.")).toBe("1.1. O objeto deste contrato é o imóvel situado em Casa de teste.");
  });
  it("valor, sinal, data e saldo calculado", () => {
    const ts = gerar();
    expect(achar(ts, "2.1.")).toBe("2.1. O valor total ajustado para a compra e venda é de R$ 350.000,00 (trezentos e cinquenta mil reais).");
    expect(achar(ts, "a) sinal")).toBe("a) sinal / arras confirmatórias no valor de R$ 10.000,00, pago até a data: 20/11/2026;");
    expect(achar(ts, "b) saldo")).toBe("b) saldo remanescente de R$ 340.000,00, a ser pago:");
  });
  it("saldo digitado vale mais que o calculado", () => {
    expect(achar(gerar({ saldo: "300.000,00" }), "b) saldo")).toContain("R$ 300.000,00");
  });
  it("forma de pagamento: só a escolhida leva X", () => {
    const f = (forma: string, outra = "") => { const ts = gerar({ forma_pagamento: forma, forma_outra: outra }); return ts.filter((t) => /^\([ X]\)/.test(t)); };
    expect(f("avista")).toEqual(["(X) à vista na assinatura da escritura definitiva;", "( ) mediante financiamento bancário;", "( ) parcelado conforme cronograma anexo;", "( ) outra forma: "]);
    expect(f("financiamento")[1]).toBe("(X) mediante financiamento bancário;");
    expect(f("parcelado")[2]).toBe("(X) parcelado conforme cronograma anexo;");
    expect(f("outra", "permuta por um terreno")[3]).toBe("(X) outra forma: permuta por um terreno");
  });
  it("\"outra forma\" exige o texto", () => {
    const r = montarDados(SLUG, { ...ENTRADA_COMPRA_VENDA, forma_pagamento: "outra", forma_outra: "" }, EMPRESA_PREENCHIDA);
    expect(r.problemas.map((p) => p.chave)).toContain("forma_outra");
  });
  it("comissão 5% urbano e 8% rural, como o modelo (sem extenso)", () => {
    expect(achar(gerar({ tipo_imovel: "urbano" }), "6.2.")).toContain("comissão de 5% sobre o valor total da venda");
    expect(achar(gerar({ tipo_imovel: "rural" }), "6.2.")).toContain("comissão de 8% sobre o valor total da venda");
  });
  it("sinal maior que o valor total é recusado", () => {
    const r = montarDados(SLUG, { ...ENTRADA_COMPRA_VENDA, sinal: "400.000,00" }, EMPRESA_PREENCHIDA);
    expect(r.problemas.map((p) => p.chave)).toContain("sinal");
  });
  it("data sem as datas antigas", () => {
    const ts = gerar({ data_assinatura: "2026-11-05" });
    expect(ts).toContain("Euclides da Cunha/BA, 05 de novembro de 2026");
    expect(ts.join("\n")).not.toContain("2025");
  });
  it("erros de digitação do original ficam como estão (só com aprovação)", () => {
    const todo = gerar().join("\n");
    expect(todo).toContain("1.2. 1.2. O VENDEDOR declara");
    expect(todo).toContain("CONTRATO DE SINAL E RESERVA DE IMÓVEL");
  });
});
