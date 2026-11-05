import "server-only";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { modoAuth } from "@/lib/auth/mock";
import { veTodosContratos } from "@/lib/auth/permissoes";
import type { Sessao } from "@/lib/auth/tipos";
import { clienteSupabase } from "@/lib/supabase/servidor";

export interface RegistroContrato {
  id: string;
  workspaceId: string;
  molde: string;
  titulo: string;
  tipoImovel: "urbano" | "rural";
  valorCentavos: number;
  dataAssinatura: string; // AAAA-MM-DD
  criadoPor: string;
  criadoPorNome: string;
  criadoEm: string; // ISO
  pendenciasEmpresa: string[];
}

export interface NovoContrato extends Omit<RegistroContrato, "id" | "criadoEm" | "workspaceId" | "criadoPor" | "criadoPorNome"> {
  /** Cópia dos dados preenchidos (guarda o que foi assinado). */
  dados: Record<string, string>;
  docx: Buffer;
  pdf: Buffer;
}

export type Formato = "docx" | "pdf";

export interface RepositorioContratos {
  salvar(sessao: Sessao, novo: NovoContrato): Promise<RegistroContrato>;
  listar(sessao: Sessao): Promise<RegistroContrato[]>;
  baixar(sessao: Sessao, id: string, formato: Formato): Promise<{ arquivo: Buffer; registro: RegistroContrato } | null>;
}

/** Em dev (login de teste) guarda em .dev-data/; com Supabase usa o banco e o Storage. */
export function repositorio(): RepositorioContratos {
  return modoAuth() === "mock" ? repositorioLocal : repositorioSupabase;
}

// ---------- desenvolvimento: arquivos locais (a pasta .dev-data está no .gitignore) ----------
const PASTA = path.join(process.cwd(), ".dev-data", "contratos");

const repositorioLocal: RepositorioContratos = {
  async salvar(sessao, novo) {
    if (process.env.NODE_ENV === "production") throw new Error("O armazenamento local não pode ser usado em produção.");
    const { docx, pdf, dados, ...resto } = novo;
    const registro: RegistroContrato = { ...resto, id: crypto.randomUUID(), workspaceId: sessao.workspaceId, criadoPor: sessao.id, criadoPorNome: sessao.nome, criadoEm: new Date().toISOString() };
    await fs.mkdir(PASTA, { recursive: true });
    await Promise.all([
      fs.writeFile(path.join(PASTA, `${registro.id}.json`), JSON.stringify({ ...registro, dados }, null, 2)),
      fs.writeFile(path.join(PASTA, `${registro.id}.docx`), docx),
      fs.writeFile(path.join(PASTA, `${registro.id}.pdf`), pdf),
    ]);
    return registro;
  },
  async listar(sessao) {
    const nomes = await fs.readdir(PASTA).catch(() => [] as string[]);
    const lista: RegistroContrato[] = [];
    for (const n of nomes.filter((x) => x.endsWith(".json"))) {
      const r: RegistroContrato & { dados?: unknown } = JSON.parse(await fs.readFile(path.join(PASTA, n), "utf8"));
      delete r.dados;
      if (r.workspaceId === sessao.workspaceId && (veTodosContratos(sessao.perfil) || r.criadoPor === sessao.id)) lista.push(r);
    }
    return lista.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  },
  async baixar(sessao, id, formato) {
    if (!/^[0-9a-f-]{36}$/.test(id)) return null;
    const registro = (await this.listar(sessao)).find((r) => r.id === id);
    if (!registro) return null;
    return { registro, arquivo: await fs.readFile(path.join(PASTA, `${id}.${formato}`)) };
  },
};

// ---------- produção: Supabase (tabela contratos + bucket privado "contratos") ----------
// As regras de acesso (RLS) do banco também filtram por workspace e perfil.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const linhaParaRegistro = (l: Record<string, any>, nomes?: string): RegistroContrato => ({
  id: l.id, workspaceId: l.workspace_id, molde: l.molde, titulo: l.titulo, tipoImovel: l.tipo_imovel,
  valorCentavos: Number(l.valor_centavos), dataAssinatura: l.data_assinatura, criadoPor: l.criado_por,
  criadoPorNome: nomes ?? l.criado_por_nome ?? "", criadoEm: l.criado_em, pendenciasEmpresa: l.pendencias ?? [],
});

const repositorioSupabase: RepositorioContratos = {
  async salvar(sessao, novo) {
    const supabase = await clienteSupabase();
    const id = crypto.randomUUID();
    const base = `${sessao.workspaceId}/${id}`;
    const envio = async (ext: Formato, corpo: Buffer, tipo: string) => {
      const { error } = await supabase.storage.from("contratos").upload(`${base}.${ext}`, corpo, { contentType: tipo });
      if (error) throw new Error(`Não foi possível guardar o ${ext.toUpperCase()}: ${error.message}`);
    };
    await envio("docx", novo.docx, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    await envio("pdf", novo.pdf, "application/pdf");
    const { data, error } = await supabase.from("contratos").insert({
      id, workspace_id: sessao.workspaceId, molde: novo.molde, titulo: novo.titulo, tipo_imovel: novo.tipoImovel,
      valor_centavos: novo.valorCentavos, data_assinatura: novo.dataAssinatura, dados: novo.dados, pendencias: novo.pendenciasEmpresa,
      docx_path: `${base}.docx`, pdf_path: `${base}.pdf`, criado_por: sessao.id, criado_por_nome: sessao.nome,
    }).select().single();
    if (error) throw new Error(`Não foi possível registrar o contrato: ${error.message}`);
    return linhaParaRegistro(data);
  },
  async listar() {
    const supabase = await clienteSupabase();
    const { data, error } = await supabase.from("contratos").select("id, workspace_id, molde, titulo, tipo_imovel, valor_centavos, data_assinatura, pendencias, criado_por, criado_por_nome, criado_em").order("criado_em", { ascending: false }).limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []).map((l) => linhaParaRegistro(l));
  },
  async baixar(_sessao, id, formato) {
    const supabase = await clienteSupabase();
    const { data: l } = await supabase.from("contratos").select("*").eq("id", id).maybeSingle();
    if (!l) return null; // sem acesso (RLS) ou não existe
    const { data: arq, error } = await supabase.storage.from("contratos").download(formato === "pdf" ? l.pdf_path : l.docx_path);
    if (error || !arq) return null;
    return { registro: linhaParaRegistro(l), arquivo: Buffer.from(await arq.arrayBuffer()) };
  },
};
