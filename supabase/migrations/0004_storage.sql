-- Lucauto · bucket privado dos contratos (Word e PDF).
-- Caminho dos arquivos: <workspace_id>/<id do contrato>.docx|pdf
-- Backup: ativar o backup diário do projeto Supabase (plano da Lucauto).

insert into storage.buckets (id, name, public)
values ('contratos', 'contratos', false)
on conflict (id) do update set public = false;

create policy contratos_arquivos_ver on storage.objects for select to authenticated
  using (bucket_id = 'contratos'
         and (storage.foldername(name))[1] = public.meu_workspace()::text
         -- a regra de contratos vale aqui dentro: gerente acha todos, corretor só os próprios
         and exists (select 1 from public.contratos c where c.docx_path = storage.objects.name or c.pdf_path = storage.objects.name));

create policy contratos_arquivos_enviar on storage.objects for insert to authenticated
  with check (bucket_id = 'contratos'
              and (storage.foldername(name))[1] = public.meu_workspace()::text
              and public.meu_perfil() in ('gerente', 'corretor'));
