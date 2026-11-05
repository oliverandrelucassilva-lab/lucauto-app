import Link from "next/link";
import type { ComponentProps } from "react";

type Variante = "primario" | "secundario";
const classe = (v: Variante, extra = "") => `btn ${v === "primario" ? "btn-primario" : "btn-secundario"} ${extra}`.trim();

/** Botão (ou link com cara de botão, quando recebe href). 44px de altura. */
export function Botao({ variante = "primario", className, href, ...resto }: { variante?: Variante; href?: string } & ComponentProps<"button">) {
  if (href) return <Link href={href} className={classe(variante, className)}>{resto.children}</Link>;
  return <button type="button" {...resto} className={classe(variante, className)} />;
}

/** Link para arquivo (download), com cara de botão. */
export function BotaoDownload({ variante = "secundario", className, ...resto }: { variante?: Variante } & ComponentProps<"a">) {
  return <a {...resto} className={classe(variante, className)} />;
}
