export type Perfil = "gerente" | "corretor" | "marketing";

export interface Sessao {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
  /** "Espaço" da empresa. Todo dado é separado por workspace_id. */
  workspaceId: string;
}

export const NOME_PERFIL: Record<Perfil, string> = { gerente: "Gerente", corretor: "Corretor(a)", marketing: "Marketing" };
