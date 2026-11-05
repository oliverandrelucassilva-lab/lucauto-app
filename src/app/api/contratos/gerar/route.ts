import { NextResponse } from "next/server";
import { obterSessao } from "@/lib/auth/sessao";
import { modoDemo } from "@/lib/auth/mock";
import { podeAcessar } from "@/lib/auth/permissoes";
import { DadosIncompletos, gerarContrato } from "@/lib/contratos/gerar";
import { moldePorSlug } from "@/lib/contratos/moldes";
import { repositorio } from "@/lib/contratos/repositorio";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request) {
  const sessao = await obterSessao();
  if (!sessao) return NextResponse.json({ erro: "Entre no sistema para continuar." }, { status: 401 });
  if (!podeAcessar(sessao.perfil, "contratos")) return NextResponse.json({ erro: "Você não tem acesso aos contratos." }, { status: 403 });

  let corpo: { molde?: string; dados?: Record<string, string> };
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ erro: "Pedido inválido." }, { status: 400 });
  }
  const molde = moldePorSlug(String(corpo.molde));
  if (!molde?.ativo || !corpo.dados || typeof corpo.dados !== "object") return NextResponse.json({ erro: "Este molde ainda não está disponível." }, { status: 400 });

  try {
    const demo = modoDemo();
    const g = await gerarContrato(molde.slug, corpo.dados, { pdfOpcional: demo });
    if (demo) {
      // Demonstração: devolve os arquivos na hora e não guarda nada.
      return NextResponse.json({ demo: true, docx: g.docx.toString("base64"), pdf: g.pdf?.toString("base64") ?? null, pendenciasEmpresa: g.pendenciasEmpresa });
    }
    const registro = await repositorio().salvar(sessao, {
      molde: molde.slug,
      titulo: g.titulo,
      tipoImovel: g.tipoImovel,
      valorCentavos: g.valorCentavos,
      dataAssinatura: g.dataAssinatura,
      pendenciasEmpresa: g.pendenciasEmpresa,
      dados: g.dados,
      docx: g.docx,
      pdf: g.pdf,
    });
    return NextResponse.json({ id: registro.id, pendenciasEmpresa: g.pendenciasEmpresa });
  } catch (e) {
    if (e instanceof DadosIncompletos) return NextResponse.json({ erro: "Faltam dados para gerar o contrato.", problemas: e.problemas }, { status: 422 });
    console.error("Falha ao gerar contrato:", e instanceof Error ? e.message : e); // sem dados pessoais no log
    return NextResponse.json({ erro: "Não foi possível gerar o contrato agora. Tente de novo em instantes." }, { status: 500 });
  }
}
