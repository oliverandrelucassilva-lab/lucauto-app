/** Arquivo com a sigla PDF, em vermelho. */
export function IconePdf({ tamanho = 20, className = "" }: { tamanho?: number; className?: string }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} style={{ color: "#DC2626" }}>
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M14 2v5h5" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <text x="12" y="17.2" textAnchor="middle" fontSize="5.6" fontWeight="800" fill="currentColor" fontFamily="Arial, sans-serif">PDF</text>
    </svg>
  );
}
