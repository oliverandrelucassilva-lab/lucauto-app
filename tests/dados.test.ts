import { describe, expect, it } from "vitest";
import { cpfValido, montarDados, valoresIniciais } from "@/lib/contratos/dados";
import { ENTRADA_FICTICIA, EMPRESA_PENDENTE, EMPRESA_PREENCHIDA } from "./fixtures/dados-ficticios";

describe("montarDados", () => {
  it("urbano: comissão 5% (cinco por cento)", () => {
    const r = montarDados({ ...ENTRADA_FICTICIA, tipo_imovel: "urbano" }, EMPRESA_PREENCHIDA);
    expect(r.problemas).toEqual([]);
    expect(r.dados.comissao_pct).toBe("5");
    expect(r.dados.comissao_extenso).toBe("cinco");
  });

  it("rural: comissão 8% (oito por cento)", () => {
    const r = montarDados({ ...ENTRADA_FICTICIA, tipo_imovel: "rural" }, EMPRESA_PREENCHIDA);
    expect(r.dados.comissao_pct).toBe("8");
    expect(r.dados.comissao_extenso).toBe("oito");
  });

  it("calcula valor, extenso e data", () => {
    const r = montarDados(ENTRADA_FICTICIA, EMPRESA_PREENCHIDA);
    expect(r.dados.valor).toBe("R$ 350.000,00");
    expect(r.dados.valor_extenso).toBe("trezentos e cinquenta mil reais");
    expect(r.dados.data_assinatura).toBe("05 de novembro de 2026");
    expect(r.dados.proprietario_nascimento).toBe("01/02/1980");
  });

  it("bloqueia quando falta campo obrigatório", () => {
    const r = montarDados({ ...ENTRADA_FICTICIA, proprietario_nome: "", banco: " " }, EMPRESA_PREENCHIDA);
    expect(r.problemas.map((p) => p.chave).sort()).toEqual(["banco", "proprietario_nome"]);
    expect(r.problemas.every((p) => p.motivo === "faltando")).toBe(true);
  });

  it("RG é opcional", () => {
    const r = montarDados({ ...ENTRADA_FICTICIA, proprietario_rg: "" }, EMPRESA_PREENCHIDA);
    expect(r.problemas).toEqual([]);
  });

  it("aponta valor, CPF e data inválidos", () => {
    const r = montarDados({ ...ENTRADA_FICTICIA, valor: "abc", proprietario_cpf: "111.111.111-11", data_assinatura: "2026-02-31" }, EMPRESA_PREENCHIDA);
    expect(r.problemas.map((p) => `${p.chave}:${p.motivo}`).sort()).toEqual(["data_assinatura:invalido", "proprietario_cpf:invalido", "valor:invalido"]);
  });

  it("dados da empresa pendentes saem como [A CONFIRMAR] e não bloqueiam", () => {
    const r = montarDados(ENTRADA_FICTICIA, EMPRESA_PENDENTE);
    expect(r.problemas).toEqual([]);
    expect(r.dados.empresa_cnpj).toBe("[A CONFIRMAR]");
    expect(r.dados.empresa_creci).toBe("[A CONFIRMAR]");
    expect(r.dados.corretora_creci).toBe("[A CONFIRMAR]");
    expect(r.pendenciasEmpresa).toHaveLength(3);
  });

  it("valores iniciais: data de hoje e padrões", () => {
    const v = valoresIniciais("2026-11-05");
    expect(v.data_assinatura).toBe("2026-11-05");
    expect(v.proprietario_cidade).toBe("Euclides da Cunha");
    expect(v.tipo_imovel).toBe("urbano");
  });

  it("CPF", () => {
    expect(cpfValido("111.444.777-35")).toBe(true);
    expect(cpfValido("111.444.777-36")).toBe(false);
    expect(cpfValido("123")).toBe(false);
  });
});
