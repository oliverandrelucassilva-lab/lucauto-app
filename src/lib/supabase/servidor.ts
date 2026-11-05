import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Cliente do Supabase no servidor, com a sessão da pessoa (respeita as regras de acesso do banco). */
export async function clienteSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !chave) throw new Error("Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  const jar = await cookies();
  return createServerClient(url, chave, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (lista) => {
        try {
          lista.forEach(({ name, value, options }) => jar.set(name, value, options));
        } catch {
          /* chamado de um componente de página: o proxy já renova a sessão */
        }
      },
    },
  });
}
