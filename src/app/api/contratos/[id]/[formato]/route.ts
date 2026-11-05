import { NextResponse } from "next/server";
import { obterSessao } from "@/lib/auth/sessao";
import { podeAcessar } from "@/lib/auth/permissoes";
import { repositorio, type Formato } from "@/lib/contratos/repositorio";

export const runtime = "nodejs";

const TIPOS: Record<Formato, string> = { docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", pdf: "application/pdf" };

export async function GET(_req: Request, ctx: RouteContext<"/api/contratos/[id]/[formato]">) {
  const { id, formato } = await ctx.params;
  if (formato !== "docx" && formato !== "pdf") return NextResponse.json({ erro: "Formato inválido." }, { status: 400 });
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Entre no sistema para continuar." }, { status: 401 });
  if (!podeAcessar(sessao.perfil, "contratos")) return NextResponse.json({ erro: "Você não tem acesso aos contratos." }, { status: 403 });

  const achado = await repositorio().baixar(sessao, id, formato);
  if (!achado) return NextResponse.json({ erro: "Contrato não encontrado." }, { status: 404 });
  const nome = `contrato-${achado.registro.molde.split("_")[0]}-${achado.registro.dataAssinatura}.${formato}`;
  return new NextResponse(new Uint8Array(achado.arquivo), {
    headers: { "Content-Type": TIPOS[formato], "Content-Disposition": `attachment; filename="${nome}"`, "Cache-Control": "private, no-store" },
  });
}
