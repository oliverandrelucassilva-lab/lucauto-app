-- Testes das regras de acesso. Dados fictícios. Rodar com: scripts/testar-rls.sh
\set ON_ERROR_STOP on
\set QUIET on
begin;
insert into workspaces (id, nome) values ('11111111-1111-1111-1111-111111111111','Empresa A'), ('22222222-2222-2222-2222-222222222222','Empresa B');
-- convite por app_metadata cria o perfil pelo gatilho
insert into auth.users (id, email, raw_app_meta_data) values
 ('aaaaaaaa-0000-0000-0000-000000000001','gerente@a.test','{"workspace_id":"11111111-1111-1111-1111-111111111111","perfil":"gerente","nome":"Gerente A"}'),
 ('aaaaaaaa-0000-0000-0000-000000000002','corretor@a.test','{"workspace_id":"11111111-1111-1111-1111-111111111111","perfil":"corretor","nome":"Corretor A"}'),
 ('aaaaaaaa-0000-0000-0000-000000000003','mkt@a.test','{"workspace_id":"11111111-1111-1111-1111-111111111111","perfil":"marketing","nome":"Mkt A"}'),
 ('bbbbbbbb-0000-0000-0000-000000000001','gerente@b.test','{"workspace_id":"22222222-2222-2222-2222-222222222222","perfil":"gerente","nome":"Gerente B"}'),
 ('cccccccc-0000-0000-0000-000000000001','intruso@x.test','{}');   -- sem convite: sem perfil
select 'perfis criados pelo convite' as teste, count(*) = 4 as ok from profiles;

insert into pessoas (workspace_id, nome, cpf) values ('11111111-1111-1111-1111-111111111111','Pessoa A','111.444.777-35'), ('22222222-2222-2222-2222-222222222222','Pessoa B','529.982.247-25');
insert into imoveis (workspace_id, codigo, tipo, matricula) values ('11111111-1111-1111-1111-111111111111','LUC-001','urbano','00.000'), ('22222222-2222-2222-2222-222222222222','LUC-001','rural','11.111');
insert into contratos (id, workspace_id, molde, titulo, tipo_imovel, valor_centavos, data_assinatura, dados, docx_path, pdf_path, criado_por, criado_por_nome) values
 ('00000000-0000-0000-0000-00000000c001','11111111-1111-1111-1111-111111111111','1_intermediacao_com_exclusividade','C do gerente','urbano',100,'2026-11-05','{}','11111111-1111-1111-1111-111111111111/c001.docx','11111111-1111-1111-1111-111111111111/c001.pdf','aaaaaaaa-0000-0000-0000-000000000001','Gerente A'),
 ('00000000-0000-0000-0000-00000000c002','11111111-1111-1111-1111-111111111111','1_intermediacao_com_exclusividade','C do corretor','urbano',100,'2026-11-05','{}','11111111-1111-1111-1111-111111111111/c002.docx','11111111-1111-1111-1111-111111111111/c002.pdf','aaaaaaaa-0000-0000-0000-000000000002','Corretor A'),
 ('00000000-0000-0000-0000-00000000c003','22222222-2222-2222-2222-222222222222','1_intermediacao_com_exclusividade','C da empresa B','rural',100,'2026-11-05','{}','22222222-2222-2222-2222-222222222222/c003.docx','22222222-2222-2222-2222-222222222222/c003.pdf','bbbbbbbb-0000-0000-0000-000000000001','Gerente B');
insert into storage.objects (bucket_id, name) values ('contratos','11111111-1111-1111-1111-111111111111/c001.pdf'),('contratos','11111111-1111-1111-1111-111111111111/c002.pdf'),('contratos','22222222-2222-2222-2222-222222222222/c003.pdf');
commit;

create temp table resultados (teste text, ok boolean);
grant all on resultados to authenticated, anon;

create or replace function pg_temp.como(usuario text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', usuario, false);
end $$;

-- helper: roda uma contagem como um usuário
\set gerA   '''aaaaaaaa-0000-0000-0000-000000000001'''
\set corrA  '''aaaaaaaa-0000-0000-0000-000000000002'''
\set mktA   '''aaaaaaaa-0000-0000-0000-000000000003'''
\set gerB   '''bbbbbbbb-0000-0000-0000-000000000001'''
\set intruso '''cccccccc-0000-0000-0000-000000000001'''

-- ===== gerente A =====
set role authenticated;
select set_config('request.jwt.claim.sub', :gerA, false) \g /dev/null
insert into resultados select 'gerente A vê só as pessoas do seu espaço', count(*) = 1 from pessoas;
insert into resultados select 'gerente A vê os 2 contratos do seu espaço', count(*) = 2 from contratos;
insert into resultados select 'gerente A vê só o seu workspace', count(*) = 1 from workspaces;
insert into resultados select 'gerente A baixa os 2 arquivos do seu espaço', count(*) = 2 from storage.objects;
-- ===== corretor A =====
select set_config('request.jwt.claim.sub', :corrA, false) \g /dev/null
insert into resultados select 'corretor A vê pessoas e imóveis', (select count(*) from pessoas) = 1 and (select count(*) from imoveis) = 1;
insert into resultados select 'corretor A vê só o contrato que ele gerou', (select count(*) from contratos) = 1 and (select titulo from contratos) = 'C do corretor';
insert into resultados select 'corretor A baixa só o arquivo do próprio contrato', (select count(*) from storage.objects) = 1;
-- ===== marketing A =====
select set_config('request.jwt.claim.sub', :mktA, false) \g /dev/null
insert into resultados select 'marketing não vê pessoas (CPF/RG)', count(*) = 0 from pessoas;
insert into resultados select 'marketing não vê contratos', count(*) = 0 from contratos;
insert into resultados select 'marketing não vê imóveis internos (matrícula)', count(*) = 0 from imoveis;
insert into resultados select 'marketing vê a visão pública de imóveis', count(*) = 1 from imoveis_marketing;
insert into resultados select 'marketing não baixa contratos', count(*) = 0 from storage.objects;
-- ===== gerente B =====
select set_config('request.jwt.claim.sub', :gerB, false) \g /dev/null
insert into resultados select 'gerente B não vê dados da empresa A', (select count(*) from pessoas where nome = 'Pessoa A') = 0 and (select count(*) from contratos where titulo like 'C do%') = 0;
-- ===== sem perfil =====
select set_config('request.jwt.claim.sub', :intruso, false) \g /dev/null
insert into resultados select 'usuário sem perfil não vê nada', (select count(*) from pessoas) + (select count(*) from contratos) + (select count(*) from imoveis) + (select count(*) from workspaces) + (select count(*) from imoveis_marketing) = 0;
-- ===== anônimo =====
reset role; set role anon;
do $$ begin
  begin perform 1 from pessoas; insert into resultados values ('anônimo é barrado em pessoas', false);
  exception when insufficient_privilege then insert into resultados values ('anônimo é barrado em pessoas', true); end;
end $$;
reset role; set role authenticated;

-- ===== escritas proibidas =====
select set_config('request.jwt.claim.sub', :mktA, false) \g /dev/null
do $$ begin
  begin insert into pessoas (workspace_id, nome) values ('11111111-1111-1111-1111-111111111111','Invasão'); insert into resultados values ('marketing não cria pessoa', false);
  exception when others then insert into resultados values ('marketing não cria pessoa', true); end;
end $$;
select set_config('request.jwt.claim.sub', :corrA, false) \g /dev/null
do $$ begin
  begin insert into pessoas (workspace_id, nome) values ('22222222-2222-2222-2222-222222222222','Em outro espaço'); insert into resultados values ('corretor não grava em outro espaço', false);
  exception when others then insert into resultados values ('corretor não grava em outro espaço', true); end;
end $$;
do $$ begin
  begin insert into contratos (workspace_id, molde, titulo, tipo_imovel, valor_centavos, data_assinatura, dados, docx_path, pdf_path, criado_por, criado_por_nome) values ('11111111-1111-1111-1111-111111111111','1_x','Fraude','urbano',1,'2026-11-05','{}','a','b','aaaaaaaa-0000-0000-0000-000000000001','Gerente A');
        insert into resultados values ('corretor não gera contrato em nome de outra pessoa', false);
  exception when others then insert into resultados values ('corretor não gera contrato em nome de outra pessoa', true); end;
end $$;
select set_config('request.jwt.claim.sub', :corrA, false) \g /dev/null
with d as (delete from pessoas returning 1) insert into resultados select 'corretor não apaga pessoa (só gerente)', count(*) = 0 from d;
do $$ begin
  begin delete from contratos; insert into resultados values ('corretor não apaga contrato gerado', false);
  exception when insufficient_privilege then insert into resultados values ('corretor não apaga contrato gerado', true); end;
end $$;
select set_config('request.jwt.claim.sub', :gerA, false) \g /dev/null
do $$ begin
  begin update contratos set titulo = 'x'; insert into resultados values ('gerente não altera contrato gerado', false);
  exception when insufficient_privilege then insert into resultados values ('gerente não altera contrato gerado', true); end;
end $$;
with d as (delete from pessoas returning 1) insert into resultados select 'gerente apaga pessoa do próprio espaço', count(*) = 1 from d;

reset role;
select case when ok then 'OK   ' else 'FALHA' end as resultado, teste from resultados order by ok, teste;
select count(*) filter (where not ok) as falhas from resultados \gset
\if :falhas
  \echo 'HÁ FALHAS'
  \quit 3
\endif
