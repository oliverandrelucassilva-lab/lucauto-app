// Campos do formulário do molde 1 (intermediação com exclusividade).
// As chaves são as mesmas dos marcadores do Word, sem as chaves { }.

import type { Mascara } from "./formatos";

export type TipoCampo = "texto" | "area" | "data" | "dinheiro" | "cpf" | "telefone" | "email" | "cep" | "numero" | "tipo_imovel";
export type ListaSugestoes = "estado_civil" | "profissao" | "cidade" | "estado" | "banco" | "cartorio" | "favorecido";

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
}

export interface Etapa {
  id: string;
  titulo: string;
  descricao: string;
  campos: Campo[];
}

const C = (c: Campo) => c;

export const ETAPAS_MOLDE_1: Etapa[] = [
  {
    id: "partes",
    titulo: "Partes",
    descricao: "Dados do proprietário (contratante).",
    campos: [
      C({ chave: "proprietario_nome", rotulo: "Nome completo", tipo: "texto", obrigatorio: true }),
      C({ chave: "proprietario_estado_civil", rotulo: "Estado civil", tipo: "texto", obrigatorio: true, dica: "Escolha na lista ou digite.", sugestoes: "estado_civil" }),
      C({ chave: "proprietario_profissao", rotulo: "Profissão", tipo: "texto", obrigatorio: true, sugestoes: "profissao" }),
      C({ chave: "proprietario_nascimento", rotulo: "Data de nascimento", tipo: "data", obrigatorio: true, erroInvalido: "Confira a data de nascimento (ano com 4 números, entre 1900 e hoje)." }),
      C({ chave: "proprietario_rg", rotulo: "RG", tipo: "numero", obrigatorio: false, mascara: "numerico", dica: "Só números. Pode ficar em branco: o trecho do RG sai do contrato.", erroInvalido: "O RG deve ter só números (de 4 a 14)." }),
      C({ chave: "proprietario_cpf", rotulo: "CPF", tipo: "cpf", obrigatorio: true, mascara: "cpf", dica: "Só números (11).", erroInvalido: "CPF inválido. Confira os 11 números." }),
      C({ chave: "proprietario_cidade", rotulo: "Cidade", tipo: "texto", obrigatorio: true, padrao: "Euclides da Cunha", sugestoes: "cidade", dica: "Comece a digitar e escolha na lista: o estado muda sozinho." }),
      C({ chave: "proprietario_uf", rotulo: "Estado", tipo: "texto", obrigatorio: true, padrao: "Bahia", sugestoes: "estado" }),
      C({ chave: "proprietario_cep", rotulo: "CEP", tipo: "cep", obrigatorio: true, mascara: "cep", dica: "Só números (8).", erroInvalido: "CEP inválido. Digite os 8 números." }),
      C({ chave: "proprietario_telefone", rotulo: "Telefone", tipo: "telefone", obrigatorio: true, mascara: "telefone", dica: "Só números, com DDD.", erroInvalido: "Telefone inválido. Digite só números, com DDD (ex.: (75) 99999-9999)." }),
      C({ chave: "proprietario_email", rotulo: "E-mail", tipo: "email", obrigatorio: true, dica: "Qualquer e-mail: gmail, hotmail, outlook, da empresa...", erroInvalido: "E-mail inválido. Use o formato nome@exemplo.com." }),
    ],
  },
  {
    id: "imovel",
    titulo: "Imóvel",
    descricao: "Tipo, descrição e documentação do imóvel.",
    campos: [
      C({ chave: "tipo_imovel", rotulo: "Tipo do imóvel", tipo: "tipo_imovel", obrigatorio: true, padrao: "urbano", dica: "A comissão do contrato muda sozinha: 5% urbano, 8% rural." }),
      C({ chave: "imovel_descricao", rotulo: "Características do imóvel", tipo: "area", obrigatorio: true, dica: "Tipo, áreas, cômodos e acabamento. Descreva este imóvel." }),
      C({ chave: "imovel_localizacao", rotulo: "Localização", tipo: "texto", obrigatorio: true, dica: "Bairro, povoado ou fazenda." }),
      C({ chave: "imovel_matricula", rotulo: "Matrícula nº", tipo: "numero", obrigatorio: true, mascara: "numerico", dica: "Só números.", erroInvalido: "A matrícula deve ter só números." }),
      C({ chave: "imovel_cartorio", rotulo: "Cartório", tipo: "texto", obrigatorio: true, padrao: "1º Cartório", sugestoes: "cartorio" }),
    ],
  },
  {
    id: "valores",
    titulo: "Valores",
    descricao: "Valor do imóvel, dados bancários para o sinal e data da assinatura.",
    campos: [
      C({ chave: "valor", rotulo: "Valor do imóvel (R$)", tipo: "dinheiro", obrigatorio: true, dica: "Só números. Ex.: 350000 ou 350.000,00", erroInvalido: "Valor inválido. Digite só números, ex.: 350000 ou 350.000,00." }),
      C({ chave: "banco", rotulo: "Banco", tipo: "texto", obrigatorio: true, sugestoes: "banco" }),
      C({ chave: "agencia", rotulo: "Agência", tipo: "numero", obrigatorio: true, mascara: "numerico", dica: "Só números.", erroInvalido: "A agência deve ter só números." }),
      C({ chave: "favorecido", rotulo: "Favorecido", tipo: "texto", obrigatorio: true, sugestoes: "favorecido", dica: "Clique na sugestão para usar o nome do proprietário." }),
      C({ chave: "data_assinatura", rotulo: "Data da assinatura", tipo: "data", obrigatorio: true, padrao: "hoje", dica: "Já vem com a data de hoje; pode mudar.", erroInvalido: "Confira a data da assinatura (ano com 4 números)." }),
    ],
  },
];

export const TODOS_CAMPOS: Campo[] = ETAPAS_MOLDE_1.flatMap((e) => e.campos);

/** Rótulos dos marcadores que vêm da configuração da empresa (não do formulário). */
export const ROTULOS_EMPRESA: Record<string, string> = {
  empresa_cnpj: "CNPJ da Lucauto",
  empresa_creci: "CRECI jurídico da Lucauto",
  corretora_nome: "Corretora responsável",
  corretora_creci: "CRECI da corretora responsável",
};
