// Gera o "fundo" da prévia de um molde: a página do Word SEM o texto do contrato, só com
// logo, marca d'água e rodapé, como o LibreOffice desenha. A prévia na tela coloca o texto por cima.
// Uso: node scripts/gerar-fundo-previa.mjs 1_intermediacao_com_exclusividade   (precisa de LibreOffice, poppler e Pillow)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import PizZip from "pizzip";

const raiz = path.resolve(import.meta.dirname, "..");
const slug = process.argv[2] ?? "1_intermediacao_com_exclusividade";
const zip = new PizZip(fs.readFileSync(path.join(raiz, `moldes/originais/${slug}.docx`)));
let xml = zip.file("word/document.xml").asText();
// tira todos os parágrafos do corpo, deixando um vazio, e mantém a configuração da página (sectPr)
xml = xml.replace(/(<w:body>)[\s\S]*?(<w:sectPr)/, '$1<w:p><w:pPr><w:spacing w:after="0"/></w:pPr></w:p>$2');
zip.file("word/document.xml", xml);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "fundo-"));
const docx = path.join(tmp, "fundo.docx");
fs.writeFileSync(docx, zip.generate({ type: "nodebuffer", compression: "DEFLATE" }));
execFileSync("soffice", ["--headless", "--convert-to", "pdf", "--outdir", tmp, docx], { stdio: "ignore" });
execFileSync("pdftoppm", ["-r", "120", "-png", "-singlefile", path.join(tmp, "fundo.pdf"), path.join(tmp, "fundo")]);
const destino = path.join(raiz, "public/previa", `${slug}.png`);
execFileSync("python3", ["-I", "-c", `
from PIL import Image
im = Image.open("${path.join(tmp, "fundo.png")}").convert("RGB")
im = im.quantize(colors=48, method=Image.Quantize.MEDIANCUT)
im.save("${destino}", optimize=True)
print(im.size)
`], { stdio: "inherit" });
fs.rmSync(tmp, { recursive: true, force: true });
console.log("Fundo gravado em", path.relative(raiz, destino), (fs.statSync(destino).size / 1024).toFixed(0) + " KB");
