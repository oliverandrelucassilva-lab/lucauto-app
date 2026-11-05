export interface Molde {
  numero: number;
  slug: string;
  titulo: string;
  descricao: string;
  ativo: boolean;
}

// Os 6 moldes da Lucauto. Por enquanto só o 1 está ativo.
export const MOLDES: Molde[] = [
  { numero: 1, slug: "1_intermediacao_com_exclusividade", titulo: "Intermediação com exclusividade", descricao: "Venda, locação ou administração, com exclusividade.", ativo: true },
  { numero: 2, slug: "2_intermediacao_sem_exclusividade", titulo: "Intermediação sem exclusividade", descricao: "Intermediação imobiliária sem exclusividade.", ativo: false },
  { numero: 3, slug: "3_intermediacao_locacao_com_exclusividade", titulo: "Intermediação de locação", descricao: "Locação de imóvel, com exclusividade.", ativo: false },
  { numero: 4, slug: "4_contrato_locacao_residencial", titulo: "Locação residencial", descricao: "Contrato particular de locação de imóvel residencial.", ativo: false },
  { numero: 5, slug: "5_sinal_e_reserva_venda_sem_escritura", titulo: "Sinal e reserva", descricao: "Venda sem escritura, com reserva do imóvel.", ativo: false },
  { numero: 6, slug: "6_compra_e_venda", titulo: "Compra e venda", descricao: "Contrato particular de compra e venda.", ativo: false },
];

export const moldePorSlug = (slug: string) => MOLDES.find((m) => m.slug === slug);
