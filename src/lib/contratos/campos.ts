// Campos do formulário do molde 1 (intermediação com exclusividade).
// As chaves são as mesmas dos marcadores do Word, sem as chaves { }.

export type TipoCampo = "texto" | "area" | "data" | "dinheiro" | "cpf" | "telefone" | "email" | "tipo_imovel";

export interface Campo {
  chave: string;
  rotulo: string;
  tipo: TipoCampo;
  obrigatorio: boolean;
  padrao?: string; // "hoje" => data de hoje
  dica?: string;
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
      C({ chave: "proprietario_estado_civil", rotulo: "Estado civil", tipo: "texto", obrigatorio: true, dica: "ex.: casado(a)" }),
      C({ chave: "proprietario_profissao", rotulo: "Profissão", tipo: "texto", obrigatorio: true }),
      C({ chave: "proprietario_nascimento", rotulo: "Data de nascimento", tipo: "data", obrigatorio: true }),
      C({ chave: "proprietario_rg", rotulo: "RG", tipo: "texto", obrigatorio: false, dica: "Pode ficar em branco: o trecho do RG sai do contrato." }),
      C({ chave: "proprietario_cpf", rotulo: "CPF", tipo: "cpf", obrigatorio: true }),
      C({ chave: "proprietario_cidade", rotulo: "Cidade", tipo: "texto", obrigatorio: true, padrao: "Euclides da Cunha" }),
      C({ chave: "proprietario_uf", rotulo: "Estado", tipo: "texto", obrigatorio: true, padrao: "Bahia" }),
      C({ chave: "proprietario_cep", rotulo: "CEP", tipo: "texto", obrigatorio: true }),
      C({ chave: "proprietario_telefone", rotulo: "Telefone", tipo: "telefone", obrigatorio: true }),
      C({ chave: "proprietario_email", rotulo: "E-mail", tipo: "email", obrigatorio: true }),
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
      C({ chave: "imovel_matricula", rotulo: "Matrícula nº", tipo: "texto", obrigatorio: true }),
      C({ chave: "imovel_cartorio", rotulo: "Cartório", tipo: "texto", obrigatorio: true, padrao: "1º Cartório" }),
    ],
  },
  {
    id: "valores",
    titulo: "Valores",
    descricao: "Valor do imóvel, dados bancários para o sinal e data da assinatura.",
    campos: [
      C({ chave: "valor", rotulo: "Valor do imóvel (R$)", tipo: "dinheiro", obrigatorio: true, dica: "ex.: 350000 ou 350.000,00" }),
      C({ chave: "banco", rotulo: "Banco", tipo: "texto", obrigatorio: true }),
      C({ chave: "agencia", rotulo: "Agência", tipo: "texto", obrigatorio: true }),
      C({ chave: "favorecido", rotulo: "Favorecido", tipo: "texto", obrigatorio: true }),
      C({ chave: "data_assinatura", rotulo: "Data da assinatura", tipo: "data", obrigatorio: true, padrao: "hoje", dica: "Já vem com a data de hoje; pode mudar." }),
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
