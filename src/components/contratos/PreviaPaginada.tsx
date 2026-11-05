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
 *
 * A moldura tem tamanho FIXO (como um leitor de PDF): o zoom acontece dentro dela, com rolagem,
 * e os botões ficam sempre no mesmo lugar.
 */
const PASSO = 0.1, MIN = 0.4, MAX = 2;
const arredonda = (n: number) => Math.round(n * 100) / 100;

export function PreviaPaginada({ slug, paragrafos: todos, dados, rotulos = {}, linhas, temFundo }: { slug: string; paragrafos: ParagrafoModelo[]; dados: Record<string, string>; rotulos?: Record<string, string>; linhas: number; temFundo: boolean }) {
  const ALTURA_CORPO = LINHA * linhas;
  const ROTULOS = { ...ROTULOS_FIXOS, ...rotulos };
  const paragrafos = visiveis(todos, dados);
  const caixa = useRef<HTMLDivElement>(null);
  const fluxo = useRef<HTMLDivElement>(null);
  const rolagem = useRef<HTMLDivElement>(null);
  const folhas = useRef<HTMLDivElement>(null);
  const ancora = useRef<{ x: number; y: number } | null>(null);
  const [disponivel, setDisponivel] = useState(PAGINA_L + 24); // largura livre para a prévia
  const [manual, setManual] = useState<number | null>(null); // zoom escolhido nos botões
  const [cheia, setCheia] = useState(false);
  const [paginas, setPaginas] = useState(1);

  // Padrão: 100% (a página do Word em tamanho real); só diminui sozinho se a tela for estreita.
  // Em tela cheia, a página se ajusta à largura da janela.
  const ajuste = arredonda(Math.max(MIN, Math.min(cheia ? 1.5 : 1, (disponivel - 24) / PAGINA_L)));
  const escala = manual ?? ajuste;
  // Tamanho da moldura: fixo, não muda com o zoom.
  const larguraMoldura = cheia ? disponivel : Math.min(disponivel, PAGINA_L + 24);

  useEffect(() => {
    const c = caixa.current;
    if (!c) return;
    const medir = () => setDisponivel(c.clientWidth);
    medir();
    const o = new ResizeObserver(medir);
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

  // Muda o zoom mantendo o centro do que está sendo visto (como num leitor de PDF).
  function zoomPara(nova: number | null) {
    const r = rolagem.current, f = folhas.current;
    if (r && f) ancora.current = { x: (r.scrollLeft + r.clientWidth / 2 - f.offsetLeft) / escala, y: (r.scrollTop + r.clientHeight / 2 - f.offsetTop) / escala };
    setManual(nova === null ? null : arredonda(Math.max(MIN, Math.min(MAX, nova))));
  }
  const passo = (d: number) => zoomPara(escala + d);
  const passoRef = useRef(passo);
  useEffect(() => { passoRef.current = passo; });

  useLayoutEffect(() => {
    const r = rolagem.current, f = folhas.current;
    if (!r || !f) return;
    if (ancora.current) {
      r.scrollLeft = ancora.current.x * escala + f.offsetLeft - r.clientWidth / 2;
      r.scrollTop = ancora.current.y * escala + f.offsetTop - r.clientHeight / 2;
      ancora.current = null;
    } else if (r.scrollWidth > r.clientWidth) {
      r.scrollLeft = (r.scrollWidth - r.clientWidth) / 2; // página maior que a moldura: começa centralizada
    }
  }, [escala, cheia, larguraMoldura]);

  // Ctrl + roda do mouse dá zoom na prévia (e não na página inteira).
  useEffect(() => {
    const r = rolagem.current;
    if (!r) return;
    const roda = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      passoRef.current(e.deltaY < 0 ? PASSO : -PASSO);
    };
    r.addEventListener("wheel", roda, { passive: false });
    return () => r.removeEventListener("wheel", roda);
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
  const celula = "grid h-9 place-items-center text-slate-700 hover:bg-slate-50 disabled:opacity-40";
  const arvore = (
    <div className={cheia ? "fixed inset-0 z-[60] flex flex-col bg-slate-100 p-3" : "w-full"}>
      <div ref={caixa} className={cheia ? "flex min-h-0 flex-1 flex-col" : "w-full"}>
        <div className={cheia ? "flex min-h-0 flex-1 flex-col" : ""} style={cheia ? undefined : { width: larguraMoldura }}>
          {/* Barra: o nome à esquerda e os botões juntinhos no canto direito (sempre no mesmo lugar) */}
          <div className="flex items-center justify-between gap-2 pb-2 pt-0.5">
            <span className="text-xs font-semibold text-suave">{cheia ? "Prévia do contrato" : "Prévia"}</span>
            <div role="toolbar" aria-label="Zoom da prévia" className="inline-flex divide-x divide-slate-300 overflow-hidden rounded-lg border border-slate-300 bg-white">
              <button type="button" className={`${celula} w-9`} onClick={() => passo(-PASSO)} disabled={escala <= MIN} aria-label="Diminuir o zoom"><Minus size={16} strokeWidth={1.75} /></button>
              <button type="button" className={`${celula} w-14 text-xs font-semibold`} onClick={() => zoomPara(null)} aria-label="Voltar ao tamanho padrão" title="Voltar ao tamanho padrão">{Math.round(escala * 100)}%</button>
              <button type="button" className={`${celula} w-9`} onClick={() => passo(PASSO)} disabled={escala >= MAX} aria-label="Aumentar o zoom"><Plus size={16} strokeWidth={1.75} /></button>
              <button type="button" className={`${celula} w-9`} onClick={() => { setCheia((v) => !v); setManual(null); }} aria-label={cheia ? "Sair da tela cheia" : "Ver em tela cheia"} title={cheia ? "Sair da tela cheia" : "Tela cheia"}>
                {cheia ? <Minimize2 size={16} strokeWidth={1.75} /> : <Maximize2 size={16} strokeWidth={1.75} />}
              </button>
            </div>
          </div>
          {/* Moldura de tamanho fixo: o zoom e a rolagem acontecem aqui dentro */}
          <div ref={rolagem} tabIndex={0} aria-label="Prévia do contrato (use a rolagem; Ctrl + roda do mouse dá zoom)" className={`${cheia ? "min-h-0 flex-1" : "max-h-[calc(100dvh-8rem)] min-h-[320px]"} relative overflow-auto overscroll-contain rounded-[14px] border border-linha bg-slate-200/70 p-3`}>
            <div ref={folhas} style={{ height: (paginas * (PAGINA_A + GAP) - GAP) * escala, width: PAGINA_L * escala, margin: "0 auto" }}>
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
