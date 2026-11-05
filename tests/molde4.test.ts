import { describe, expect, it } from "vitest";
import { montarDados } from "@/lib/contratos/dados";
import { gerarDocx } from "@/lib/contratos/modelo";
import { fimDoPrazo } from "@/lib/contratos/regras";
import { ENTRADA_LOCACAO, EMPRESA_PREENCHIDA } from "./fixtures/dados-ficticios";
import { textosDoDocx } from "./helpers";

const SLUG = "4_contrato_locacao_residencial";
const gerar = (extra: Record<string, string> = {}) => {
  const r = montarDados(SLUG, { ...ENTRADA_LOCACAO, ...extra }, EMPRESA_PREENCHIDA);
  expect(r.problemas).toEqual([]);
  return textosDoDocx(gerarDocx(SLUG, r.dados));
};
const achar = (ts: string[], comeco: string) => ts.find((t) => t.startsWith(comeco)) ?? "";

describe("Locação residencial (molde 4)", () => {
  it("não sobra marcador, colchete nem sublinhado de exemplo", () => {
    const todo = gerar().join("\n");
    expect(todo).not.toMatch(/[{}]/);
    expect(todo).not.toContain("[Nome]");
    expect(todo).not.toContain("//____");
    expect(todo).not.toContain("(Adicionar segundo fiador");
  });

  it("locador completo, com RG e endereço", () => {
    expect(achar(gerar(), "Locador Exemplo")).toBe("Locador Exemplo de Teste, solteiro(a), comerciante, RG nº 00.000.000-00, CPF nº 111.444.777-35, residente em Rua Exemplo, 100, Bairro Teste, Cidade Exemplo, e-mail locador@exemplo.test.");
  });

  it("sem RG e sem endereço (contrato real: só CPF)", () => {
    const t = achar(gerar({ locatario_rg: "", locatario_endereco: "" }), "Locatária Exemplo");
    expect(t).toBe("Locatária Exemplo de Teste, solteiro(a), comerciante, CPF nº 529.982.247-25, e-mail locatario@exemplo.test.");
  });

  it("fiador com nacionalidade", () => {
    expect(achar(gerar(), "Fiador Exemplo")).toContain("Fiador Exemplo de Teste, brasileiro(a), solteiro(a), comerciante, RG nº");
  });

  it("prazo por extenso e datas; fim calculado sozinho", () => {
    expect(achar(gerar(), "2.1.")).toBe("2.1. A locação tem prazo de 12 (doze) meses, iniciando-se em 05/11/2026 e encerrando-se em 04/11/2027.");
  });

  it("data de término digitada vale mais que a calculada", () => {
    expect(achar(gerar({ data_fim: "2027-12-31" }), "2.1.")).toContain("encerrando-se em 31/12/2027.");
  });

  it("aluguel com extenso e dia de vencimento com dois dígitos", () => {
    expect(achar(gerar(), "3.1.")).toBe("3.1. O aluguel mensal será de R$ 1.250,50 (mil, duzentos e cinquenta reais e cinquenta centavos), vencível todo dia 05 de cada mês.");
  });

  it("endereço do imóvel", () => {
    expect(achar(gerar(), "Casa de teste")).toContain("Casa de teste na Rua Exemplo, nº 10");
  });

  it("segundo fiador: some quando vazio, aparece (com assinatura) quando preenchido", () => {
    const sem = gerar();
    expect(sem.filter((t) => t === "FIADOR:").length).toBe(1);
    expect(sem.filter((t) => t === "FIADOR").length).toBe(1);
    const com = gerar({ fiador2_nome: "Segundo Fiador de Teste", fiador2_nacionalidade: "brasileiro(a)", fiador2_estado_civil: "casado(a)", fiador2_profissao: "agricultor(a)", fiador2_cpf: "111.444.777-35", fiador2_email: "f2@exemplo.test" });
    expect(com.filter((t) => t === "FIADOR:").length).toBe(2);
    expect(com.filter((t) => t === "FIADOR").length).toBe(2);
    expect(achar(com, "Segundo Fiador")).toBe("Segundo Fiador de Teste, brasileiro(a), casado(a), agricultor(a), CPF nº 111.444.777-35, e-mail f2@exemplo.test.");
  });

  it("segundo fiador começado e incompleto bloqueia", () => {
    const r = montarDados(SLUG, { ...ENTRADA_LOCACAO, fiador2_nome: "Fulano de Teste" }, EMPRESA_PREENCHIDA);
    expect(r.problemas.map((p) => p.chave)).toContain("fiador2_cpf");
  });

  it("data da assinatura sem o ano fixo 2026", () => {
    expect(gerar({ data_assinatura: "2027-03-10" })).toContain("Euclides da Cunha/BA, 10 de março de 2027.");
  });

  it("regras de data e vencimento", () => {
    const p = (extra: Record<string, string>) => montarDados(SLUG, { ...ENTRADA_LOCACAO, ...extra }, EMPRESA_PREENCHIDA).problemas.map((x) => x.chave);
    expect(p({ data_fim: "2026-01-01" })).toContain("data_fim");
    expect(p({ dia_vencimento: "32" })).toContain("dia_vencimento");
    expect(p({ prazo_meses: "doze" })).toContain("prazo_meses");
    expect(p({ aluguel: "" })).toContain("aluguel");
  });

  it("fim do prazo: fim de mês e ano bissexto", () => {
    expect(fimDoPrazo("2026-11-05", 12)).toBe("2027-11-04");
    expect(fimDoPrazo("2026-01-31", 1)).toBe("2026-02-27");
    expect(fimDoPrazo("2027-12-01", 6)).toBe("2028-05-31");
    expect(fimDoPrazo("2024-02-29", 12)).toBe("2025-02-27");
    expect(fimDoPrazo("2026-11-05", 0)).toBeNull();
  });
});
