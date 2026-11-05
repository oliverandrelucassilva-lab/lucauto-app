import { A_CONFIRMAR, type ConfigEmpresa, pendenciasEmpresa } from "@/config/empresa";
import { todosCampos, type Campo } from "./campos";
import { definicaoPorSlug, type Problema } from "./definicoes";
import { formatarBRL, lerValor, valorPorExtenso } from "./extenso";
import { formatarCpf, mascaraCep, mascaraTelefone, soDigitos } from "./formatos";
import { dataCurta, dataPorExtenso, hojeISO } from "./regras";

export type Entrada = Record<string, string | undefined>;
export type { Problema };

export interface Resultado {
  /** Valores prontos para os marcadores do Word. */
  dados: Record<string, string>;
  /** Campos do formulário que bloqueiam a geração. */
  problemas: Problema[];
  /** Dados da empresa ainda pendentes: saem como [A CONFIRMAR] e não bloqueiam. */
  pendenciasEmpresa: string[];
  /** Valores calculados (AAAA-MM-DD) para campos que ficaram vazios, como a data final do aluguel. */
  sugeridos: Record<string, string>;
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

export const dataIsoValida = (iso: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
};

/** Valores iniciais do formulário (padrões e data de hoje). */
export function valoresIniciais(slug: string, hoje: string = hojeISO()): Record<string, string> {
  const def = definicaoPorSlug(slug);
  if (!def) throw new Error("Molde desconhecido");
  const v: Record<string, string> = {};
  for (const c of todosCampos(def.etapas)) v[c.chave] = c.padrao === "hoje" ? hoje : (c.padrao ?? "");
  return v;
}

const hojeUTC = () => new Date().toISOString().slice(0, 10);

function conferir(c: Campo, valor: string): Problema["motivo"] | null {
  if (!valor) return c.obrigatorio ? "faltando" : null;
  const digitos = soDigitos(valor);
  switch (c.tipo) {
    case "dinheiro": return lerValor(valor) === null ? "invalido" : null;
    case "inteiro": return /^\d{1,3}$/.test(valor) && Number(valor) >= 1 ? null : "invalido";
    case "cpf": return cpfValido(valor) ? null : "invalido";
    case "telefone": return /^[\d\s()+\-.]+$/.test(valor) && (digitos.length === 10 || digitos.length === 11) ? null : "invalido";
    case "cep": return /^[\d\s.\-]+$/.test(valor) && digitos.length === 8 ? null : "invalido";
    case "numero": {
      const permitido = c.chave === "agencia" ? /^[\d\s\-]+$/ : /^[\d\s./\-]+$/;
      const [min, max] = c.chave.endsWith("_rg") ? [4, 14] : [1, 20];
      return permitido.test(valor) && digitos.length >= min && digitos.length <= max ? null : "invalido";
    }
    case "email": return /^[^\s@.][^\s@]*@[^\s@.]+(\.[^\s@.]+)*\.[^\s@.]{2,}$/.test(valor) && !valor.includes("..") ? null : "invalido";
    case "data": {
      if (!dataIsoValida(valor)) return "invalido";
      const ano = Number(valor.slice(0, 4));
      if (c.chave.endsWith("_nascimento")) return ano >= 1900 && valor <= hojeUTC() ? null : "invalido";
      const limite = new Date().getUTCFullYear() + (c.chave === "data_assinatura" ? 2 : 15);
      return ano >= 2000 && ano <= limite ? null : "invalido";
    }
    case "opcoes": return c.opcoes?.some((o) => o.valor === valor) ? null : "invalido";
    default:
      // nomes, cidade e estado não levam números
      if (/_(nome|cidade|uf)$/.test(c.chave)) return /\d/.test(valor) ? "invalido" : null;
      return null;
  }
}

export function montarDados(slug: string, entrada: Entrada, empresa: ConfigEmpresa): Resultado {
  const def = definicaoPorSlug(slug);
  if (!def) throw new Error("Molde desconhecido");
  const campos = todosCampos(def.etapas);

  const limpo: Record<string, string> = {};
  for (const c of campos) limpo[c.chave] = (entrada[c.chave] ?? "").toString().trim();

  // campos que se calculam sozinhos quando ficam vazios (ex.: data final do aluguel)
  const sugeridos = def.sugerir?.(limpo) ?? {};
  const efetivo: Record<string, string> = { ...limpo };
  for (const [k, v] of Object.entries(sugeridos)) if (!efetivo[k]) efetivo[k] = v;

  const problemas: Problema[] = [];
  for (const c of campos) {
    // blocos opcionais (ex.: 2º fiador): só valem se a pessoa começou a preencher
    if (c.dependeDe && !limpo[c.dependeDe] && !limpo[c.chave]) continue;
    const motivo = conferir(c, efetivo[c.chave]);
    if (motivo) problemas.push({ chave: c.chave, rotulo: c.rotulo, motivo });
  }
  if (!problemas.length) problemas.push(...(def.conferir?.(efetivo) ?? []));

  const dados: Record<string, string> = { ...efetivo };
  for (const c of campos) {
    const v = efetivo[c.chave];
    if (!v) continue;
    if (c.tipo === "data") dados[c.chave] = c.saida === "extenso" ? dataPorExtenso(v) : dataCurta(v);
    else if (c.tipo === "cpf") dados[c.chave] = formatarCpf(v);
    else if (c.tipo === "telefone") dados[c.chave] = mascaraTelefone(v);
    else if (c.tipo === "cep") dados[c.chave] = mascaraCep(v);
    else if (c.semPontoFinal) dados[c.chave] = v.replace(/[.,;\s]+$/, "");
    else if (c.tipo === "dinheiro") {
      const cents = lerValor(v);
      dados[c.chave] = cents ? formatarBRL(cents) : "";
      dados[`${c.chave}_extenso`] = cents ? valorPorExtenso(cents) : "";
    }
  }
  Object.assign(dados, def.calcular?.(efetivo, empresa) ?? {});
  Object.assign(dados, {
    empresa_cnpj: empresa.cnpj ?? A_CONFIRMAR,
    empresa_creci: empresa.creciJuridico ?? A_CONFIRMAR,
    corretora_nome: empresa.corretoraNome,
    corretora_creci: empresa.corretoraCreci ?? A_CONFIRMAR,
  });
  return { dados, problemas, pendenciasEmpresa: pendenciasEmpresa(empresa), sugeridos };
}
