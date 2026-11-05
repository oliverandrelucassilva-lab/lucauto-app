// Listas para o preenchimento automático (o usuário clica em vez de digitar).

export const ESTADOS: { uf: string; nome: string }[] = [
  { uf: "AC", nome: "Acre" }, { uf: "AL", nome: "Alagoas" }, { uf: "AP", nome: "Amapá" }, { uf: "AM", nome: "Amazonas" },
  { uf: "BA", nome: "Bahia" }, { uf: "CE", nome: "Ceará" }, { uf: "DF", nome: "Distrito Federal" }, { uf: "ES", nome: "Espírito Santo" },
  { uf: "GO", nome: "Goiás" }, { uf: "MA", nome: "Maranhão" }, { uf: "MT", nome: "Mato Grosso" }, { uf: "MS", nome: "Mato Grosso do Sul" },
  { uf: "MG", nome: "Minas Gerais" }, { uf: "PA", nome: "Pará" }, { uf: "PB", nome: "Paraíba" }, { uf: "PR", nome: "Paraná" },
  { uf: "PE", nome: "Pernambuco" }, { uf: "PI", nome: "Piauí" }, { uf: "RJ", nome: "Rio de Janeiro" }, { uf: "RN", nome: "Rio Grande do Norte" },
  { uf: "RS", nome: "Rio Grande do Sul" }, { uf: "RO", nome: "Rondônia" }, { uf: "RR", nome: "Roraima" }, { uf: "SC", nome: "Santa Catarina" },
  { uf: "SP", nome: "São Paulo" }, { uf: "SE", nome: "Sergipe" }, { uf: "TO", nome: "Tocantins" },
];

export const ESTADO_CIVIL = ["solteiro(a)", "casado(a)", "divorciado(a)", "viúvo(a)", "separado(a)", "em união estável"];

export const PROFISSOES = [
  "agricultor(a)", "agente de saúde", "analista", "aposentado(a)", "autônomo(a)", "auxiliar administrativo(a)", "advogado(a)", "bancário(a)",
  "barbeiro(a)", "cabeleireiro(a)", "carpinteiro(a)", "comerciante", "contador(a)", "corretor(a) de imóveis", "cozinheiro(a)", "dentista",
  "diarista", "eletricista", "empresário(a)", "enfermeiro(a)", "engenheiro(a)", "estudante", "farmacêutico(a)", "fazendeiro(a)",
  "funcionário(a) público(a)", "gerente", "do lar", "mecânico(a)", "médico(a)", "motorista", "motoboy", "pecuarista", "pedreiro(a)",
  "pintor(a)", "policial civil", "policial militar", "professor(a)", "produtor(a) rural", "servidor(a) público(a)", "técnico(a) de enfermagem",
  "vendedor(a)", "vigilante",
];

export const BANCOS = [
  "Banco do Brasil", "Caixa Econômica Federal", "Bradesco", "Itaú", "Santander", "Banco do Nordeste", "Sicoob", "Sicredi", "Nubank",
  "Banco Inter", "C6 Bank", "BTG Pactual", "Banco Safra", "Banco Pan", "Banco Original", "Banco Mercantil", "Banese", "Banrisul", "Banestes",
];

export const CARTORIOS = ["1º Cartório", "2º Cartório"];

export const NACIONALIDADES = ["brasileiro(a)", "estrangeiro(a)"];
