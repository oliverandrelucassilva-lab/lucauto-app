/**
 * Logo da Lucauto: versão para fundo claro e versão para fundo escuro (a CSS escolhe).
 * A versão escura tem o ícone da casa e por isso pede uma altura um pouco maior.
 */
export function Logo({ claro = "h-6", escuro = "h-9" }: { claro?: string; escuro?: string }) {
  return (
    <>
      {/* Logo provisório (azul marinho), recortado do cabeçalho do contrato, até chegar o PNG oficial. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-provisorio.png" alt="Lucauto" className={`logo-claro w-auto ${claro}`} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-escuro.png" alt="" aria-hidden="true" className={`logo-escuro w-auto ${escuro}`} />
    </>
  );
}
