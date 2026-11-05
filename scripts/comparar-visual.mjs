// Gera o contrato com dados fictícios, converte o molde original e o contrato para PDF
// e cria imagens lado a lado (original | gerado), página por página, em ./saida-teste/.
// Uso: npx tsx scripts/comparar-visual.mjs   (precisa de LibreOffice e poppler-utils)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const raiz = path.resolve(import.meta.dirname, "..");
const saida = path.join(raiz, "saida-teste");
fs.mkdirSync(saida, { recursive: true });
const { montarDados } = await import("../src/lib/contratos/dados.ts");
const { gerarDocx } = await import("../src/lib/contratos/modelo.ts");
const { converterParaPdf } = await import("../src/lib/contratos/converter-pdf.ts");
const { ENTRADA_FICTICIA, EMPRESA_PREENCHIDA } = await import("../tests/fixtures/dados-ficticios.ts");

const slug = "1_intermediacao_com_exclusividade";
const variantes = { urbano: { tipo_imovel: "urbano" }, rural: { tipo_imovel: "rural" } };
const origPdfDir = path.join(saida, "original");
fs.mkdirSync(origPdfDir, { recursive: true });
execFileSync("soffice", ["--headless", "--convert-to", "pdf", "--outdir", origPdfDir, path.join(raiz, `moldes/originais/${slug}.docx`)], { stdio: "ignore" });
execFileSync("pdftoppm", ["-r", "70", "-png", path.join(origPdfDir, `${slug}.pdf`), path.join(origPdfDir, "p")]);

for (const [nome, extra] of Object.entries(variantes)) {
  const { dados } = montarDados({ ...ENTRADA_FICTICIA, ...extra }, EMPRESA_PREENCHIDA);
  const docx = gerarDocx(slug, dados);
  const pdf = await converterParaPdf(docx);
  const dir = path.join(saida, nome);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${slug}.docx`), docx);
  fs.writeFileSync(path.join(dir, `${slug}.pdf`), pdf);
  execFileSync("pdftoppm", ["-r", "70", "-png", path.join(dir, `${slug}.pdf`), path.join(dir, "p")]);
}
console.log("Pronto. Veja", saida);
