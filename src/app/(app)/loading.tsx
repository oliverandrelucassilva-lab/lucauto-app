import { Cartao } from "@/components/ui/Cartao";
import { Esqueleto } from "@/components/ui/Esqueleto";

export default function Carregando() {
  return (
    <div className="space-y-6" role="status" aria-label="Carregando">
      <div className="space-y-2"><Esqueleto className="h-8 w-64" /><Esqueleto className="h-4 w-80 max-w-full" /></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => <Cartao key={i} className="space-y-3"><Esqueleto className="size-10" /><Esqueleto className="h-4 w-40" /><Esqueleto className="h-3 w-full" /></Cartao>)}
      </div>
      <Cartao className="space-y-3"><Esqueleto className="h-4 w-48" /><Esqueleto className="h-12 w-full" /><Esqueleto className="h-12 w-full" /></Cartao>
    </div>
  );
}
