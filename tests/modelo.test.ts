import fs from "node:fs";
import path from "node:path";
import PizZip from "pizzip";
import { describe, expect, it } from "vitest";
import { ROTULOS_EMPRESA, todosCampos } from "@/lib/contratos/campos";
import { montarDados } from "@/lib/contratos/dados";
import { DEFINICOES } from "@/lib/contratos/definicoes";
import { ENTRADAS, EMPRESA_PREENCHIDA } from "./fixtures/dados-ficticios";
import { paragrafosXml, textosDoDocx } from "./helpers";

const raiz = path.resolve(__dirname, "..");
const abrir = (pasta: string, slug: string) => new PizZip(fs.readFileSync(path.join(raiz, "moldes", pasta, `${slug}.docx`)));

// Restos de exemplo e datas antigas que não podem sobrar em nenhum modelo.
const PROIBIDOS = ["25.487", "360m²", "07 de novembro de 2025", "01 de dezembro de 2025", "07 de janeiro de 2026", "digite o valor", "48450-000", "XX/XX/XXX", "(Adicionar segundo fiador"];

// Palavras que se repetem de propósito (blocos opcionais clonados do próprio modelo, como o 2º fiador).
const PERMITIDAS: Record<string, string[]> = {
  "4_contrato_locacao_residencial": ["fiador", "rg", "nº", "cpf", "residente", "em", "mail", "e"],
};

describe.each(DEFINICOES.map((d) => [d.slug, d] as const))("modelo %s × Word original", (slug, def) => {
  const original = abrir("originais", slug);
  const modelo = abrir("modelos", slug);

  it("cabeçalho, rodapé, marca d'água, imagens e estilos são idênticos ao original", () => {
    const nomes = Object.keys(original.files).filter((n) => !original.files[n].dir && n !== "word/document.xml");
    expect(nomes.length).toBeGreaterThan(5);
    for (const n of nomes) {
      expect(modelo.file(n), n).not.toBeNull();
      expect(Buffer.compare(Buffer.from(modelo.file(n)!.asUint8Array()), Buffer.from(original.file(n)!.asUint8Array())), n).toBe(0);
    }
  });

  it("nenhuma cláusula foi alterada: todo parágrafo que não é campo continua idêntico e na mesma ordem", () => {
    const o = paragrafosXml(original);
    const m = paragrafosXml(modelo);
    let pos = 0;
    let iguais = 0;
    for (const p of o) {
      const achou = m.indexOf(p, pos);
      if (achou >= 0) { pos = achou + 1; iguais++; }
    }
    const alterados = o.length - iguais;
    // parágrafos transformados em campo: poucos, e nunca a maioria do contrato
    expect(alterados).toBeGreaterThan(0);
    expect(alterados).toBeLessThanOrEqual(Math.ceil(o.length * 0.25));
    // e a quantidade de parágrafos que sumiram é só a dos transformados
    expect(m.length).toBeGreaterThanOrEqual(o.length - 1);
  });

  it("Ctrl+C Ctrl+V: o modelo não acrescenta nenhuma palavra ao texto do original", () => {
    const palavras = (zip: PizZip, tirarMarcadores: boolean) => {
      let txt = textosDoDocx(Buffer.from(zip.generate({ type: "nodebuffer" }))).join(" ");
      if (tirarMarcadores) txt = txt.replace(/\{[^}]*\}/g, " ");
      const bag = new Map<string, number>();
      for (const w of txt.toLowerCase().match(/[\p{L}\p{N}º]+/gu) ?? []) bag.set(w, (bag.get(w) ?? 0) + 1);
      return bag;
    };
    const o = palavras(original, false);
    const m = palavras(modelo, true);
    const novas = [...m].filter(([w, n]) => n > (o.get(w) ?? 0) && !(PERMITIDAS[slug] ?? []).includes(w)).map(([w]) => w);
    expect(novas).toEqual([]);
  });

  it("restos de exemplo e datas antigas saíram", () => {
    const xml = modelo.file("word/document.xml")!.asText();
    for (const resto of PROIBIDOS) expect(xml.includes(resto), resto).toBe(false);
  });

  it("todo marcador do modelo tem origem conhecida", () => {
    const xml = modelo.file("word/document.xml")!.asText();
    const marcadores = new Set([...xml.matchAll(/\{[#/]?(\w+)\}/g)].map((m) => m[1]));
    const { dados } = montarDados(slug, ENTRADAS[slug], EMPRESA_PREENCHIDA);
    const conhecidos = new Set([...Object.keys(dados), ...todosCampos(def.etapas).map((c) => c.chave), ...Object.keys(ROTULOS_EMPRESA)]);
    for (const k of marcadores) expect(conhecidos.has(k), k).toBe(true);
    expect(marcadores.size).toBeGreaterThanOrEqual(8);
  });
});
