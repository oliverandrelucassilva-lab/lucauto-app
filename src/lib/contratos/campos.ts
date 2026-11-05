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

export interface GrupoCampos {
  titulo: string;
  campos: Campo[];
}

export const GRUPOS_MOLDE_1: GrupoCampos[] = [
  {
    titulo: "Tipo do imóvel",
    campos: [{ chave: "tipo_imovel", rotulo: "Tipo do imóvel", tipo: "tipo_imovel", obrigatorio: true, padrao: "urbano", dica: "A comissão do contrato muda sozinha: 5% urbano, 8% rural." }],
  },
  {
    titulo: "Proprietário (contratante)",
    campos: [
      { chave: "proprietario_nome", rotulo: "Nome completo", tipo: "texto", obrigatorio: true },
      { chave: "proprietario_estado_civil", rotulo: "Estado civil", tipo: "texto", obrigatorio: true, dica: "ex.: casado(a)" },
      { chave: "proprietario_profissao", rotulo: "Profissão", tipo: "texto", obrigatorio: true },
      { chave: "proprietario_nascimento", rotulo: "Data de nascimento", tipo: "data", obrigatorio: true },
      { chave: "proprietario_rg", rotulo: "RG", tipo: "texto", obrigatorio: false, dica: "Pode ficar em branco: o trecho do RG sai do contrato." },
      { chave: "proprietario_cpf", rotulo: "CPF", tipo: "cpf", obrigatorio: true },
      { chave: "proprietario_cidade", rotulo: "Cidade", tipo: "texto", obrigatorio: true, padrao: "Euclides da Cunha" },
      { chave: "proprietario_uf", rotulo: "Estado", tipo: "texto", obrigatorio: true, padrao: "Bahia" },
      { chave: "proprietario_cep", rotulo: "CEP", tipo: "texto", obrigatorio: true },
      { chave: "proprietario_telefone", rotulo: "Telefone", tipo: "telefone", obrigatorio: true },
      { chave: "proprietario_email", rotulo: "E-mail", tipo: "email", obrigatorio: true },
    ],
  },
  {
    titulo: "Imóvel",
    campos: [
      { chave: "imovel_descricao", rotulo: "Características do imóvel", tipo: "area", obrigatorio: true, dica: "Tipo, áreas, cômodos e acabamento. Descreva este imóvel." },
      { chave: "imovel_localizacao", rotulo: "Localização", tipo: "texto", obrigatorio: true, dica: "Bairro, povoado ou fazenda." },
      { chave: "imovel_matricula", rotulo: "Matrícula nº", tipo: "texto", obrigatorio: true },
      { chave: "imovel_cartorio", rotulo: "Cartório", tipo: "texto", obrigatorio: true, padrao: "1º Cartório" },
    ],
  },
  {
    titulo: "Valor e sinal",
    campos: [
      { chave: "valor", rotulo: "Valor do imóvel (R$)", tipo: "dinheiro", obrigatorio: true, dica: "ex.: 350000 ou 350.000,00" },
      { chave: "banco", rotulo: "Banco", tipo: "texto", obrigatorio: true },
      { chave: "agencia", rotulo: "Agência", tipo: "texto", obrigatorio: true },
      { chave: "favorecido", rotulo: "Favorecido", tipo: "texto", obrigatorio: true },
    ],
  },
  {
    titulo: "Data da assinatura",
    campos: [{ chave: "data_assinatura", rotulo: "Data da assinatura", tipo: "data", obrigatorio: true, padrao: "hoje", dica: "Já vem com a data de hoje; pode mudar." }],
  },
];

export const TODOS_CAMPOS: Campo[] = GRUPOS_MOLDE_1.flatMap((g) => g.campos);

/** Rótulos dos marcadores que vêm da configuração da empresa (não do formulário). */
export const ROTULOS_EMPRESA: Record<string, string> = {
  empresa_cnpj: "CNPJ da Lucauto",
  empresa_creci: "CRECI jurídico da Lucauto",
  corretora_nome: "Corretora responsável",
  corretora_creci: "CRECI da corretora responsável",
};
