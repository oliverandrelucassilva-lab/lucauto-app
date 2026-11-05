"use client";
import { useId, useRef, useState } from "react";

export interface Opcao {
  valor: string; // o que entra no campo
  rotulo?: string; // o que aparece na lista (se diferente)
  detalhe?: string; // texto pequeno à direita (ex.: UF)
  dados?: unknown; // informação extra devolvida em onEscolher
}

interface Props {
  id: string;
  value: string;
  onChange: (v: string) => void;
  /** Devolve as sugestões para o que foi digitado ("" = campo vazio). */
  buscar: (consulta: string) => Opcao[];
  onEscolher?: (o: Opcao) => void;
  onFocar?: () => void;
  onBlur?: () => void;
  invalido?: boolean;
  descritoPor?: string;
  mostrarAoFocar?: boolean; // mostra a lista logo que o campo recebe o foco
}

/** Campo de texto com lista de sugestões: digita, a lista aparece, clica e preenche. */
export function Combobox({ id, value, onChange, buscar, onEscolher, onFocar, onBlur, invalido, descritoPor, mostrarAoFocar }: Props) {
  const lista = useId();
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(-1);
  const fechar = useRef<ReturnType<typeof setTimeout> | null>(null);

  const opcoes = aberto ? buscar(value) : [];
  // se o que está digitado já é exatamente uma opção, não precisa mostrar a lista
  const visiveis = opcoes.length === 1 && opcoes[0].valor === value ? [] : opcoes;

  function escolher(o: Opcao) {
    onChange(o.valor);
    onEscolher?.(o);
    setAberto(false);
    setAtivo(-1);
  }

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={visiveis.length > 0}
        aria-controls={lista}
        aria-autocomplete="list"
        aria-activedescendant={ativo >= 0 ? `${lista}-${ativo}` : undefined}
        aria-invalid={invalido ? true : undefined}
        aria-describedby={descritoPor}
        autoComplete="off"
        className="campo"
        value={value}
        onChange={(e) => { onChange(e.target.value); setAberto(true); setAtivo(-1); }}
        onFocus={() => { if (fechar.current) clearTimeout(fechar.current); onFocar?.(); if (mostrarAoFocar || value) setAberto(true); }}
        onBlur={() => { fechar.current = setTimeout(() => setAberto(false), 120); onBlur?.(); }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setAberto(true); setAtivo((a) => Math.min(visiveis.length - 1, a + 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setAtivo((a) => Math.max(0, a - 1)); }
          else if (e.key === "Enter" && ativo >= 0 && visiveis[ativo]) { e.preventDefault(); escolher(visiveis[ativo]); }
          else if (e.key === "Escape") setAberto(false);
        }}
      />
      {visiveis.length > 0 && (
        <ul id={lista} role="listbox" className="absolute left-0 right-0 z-30 mt-1 max-h-60 overflow-auto rounded-[10px] border border-linha bg-white py-1 shadow-lg">
          {visiveis.map((o, i) => (
            <li key={`${o.valor}-${o.detalhe ?? ""}-${i}`} id={`${lista}-${i}`} role="option" aria-selected={i === ativo}
              // mouseDown (e não click) para escolher antes de o campo perder o foco
              onMouseDown={(e) => { e.preventDefault(); escolher(o); }}
              onMouseEnter={() => setAtivo(i)}
              className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 px-3 text-sm ${i === ativo ? "bg-dourado/15" : "hover:bg-slate-50"}`}>
              <span>{o.rotulo ?? o.valor}</span>
              {o.detalhe && <span className="text-xs text-suave">{o.detalhe}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
