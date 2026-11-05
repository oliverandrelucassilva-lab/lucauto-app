// Lista os parágrafos de um molde (índice, nº de pedaços internos e texto). Uso: node scripts/ler-molde.mjs 4_contrato_locacao_residencial [originais|modelos]
import fs from "node:fs";
import path from "node:path";
import PizZip from "pizzip";
const slug = process.argv[2], pasta = process.argv[3] ?? "originais";
const z = new PizZip(fs.readFileSync(path.join(import.meta.dirname, "..", "moldes", pasta, `${slug}.docx`)));
console.log("arquivos:", Object.keys(z.files).filter((n) => /header|footer|media/.test(n)).join(", "));
const xml = z.file("word/document.xml").asText();
const dec = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
(xml.match(/<w:p[ >][\s\S]*?<\/w:p>/g) ?? []).forEach((p, i) => {
  const runs = (p.match(/<w:t(?:\s[^>]*)?>[\s\S]*?<\/w:t>/g) ?? []).map((t) => dec(t.replace(/<[^>]+>/g, "")));
  if (runs.length) console.log(i, runs.length, runs.join(""));
});
