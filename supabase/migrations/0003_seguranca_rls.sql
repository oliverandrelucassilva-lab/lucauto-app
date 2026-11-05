-- Lucauto · regras de acesso (RLS) por espaço e por perfil.
--
--   gerente   : tudo do seu espaço
--   corretor  : pessoas e imóveis do espaço; contratos só os que ele mesmo gerou
--   marketing : sem acesso a pessoas, contratos e dados internos de imóveis
--               (só a visão imoveis_marketing)
--
-- Dados pessoais (CPF, RG, endereço) só para usuários autenticados do MESMO espaço
-- e com perfil gerente ou corretor.

alter table public.workspaces enable row level security;
alter table public.profiles   enable row level security;
alter table public.pessoas    enable row level security;
alter table public.imoveis    enable row level security;
alter table public.contratos  enable row level security;
alter table public.workspaces force row level security;
alter table public.profiles   force row level security;
alter table public.pessoas    force row level security;
alter table public.imoveis    force row level security;
alter table public.contratos  force row level security;

-- Sem acesso para quem não está logado.
revoke all on public.workspaces, public.profiles, public.pessoas, public.imoveis, public.contratos from anon;

-- workspaces: cada pessoa enxerga só o seu; só o gerente altera.
create policy workspaces_ver on public.workspaces for select to authenticated
  using (id = public.meu_workspace());
create policy workspaces_alterar on public.workspaces for update to authenticated
  using (id = public.meu_workspace() and public.meu_perfil() = 'gerente')
  with check (id = public.meu_workspace());

-- profiles: cada pessoa vê o próprio; o gerente vê e gerencia a equipe do espaço.
-- (Cadastro de novas pessoas acontece por convite, no servidor.)
create policy profiles_ver_proprio on public.profiles for select to authenticated
  using (id = auth.uid());
create policy profiles_ver_equipe on public.profiles for select to authenticated
  using (workspace_id = public.meu_workspace() and public.meu_perfil() = 'gerente');
create policy profiles_gerente_altera on public.profiles for update to authenticated
  using (workspace_id = public.meu_workspace() and public.meu_perfil() = 'gerente')
  with check (workspace_id = public.meu_workspace());

-- pessoas (dados pessoais): gerente e corretor do mesmo espaço.
create policy pessoas_ver on public.pessoas for select to authenticated
  using (workspace_id = public.meu_workspace() and public.meu_perfil() in ('gerente', 'corretor'));
create policy pessoas_criar on public.pessoas for insert to authenticated
  with check (workspace_id = public.meu_workspace() and public.meu_perfil() in ('gerente', 'corretor'));
create policy pessoas_alterar on public.pessoas for update to authenticated
  using (workspace_id = public.meu_workspace() and public.meu_perfil() in ('gerente', 'corretor'))
  with check (workspace_id = public.meu_workspace());
create policy pessoas_apagar on public.pessoas for delete to authenticated
  using (workspace_id = public.meu_workspace() and public.meu_perfil() = 'gerente');

-- imóveis: gerente e corretor veem tudo; marketing usa a visão imoveis_marketing.
create policy imoveis_ver on public.imoveis for select to authenticated
  using (workspace_id = public.meu_workspace() and public.meu_perfil() in ('gerente', 'corretor'));
create policy imoveis_criar on public.imoveis for insert to authenticated
  with check (workspace_id = public.meu_workspace() and public.meu_perfil() in ('gerente', 'corretor'));
create policy imoveis_alterar on public.imoveis for update to authenticated
  using (workspace_id = public.meu_workspace() and public.meu_perfil() in ('gerente', 'corretor'))
  with check (workspace_id = public.meu_workspace());
create policy imoveis_apagar on public.imoveis for delete to authenticated
  using (workspace_id = public.meu_workspace() and public.meu_perfil() = 'gerente');

-- contratos: gerente vê todos do espaço; corretor vê só os próprios; marketing nenhum.
-- Contratos gerados não são editados nem apagados pelo sistema (histórico).
create policy contratos_ver on public.contratos for select to authenticated
  using (workspace_id = public.meu_workspace()
         and (public.meu_perfil() = 'gerente' or (public.meu_perfil() = 'corretor' and criado_por = auth.uid())));
create policy contratos_criar on public.contratos for insert to authenticated
  with check (workspace_id = public.meu_workspace()
              and public.meu_perfil() in ('gerente', 'corretor')
              and criado_por = auth.uid());

grant select, insert, update, delete on public.pessoas, public.imoveis to authenticated;
grant select, insert on public.contratos to authenticated;
grant select on public.workspaces, public.profiles to authenticated;
grant update on public.workspaces, public.profiles to authenticated;
