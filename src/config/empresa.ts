// Configuração da empresa (Lucauto). Nada aqui é inventado: o que ainda não foi
// confirmado fica como [A CONFIRMAR] e aparece assim no contrato.
// Os valores reais entram por variáveis de ambiente (veja .env.example),
// nunca no código. No banco, a mesma configuração ficará em workspaces.configuracao.

export const A_CONFIRMAR = "[A CONFIRMAR]";

const env = (nome: string) => {
  const v = process.env[nome]?.trim();
  return v ? v : null;
};

export interface ConfigEmpresa {
  cnpj: string | null;
  creciJuridico: string | null;
  corretoraNome: string;
  corretoraCreci: string | null;
}

export function configEmpresa(): ConfigEmpresa {
  return {
    cnpj: env("EMPRESA_CNPJ"),
    creciJuridico: env("EMPRESA_CRECI_JURIDICO"),
    // Nome da corretora responsável: já consta no molde original.
    corretoraNome: env("EMPRESA_CORRETORA_NOME") ?? "POLLYANA MALTA MARQUES CUNHA",
    corretoraCreci: env("EMPRESA_CORRETORA_CRECI"),
  };
}

/** Pendências da empresa que ainda saem como [A CONFIRMAR] no contrato. */
export function pendenciasEmpresa(c: ConfigEmpresa): string[] {
  const p: string[] = [];
  if (!c.cnpj) p.push("CNPJ da Lucauto");
  if (!c.creciJuridico) p.push("CRECI jurídico da Lucauto");
  if (!c.corretoraCreci) p.push("CRECI da corretora responsável");
  return p;
}
