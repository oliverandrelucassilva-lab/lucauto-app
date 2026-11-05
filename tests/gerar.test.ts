import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { montarDados } from "@/lib/contratos/dados";
import { converterParaPdf } from "@/lib/contratos/converter-pdf";
import { gerarDocx } from "@/lib/contratos/modelo";
import { ENTRADA_FICTICIA, EMPRESA_PENDENTE, EMPRESA_PREENCHIDA } from "./fixtures/dados-ficticios";
import { textosDoDocx } from "./helpers";

const SLUG = "1_intermediacao_com_exclusividade";
const gerar = (extra: Record<string, string> = {}, empresa = EMPRESA_PREENCHIDA) => {
  const { dados, problemas } = montarDados(SLUG, { ...ENTRADA_FICTICIA, ...extra }, empresa);
  expect(problemas).toEqual([]);
  return textosDoDocx(gerarDocx(SLUG, dados));
};
const achar = (ts: string[], comeco: string) => ts.find((t) => t.startsWith(comeco)) ?? "";

describe("Word preenchido (molde 1)", () => {
  it("não sobra nenhum marcador sem preencher", () => {
    const todo = gerar().join("\n");
    expect(todo).not.toMatch(/[{}]/);
    expect(todo).not.toContain("[A CONFIRMAR]");
  });

  it("proprietário completo, com RG", () => {
    const t = achar(gerar(), "Maria Exemplo");
    expect(t).toBe("Maria Exemplo de Teste, solteira, professora, nascido(a) em 01/02/1980, RG sob o nº 00.000.000-00 e CPF de nº 111.444.777-35, residente e domiciliado (a) na cidade de Cidade Exemplo, Bahia, CEP: 00000-000, telefone: (00) 90000-0000, e-mail: maria@exemplo.test.");
  });

  it("RG em branco: o trecho do RG some", () => {
    const t = achar(gerar({ proprietario_rg: "" }), "Maria Exemplo");
    expect(t).toContain("nascido(a) em 01/02/1980, CPF de nº 111.444.777-35");
    expect(t).not.toContain("RG");
  });

  it("imóvel preenchido, sem o exemplo antigo", () => {
    const todo = gerar().join("\n");
    expect(todo).toContain("Casa de teste com dois quartos, sala, cozinha e quintal. Localizado em Bairro Exemplo. Imóvel matriculado sob o nº 00.000 do 1º Cartório de Registro de Imóveis de Euclides da Cunha/BA.");
    expect(todo).not.toContain("360m²");
    expect(todo).not.toContain("25.487");
  });

  it("valor com extenso", () => {
    expect(achar(gerar(), "3.1.")).toBe("3.1. A transação objeto deste instrumento contratual deverá ser concretizada pelo valor total de R$ 350.000,00 (trezentos e cinquenta mil reais).");
  });

  it("banco, agência e favorecido", () => {
    const ts = gerar();
    expect(ts).toContain("Banco: Banco Exemplo");
    expect(ts).toContain("Agência: 0000");
    expect(ts).toContain("Favorecido: Maria Exemplo de Teste");
  });

  it("urbano: comissão de 5% (cinco por cento)", () => {
    expect(achar(gerar({ tipo_imovel: "urbano" }), "4.1.")).toContain("o percentual de 5% (cinco por cento) sobre o valor total da transação concluída.");
  });

  it("rural: comissão de 8% (oito por cento)", () => {
    expect(achar(gerar({ tipo_imovel: "rural" }), "4.1.")).toContain("o percentual de 8% (oito por cento) sobre o valor total da transação concluída.");
  });

  it("data da assinatura sem a data antiga", () => {
    const ts = gerar({ data_assinatura: "2026-11-05" });
    expect(ts).toContain("Euclides da Cunha/BA, 05 de novembro de 2026");
    expect(ts.join("\n")).not.toContain("2025");
  });

  it("dados da empresa pendentes aparecem como [A CONFIRMAR]", () => {
    const todo = gerar({}, EMPRESA_PENDENTE).join("\n");
    expect(todo).toContain("CNPJ nº [A CONFIRMAR], CRECI Jurídico nº [A CONFIRMAR]");
    expect(todo).toContain("CREC nº: [A CONFIRMAR].");
  });

  it("caracteres especiais não quebram o Word", () => {
    const ts = gerar({ imovel_descricao: 'Casa "A" & Cia <fundos>\nsegunda linha' });
    expect(ts.join("\n")).toContain('Casa "A" & Cia <fundos>\nsegunda linha');
  });

  it("clásulas jurídicas continuam iguais (amostra)", () => {
    const todo = gerar().join("\n");
    expect(todo).toContain("O CONTRATO declara que o imóvel referido"); // erro de digitação do original: só com aprovação
    expect(todo).toContain("art. 727 do Código Civil");
  });
});

const temLibreOffice = spawnSync("soffice", ["--version"]).status === 0;
const temPoppler = spawnSync("pdftotext", ["-v"]).status === 0;

describe.skipIf(!temLibreOffice || !temPoppler)("PDF do molde 1", () => {
  it("converte para PDF com cabeçalho, marca d'água e rodapé em todas as páginas", async () => {
    const { dados } = montarDados(SLUG, ENTRADA_FICTICIA, EMPRESA_PREENCHIDA);
    const pdf = await converterParaPdf(gerarDocx(SLUG, dados));
    const arq = path.join(os.tmpdir(), `teste-${process.pid}.pdf`);
    fs.writeFileSync(arq, pdf);
    try {
      const info = execFileSync("pdfinfo", [arq]).toString();
      const paginasPdf = Number(/Pages:\s+(\d+)/.exec(info)![1]);
      expect(paginasPdf).toBeGreaterThanOrEqual(6); // o original tem 7 com a casa de exemplo; sem ela fica mais curto
      expect(paginasPdf).toBeLessThanOrEqual(8);
      const texto = execFileSync("pdftotext", ["-layout", arq, "-"]).toString();
      expect(texto).toContain("Maria Exemplo de Teste");
      expect(texto).toContain("350.000,00");
      expect(texto).toContain("Rua Elson Torres de Aquino"); // rodapé
      expect(texto).not.toMatch(/[{}]/);
      // logo/marca d'água presentes em todas as páginas
      const imagens = execFileSync("pdfimages", ["-list", arq]).toString().split("\n").filter((l) => /^\s*\d+\s+\d+\s+image/.test(l));
      const paginas = new Set(imagens.map((l) => l.trim().split(/\s+/)[0]));
      expect(paginas.size).toBe(paginasPdf);
    } finally {
      fs.rmSync(arq, { force: true });
    }
  });
});
