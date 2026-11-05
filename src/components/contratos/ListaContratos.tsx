import { Download } from "lucide-react";
import { BotaoDownload } from "@/components/ui/Botao";
import { Cartao } from "@/components/ui/Cartao";
import { moldePorSlug } from "@/lib/contratos/moldes";
import { dataCurta } from "@/lib/contratos/regras";
import type { RegistroContrato } from "@/lib/contratos/repositorio";

const cliente = (titulo: string) => titulo.split(" — ").slice(1).join(" — ") || titulo;

export function ListaContratos({ contratos }: { contratos: RegistroContrato[] }) {
  if (contratos.length === 0)
    return <Cartao className="py-10 text-center text-suave">Nenhum contrato gerado ainda.</Cartao>;
  return (
    <Cartao semPadding>
      <ul className="divide-y divide-linha">
        {contratos.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4 sm:px-5">
            <div className="min-w-0 flex-1 basis-60">
              <p className="truncate text-sm font-semibold text-tinta">{cliente(c.titulo)}</p>
              <p className="text-xs text-suave">
                {moldePorSlug(c.molde)?.titulo} · {c.tipoImovel ? (c.tipoImovel === "rural" ? "Rural · " : "Urbano · ") : ""}{dataCurta(c.dataAssinatura)}
              </p>
              {c.pendenciasEmpresa.length > 0 && <p className="mt-0.5 text-xs text-amber-700">Saiu com [A CONFIRMAR]: {c.pendenciasEmpresa.join(", ")}.</p>}
            </div>
            <div className="flex gap-2">
              <BotaoDownload href={`/api/contratos/${c.id}/docx`}><Download size={16} strokeWidth={1.75} aria-hidden="true" />Word</BotaoDownload>
              <BotaoDownload href={`/api/contratos/${c.id}/pdf`}><Download size={16} strokeWidth={1.75} aria-hidden="true" />PDF</BotaoDownload>
            </div>
          </li>
        ))}
      </ul>
    </Cartao>
  );
}
