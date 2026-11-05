"use client";
import { AlertCircle, Check, ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { PreviaPaginada } from "@/components/contratos/PreviaPaginada";
import { Botao } from "@/components/ui/Botao";
import { Combobox, type Opcao } from "@/components/ui/Combobox";
import { Cartao } from "@/components/ui/Cartao";
import type { ConfigEmpresa } from "@/config/empresa";
import type { Campo, Etapa } from "@/lib/contratos/campos";
import { montarDados } from "@/lib/contratos/dados";
import { aplicarMascara, normalizar } from "@/lib/contratos/formatos";
import { BANCOS, CARTORIOS, ESTADO_CIVIL, ESTADOS, NACIONALIDADES, PROFISSOES } from "@/lib/contratos/sugestoes";
import type { ParagrafoModelo } from "@/lib/contratos/modelo";

interface Props {
  slug: string;
  etapas: Etapa[];
  temFundo: boolean;
  linhas: number;
  paragrafos: ParagrafoModelo[];
  inicial: Record<string, string>;
  empresa: ConfigEmpresa;
}

interface Pronto { docx: string; pdf: string | null; pendencias: string[]; demo: boolean }

export function FormularioContrato({ slug, etapas: ETAPAS, temFundo, linhas, paragrafos, inicial, empresa }: Props) {
  const TITULOS = [...ETAPAS.map((e) => e.titulo), "Revisar"];
  const REVISAR = ETAPAS.length;
  // nome amigável de cada marcador, para os trechos pendentes da prévia
  const rotulos = useMemo(() => {
    const r: Record<string, string> = {};
    for (const c of ETAPAS.flatMap((e) => e.campos)) { r[c.chave] = c.rotulo; if (c.tipo === "dinheiro") r[`${c.chave}_extenso`] = `${c.rotulo} por extenso`; }
    return r;
  }, [ETAPAS]);
  const [valores, setValores] = useState(inicial);
  const [etapa, setEtapa] = useState(0);
  const [tocados, setTocados] = useState<Set<string>>(new Set());
  const [gerando, setGerando] = useState<"docx" | "pdf" | null>(null);
  const [erro, setErro] = useState("");
  const [pronto, setPronto] = useState<Pronto | null>(null);

  const { dados, problemas, pendenciasEmpresa, sugeridos } = useMemo(() => montarDados(slug, valores, empresa), [slug, valores, empresa]);
  const problemaDe = (chave: string) => problemas.find((p) => p.chave === chave);
  const mudar = (chave: string, v: string) => { setValores((x) => ({ ...x, [chave]: v })); setPronto(null); setErro(""); };
  const tocar = (...chaves: string[]) => setTocados((s) => new Set([...s, ...chaves]));
  const etapaDoCampo = (chave: string) => ETAPAS.findIndex((e) => e.campos.some((c) => c.chave === chave));

  function continuar() {
    const atual = ETAPAS[etapa];
    tocar(...atual.campos.map((c) => c.chave));
    const faltam = problemas.filter((p) => atual.campos.some((c) => c.chave === p.chave));
    if (faltam.length) { setErro(`Antes de continuar, corrija: ${faltam.map((p) => p.rotulo).join(", ")}.`); return; }
    setErro("");
    setEtapa((e) => e + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  const voltar = () => { setErro(""); setEtapa((e) => Math.max(0, e - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); };

  async function gerar(): Promise<Pronto | null> {
    if (pronto) return pronto;
    const resp = await fetch("/api/contratos/gerar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ molde: slug, dados: valores }) });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.erro ?? "Não foi possível gerar o contrato.");
    let r: Pronto;
    if (json.demo) {
      const url = (b64: string, tipo: string) => URL.createObjectURL(new Blob([Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))], { type: tipo }));
      r = { demo: true, pendencias: json.pendenciasEmpresa ?? [], docx: url(json.docx, "application/vnd.openxmlformats-officedocument.wordprocessingml.document"), pdf: json.pdf ? url(json.pdf, "application/pdf") : null };
    } else {
      r = { demo: false, pendencias: json.pendenciasEmpresa ?? [], docx: `/api/contratos/${json.id}/docx`, pdf: `/api/contratos/${json.id}/pdf` };
    }
    setPronto(r);
    return r;
  }

  async function baixar(formato: "docx" | "pdf") {
    setGerando(formato);
    setErro("");
    try {
      const r = await gerar();
      const url = r && (formato === "docx" ? r.docx : r.pdf);
      if (!url) { setErro("O PDF ainda não está disponível neste ambiente de demonstração. O Word foi gerado normalmente."); return; }
      const a = document.createElement("a");
      a.href = url; a.download = `contrato.${formato}`;
      document.body.appendChild(a); a.click(); a.remove();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível gerar o contrato.");
    } finally {
      setGerando(null);
    }
  }

  const atual = ETAPAS[etapa];
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,370px)_minmax(0,1fr)] lg:items-start">
      <div className="min-w-0 space-y-4">
        {/* Barra de progresso */}
        <nav aria-label="Etapas" className="space-y-3">
          <p className="text-xs font-semibold text-suave">Etapa {etapa + 1} de {TITULOS.length} · <span className="text-tinta">{TITULOS[etapa]}</span></p>
          <ol className="grid gap-2" style={{ gridTemplateColumns: `repeat(${TITULOS.length}, minmax(0, 1fr))` }}>
            {TITULOS.map((t, i) => (
              <li key={t} aria-current={i === etapa ? "step" : undefined}>
                <div className={`h-1.5 rounded-full transition-colors duration-150 ${i <= etapa ? "bg-dourado" : "bg-slate-200"}`} />
                <span className={`mt-1.5 block truncate text-xs ${i === etapa ? "font-semibold text-tinta" : "text-suave"}`}>{t}</span>
              </li>
            ))}
          </ol>
        </nav>

        <Cartao className="space-y-5">
          {etapa < REVISAR ? (
            <>
              <div>
                <h2 className="text-base font-bold">{atual.titulo}</h2>
                <p className="text-sm text-suave">{atual.descricao}</p>
              </div>
              <div className="space-y-4">
                {atual.campos.map((c) => (
                  <Fragment key={c.chave}>
                  {c.grupo && <h3 className="border-t border-linha pt-4 text-sm font-bold text-tinta first:border-0 first:pt-0">{c.grupo}</h3>}
                  <CampoForm sugerido={sugeridos[c.chave]} campo={c} valor={valores[c.chave] ?? ""} valores={valores} mudarOutro={mudar} extenso={c.tipo === "dinheiro" ? dados.valor_extenso : ""} comissao={c.tipo === "tipo_imovel" ? dados.comissao_pct : ""}
                    erro={tocados.has(c.chave) ? problemaDe(c.chave)?.motivo : undefined} mensagem={tocados.has(c.chave) ? problemaDe(c.chave)?.mensagem : undefined} onChange={(v) => mudar(c.chave, aplicarMascara(c.mascara, v))} onBlur={() => tocar(c.chave)} />
                  </Fragment>
                ))}
              </div>
            </>
          ) : (
            <>
              <div>
                <h2 className="text-base font-bold">Revisar</h2>
                <p className="text-sm text-suave">Confira a prévia do contrato e baixe o arquivo.</p>
              </div>
              {problemas.length > 0 ? (
                <div role="alert" className="space-y-2 rounded-[10px] bg-red-50 p-4 text-sm text-red-700">
                  <p className="flex items-center gap-2 font-semibold"><AlertCircle size={18} strokeWidth={1.75} aria-hidden="true" />Falta preencher {problemas.length} {problemas.length === 1 ? "campo" : "campos"}:</p>
                  <ul className="space-y-1">
                    {problemas.map((p) => (
                      <li key={p.chave} className="flex items-center justify-between gap-2">
                        <span>{p.rotulo}{p.motivo === "invalido" ? " (confira o valor)" : ""}</span>
                        <button type="button" className="min-h-11 px-2 font-semibold underline" onClick={() => { tocar(p.chave); setEtapa(etapaDoCampo(p.chave)); }}>Corrigir</button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="flex items-center gap-2 rounded-[10px] bg-emerald-50 p-4 text-sm font-medium text-emerald-800"><Check size={18} strokeWidth={1.75} aria-hidden="true" />Tudo preenchido. O contrato está pronto para baixar.</p>
              )}
              {pendenciasEmpresa.length > 0 && <p className="rounded-[10px] bg-slate-50 p-3 text-xs text-suave">Dados da empresa ainda a confirmar ({pendenciasEmpresa.join(", ")}). Eles saem como [A CONFIRMAR] no contrato.</p>}
              <div className="grid gap-3 sm:grid-cols-2">
                <Botao variante="secundario" disabled={problemas.length > 0 || gerando !== null} onClick={() => baixar("docx")}>
                  {gerando === "docx" ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Download size={18} strokeWidth={1.75} aria-hidden="true" />}Baixar Word
                </Botao>
                <Botao disabled={problemas.length > 0 || gerando !== null} onClick={() => baixar("pdf")}>
                  {gerando === "pdf" ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Download size={18} strokeWidth={1.75} aria-hidden="true" />}Baixar PDF
                </Botao>
              </div>
              {gerando && <p role="status" className="text-xs text-suave">Gerando o contrato… pode levar alguns segundos.</p>}
              {pronto?.demo && <p className="text-xs text-suave">Demonstração: este contrato não é guardado no histórico.</p>}
            </>
          )}

          {erro && <p role="alert" className="flex items-start gap-2 rounded-[10px] bg-red-50 px-3 py-2 text-sm text-red-700"><AlertCircle size={18} strokeWidth={1.75} className="mt-0.5 shrink-0" aria-hidden="true" />{erro}</p>}

          <div className="flex justify-between gap-3 border-t border-linha pt-4">
            <Botao variante="secundario" onClick={voltar} disabled={etapa === 0}><ChevronLeft size={18} strokeWidth={1.75} aria-hidden="true" />Voltar</Botao>
            {etapa < REVISAR && <Botao onClick={continuar}>Continuar<ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" /></Botao>}
          </div>
        </Cartao>
      </div>

      <section aria-label="Prévia do contrato" className={`${etapa === REVISAR ? "" : "hidden"} min-w-0 lg:block lg:sticky lg:top-4`}>
        <PreviaPaginada slug={slug} paragrafos={paragrafos} dados={dados} rotulos={rotulos} linhas={linhas} temFundo={temFundo} />
        <p className="mt-2 text-xs text-suave">Prévia com o fundo do modelo da Lucauto (logo, marca d&apos;água e rodapé). O que falta aparece em amarelo. A divisão das páginas é aproximada: o Word e o PDF baixados são o documento oficial.</p>
      </section>
    </div>
  );
}

// ---------- sugestões ----------
type Municipio = { nome: string; uf: string; chave: string };
let cacheMunicipios: Municipio[] | null = null;
async function carregarMunicipios(): Promise<Municipio[]> {
  if (cacheMunicipios) return cacheMunicipios;
  const dados = (await import("@/data/municipios.json")).default as Record<string, string[]>;
  cacheMunicipios = Object.entries(dados).flatMap(([uf, nomes]) => nomes.map((nome) => ({ nome, uf, chave: normalizar(nome) })));
  return cacheMunicipios;
}

function filtrar(itens: Opcao[], consulta: string, max = 8): Opcao[] {
  const q = normalizar(consulta);
  if (!q) return itens.slice(0, max);
  const comeca: Opcao[] = [], contem: Opcao[] = [];
  for (const o of itens) {
    const alvo = normalizar(o.valor + " " + (o.detalhe ?? ""));
    if (normalizar(o.valor).startsWith(q)) comeca.push(o);
    else if (alvo.includes(q)) contem.push(o);
  }
  return [...comeca, ...contem].slice(0, max);
}

const comoOpcoes = (l: string[]): Opcao[] => l.map((valor) => ({ valor }));

function CampoForm({ campo, valor, valores, mudarOutro, extenso, comissao, sugerido, erro, mensagem, onChange, onBlur }: { mensagem?: string; sugerido?: string; campo: Campo; valor: string; valores: Record<string, string>; mudarOutro: (chave: string, v: string) => void; extenso: string; comissao: string; erro?: "faltando" | "invalido"; onChange: (v: string) => void; onBlur: () => void }) {
  const [municipios, setMunicipios] = useState<Municipio[]>(cacheMunicipios ?? []);
  const id = `campo-${campo.chave}`;
  const comum = { id, value: valor, onBlur, "aria-invalid": erro ? true : undefined, "aria-describedby": `${id}-dica`, onChange: (e: { target: { value: string } }) => onChange(e.target.value) } as const;

  // O que aparece na lista de cada campo com sugestões
  function buscar(q: string): Opcao[] {
    switch (campo.sugestoes) {
      case "estado_civil": return filtrar(comoOpcoes(ESTADO_CIVIL), q);
      case "profissao": return filtrar(comoOpcoes(PROFISSOES), q);
      case "banco": return filtrar(comoOpcoes(BANCOS), q);
      case "cartorio": return filtrar(comoOpcoes(CARTORIOS), q);
      case "estado": return filtrar(ESTADOS.map((e) => ({ valor: e.nome, detalhe: e.uf })), q, 10);
      case "nacionalidade": return filtrar(comoOpcoes(NACIONALIDADES), q);
      case "favorecido": { const nome = valores[campo.sugestaoDe ?? ""]?.trim(); return nome ? filtrar([{ valor: nome, detalhe: "nome já digitado" }], q.trim() === nome ? "" : q) : []; }
      case "cidade": {
        const ufAtual = ESTADOS.find((e) => normalizar(e.nome) === normalizar(valores[campo.chave.replace(/_cidade$/, "_uf")] ?? ""))?.uf;
        const nq = normalizar(q);
        if (nq.length < 2) return [];
        // cidades do estado escolhido primeiro, depois as de outros estados
        const achadas = municipios.filter((m) => m.chave.startsWith(nq) || m.chave.includes(" " + nq));
        // nome exato primeiro, depois as do estado escolhido, depois as que começam com o que foi digitado (nomes curtos antes)
        achadas.sort((a, b) => Number(b.chave === nq) - Number(a.chave === nq) || Number(b.uf === ufAtual) - Number(a.uf === ufAtual) || Number(b.chave.startsWith(nq)) - Number(a.chave.startsWith(nq)) || a.chave.length - b.chave.length);
        return achadas.slice(0, 8).map((m) => ({ valor: m.nome, detalhe: m.uf, dados: m.uf }));
      }
      default: return [];
    }
  }

  let entrada: React.ReactNode;
  if (campo.tipo === "tipo_imovel") {
    entrada = (
      <div role="radiogroup" aria-label={campo.rotulo} className="grid grid-cols-2 gap-2">
        {[["urbano", "Urbano (5%)"], ["rural", "Rural (8%)"]].map(([v, t]) => (
          <label key={v} className="flex h-11 cursor-pointer items-center gap-2 rounded-[10px] border border-slate-300 bg-white px-3 text-sm font-medium transition-colors duration-150 has-[:checked]:border-dourado has-[:checked]:bg-dourado/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-dourado">
            <input type="radio" name="tipo_imovel" value={v} checked={valor === v} onChange={() => onChange(v)} className="accent-dourado" />{t}
          </label>
        ))}
      </div>
    );
  } else if (campo.tipo === "opcoes") {
    entrada = (
      <div role="radiogroup" aria-label={campo.rotulo} className="grid gap-2 sm:grid-cols-2">
        {campo.opcoes?.map((o) => (
          <label key={o.valor} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-[10px] border border-slate-300 bg-white px-3 py-2 text-sm font-medium has-[:checked]:border-dourado has-[:checked]:bg-dourado/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-dourado">
            <input type="radio" name={campo.chave} value={o.valor} checked={valor === o.valor} onChange={() => onChange(o.valor)} className="accent-dourado" />{o.rotulo}
          </label>
        ))}
      </div>
    );
  } else if (campo.sugestoes) {
    entrada = (
      <Combobox id={id} value={valor} onChange={onChange} buscar={buscar} invalido={!!erro} descritoPor={`${id}-dica`} onBlur={onBlur}
        mostrarAoFocar={campo.sugestoes !== "cidade" && campo.sugestoes !== "profissao"}
        onFocar={() => { if (campo.sugestoes === "cidade" && !cacheMunicipios) carregarMunicipios().then(setMunicipios); else if (campo.sugestoes === "cidade") setMunicipios(cacheMunicipios!); }}
        onEscolher={(o) => {
          // escolher a cidade preenche o estado sozinho
          if (campo.sugestoes === "cidade" && typeof o.dados === "string") { const e = ESTADOS.find((x) => x.uf === o.dados); if (e) mudarOutro(campo.chave.replace(/_cidade$/, "_uf"), e.nome); }
        }} />
    );
  } else if (campo.tipo === "area") {
    entrada = <textarea {...comum} rows={5} className="campo" />;
  } else {
    const tipo = campo.tipo === "data" ? "date" : campo.tipo === "email" ? "email" : "text";
    const modo = campo.tipo === "dinheiro" ? "decimal" : ["cpf", "telefone", "cep", "numero", "inteiro"].includes(campo.tipo) ? "numeric" : undefined;
    const hoje = new Date().toISOString().slice(0, 10);
    const limites = campo.chave === "proprietario_nascimento" ? { min: "1900-01-01", max: hoje } : campo.tipo === "data" ? { min: "2000-01-01" } : {};
    entrada = <input {...comum} {...limites} type={tipo} inputMode={modo} autoComplete={campo.tipo === "email" ? "email" : "off"} className="campo" />;
  }
  return (
    <div>
      {campo.tipo === "tipo_imovel" || campo.tipo === "opcoes" ? (
        <span className="mb-1.5 block text-sm font-medium text-tinta">{campo.rotulo}</span>
      ) : (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-tinta">{campo.rotulo}{(!campo.obrigatorio || campo.dependeDe) && <span className="font-normal text-suave"> (opcional)</span>}</label>
      )}
      {entrada}
      {extenso && <p className="mt-1.5 text-sm font-medium text-slate-700">{extenso}</p>}
      {comissao && <p className="mt-1.5 text-xs text-suave">Comissão deste contrato: {comissao}%.</p>}
      {sugerido && !valor && <p className="mt-1.5 text-xs font-medium text-slate-700">Calculado automaticamente: {sugerido.split("-").reverse().join("/")}. Preencha só se quiser outra data.</p>}
      <p id={`${id}-dica`} className={`mt-1.5 text-xs ${erro ? "text-red-600" : "text-suave"}`}>
        {erro === "faltando" ? `Preencha o campo ${campo.rotulo}.` : erro === "invalido" ? (mensagem ?? campo.erroInvalido ?? `Confira o campo ${campo.rotulo}: o valor não parece correto.`) : campo.dica ?? ""}
      </p>
    </div>
  );
}
