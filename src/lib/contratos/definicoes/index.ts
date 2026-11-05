import { molde1 } from "./molde1";
import { molde4 } from "./molde4";
import { molde5 } from "./molde5";
import { molde6 } from "./molde6";
import type { Definicao } from "./tipos";

// Os moldes prontos. Cada um entra aqui depois de validado página por página.
export const DEFINICOES: Definicao[] = [molde1, molde4, molde5, molde6];

export const definicaoPorSlug = (slug: string) => DEFINICOES.find((d) => d.slug === slug);
export type { Definicao, Problema } from "./tipos";
