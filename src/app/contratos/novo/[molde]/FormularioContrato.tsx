"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { ConfigEmpresa } from "@/config/empresa";
import { GRUPOS_MOLDE_1, ROTULOS_EMPRESA, TODOS_CAMPOS, type Campo } from "@/lib/contratos/campos";
import { montarDados } from "@/lib/contratos/dados";
import type { ParagrafoModelo } from "@/lib/contratos/modelo";
import { preencherTexto } from "@/lib/contratos/previa";

interface Props {
  slug: string;
  paragrafos: ParagrafoModelo[];
  inicial: Record<string, string>;
  empresa: ConfigEmpresa;
}

// Nome amigável de cada marcador, usado nos trechos pendentes da prévia.
const ROTULOS: Record<string, string> = {
  ...Object.fromEntries(TODOS_CAMPOS.map((c) => [c.chave, c.rotulo])),
  ...ROTULOS_EMPRESA,
  valor_extenso: "Valor por extenso",
};

export function FormularioContrato({ slug, paragrafos, inicial, empresa }: Props) {
  const [valores, setValores] = useState(inicial);
  const [tocados, setTocados] = useState<Set<string>>(new Set());
  const [aba, setAba] = useState<"preencher" | "previa">("preencher");
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState("");
  const [pronto, setPronto] = useState<{ docx: string; pdf: string | null; pendencias: string[]; demo: boolean } | null>(null);

  const { dados, problemas, pendenciasEmpresa } = useMemo(() => montarDados(valores, empresa), [valores, empresa]);
  const problemaDe = (chave: string) => problemas.find((p) => p.chave === chave);
  const mudar = (chave: string, v: string) => { setValores((x) => ({ ...x, [chave]: v })); setPronto(null); };
  const tocar = (chave: string) => setTocados((s) => new Set(s).add(chave));

  async function gerar() {
    setGerando(true);
    setErro("");
    try {
      const resp = await fetch("/api/contratos/gerar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ molde: slug, dados: valores }) });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.erro ?? "Não foi possível gerar o contrato.");
      if (json.demo) {
        const url = (b64: string, tipo: string) => URL.createObjectURL(new Blob([Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))], { type: tipo }));
        setPronto({ demo: true, pendencias: json.pendenciasEmpresa ?? [], docx: url(json.docx, "application/vnd.openxmlformats-officedocument.wordprocessingml.document"), pdf: json.pdf ? url(json.pdf, "application/pdf") : null });
      } else {
        setPronto({ demo: false, pendencias: json.pendenciasEmpresa ?? [], docx: `/api/contratos/${json.id}/docx`, pdf: `/api/contratos/${json.id}/pdf` });
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível gerar o contrato.");
    } finally {
      setGerando(false);
    }
  }

  return (
    <div className="mt-4">
      <div role="tablist" className="mb-4 grid grid-cols-2 gap-2 lg:hidden">
        {(["preencher", "previa"] as const).map((a) => (
          <button key={a} role="tab" aria-selected={aba === a} onClick={() => setAba(a)} className={`min-h-11 rounded-lg font-bold ${aba === a ? "bg-marinho text-white" : "bg-white"}`}>
            {a === "preencher" ? "Preencher" : "Prévia"}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(320px,440px)_1fr] lg:items-start">
        <section aria-label="Dados do contrato" className={`${aba === "preencher" ? "" : "hidden"} rounded-2xl bg-white p-4 sm:p-5 lg:block lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:overflow-auto`}>
          {GRUPOS_MOLDE_1.map((g) => (
            <fieldset key={g.titulo} className="mb-6">
              <legend className="mb-2 font-display text-lg font-bold">{g.titulo}</legend>
              <div className="space-y-3">
                {g.campos.map((c) => (
                  <CampoForm key={c.chave} campo={c} valor={valores[c.chave] ?? ""} extenso={c.tipo === "dinheiro" ? dados.valor_extenso : ""} comissao={c.tipo === "tipo_imovel" ? dados.comissao_pct : ""}
                    erro={tocados.has(c.chave) ? problemaDe(c.chave)?.motivo : undefined} onChange={(v) => mudar(c.chave, v)} onBlur={() => tocar(c.chave)} />
                ))}
              </div>
            </fieldset>
          ))}

          <div aria-live="polite" className={`mb-3 rounded-lg px-3 py-2 text-sm ${problemas.length ? "bg-aviso/70" : "bg-emerald-50 text-emerald-900"}`}>
            {problemas.length ? `Falta preencher ${problemas.length} ${problemas.length === 1 ? "campo" : "campos"}: ${problemas.slice(0, 4).map((p) => p.rotulo).join(", ")}${problemas.length > 4 ? "…" : ""}` : "Tudo preenchido. Confira a prévia e gere o contrato."}
          </div>
          {pendenciasEmpresa.length > 0 && <p className="mb-3 rounded-lg bg-marinho/5 px-3 py-2 text-xs">Dados da empresa ainda a confirmar ({pendenciasEmpresa.join(", ")}). Eles saem como [A CONFIRMAR] no contrato.</p>}
          {erro && <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{erro}</p>}

          {pronto ? (
            <div className="space-y-3 rounded-xl border-2 border-emerald-600 bg-emerald-50 p-4">
              <p className="font-bold text-emerald-900">Contrato gerado.</p>
              {pronto.pendencias.length > 0 && <p className="text-sm">Atenção: saiu com [A CONFIRMAR] em {pronto.pendencias.join(", ")}.</p>}
              <div className="grid grid-cols-2 gap-2">
                <a className="btn-principal" href={pronto.docx} download="contrato.docx">Baixar Word</a>
                {pronto.pdf ? (
                  <a className="btn-principal" href={pronto.pdf} download="contrato.pdf">Baixar PDF</a>
                ) : (
                  <span className="grid min-h-[52px] place-items-center rounded-xl bg-marinho/10 px-2 text-center text-xs font-bold">PDF em breve (serviço de conversão ainda não ligado)</span>
                )}
              </div>
              {pronto.demo ? <p className="text-center text-xs">Demonstração: este contrato não foi guardado no histórico.</p> : <Link href="/contratos" className="block text-center text-sm underline">Ver todos os contratos</Link>}
            </div>
          ) : (
            <button type="button" className="btn-principal w-full" disabled={problemas.length > 0 || gerando} onClick={gerar}>
              {gerando ? "Gerando… (pode levar alguns segundos)" : "Gerar contrato"}
            </button>
          )}
        </section>

        <section aria-label="Prévia do contrato" className={`${aba === "previa" ? "" : "hidden"} lg:block`}>
          <div className="overflow-auto rounded-2xl bg-marinho/10 p-3 sm:p-5">
            <div className="folha mx-auto max-w-[820px]">
              {paragrafos.map((p, i) => {
                if (!p.texto.trim()) return <div key={i} className="h-3" />;
                const prefixo = p.prefixoNegrito && p.texto.startsWith(p.prefixoNegrito) ? p.prefixoNegrito : "";
                const trechos = preencherTexto(p.texto.slice(prefixo.length), dados, ROTULOS);
                return (
                  <p key={i} style={{ textAlign: p.alinhamento === "centro" ? "center" : p.alinhamento === "direita" ? "right" : p.alinhamento === "justificado" ? "justify" : "left", fontWeight: p.negrito ? 700 : 400, marginLeft: p.recuo, textIndent: p.recuoPrimeiraLinha, whiteSpace: "pre-line" }}>
                    {prefixo && <b>{prefixo}</b>}
                    {trechos.map((t, j) => (t.pendente ? <mark key={j}>{t.texto}</mark> : <span key={j}>{t.texto}</span>))}
                  </p>
                );
              })}
            </div>
          </div>
          <p className="mt-2 text-xs text-marinho/70">Prévia do texto. Os trechos em amarelo ainda precisam ser preenchidos. O Word e o PDF saem com o cabeçalho, a marca d&apos;água e o rodapé do modelo da Lucauto.</p>
        </section>
      </div>
    </div>
  );
}

function CampoForm({ campo, valor, extenso, comissao, erro, onChange, onBlur }: { campo: Campo; valor: string; extenso: string; comissao: string; erro?: "faltando" | "invalido"; onChange: (v: string) => void; onBlur: () => void }) {
  const id = `campo-${campo.chave}`;
  const rotulo = (
    <label htmlFor={id} className="mb-1 block text-sm font-semibold">
      {campo.rotulo}{!campo.obrigatorio && <span className="font-normal text-marinho/60"> (opcional)</span>}
    </label>
  );
  const comum = { id, value: valor, onBlur, "aria-invalid": erro ? true : undefined, "aria-describedby": `${id}-dica`, onChange: (e: { target: { value: string } }) => onChange(e.target.value) } as const;

  let entrada: React.ReactNode;
  if (campo.tipo === "tipo_imovel") {
    entrada = (
      <div role="radiogroup" className="grid grid-cols-2 gap-2">
        {[["urbano", "Urbano (5%)"], ["rural", "Rural (8%)"]].map(([v, t]) => (
          <label key={v} className="flex min-h-12 cursor-pointer items-center gap-2 rounded-lg border border-marinho/25 px-3 has-[:checked]:border-dourado has-[:checked]:bg-dourado/15">
            <input type="radio" name="tipo_imovel" value={v} checked={valor === v} onChange={() => onChange(v)} className="accent-dourado" />
            <span className="font-semibold">{t}</span>
          </label>
        ))}
      </div>
    );
  } else if (campo.tipo === "area") {
    entrada = <textarea {...comum} rows={5} className="campo" />;
  } else {
    const tipo = campo.tipo === "data" ? "date" : campo.tipo === "email" ? "email" : campo.tipo === "telefone" ? "tel" : "text";
    const modo = campo.tipo === "dinheiro" ? "decimal" : campo.tipo === "cpf" ? "numeric" : undefined;
    entrada = <input {...comum} type={tipo} inputMode={modo} autoComplete="off" className="campo" />;
  }
  return (
    <div>
      {campo.tipo === "tipo_imovel" ? <span className="mb-1 block text-sm font-semibold">{campo.rotulo}</span> : rotulo}
      {entrada}
      {extenso && <p className="mt-1 text-sm font-semibold text-marinho/80">{extenso}</p>}
      {comissao && <p className="mt-1 text-xs text-marinho/70">Comissão deste contrato: {comissao}%.</p>}
      <p id={`${id}-dica`} className={`mt-1 text-xs ${erro ? "text-amber-800" : "text-marinho/60"}`}>
        {erro === "faltando" ? "Preencha este campo." : erro === "invalido" ? "Confira este campo: o valor não parece correto." : campo.dica ?? ""}
      </p>
    </div>
  );
}
