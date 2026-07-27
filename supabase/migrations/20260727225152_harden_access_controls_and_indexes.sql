begin;

create table public.profile_access_controls (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  suspended_at timestamptz,
  updated_at timestamptz not null default now()
);

insert into public.profile_access_controls (user_id, suspended_at)
select id, access_suspended_at
from public.profiles;

update public.profiles
set access_suspended_at = null
where access_suspended_at is not null;

alter table public.profile_access_controls enable row level security;

create policy profile_access_controls_select_self_or_admin
on public.profile_access_controls for select to authenticated
using (user_id = (select auth.uid()) or (select private.is_admin()));

create policy profile_access_controls_admin_insert
on public.profile_access_controls for insert to authenticated
with check ((select private.is_admin()));

create policy profile_access_controls_admin_update
on public.profile_access_controls for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

revoke all on public.profile_access_controls from public, anon, authenticated;
grant select, insert, update on public.profile_access_controls to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    left join public.profile_access_controls access
      on access.user_id = p.id
    where p.id = (select auth.uid())
      and p.role = 'admin'
      and access.suspended_at is null
  );
$$;

create or replace function private.is_org_member(target_organisation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select private.is_admin())
    or exists (
      select 1
      from public.organisation_members om
      join public.profiles p on p.id = om.user_id
      left join public.profile_access_controls access
        on access.user_id = p.id
      where om.organisation_id = target_organisation_id
        and om.user_id = (select auth.uid())
        and access.suspended_at is null
    );
$$;

create or replace function private.can_access_engagement(target_engagement_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select private.is_admin())
    or exists (
      select 1
      from public.engagements e
      join public.organisation_members om
        on om.organisation_id = e.organisation_id
      join public.profiles p on p.id = om.user_id
      left join public.profile_access_controls access
        on access.user_id = p.id
      where e.id = target_engagement_id
        and om.user_id = (select auth.uid())
        and access.suspended_at is null
    );
$$;

create or replace function private.ensure_profile_access_control()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profile_access_controls (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

revoke all on function private.ensure_profile_access_control()
  from public, anon, authenticated;

create trigger profile_access_control_on_profile_created
after insert on public.profiles
for each row execute function private.ensure_profile_access_control();

drop function public.set_user_access_suspension(uuid, boolean);

create index analysis_findings_created_by_idx
  on public.analysis_findings(created_by);
create index audit_logs_organisation_created_idx
  on public.audit_logs(organisation_id, created_at desc);
create index clarification_messages_attachment_idx
  on public.clarification_messages(attachment_document_id);
create index clarification_messages_author_idx
  on public.clarification_messages(author_id);
create index clarification_threads_created_by_idx
  on public.clarification_threads(created_by);
create index clarification_threads_document_idx
  on public.clarification_threads(document_id);
create index deliverables_published_by_idx
  on public.deliverables(published_by);
create index document_versions_uploaded_by_idx
  on public.document_versions(uploaded_by);
create index documents_request_idx
  on public.documents(request_id);
create index internal_notes_author_idx
  on public.internal_notes(author_id);
create index nda_acceptances_version_idx
  on public.nda_acceptances(nda_version_id);
create index questionnaire_items_answered_by_idx
  on public.questionnaire_response_items(answered_by);
create index questionnaire_responses_respondent_idx
  on public.questionnaire_responses(respondent_id);

drop policy organisation_members_admin_write on public.organisation_members;
create policy organisation_members_admin_insert on public.organisation_members
  for insert to authenticated with check ((select private.is_admin()));
create policy organisation_members_admin_update on public.organisation_members
  for update to authenticated using ((select private.is_admin()))
  with check ((select private.is_admin()));
create policy organisation_members_admin_delete on public.organisation_members
  for delete to authenticated using ((select private.is_admin()));

drop policy engagements_admin_write on public.engagements;
create policy engagements_admin_insert on public.engagements
  for insert to authenticated with check ((select private.is_admin()));
create policy engagements_admin_update on public.engagements
  for update to authenticated using ((select private.is_admin()))
  with check ((select private.is_admin()));
create policy engagements_admin_delete on public.engagements
  for delete to authenticated using ((select private.is_admin()));

drop policy nda_versions_admin_write on public.nda_versions;
create policy nda_versions_admin_insert on public.nda_versions
  for insert to authenticated with check ((select private.is_admin()));
create policy nda_versions_admin_update on public.nda_versions
  for update to authenticated using ((select private.is_admin()))
  with check ((select private.is_admin()));
create policy nda_versions_admin_delete on public.nda_versions
  for delete to authenticated using ((select private.is_admin()));

drop policy questionnaire_definitions_admin_write on public.questionnaire_sections;
create policy questionnaire_sections_admin_insert on public.questionnaire_sections
  for insert to authenticated with check ((select private.is_admin()));
create policy questionnaire_sections_admin_update on public.questionnaire_sections
  for update to authenticated using ((select private.is_admin()))
  with check ((select private.is_admin()));
create policy questionnaire_sections_admin_delete on public.questionnaire_sections
  for delete to authenticated using ((select private.is_admin()));

drop policy questionnaire_questions_admin_write on public.questionnaire_questions;
create policy questionnaire_questions_admin_insert on public.questionnaire_questions
  for insert to authenticated with check ((select private.is_admin()));
create policy questionnaire_questions_admin_update on public.questionnaire_questions
  for update to authenticated using ((select private.is_admin()))
  with check ((select private.is_admin()));
create policy questionnaire_questions_admin_delete on public.questionnaire_questions
  for delete to authenticated using ((select private.is_admin()));

drop policy questionnaire_options_admin_write on public.questionnaire_options;
create policy questionnaire_options_admin_insert on public.questionnaire_options
  for insert to authenticated with check ((select private.is_admin()));
create policy questionnaire_options_admin_update on public.questionnaire_options
  for update to authenticated using ((select private.is_admin()))
  with check ((select private.is_admin()));
create policy questionnaire_options_admin_delete on public.questionnaire_options
  for delete to authenticated using ((select private.is_admin()));

drop policy document_requests_admin_write on public.document_requests;
create policy document_requests_admin_insert on public.document_requests
  for insert to authenticated with check ((select private.is_admin()));
create policy document_requests_admin_update on public.document_requests
  for update to authenticated using ((select private.is_admin()))
  with check ((select private.is_admin()));
create policy document_requests_admin_delete on public.document_requests
  for delete to authenticated using ((select private.is_admin()));

drop policy analysis_findings_admin_write on public.analysis_findings;
create policy analysis_findings_admin_insert on public.analysis_findings
  for insert to authenticated with check ((select private.is_admin()));
create policy analysis_findings_admin_update on public.analysis_findings
  for update to authenticated using ((select private.is_admin()))
  with check ((select private.is_admin()));
create policy analysis_findings_admin_delete on public.analysis_findings
  for delete to authenticated using ((select private.is_admin()));

drop policy deliverables_admin_write on public.deliverables;
create policy deliverables_admin_insert on public.deliverables
  for insert to authenticated with check ((select private.is_admin()));
create policy deliverables_admin_update on public.deliverables
  for update to authenticated using ((select private.is_admin()))
  with check ((select private.is_admin()));
create policy deliverables_admin_delete on public.deliverables
  for delete to authenticated using ((select private.is_admin()));

drop policy deliverable_sections_admin_write on public.deliverable_sections;
create policy deliverable_sections_admin_insert on public.deliverable_sections
  for insert to authenticated with check ((select private.is_admin()));
create policy deliverable_sections_admin_update on public.deliverable_sections
  for update to authenticated using ((select private.is_admin()))
  with check ((select private.is_admin()));
create policy deliverable_sections_admin_delete on public.deliverable_sections
  for delete to authenticated using ((select private.is_admin()));

commit;
