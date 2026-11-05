import type { ConfigEmpresa } from "@/config/empresa";
import type { Etapa } from "../campos";

export interface Problema {
  chave: string;
  rotulo: string;
  motivo: "faltando" | "invalido";
  /** Mensagem específica (regras entre campos). */
  mensagem?: string;
}

/** Tudo o que muda de um molde para outro: campos, regras e como mostrar a prévia. */
export interface Definicao {
  slug: string;
  titulo: string;
  etapas: Etapa[];
  /** Campo com o nome do cliente (para o histórico). */
  clienteChave: string;
  /** Campo de dinheiro principal (para o histórico). Moldes sem valor em dinheiro não têm. */
  valorChave?: string;
  /** O Word tem logo, marca d'água e rodapé (a prévia desenha esse fundo). */
  temFundo: boolean;
  /** Linhas de texto que cabem em cada página (calibrado no PDF do original). */
  linhasPorPagina: number;
  /** Marcadores calculados a partir do que foi digitado (comissão, prazo por extenso...). */
  calcular?: (l: Record<string, string>, empresa: ConfigEmpresa) => Record<string, string>;
  /** Valores sugeridos (AAAA-MM-DD) para campos vazios que se calculam sozinhos, como a data final do aluguel. */
  sugerir?: (l: Record<string, string>) => Record<string, string>;
  /** Regras entre campos (ex.: data final depois da inicial). */
  conferir?: (l: Record<string, string>) => Problema[];
}
