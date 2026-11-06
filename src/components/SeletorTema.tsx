"use client";
import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Tema = "claro" | "escuro" | "auto";
const OPCOES: { valor: Tema; rotulo: string; Icone: typeof Sun }[] = [
  { valor: "claro", rotulo: "Tema claro", Icone: Sun },
  { valor: "escuro", rotulo: "Tema escuro", Icone: Moon },
  { valor: "auto", rotulo: "Tema do aparelho (automático)", Icone: Monitor },
];

const escuroAgora = (t: Tema) => t === "escuro" || (t === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
const aplicar = (t: Tema) => { document.documentElement.dataset.tema = escuroAgora(t) ? "escuro" : "claro"; };

/** Escolha do tema: claro, escuro ou automático (segue o aparelho). Lembra a escolha neste navegador. */
export function SeletorTema({ className = "" }: { className?: string }) {
  const [tema, setTema] = useState<Tema>("auto");

  useEffect(() => {
    let salvo: Tema = "auto";
    try { const v = localStorage.getItem("tema"); if (v === "claro" || v === "escuro") salvo = v; } catch { /* sem armazenamento: segue o aparelho */ }
    setTema(salvo); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  // No modo automático, acompanha a mudança do aparelho (ex.: escurece à noite).
  useEffect(() => {
    if (tema !== "auto") return;
    const m = window.matchMedia("(prefers-color-scheme: dark)");
    const seguir = () => aplicar("auto");
    m.addEventListener("change", seguir);
    return () => m.removeEventListener("change", seguir);
  }, [tema]);

  function escolher(t: Tema) {
    setTema(t);
    aplicar(t);
    try { if (t === "auto") localStorage.removeItem("tema"); else localStorage.setItem("tema", t); } catch { /* ignora */ }
  }

  return (
    <div role="radiogroup" aria-label="Tema da tela" className={`inline-flex divide-x divide-slate-300 overflow-hidden rounded-lg border border-slate-300 bg-white ${className}`}>
      {OPCOES.map(({ valor, rotulo, Icone }) => (
        <button key={valor} type="button" role="radio" aria-checked={tema === valor} aria-label={rotulo} title={rotulo} onClick={() => escolher(valor)}
          className={`grid h-9 w-10 place-items-center transition-colors duration-150 ${tema === valor ? "bg-dourado/20 text-marinho" : "text-slate-500 hover:bg-slate-50"}`}>
          <Icone size={16} strokeWidth={1.75} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
