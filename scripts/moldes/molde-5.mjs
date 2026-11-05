import { editarImobiliaria, editarParte, substituir } from "./lib.mjs";

export const slug = "5_sinal_e_reserva_venda_sem_escritura";
export const edicoes = [
  [3, "[NOME", editarParte("vendedor")],
  [6, "[NOME", editarParte("comprador")],
  [9, "LUCAUTO EMPREENDIMENTOS LTDA", editarImobiliaria],
  [13, "1.1.", (p) => substituir(p, "[endereço completo]", "{imovel_endereco}")],
  [16, "2.1.", (p) => substituir(p, "R$ [valor] (valor por extenso)", "{sinal} ({sinal_extenso})")],
  [18, "Banco:", (p) => substituir(p, /Banco: _+/, "Banco: {banco}")],
  [19, "Agência:", (p) => substituir(p, /Agência: _+/, "Agência: {agencia}")],
  [20, "Favorecido:", (p) => substituir(p, /Favorecido: _+/, "Favorecido: {favorecido}")],
  [31, "4.1.", (p) => substituir(p, "R$ [valor] (por extenso)", "{valor} ({valor_extenso})")],
  [50, "7.1.", (p) => substituir(p, "comissão de 8%", "comissão de {comissao_pct}%")],
  [142, "Euclides da Cunha/BA,", (p) => substituir(p, "01 de dezembro de 2025", "{data_assinatura}")],
];
