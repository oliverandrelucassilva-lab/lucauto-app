import { molde1 } from "./molde1";
import type { Definicao } from "./tipos";

// Mesmos campos e regras do molde 1: só muda o texto fixo sobre a exclusividade.
export const molde2: Definicao = { ...molde1, slug: "2_intermediacao_sem_exclusividade", titulo: "Intermediação sem exclusividade" };
