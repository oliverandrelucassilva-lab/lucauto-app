import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

/**
 * Converte um Word (.docx) em PDF. É o único ponto do sistema que sabe como.
 *
 * Desenvolvimento: usa o LibreOffice instalado na máquina (modo headless).
 * Produção: funções serverless (ex.: Vercel) NÃO rodam LibreOffice. Lá, a conversão
 * precisa rodar num serviço próprio. Está pronto para o Gotenberg
 * (https://gotenberg.dev): defina PDF_CONVERSOR=gotenberg e GOTENBERG_URL.
 */
/** "nenhum" = só Word (a pessoa usa "Salvar como PDF" no Word). É o padrão quando o app roda na Vercel. */
export const modoPdf = () => process.env.PDF_CONVERSOR ?? (process.env.VERCEL ? "nenhum" : "libreoffice");
export const pdfDisponivel = () => modoPdf() !== "nenhum";

export async function converterParaPdf(docx: Buffer): Promise<Buffer> {
  const modo = modoPdf();
  if (modo === "nenhum") throw new Error("A geração de PDF está desligada. Use o Word e \"Salvar como PDF\".");
  if (modo === "gotenberg") return viaGotenberg(docx);
  if (modo === "libreoffice") return viaLibreOffice(docx);
  throw new Error(`PDF_CONVERSOR desconhecido: ${modo}`);
}

async function viaGotenberg(docx: Buffer): Promise<Buffer> {
  const url = process.env.GOTENBERG_URL;
  if (!url) throw new Error("Defina GOTENBERG_URL para converter o PDF em produção.");
  const form = new FormData();
  form.append("files", new Blob([new Uint8Array(docx)]), "contrato.docx");
  const resp = await fetch(`${url.replace(/\/$/, "")}/forms/libreoffice/convert`, { method: "POST", body: form, signal: AbortSignal.timeout(60_000) });
  if (!resp.ok) throw new Error(`Falha ao converter o PDF (serviço respondeu ${resp.status}).`);
  return Buffer.from(await resp.arrayBuffer());
}

async function viaLibreOffice(docx: Buffer): Promise<Buffer> {
  const id = crypto.randomUUID();
  const pasta = await fs.mkdtemp(path.join(os.tmpdir(), "lucauto-pdf-"));
  const entrada = path.join(pasta, `${id}.docx`);
  try {
    await fs.writeFile(entrada, docx);
    // Perfil próprio por conversão: evita travar quando duas conversões rodam juntas.
    const perfil = `file://${path.join(pasta, "perfil")}`;
    await new Promise<void>((ok, erro) => {
      const proc = spawn(/*turbopackIgnore: true*/ process.env.LIBREOFFICE_BIN ?? "soffice", ["--headless", "--norestore", `-env:UserInstallation=${perfil}`, "--convert-to", "pdf", "--outdir", pasta, entrada], { stdio: "ignore" });
      const limite = setTimeout(() => { proc.kill("SIGKILL"); erro(new Error("A conversão para PDF demorou demais.")); }, 90_000);
      proc.on("error", (e) => { clearTimeout(limite); erro(new Error(`LibreOffice não encontrado (${e.message}).`)); });
      proc.on("exit", (code) => { clearTimeout(limite); if (code === 0) ok();
        else erro(new Error(`LibreOffice terminou com erro (${code}).`)); });
    });
    return await fs.readFile(path.join(pasta, `${id}.pdf`));
  } finally {
    await fs.rm(pasta, { recursive: true, force: true });
  }
}
