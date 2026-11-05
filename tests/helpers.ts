import PizZip from "pizzip";

export const paragrafosXml = (zip: PizZip): string[] => zip.file("word/document.xml")!.asText().match(/<w:p[ >][\s\S]*?<\/w:p>/g) ?? [];

const decod = (s: string) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");

/** Texto de cada parágrafo do Word (quebras de linha <w:br/> viram \n). */
export function textosDoDocx(buf: Buffer): string[] {
  return paragrafosXml(new PizZip(buf)).map((p) =>
    (p.match(/<w:t(?:\s[^>]*)?>[\s\S]*?<\/w:t>|<w:br\/>/g) ?? []).map((t) => (t === "<w:br/>" ? "\n" : decod(t.replace(/<[^>]+>/g, "")))).join(""),
  );
}
