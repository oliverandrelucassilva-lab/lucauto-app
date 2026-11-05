import type { ComponentProps } from "react";

/** Card branco: borda 1px, raio 14px, sombra bem leve, 20px de respiro. */
export function Cartao({ className = "", semPadding, ...resto }: { semPadding?: boolean } & ComponentProps<"div">) {
  return <div {...resto} className={`rounded-[14px] border border-linha bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${semPadding ? "" : "p-5"} ${className}`} />;
}
