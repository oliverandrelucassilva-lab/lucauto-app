import { AppShell } from "@/components/layout/AppShell";
import { exigirSessao } from "@/lib/auth/sessao";

export default async function LayoutDoApp({ children }: { children: React.ReactNode }) {
  const sessao = await exigirSessao();
  return <AppShell sessao={sessao}>{children}</AppShell>;
}
