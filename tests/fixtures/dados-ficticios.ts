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
  imovel_localizacao: "Bairro Exemplo",
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
  imovel_localizacao: "Bairro Exemplo, próximo ao centro comercial e escolas",
};
