-- Lucauto · cadastros-base: pessoas, imóveis e contratos. Todos com workspace_id.

create type public.tipo_imovel as enum ('urbano', 'rural');
create type public.situacao_imovel as enum ('disponivel', 'reservado', 'vendido', 'alugado');

-- Pessoas (proprietário, comprador, locatário, fiador...). Contém DADOS PESSOAIS (LGPD).
create table public.pessoas (
  id                uuid primary key default gen_random_uuid(),
  workspace_id      uuid not null references public.workspaces(id) on delete restrict,
  nome              text not null,
  estado_civil      text,
  profissao         text,
  data_nascimento   date,
  rg                text,
  cpf               text,
  cidade            text,
  estado            text,
  cep               text,
  telefone          text,
  email             text,
  criado_por        uuid references auth.users(id),
  criado_em         timestamptz not null default now(),
  atualizado_em     timestamptz not null default now()
);
create index pessoas_workspace_idx on public.pessoas (workspace_id);
create unique index pessoas_cpf_unico on public.pessoas (workspace_id, cpf) where cpf is not null;

-- Imóveis. O código (LUC-001...) é gerado no módulo Imóveis (etapa 2).
create table public.imoveis (
  id                uuid primary key default gen_random_uuid(),
  workspace_id      uuid not null references public.workspaces(id) on delete restrict,
  codigo            text,
  tipo              public.tipo_imovel not null,
  finalidade        text check (finalidade in ('venda', 'aluguel')),
  localizacao       text,
  valor_centavos    bigint check (valor_centavos > 0),
  quartos           int,
  vagas             int,
  area_m2           numeric,
  descricao         text,
  matricula         text,
  cartorio          text,
  proprietario_id   uuid references public.pessoas(id),
  situacao          public.situacao_imovel not null default 'disponivel',
  pasta_fotos_url   text,
  destaque_no_site  boolean not null default false,
  autorizou_fotos   boolean not null default false, -- ligado à cláusula 5 do contrato de exclusividade
  criado_em         timestamptz not null default now(),
  unique (workspace_id, codigo)
);
create index imoveis_workspace_idx on public.imoveis (workspace_id);

-- Contratos gerados. "dados" guarda o que foi preenchido (o que foi assinado).
create table public.contratos (
  id                uuid primary key default gen_random_uuid(),
  workspace_id      uuid not null references public.workspaces(id) on delete restrict,
  molde             text not null check (molde ~ '^[1-6]_[a-z_]+$'),
  titulo            text not null,
  tipo_imovel       public.tipo_imovel not null,
  imovel_id         uuid references public.imoveis(id),
  partes            jsonb not null default '[]'::jsonb, -- [{papel, pessoa_id}]
  valor_centavos    bigint not null check (valor_centavos >= 0),
  data_assinatura   date not null,
  dados             jsonb not null,
  pendencias        jsonb not null default '[]'::jsonb, -- dados da empresa que saíram [A CONFIRMAR]
  docx_path         text not null,
  pdf_path          text not null,
  criado_por        uuid not null references auth.users(id),
  criado_por_nome   text not null,
  criado_em         timestamptz not null default now()
);
create index contratos_workspace_idx on public.contratos (workspace_id, criado_em desc);

-- Marketing enxerga só o que é público do imóvel (nada de matrícula, proprietário ou valor interno).
create view public.imoveis_marketing with (security_invoker = false) as
  select id, workspace_id, codigo, tipo, finalidade, localizacao, valor_centavos, quartos, vagas,
         area_m2, descricao, situacao, pasta_fotos_url, destaque_no_site, autorizou_fotos
  from public.imoveis
  where workspace_id = public.meu_workspace() and public.meu_perfil() in ('gerente', 'corretor', 'marketing');
revoke all on public.imoveis_marketing from public, anon;
grant select on public.imoveis_marketing to authenticated;
