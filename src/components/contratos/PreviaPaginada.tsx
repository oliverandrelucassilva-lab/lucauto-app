"use client";
import { Maximize2, Minimize2, Minus, Plus } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ROTULOS_EMPRESA } from "@/lib/contratos/campos";
import type { ParagrafoModelo } from "@/lib/contratos/modelo";
import { preencherTexto } from "@/lib/contratos/previa";

// Medidas da página do Word do molde (A4, Arial 12, espaço 1,5), em pixels a 96 dpi.
const PAGINA_L = 794, PAGINA_A = 1123;
const TOPO = 94.5, ESQUERDA = 113.4, LARGURA = 566.9;
const LINHA = 27.6;
// O LibreOffice/Word encolhem um pouco os espaços do texto justificado; isto imita o efeito.
const ESPACO_PALAVRAS = process.env.NEXT_PUBLIC_ESPACO_PALAVRAS ?? "-0.12em";

const ROTULOS_FIXOS: Record<string, string> = { ...ROTULOS_EMPRESA };

/** Tira da prévia os parágrafos de marcação ({#x} ... {/x}) e os blocos opcionais que não valem. */
function visiveis(paragrafos: ParagrafoModelo[], dados: Record<string, string>): ParagrafoModelo[] {
  const saida: ParagrafoModelo[] = [];
  const pilha: boolean[] = [];
  for (const p of paragrafos) {
    const abre = /^\{#(\w+)\}$/.exec(p.texto.trim());
    const fecha = /^\{\/(\w+)\}$/.exec(p.texto.trim());
    if (abre) { pilha.push(!!dados[abre[1]]); continue; }
    if (fecha) { pilha.pop(); continue; }
    if (pilha.every(Boolean)) saida.push(p);
  }
  return saida;
}

/**
 * Prévia do contrato em páginas A4: o fundo (logo, marca d'água e rodapé) é o do próprio modelo
 * da Lucauto, e o texto do contrato vai por cima. A divisão das páginas é uma aproximação;
 * o Word e o PDF baixados são o documento oficial.
 */
export function PreviaPaginada({ slug, paragrafos: todos, dados, rotulos = {}, linhas, temFundo }: { slug: string; paragrafos: ParagrafoModelo[]; dados: Record<string, string>; rotulos?: Record<string, string>; linhas: number; temFundo: boolean }) {
  const ALTURA_CORPO = LINHA * linhas;
  const ROTULOS = { ...ROTULOS_FIXOS, ...rotulos };
  const paragrafos = visiveis(todos, dados);
  const caixa = useRef<HTMLDivElement>(null);
  const fluxo = useRef<HTMLDivElement>(null);
  const [disponivel, setDisponivel] = useState(PAGINA_L + 24); // largura livre para a prévia
  const [manual, setManual] = useState<number | null>(null); // zoom escolhido nos botões
  const [cheia, setCheia] = useState(false);
  // Tamanho padrão = 100% (a página do Word em tamanho real). Só diminui sozinho se a tela for estreita.
  // Em tela cheia, ajusta a página à largura da janela.
  const ajuste = cheia ? Math.max(0.4, Math.min(1.5, (disponivel - 24) / PAGINA_L)) : Math.max(0.4, Math.min(1, (disponivel - 24) / PAGINA_L));
  const escala = manual ?? ajuste;
  const [paginas, setPaginas] = useState(1);

  useEffect(() => {
    const c = caixa.current;
    if (!c) return;
    const ajustar = () => setDisponivel(c.clientWidth);
    ajustar();
    const o = new ResizeObserver(ajustar);
    o.observe(c);
    return () => o.disconnect();
  }, [cheia]);

  useEffect(() => {
    if (!cheia) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setCheia(false);
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [cheia]);

  useLayoutEffect(() => {
    const medir = () => fluxo.current && setPaginas(Math.max(1, Math.ceil((fluxo.current.offsetHeight - 1) / ALTURA_CORPO)));
    medir();
    document.fonts?.ready.then(medir);
  });

  const conteudo = (
    <div style={{ width: LARGURA, fontFamily: 'Arial, "Liberation Sans", Helvetica, sans-serif', fontSize: 16, color: "#000" }}>
      {paragrafos.map((p, i) => {
        if (!p.texto.trim()) return <div key={i} style={{ height: LINHA }} />;
        // Pedaços em negrito/itálico no meio do parágrafo. Se um marcador atravessar pedaços, junta tudo.
        const equilibrado = p.runs.every((r) => (r.texto.match(/\{/g) ?? []).length === (r.texto.match(/\}/g) ?? []).length);
        const pedacos = equilibrado ? p.runs : [{ texto: p.texto, negrito: p.negrito, italico: false }];
        return (
          <p key={i} style={{ margin: 0, lineHeight: `${LINHA}px`, textAlign: p.alinhamento === "centro" ? "center" : p.alinhamento === "direita" ? "right" : p.alinhamento === "justificado" ? "justify" : "left", marginLeft: `${p.recuo}pt`, textIndent: `${p.recuoPrimeiraLinha}pt`, whiteSpace: "pre-line", overflowWrap: "anywhere", wordSpacing: ESPACO_PALAVRAS }}>
            {pedacos.map((r, n) => (
              <span key={n} style={{ fontWeight: r.negrito ? 700 : 400, fontStyle: r.italico ? "italic" : "normal" }}>
                {preencherTexto(r.texto, dados, ROTULOS).map((t, j) => (t.pendente ? <mark key={j} style={{ background: "#ffe9a8", color: "#5a3d00", borderRadius: 3 }}>{t.texto}</mark> : <span key={j}>{t.texto}</span>))}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );

  const GAP = 16;
  const passo = (d: number) => setManual(Math.max(0.4, Math.min(2, Math.round((escala + d) * 10) / 10)));
  const botao = "grid size-9 place-items-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40";
  const arvore = (
    <div className={cheia ? "fixed inset-0 z-[60] flex flex-col bg-slate-100 p-3" : "w-full"}>
      <div ref={caixa} className={cheia ? "flex min-h-0 flex-1 flex-col" : "w-full"}>
        {/* A moldura acompanha o tamanho da página: cresce e encolhe junto com o zoom */}
        <div className={`${cheia ? "mx-auto flex min-h-0 flex-1 flex-col" : "flex flex-col"}`} style={{ width: Math.min(disponivel, PAGINA_L * escala + 24), maxWidth: "100%" }}>
          <div className="flex items-center justify-between gap-2 px-1 pb-2 pt-0.5" role="toolbar" aria-label="Controles da prévia">
            <span className="text-xs font-semibold text-suave">{cheia ? "Prévia do contrato" : "Prévia"}</span>
            <div className="flex items-center gap-1.5">
              <button type="button" className={botao} onClick={() => passo(-0.1)} aria-label="Diminuir o zoom"><Minus size={16} strokeWidth={1.75} /></button>
              <button type="button" className="h-9 min-w-14 rounded-lg border border-slate-300 bg-white px-2 text-xs font-semibold hover:bg-slate-50" onClick={() => setManual(null)} aria-label="Voltar ao tamanho padrão">{Math.round(escala * 100)}%</button>
              <button type="button" className={botao} onClick={() => passo(0.1)} aria-label="Aumentar o zoom"><Plus size={16} strokeWidth={1.75} /></button>
              <button type="button" className={`${botao} ml-1`} onClick={() => { setCheia((v) => !v); setManual(null); }} aria-label={cheia ? "Sair da tela cheia" : "Ver em tela cheia"}>
                {cheia ? <Minimize2 size={16} strokeWidth={1.75} /> : <Maximize2 size={16} strokeWidth={1.75} />}
              </button>
            </div>
          </div>
          <div className={`${cheia ? "min-h-0 flex-1" : "max-h-[calc(100dvh-8rem)]"} overflow-auto rounded-[14px] border border-linha bg-slate-200/70 p-3`}>
            <div style={{ height: (paginas * (PAGINA_A + GAP) - GAP) * escala, width: PAGINA_L * escala, margin: "0 auto" }}>
              <div style={{ width: PAGINA_L, transform: `scale(${escala})`, transformOrigin: "top left" }}>
                {Array.from({ length: paginas }, (_, k) => (
                  <div key={k} role="img" aria-label={`Página ${k + 1} de ${paginas} do contrato`} style={{ position: "relative", width: PAGINA_L, height: PAGINA_A, marginBottom: k < paginas - 1 ? GAP : 0, background: temFundo ? `#fff url(/previa/${slug}.png) center / 100% 100% no-repeat` : "#fff", boxShadow: "0 1px 6px rgba(15,23,42,.18)", overflow: "hidden" }}>
                    <div style={{ position: "absolute", left: ESQUERDA, top: TOPO, width: LARGURA, height: ALTURA_CORPO, overflow: "hidden" }}>
                      <div ref={k === 0 ? fluxo : undefined} style={{ transform: `translateY(${-k * ALTURA_CORPO}px)` }}>{conteudo}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  // Em tela cheia, sai de dentro da página para cobrir também o menu lateral.
  return cheia ? createPortal(arvore, document.body) : arvore;
}
