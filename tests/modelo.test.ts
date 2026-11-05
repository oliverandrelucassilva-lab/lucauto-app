import fs from "node:fs";
import path from "node:path";
import PizZip from "pizzip";
import { describe, expect, it } from "vitest";
import { PARAGRAFOS_EDITADOS } from "../scripts/preparar-molde-1.mjs";
import { montarDados } from "@/lib/contratos/dados";
import { ROTULOS_EMPRESA, TODOS_CAMPOS } from "@/lib/contratos/campos";
import { ENTRADA_FICTICIA, EMPRESA_PREENCHIDA } from "./fixtures/dados-ficticios";
import { paragrafosXml } from "./helpers";

const raiz = path.resolve(__dirname, "..");
const original = new PizZip(fs.readFileSync(path.join(raiz, "moldes/originais/1_intermediacao_com_exclusividade.docx")));
const modelo = new PizZip(fs.readFileSync(path.join(raiz, "moldes/modelos/1_intermediacao_com_exclusividade.docx")));

describe("modelo do molde 1 × Word original", () => {
  it("cabeçalho, rodapé, marca d'água, imagens e estilos são idênticos ao original", () => {
    const nomes = Object.keys(original.files).filter((n) => !original.files[n].dir && n !== "word/document.xml");
    expect(nomes.length).toBeGreaterThan(10);
    for (const n of nomes) {
      expect(modelo.file(n), n).not.toBeNull();
      expect(Buffer.compare(Buffer.from(modelo.file(n)!.asUint8Array()), Buffer.from(original.file(n)!.asUint8Array())), n).toBe(0);
    }
  });

  it("nenhuma cláusula foi alterada: só os parágrafos variáveis mudam", () => {
    const o = paragrafosXml(original);
    const m = paragrafosXml(modelo);
    expect(m.length).toBe(o.length);
    const diferentes = o.map((p, i) => (p === m[i] ? -1 : i)).filter((i) => i >= 0);
    expect(diferentes).toEqual(([...PARAGRAFOS_EDITADOS] as number[]).sort((a, b) => a - b));
  });

  it("o imóvel de exemplo e as datas antigas saíram", () => {
    const xml = modelo.file("word/document.xml")!.asText();
    for (const resto of ["25.487", "360m²", "07 de novembro de 2025", "digite o valor", "48450-000", "Banco: __"]) expect(xml, resto).not.toContain(resto);
  });

  it("todo marcador do modelo tem origem conhecida", () => {
    const xml = modelo.file("word/document.xml")!.asText();
    const marcadores = new Set([...xml.matchAll(/\{[#/]?(\w+)\}/g)].map((m) => m[1]));
    const { dados } = montarDados(ENTRADA_FICTICIA, EMPRESA_PREENCHIDA);
    const conhecidos = new Set([...Object.keys(dados), ...TODOS_CAMPOS.map((c) => c.chave), ...Object.keys(ROTULOS_EMPRESA)]);
    for (const k of marcadores) expect(conhecidos.has(k), k).toBe(true);
    expect(marcadores.size).toBeGreaterThanOrEqual(25);
  });
});
