import fs from "node:fs";
import path from "node:path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

/** Pasta dos modelos do Word (com marcadores). */
export const PASTA_MODELOS = path.join(process.cwd(), "moldes", "modelos");

export function lerModelo(slug: string): Buffer {
  if (!/^\d_[a-z_]+$/.test(slug)) throw new Error("Molde inválido");
  return fs.readFileSync(path.join(PASTA_MODELOS, `${slug}.docx`));
}

/** Preenche o Word com os dados. O cabeçalho, a marca d'água e o rodapé não são tocados. */
export function gerarDocx(slug: string, dados: Record<string, string>): Buffer {
  const zip = new PizZip(lerModelo(slug));
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    // Marcador sem valor vira texto vazio; quem decide se pode gerar é montarDados().
    nullGetter: () => "",
  });
  doc.render(dados);
  return doc.getZip().generate({ type: "nodebuffer", compression: "DEFLATE" });
}

export interface ParagrafoModelo {
  texto: string; // com marcadores {assim}
  alinhamento: "justificado" | "centro" | "esquerda" | "direita";
  negrito: boolean; // parágrafo inteiro em negrito
  prefixoNegrito: string; // trecho inicial em negrito (ex.: "3.1. ")
  runs: { texto: string; negrito: boolean; italico: boolean }[]; // pedaços com o mesmo estilo
  recuo: number; // recuo da esquerda em pontos
  recuoPrimeiraLinha: number;
}

const decod = (s: string) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");

/** Lê o texto do modelo, parágrafo a parágrafo, para montar a prévia na tela. */
export function paragrafosDoModelo(slug: string): ParagrafoModelo[] {
  const xml = new PizZip(lerModelo(slug)).file("word/document.xml")!.asText();
  const out: ParagrafoModelo[] = [];
  for (const p of xml.match(/<w:p[ >][\s\S]*?<\/w:p>/g) ?? []) {
    const runs = (p.match(/<w:r(?:\s[^>]*)?>[\s\S]*?<\/w:r>/g) ?? [])
      .map((r) => {
        const t = r.match(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/);
        const props = r.split("</w:rPr>")[0] ?? "";
        const negrito = /<w:b\/>|<w:b w:val="(1|true)"\/>/.test(props);
        const italico = /<w:i\/>|<w:i w:val="(1|true)"\/>/.test(props);
        return t ? { texto: decod(t[1]), negrito, italico } : null;
      })
      .filter((r): r is { texto: string; negrito: boolean; italico: boolean } => r !== null);
    const texto = runs.map((r) => r.texto).join("");
    const jc = /<w:jc w:val="(\w+)"/.exec(p)?.[1];
    const ind = /<w:ind ([^>]*)\/>/.exec(p)?.[1] ?? "";
    const num = (nome: string) => Number(new RegExp(`w:${nome}="(\\d+)"`).exec(ind)?.[1] ?? 0) / 20;
    let prefixo = "";
    for (const r of runs) {
      if (!r.negrito) break;
      prefixo += r.texto;
    }
    out.push({
      texto,
      alinhamento: jc === "center" ? "centro" : jc === "right" ? "direita" : jc === "both" ? "justificado" : "esquerda",
      negrito: runs.length > 0 && runs.every((r) => r.negrito),
      prefixoNegrito: prefixo === texto ? "" : prefixo,
      runs,
      recuo: num("left"),
      recuoPrimeiraLinha: num("firstLine"),
    });
  }
  return out;
}
