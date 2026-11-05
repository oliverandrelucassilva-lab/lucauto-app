// Gera os modelos (com marcadores) a partir dos Word originais. Uso: node scripts/preparar-moldes.mjs [numero ...]   (sem número = todos que existem)
import fs from "node:fs";
import path from "node:path";
import { executar, raiz } from "./moldes/lib.mjs";

const pasta = path.join(raiz, "scripts/moldes");
const alvos = process.argv.slice(2);
for (const arq of fs.readdirSync(pasta).filter((f) => /^molde-\d\.mjs$/.test(f)).sort()) {
  const numero = arq.match(/\d/)[0];
  if (alvos.length && !alvos.includes(numero)) continue;
  const cfg = await import(path.join(pasta, arq));
  const indices = executar(cfg.slug, cfg.edicoes);
  console.log(`Molde ${numero}: ${indices.length} parágrafos transformados -> moldes/modelos/${cfg.slug}.docx`);
}
