// Dados 100% fictícios, só para testes. Nenhuma pessoa real.
import type { ConfigEmpresa } from "@/config/empresa";

export const ENTRADA_FICTICIA: Record<string, string> = {
  tipo_imovel: "urbano",
  proprietario_nome: "Maria Exemplo de Teste",
  proprietario_estado_civil: "solteira",
  proprietario_profissao: "professora",
  proprietario_nascimento: "1980-02-01",
  proprietario_rg: "00.000.000-00",
  proprietario_cpf: "111.444.777-35", // CPF de teste (dígitos válidos, não é de ninguém)
  proprietario_cidade: "Cidade Exemplo",
  proprietario_uf: "Bahia",
  proprietario_cep: "00000-000",
  proprietario_telefone: "(00) 90000-0000",
  proprietario_email: "maria@exemplo.test",
  imovel_descricao: "Casa de teste com dois quartos, sala, cozinha e quintal.",
  imovel_localizacao: "no bairro Exemplo",
  imovel_matricula: "00.000",
  imovel_cartorio: "1º Cartório",
  valor: "350.000,00",
  banco: "Banco Exemplo",
  agencia: "0000",
  favorecido: "Maria Exemplo de Teste",
  data_assinatura: "2026-11-05",
};

export const EMPRESA_PENDENTE: ConfigEmpresa = { cnpj: null, creciJuridico: null, corretoraNome: "POLLYANA MALTA MARQUES CUNHA", corretoraCreci: null };
export const EMPRESA_PREENCHIDA: ConfigEmpresa = { cnpj: "00.000.000/0001-00", creciJuridico: "J-0000", corretoraNome: "POLLYANA MALTA MARQUES CUNHA", corretoraCreci: "00000-F" };

/** Dados para a validação visual: descrição do mesmo tamanho da do exemplo do Word original,
 *  para os dois documentos terem o mesmo fluxo de páginas. Tudo fictício. */
export const ENTRADA_VALIDACAO: Record<string, string> = {
  ...ENTRADA_FICTICIA,
  imovel_descricao:
    "Casa de teste de dois pavimentos, com área total de 300m² e área construída de 180m². Possui 3 quartos (sendo 1 suíte), 2 banheiros sociais, sala de estar e jantar integradas, cozinha planejada, área de serviço, varanda, garagem coberta para 2 veículos e quintal amplo. Piso em porcelanato, acabamento moderno e excelente estado de conservação.",
  imovel_localizacao: "no bairro Exemplo, próximo ao centro comercial e escolas",
};

/** Entradas completas e fictícias de cada molde pronto (usadas pelos testes genéricos). */
const pessoa = (pre: string, nome: string, cpf: string) => ({
  [`${pre}_nome`]: nome, [`${pre}_estado_civil`]: "solteiro(a)", [`${pre}_profissao`]: "comerciante", [`${pre}_rg`]: "00.000.000-00",
  [`${pre}_cpf`]: cpf, [`${pre}_endereco`]: "Rua Exemplo, 100, Bairro Teste, Cidade Exemplo", [`${pre}_email`]: `${pre}@exemplo.test`,
});

/** Locação residencial (molde 4), tudo fictício. */
export const ENTRADA_LOCACAO: Record<string, string> = {
  ...pessoa("locador", "Locador Exemplo de Teste", "111.444.777-35"),
  ...pessoa("locatario", "Locatária Exemplo de Teste", "529.982.247-25"),
  ...pessoa("fiador", "Fiador Exemplo de Teste", "390.533.447-05"),
  fiador_nacionalidade: "brasileiro(a)",
  fiador2_nome: "", fiador2_nacionalidade: "", fiador2_estado_civil: "", fiador2_profissao: "", fiador2_rg: "", fiador2_cpf: "", fiador2_endereco: "", fiador2_email: "",
  imovel_endereco: "Casa de teste na Rua Exemplo, nº 10, Bairro Teste, Cidade Exemplo/BA, com 2 quartos, sala, cozinha e quintal",
  prazo_meses: "12", data_inicio: "2026-11-05", data_fim: "", aluguel: "1.250,50", dia_vencimento: "5", data_assinatura: "2026-11-05",
};

/** Compra e venda (molde 6), tudo fictício. */
export const ENTRADA_COMPRA_VENDA: Record<string, string> = {
  ...Object.fromEntries(Object.entries(ENTRADA_FICTICIA).filter(([k]) => k.startsWith("proprietario_")).map(([k, v]) => [k.replace("proprietario_", "vendedor_"), v])),
  vendedor_nome: "Vendedora Exemplo de Teste",
  ...Object.fromEntries(Object.entries(ENTRADA_FICTICIA).filter(([k]) => k.startsWith("proprietario_")).map(([k, v]) => [k.replace("proprietario_", "comprador_"), v])),
  comprador_nome: "Comprador Exemplo de Teste", comprador_cpf: "529.982.247-25", comprador_email: "comprador@exemplo.test",
  tipo_imovel: "urbano",
  imovel_descricao: "Casa de teste na Rua Exemplo, nº 10, Bairro Teste, matrícula nº 00.000, com 2 quartos, sala e cozinha, área total de 200m²",
  valor: "350.000,00", sinal: "10.000,00", data_sinal: "2026-11-20", saldo: "", forma_pagamento: "avista", forma_outra: "", data_assinatura: "2026-11-05",
};

export const ENTRADAS: Record<string, Record<string, string>> = {
  "6_compra_e_venda": ENTRADA_COMPRA_VENDA,
  "1_intermediacao_com_exclusividade": ENTRADA_FICTICIA,
  "4_contrato_locacao_residencial": ENTRADA_LOCACAO,
};

/** Dados para a validação visual de cada molde: textos do mesmo tamanho dos exemplos do Word original,
 *  para os dois documentos terem o mesmo fluxo de páginas. Tudo fictício. */
export const VALIDACAO: Record<string, Record<string, string>> = {
  "6_compra_e_venda": { ...ENTRADA_COMPRA_VENDA, imovel_descricao: "Casa de teste na Rua Exemplo, nº 10, Bairro Teste, com 2 quartos e quintal" },
  "1_intermediacao_com_exclusividade": ENTRADA_VALIDACAO,
  "4_contrato_locacao_residencial": { ...ENTRADA_LOCACAO, imovel_endereco: "Rua Exemplo, nº 10, Bairro Teste, Cidade Exemplo/BA, casa com 2 quartos" },
};
