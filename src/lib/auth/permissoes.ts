import type { Perfil } from "./tipos";

export type Modulo = "contratos" | "imoveis" | "painel" | "automacoes";

// Quem enxerga o quê. Espelha as regras de acesso do banco (supabase/migrations).
// Marketing não acessa contratos nem dados pessoais.
const ACESSO: Record<Perfil, Modulo[]> = {
  gerente: ["contratos", "imoveis", "painel", "automacoes"],
  corretor: ["contratos", "imoveis"],
  marketing: ["imoveis"],
};

export const podeAcessar = (perfil: Perfil, modulo: Modulo) => ACESSO[perfil].includes(modulo);

/** Gerente vê todos os contratos do espaço; corretor vê só os que ele mesmo gerou. */
export const veTodosContratos = (perfil: Perfil) => perfil === "gerente";
