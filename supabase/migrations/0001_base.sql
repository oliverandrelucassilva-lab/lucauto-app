-- Lucauto · base do sistema: espaços (workspaces), perfis de acesso e funções auxiliares.
-- NÃO foi executado em nenhum banco. Aplicar só no projeto Supabase da própria Lucauto.

create extension if not exists pgcrypto;

create type public.perfil_acesso as enum ('gerente', 'corretor', 'marketing');

-- Um "espaço" por empresa. Todo dado do sistema carrega o workspace_id.
create table public.workspaces (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  -- Dados da empresa usados nos contratos (CNPJ, CRECI...). Ainda [A CONFIRMAR]: nunca inventar.
  configuracao  jsonb not null default '{}'::jsonb,
  criado_em     timestamptz not null default now()
);

-- Uma pessoa = um login (auth.users) + um perfil dentro de um espaço.
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  workspace_id  uuid not null references public.workspaces(id) on delete restrict,
  nome          text not null,
  perfil        public.perfil_acesso not null,
  ativo         boolean not null default true,
  criado_em     timestamptz not null default now()
);
create index profiles_workspace_idx on public.profiles (workspace_id);

-- Funções usadas pelas regras de acesso. "security definer" para não cair em recursão
-- ao consultar profiles de dentro da própria regra de profiles.
create or replace function public.meu_workspace() returns uuid
language sql stable security definer set search_path = public as $$
  select workspace_id from public.profiles where id = auth.uid() and ativo
$$;

create or replace function public.meu_perfil() returns public.perfil_acesso
language sql stable security definer set search_path = public as $$
  select perfil from public.profiles where id = auth.uid() and ativo
$$;

revoke all on function public.meu_workspace() from public, anon;
revoke all on function public.meu_perfil() from public, anon;
grant execute on function public.meu_workspace() to authenticated;
grant execute on function public.meu_perfil() to authenticated;

-- Convite por e-mail: o gerente convida pelo painel do Supabase (ou por serviço do servidor),
-- informando workspace_id, perfil e nome em app_metadata (só o servidor consegue gravar ali).
-- NUNCA ler de user_metadata: a própria pessoa consegue editá-lo.
-- Mantenha o cadastro público (signup) DESLIGADO no projeto.
create or replace function public.criar_perfil_do_convite() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.raw_app_meta_data ? 'workspace_id' and new.raw_app_meta_data ? 'perfil' then
    insert into public.profiles (id, workspace_id, nome, perfil)
    values (
      new.id,
      (new.raw_app_meta_data ->> 'workspace_id')::uuid,
      coalesce(new.raw_app_meta_data ->> 'nome', split_part(new.email, '@', 1)),
      (new.raw_app_meta_data ->> 'perfil')::public.perfil_acesso
    );
  end if;
  return new;
end $$;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil_do_convite();
