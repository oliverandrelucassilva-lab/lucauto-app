import { definicaoPorSlug } from "./definicoes";

export interface Molde {
  numero: number;
  slug: string;
  titulo: string;
  descricao: string;
  /** Pronto para uso: tem formulário e foi validado página por página. */
  ativo: boolean;
}

const BASE: Omit<Molde, "ativo">[] = [
  { numero: 1, slug: "1_intermediacao_com_exclusividade", titulo: "Intermediação com exclusividade", descricao: "Venda, locação ou administração, com exclusividade." },
  { numero: 2, slug: "2_intermediacao_sem_exclusividade", titulo: "Intermediação sem exclusividade", descricao: "Intermediação imobiliária sem exclusividade." },
  { numero: 3, slug: "3_intermediacao_locacao_com_exclusividade", titulo: "Intermediação de locação", descricao: "Locação de imóvel, com exclusividade." },
  { numero: 4, slug: "4_contrato_locacao_residencial", titulo: "Locação residencial", descricao: "Contrato particular de locação de imóvel residencial." },
  { numero: 5, slug: "5_sinal_e_reserva_venda_sem_escritura", titulo: "Sinal e reserva", descricao: "Venda sem escritura, com reserva do imóvel." },
  { numero: 6, slug: "6_compra_e_venda", titulo: "Compra e venda", descricao: "Contrato particular de compra e venda." },
];

// Um molde fica ativo assim que tem definição (campos e regras) no sistema.
export const MOLDES: Molde[] = BASE.map((m) => ({ ...m, ativo: !!definicaoPorSlug(m.slug) }));

export const moldePorSlug = (slug: string) => MOLDES.find((m) => m.slug === slug);
