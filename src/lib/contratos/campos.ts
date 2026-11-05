// Tipos e fábricas de campos dos formulários. As chaves são as mesmas dos marcadores do Word, sem as chaves { }.
import type { Mascara } from "./formatos";

export type TipoCampo = "texto" | "area" | "data" | "dinheiro" | "cpf" | "telefone" | "email" | "cep" | "numero" | "inteiro" | "tipo_imovel" | "opcoes";
export type ListaSugestoes = "estado_civil" | "profissao" | "cidade" | "estado" | "banco" | "cartorio" | "favorecido" | "nacionalidade" | "forma_pagamento";

export interface Campo {
  chave: string;
  rotulo: string;
  tipo: TipoCampo;
  obrigatorio: boolean;
  padrao?: string; // "hoje" => data de hoje
  dica?: string;
  /** Mensagem quando o valor digitado não é aceito. */
  erroInvalido?: string;
  mascara?: Mascara;
  sugestoes?: ListaSugestoes;
  /** Campo cujo valor aparece como sugestão (ex.: favorecido = nome do vendedor). */
  sugestaoDe?: string;
  /** Subtítulo do bloco de campos (ex.: "Locador"). */
  grupo?: string;
  /** Só é exigido se este outro campo estiver preenchido (ex.: dados do 2º fiador). */
  dependeDe?: string;
  /** Opções fixas, para tipo "opcoes" (valor, rótulo). */
  opcoes?: { valor: string; rotulo: string }[];
  /** Como a data sai no contrato: "curta" (01/02/2026) ou "extenso" (01 de fevereiro de 2026). */
  saida?: "curta" | "extenso";
}

export interface Etapa {
  id: string;
  titulo: string;
  descricao: string;
  campos: Campo[];
}

export const ROTULOS_EMPRESA: Record<string, string> = {
  empresa_cnpj: "CNPJ da Lucauto",
  empresa_creci: "CRECI jurídico da Lucauto",
  corretora_nome: "Corretora responsável",
  corretora_creci: "CRECI da corretora responsável",
};

const C = (c: Campo): Campo => c;

// ---------- fábricas ----------

const rgCampo = (p: string, grupo?: string): Campo =>
  C({ chave: `${p}_rg`, rotulo: "RG", tipo: "numero", obrigatorio: false, mascara: "numerico", grupo, dica: "Só números. Pode ficar em branco: o trecho do RG sai do contrato.", erroInvalido: "O RG deve ter só números (de 4 a 14)." });
const cpfCampo = (p: string, grupo?: string): Campo =>
  C({ chave: `${p}_cpf`, rotulo: "CPF", tipo: "cpf", obrigatorio: true, mascara: "cpf", grupo, dica: "Só números (11).", erroInvalido: "CPF inválido. Confira os 11 números." });
const emailCampo = (p: string, grupo?: string): Campo =>
  C({ chave: `${p}_email`, rotulo: "E-mail", tipo: "email", obrigatorio: true, grupo, dica: "Qualquer e-mail: gmail, hotmail, outlook, da empresa...", erroInvalido: "E-mail inválido. Use o formato nome@exemplo.com." });

/** Pessoa no formato "residente e domiciliado (a) na cidade de X, UF, CEP, telefone, e-mail". */
export function pessoaPorCidade(p: string, grupo?: string): Campo[] {
  return [
    C({ chave: `${p}_nome`, rotulo: "Nome completo", tipo: "texto", obrigatorio: true, grupo }),
    C({ chave: `${p}_estado_civil`, rotulo: "Estado civil", tipo: "texto", obrigatorio: true, dica: "Escolha na lista ou digite.", sugestoes: "estado_civil" }),
    C({ chave: `${p}_profissao`, rotulo: "Profissão", tipo: "texto", obrigatorio: true, sugestoes: "profissao" }),
    C({ chave: `${p}_nascimento`, rotulo: "Data de nascimento", tipo: "data", obrigatorio: true, erroInvalido: "Confira a data de nascimento (ano com 4 números, entre 1900 e hoje)." }),
    rgCampo(p),
    cpfCampo(p),
    C({ chave: `${p}_cidade`, rotulo: "Cidade", tipo: "texto", obrigatorio: true, padrao: "Euclides da Cunha", sugestoes: "cidade", dica: "Comece a digitar e escolha na lista: o estado muda sozinho." }),
    C({ chave: `${p}_uf`, rotulo: "Estado", tipo: "texto", obrigatorio: true, padrao: "Bahia", sugestoes: "estado" }),
    C({ chave: `${p}_cep`, rotulo: "CEP", tipo: "cep", obrigatorio: true, mascara: "cep", dica: "Só números (8).", erroInvalido: "CEP inválido. Digite os 8 números." }),
    C({ chave: `${p}_telefone`, rotulo: "Telefone", tipo: "telefone", obrigatorio: true, mascara: "telefone", dica: "Só números, com DDD.", erroInvalido: "Telefone inválido. Digite só números, com DDD (ex.: (75) 99999-9999)." }),
    emailCampo(p),
  ];
}

/** Pessoa no formato "RG nº, CPF nº, residente em [endereço], e-mail" (RG e endereço opcionais). */
export function pessoaComEndereco(p: string, grupo: string, opcoes: { nacionalidade?: boolean; dependeDe?: string } = {}): Campo[] {
  const dep = opcoes.dependeDe;
  const lista: Campo[] = [
    C({ chave: `${p}_nome`, rotulo: "Nome completo", tipo: "texto", obrigatorio: !dep }),
    ...(opcoes.nacionalidade ? [C({ chave: `${p}_nacionalidade`, rotulo: "Nacionalidade", tipo: "texto", obrigatorio: true, padrao: dep ? "" : "brasileiro(a)", sugestoes: "nacionalidade" })] : []),
    C({ chave: `${p}_estado_civil`, rotulo: "Estado civil", tipo: "texto", obrigatorio: true, dica: "Escolha na lista ou digite.", sugestoes: "estado_civil" }),
    C({ chave: `${p}_profissao`, rotulo: "Profissão", tipo: "texto", obrigatorio: true, sugestoes: "profissao" }),
    rgCampo(p),
    cpfCampo(p),
    C({ chave: `${p}_endereco`, rotulo: "Endereço completo", tipo: "texto", obrigatorio: false, dica: "Rua, número, bairro e cidade. Pode ficar em branco: o trecho do endereço sai do contrato." }),
    emailCampo(p),
  ];
  return lista.map((c, i) => ({ ...c, grupo: i === 0 ? grupo : undefined, dependeDe: i === 0 ? undefined : dep }));
}

export const campoDataAssinatura = (): Campo =>
  C({ chave: "data_assinatura", rotulo: "Data da assinatura", tipo: "data", obrigatorio: true, padrao: "hoje", saida: "extenso", dica: "Já vem com a data de hoje; pode mudar.", erroInvalido: "Confira a data da assinatura (ano com 4 números)." });

export const campoTipoImovel = (): Campo =>
  C({ chave: "tipo_imovel", rotulo: "Tipo do imóvel", tipo: "tipo_imovel", obrigatorio: true, padrao: "urbano", dica: "A comissão do contrato muda sozinha: 5% urbano, 8% rural." });

export const campoValor = (chave: string, rotulo: string, dica = "Só números. Ex.: 350000 ou 350.000,00"): Campo =>
  C({ chave, rotulo, tipo: "dinheiro", obrigatorio: true, dica, erroInvalido: "Valor inválido. Digite só números, ex.: 350000 ou 350.000,00." });

export const camposBanco = (favorecidoDe: string): Campo[] => [
  C({ chave: "banco", rotulo: "Banco", tipo: "texto", obrigatorio: true, sugestoes: "banco" }),
  C({ chave: "agencia", rotulo: "Agência", tipo: "numero", obrigatorio: true, mascara: "numerico", dica: "Só números.", erroInvalido: "A agência deve ter só números." }),
  C({ chave: "favorecido", rotulo: "Favorecido", tipo: "texto", obrigatorio: true, sugestoes: "favorecido", sugestaoDe: favorecidoDe, dica: "Clique na sugestão para usar o nome já digitado." }),
];

export const campoMatricula = (): Campo =>
  C({ chave: "imovel_matricula", rotulo: "Matrícula nº", tipo: "numero", obrigatorio: true, mascara: "numerico", dica: "Só números.", erroInvalido: "A matrícula deve ter só números." });

export const camposImovelPadrao = (): Campo[] => [
  C({ chave: "imovel_descricao", rotulo: "Características do imóvel", tipo: "area", obrigatorio: true, dica: "Tipo, áreas, cômodos e acabamento. Descreva este imóvel." }),
  C({ chave: "imovel_localizacao", rotulo: "Localização", tipo: "texto", obrigatorio: true, dica: "Bairro, povoado ou fazenda." }),
  campoMatricula(),
  C({ chave: "imovel_cartorio", rotulo: "Cartório", tipo: "texto", obrigatorio: true, padrao: "1º Cartório", sugestoes: "cartorio" }),
];

export const todosCampos = (etapas: Etapa[]): Campo[] => etapas.flatMap((e) => e.campos);
