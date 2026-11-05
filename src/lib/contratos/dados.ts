import { A_CONFIRMAR, type ConfigEmpresa, pendenciasEmpresa } from "@/config/empresa";
import { TODOS_CAMPOS, type Campo } from "./campos";
import { formatarBRL, lerValor, valorPorExtenso } from "./extenso";
import { formatarCpf, mascaraCep, mascaraTelefone, soDigitos } from "./formatos";
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
  if (!/^[\d.\-\s]+$/.test(txt)) return false; // letras não são aceitas
  const d = soDigitos(txt);
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

/** Valores iniciais do formulário (padrões e data de hoje). */
export function valoresIniciais(hoje: string = hojeISO()): Record<string, string> {
  const v: Record<string, string> = {};
  for (const c of TODOS_CAMPOS) v[c.chave] = c.padrao === "hoje" ? hoje : (c.padrao ?? "");
  return v;
}

const hojeUTC = () => new Date().toISOString().slice(0, 10);

function conferir(c: Campo, valor: string): Problema["motivo"] | null {
  if (!valor) return c.obrigatorio ? "faltando" : null;
  const digitos = soDigitos(valor);
  switch (c.tipo) {
    case "dinheiro": return lerValor(valor) === null ? "invalido" : null;
    case "cpf": return cpfValido(valor) ? null : "invalido";
    case "telefone": return /^[\d\s()+\-.]+$/.test(valor) && (digitos.length === 10 || digitos.length === 11) ? null : "invalido";
    case "cep": return /^[\d\s.\-]+$/.test(valor) && digitos.length === 8 ? null : "invalido";
    case "numero": {
      const permitido = c.chave === "agencia" ? /^[\d\s\-]+$/ : /^[\d\s./\-]+$/;
      const [min, max] = c.chave === "proprietario_rg" ? [4, 14] : [1, 20];
      return permitido.test(valor) && digitos.length >= min && digitos.length <= max ? null : "invalido";
    }
    case "email": return /^[^\s@.][^\s@]*@[^\s@.]+(\.[^\s@.]+)*\.[^\s@.]{2,}$/.test(valor) && !valor.includes("..") ? null : "invalido";
    case "data": {
      if (!dataIsoValida(valor)) return "invalido";
      const ano = Number(valor.slice(0, 4));
      if (c.chave === "proprietario_nascimento") return ano >= 1900 && valor <= hojeUTC() ? null : "invalido";
      return ano >= 2000 && ano <= new Date().getUTCFullYear() + 2 ? null : "invalido";
    }
    default:
      // nomes, cidade e estado não levam números
      if (["proprietario_nome", "proprietario_cidade", "proprietario_uf"].includes(c.chave)) return /\d/.test(valor) ? "invalido" : null;
      return null;
  }
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
    proprietario_telefone: limpo.proprietario_telefone ? mascaraTelefone(limpo.proprietario_telefone) : "",
    proprietario_cep: limpo.proprietario_cep ? mascaraCep(limpo.proprietario_cep) : "",
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
