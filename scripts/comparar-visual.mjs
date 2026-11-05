// Validação visual de um molde: converte o ORIGINAL e o contrato GERADO (dados fictícios) para PDF,
// vira imagem página por página e monta: original | gerado | diferenças (em vermelho).
// Uso: npx tsx scripts/comparar-visual.mjs [slug-do-molde]     (precisa de LibreOffice, poppler-utils e python3 com Pillow)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const raiz = path.resolve(import.meta.dirname, "..");
const slug = process.argv[2] ?? "1_intermediacao_com_exclusividade";
const saida = path.join(raiz, "saida-teste", slug);
fs.rmSync(saida, { recursive: true, force: true });
for (const d of ["original", "gerado", "painel"]) fs.mkdirSync(path.join(saida, d), { recursive: true });

const { montarDados } = await import("../src/lib/contratos/dados.ts");
const { gerarDocx } = await import("../src/lib/contratos/modelo.ts");
const { converterParaPdf } = await import("../src/lib/contratos/converter-pdf.ts");
const { VALIDACAO, EMPRESA_PREENCHIDA } = await import("../tests/fixtures/dados-ficticios.ts");

execFileSync("soffice", ["--headless", "--convert-to", "pdf", "--outdir", path.join(saida, "original"), path.join(raiz, `moldes/originais/${slug}.docx`)], { stdio: "ignore" });
execFileSync("pdftoppm", ["-r", "80", "-png", path.join(saida, "original", `${slug}.pdf`), path.join(saida, "original", "p")]);

const { dados, problemas } = montarDados(slug, { ...VALIDACAO[slug] }, EMPRESA_PREENCHIDA);
if (problemas.length) throw new Error("Dados de validação incompletos: " + problemas.map((p) => p.chave).join(", "));
const docx = gerarDocx(slug, dados);
fs.writeFileSync(path.join(saida, "gerado", `${slug}.docx`), docx);
fs.writeFileSync(path.join(saida, "gerado", `${slug}.pdf`), await converterParaPdf(docx));
execFileSync("pdftoppm", ["-r", "80", "-png", path.join(saida, "gerado", `${slug}.pdf`), path.join(saida, "gerado", "p")]);

const py = `
import glob, os, sys
from PIL import Image, ImageChops
d = sys.argv[1]
o = sorted(glob.glob(d + "/original/p-*.png")); g = sorted(glob.glob(d + "/gerado/p-*.png"))
print("PÁGINAS original=%d gerado=%d" % (len(o), len(g)))
for i in range(max(len(o), len(g))):
    a = Image.open(o[i]).convert("RGB") if i < len(o) else None
    b = Image.open(g[i]).convert("RGB") if i < len(g) else None
    base = a or b
    a = a or Image.new("RGB", base.size, "white"); b = b or Image.new("RGB", base.size, "white")
    diff = ImageChops.difference(a, b).convert("L").point(lambda v: 255 if v > 40 else 0)
    pct = 100.0 * sum(1 for v in diff.tobytes() if v) / (diff.width * diff.height)
    over = b.copy(); red = Image.new("RGB", b.size, (220, 38, 38)); over.paste(red, mask=diff)
    W = a.width * 3 + 40
    im = Image.new("RGB", (W, a.height + 30), (110, 110, 110))
    im.paste(a, (0, 30)); im.paste(b, (a.width + 20, 30)); im.paste(over, (2 * a.width + 40, 30))
    from PIL import ImageDraw
    dr = ImageDraw.Draw(im)
    for k, t in enumerate(["ORIGINAL", "GERADO", "DIFERENÇAS (vermelho)  %.1f%% da página" % pct]): dr.text((k * (a.width + 20) + 8, 8), t, fill="white")
    im.save("%s/painel/pagina-%d.png" % (d, i + 1))
    print("pág %d: diferença %.2f%%" % (i + 1, pct))
`;
fs.writeFileSync(path.join(saida, "montar.py"), py);
console.log(execFileSync("python3", ["-I", path.join(saida, "montar.py"), saida]).toString());
