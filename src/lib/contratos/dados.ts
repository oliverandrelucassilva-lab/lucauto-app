import { A_CONFIRMAR, type ConfigEmpresa, pendenciasEmpresa } from "@/config/empresa";
import { TODOS_CAMPOS, type Campo } from "./campos";
import { formatarBRL, lerValor, valorPorExtenso } from "./extenso";
import { comissaoPorTipo, dataCurta, dataPorExtenso, hojeISO, type TipoImovel } from "./regras";

export type Entrada = Record<string, string | undefined>;

export interface Problema {
  chave: string;
  rotulo: string;
  motivo: "faltando" | "invalido";
}

export interface Resultado {
  /** Valores prontos para os marcadores do Word. */
  dados: Record<string, string>;
  /** Campos do formulário que bloqueiam a geração. */
  problemas: Problema[];
  /** Dados da empresa ainda pendentes: saem como [A CONFIRMAR] e não bloqueiam. */
  pendenciasEmpresa: string[];
}

/** Confere os dígitos verificadores do CPF. */
export function cpfValido(txt: string): boolean {
  const d = txt.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const dig = (n: number) => {
    let s = 0;
    for (let i = 0; i < n; i++) s += Number(d[i]) * (n + 1 - i);
    const r = (s * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return dig(9) === Number(d[9]) && dig(10) === Number(d[10]);
}

const dataIsoValida = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
};

/** 11144477735 -> 111.444.777-35 (se não tiver 11 dígitos, devolve como veio). */
export function formatarCpf(txt: string): string {
  const d = txt.replace(/\D/g, "");
  return d.length === 11 ? `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}` : txt;
}

/** Valores iniciais do formulário (padrões e data de hoje). */
export function valoresIniciais(hoje: string = hojeISO()): Record<string, string> {
  const v: Record<string, string> = {};
  for (const c of TODOS_CAMPOS) v[c.chave] = c.padrao === "hoje" ? hoje : (c.padrao ?? "");
  return v;
}

function conferir(c: Campo, valor: string): Problema["motivo"] | null {
  if (!valor) return c.obrigatorio ? "faltando" : null;
  if (c.tipo === "dinheiro" && lerValor(valor) === null) return "invalido";
  if (c.tipo === "cpf" && !cpfValido(valor)) return "invalido";
  if (c.tipo === "data" && !dataIsoValida(valor)) return "invalido";
  if (c.tipo === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return "invalido";
  return null;
}

export function montarDados(entrada: Entrada, empresa: ConfigEmpresa): Resultado {
  const limpo: Record<string, string> = {};
  for (const c of TODOS_CAMPOS) limpo[c.chave] = (entrada[c.chave] ?? "").toString().trim();

  const problemas: Problema[] = [];
  for (const c of TODOS_CAMPOS) {
    const motivo = conferir(c, limpo[c.chave]);
    if (motivo) problemas.push({ chave: c.chave, rotulo: c.rotulo, motivo });
  }

  const tipo: TipoImovel = limpo.tipo_imovel === "rural" ? "rural" : "urbano";
  const comissao = comissaoPorTipo(tipo);
  const centavos = lerValor(limpo.valor);

  const dados: Record<string, string> = {
    ...limpo,
    proprietario_nascimento: dataCurta(limpo.proprietario_nascimento),
    proprietario_cpf: formatarCpf(limpo.proprietario_cpf),
    valor: centavos ? formatarBRL(centavos) : "",
    valor_extenso: centavos ? valorPorExtenso(centavos) : "",
    comissao_pct: comissao.pct,
    comissao_extenso: comissao.extenso,
    data_assinatura: dataPorExtenso(limpo.data_assinatura),
    empresa_cnpj: empresa.cnpj ?? A_CONFIRMAR,
    empresa_creci: empresa.creciJuridico ?? A_CONFIRMAR,
    corretora_nome: empresa.corretoraNome,
    corretora_creci: empresa.corretoraCreci ?? A_CONFIRMAR,
  };
  return { dados, problemas, pendenciasEmpresa: pendenciasEmpresa(empresa) };
}
