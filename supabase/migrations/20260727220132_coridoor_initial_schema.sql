begin;

create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  role text not null default 'client'
    check (role in ('client', 'advisor', 'admin')),
  access_suspended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  website text,
  industry text,
  country text default 'DE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organisation_members (
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'owner'
    check (role in ('owner', 'member', 'advisor')),
  created_at timestamptz not null default now(),
  primary key (organisation_id, user_id)
);

create table public.engagements (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  client_owner_id uuid not null references public.profiles(id) on delete restrict,
  type text not null default 'buyer_objection_report'
    check (type = 'buyer_objection_report'),
  status text not null default 'setup_required'
    check (status in (
      'setup_required',
      'interview_in_progress',
      'documents_outstanding',
      'documents_under_review',
      'clarifications_open',
      'analysis_in_progress',
      'quality_assurance',
      'results_available',
      'completed',
      'archived'
    )),
  title text not null,
  delivery_due_at timestamptz,
  submitted_at timestamptz,
  completed_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.nda_versions (
  id uuid primary key default gen_random_uuid(),
  version text not null unique,
  title text not null,
  content text not null,
  content_hash text not null unique,
  is_active boolean not null default false,
  effective_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index nda_versions_one_active_idx
  on public.nda_versions (is_active)
  where is_active;

create table public.nda_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  nda_version_id uuid not null references public.nda_versions(id) on delete restrict,
  nda_version text not null,
  content_hash text not null,
  accepted_at timestamptz not null default now(),
  ip_address inet,
  user_agent text,
  unique (user_id, engagement_id, nda_version_id)
);

create table public.questionnaire_sections (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.questionnaire_questions (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.questionnaire_sections(id) on delete cascade,
  key text not null unique,
  label text not null,
  description text,
  kind text not null
    check (kind in ('text', 'textarea', 'number', 'percent', 'currency', 'date', 'boolean', 'single', 'multiple', 'table', 'repeatable', 'file')),
  is_required boolean not null default false,
  validation jsonb not null default '{}'::jsonb,
  condition jsonb,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.questionnaire_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questionnaire_questions(id) on delete cascade,
  value text not null,
  label text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (question_id, value)
);

create table public.questionnaire_responses (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null unique references public.engagements(id) on delete cascade,
  respondent_id uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'draft'
    check (status in ('draft', 'submitted', 'reopened', 'locked')),
  progress integer not null default 0 check (progress between 0 and 100),
  last_saved_at timestamptz,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.questionnaire_response_items (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.questionnaire_responses(id) on delete cascade,
  question_key text not null,
  value jsonb not null default 'null'::jsonb,
  answered_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (response_id, question_key)
);

create table public.document_requests (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  title text not null,
  description text,
  category text not null,
  is_required boolean not null default true,
  status text not null default 'requested'
    check (status in ('requested', 'uploaded', 'under_review', 'clarification_required', 'accepted', 'rejected', 'not_applicable')),
  due_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  request_id uuid references public.document_requests(id) on delete set null,
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  storage_path text not null unique,
  original_filename text not null,
  sanitized_filename text not null,
  mime_type text not null,
  file_size bigint not null check (file_size > 0 and file_size <= 104857600),
  category text not null
    check (category in ('corporate', 'financial', 'customers', 'commercial', 'management', 'operations', 'legal', 'tax', 'technology', 'contracts', 'other')),
  description text,
  document_year integer check (document_year between 1900 and 2200),
  status text not null default 'uploaded'
    check (status in ('requested', 'uploaded', 'under_review', 'clarification_required', 'accepted', 'rejected', 'not_applicable')),
  current_version integer not null default 1 check (current_version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  version integer not null check (version > 0),
  storage_path text not null unique,
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  original_filename text not null,
  sanitized_filename text not null,
  mime_type text not null,
  file_size bigint not null check (file_size > 0 and file_size <= 104857600),
  checksum text,
  created_at timestamptz not null default now(),
  unique (document_id, version)
);

create table public.clarification_threads (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  document_id uuid references public.documents(id) on delete set null,
  subject text not null,
  status text not null default 'open'
    check (status in ('open', 'answered', 'closed')),
  created_by uuid not null references public.profiles(id) on delete restrict,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clarification_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.clarification_threads(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete restrict,
  body text not null check (char_length(body) between 1 and 10000),
  attachment_document_id uuid references public.documents(id) on delete set null,
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.analysis_findings (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  category text not null,
  title text not null,
  observation text not null,
  buyer_interpretation text not null,
  potential_deal_impact text not null,
  required_evidence text not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  likelihood text check (likelihood in ('low', 'medium', 'high')),
  status text not null default 'draft'
    check (status in ('draft', 'in_review', 'approved', 'withdrawn')),
  client_visible boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.deliverables (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  type text not null
    check (type in ('executive_summary', 'buyer_objection_register', 'deal_term_risk_map', 'evidence_gap_report', 'founder_dependency_map', 'management_questions', 'proof_plan', 'final_report')),
  title text not null,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'withdrawn')),
  version integer not null default 1 check (version > 0),
  published_at timestamptz,
  published_by uuid references public.profiles(id) on delete set null,
  storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (engagement_id, type, version)
);

create table public.deliverable_sections (
  id uuid primary key default gen_random_uuid(),
  deliverable_id uuid not null references public.deliverables(id) on delete cascade,
  title text not null,
  content jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.internal_notes (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete restrict,
  body text not null check (char_length(body) between 1 and 20000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  engagement_id uuid references public.engagements(id) on delete set null,
  organisation_id uuid references public.organisations(id) on delete set null,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index organisation_members_user_id_idx on public.organisation_members(user_id);
create index engagements_org_status_idx on public.engagements(organisation_id, status);
create index engagements_owner_created_idx on public.engagements(client_owner_id, created_at desc);
create index nda_acceptances_engagement_idx on public.nda_acceptances(engagement_id);
create index questionnaire_questions_section_sort_idx on public.questionnaire_questions(section_id, sort_order);
create index questionnaire_response_items_response_idx on public.questionnaire_response_items(response_id);
create index document_requests_engagement_status_idx on public.document_requests(engagement_id, status);
create index documents_engagement_status_idx on public.documents(engagement_id, status);
create index documents_organisation_id_idx on public.documents(organisation_id);
create index documents_uploaded_by_idx on public.documents(uploaded_by);
create index document_versions_document_idx on public.document_versions(document_id, version desc);
create index clarification_threads_engagement_status_idx on public.clarification_threads(engagement_id, status);
create index clarification_messages_thread_created_idx on public.clarification_messages(thread_id, created_at);
create index analysis_findings_engagement_visible_idx on public.analysis_findings(engagement_id, client_visible, sort_order);
create index deliverables_engagement_status_idx on public.deliverables(engagement_id, status);
create index deliverable_sections_deliverable_sort_idx on public.deliverable_sections(deliverable_id, sort_order);
create index internal_notes_engagement_created_idx on public.internal_notes(engagement_id, created_at desc);
create index audit_logs_engagement_created_idx on public.audit_logs(engagement_id, created_at desc);
create index audit_logs_actor_created_idx on public.audit_logs(actor_id, created_at desc);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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
    where p.id = (select auth.uid())
      and p.role = 'admin'
      and p.access_suspended_at is null
  );
$$;

create or replace function public.set_user_access_suspension(
  target_user_id uuid,
  should_suspend boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select private.is_admin()) then
    raise exception 'administrator access required';
  end if;
  if target_user_id = (select auth.uid()) then
    raise exception 'administrators cannot suspend their own account';
  end if;

  update public.profiles
  set access_suspended_at = case when should_suspend then now() else null end,
      updated_at = now()
  where id = target_user_id;

  if not found then
    raise exception 'profile not found';
  end if;
end;
$$;

revoke all on function public.set_user_access_suspension(uuid, boolean)
  from public, anon;
grant execute on function public.set_user_access_suspension(uuid, boolean)
  to authenticated;

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
      where om.organisation_id = target_organisation_id
        and om.user_id = (select auth.uid())
        and p.access_suspended_at is null
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
      where e.id = target_engagement_id
        and om.user_id = (select auth.uid())
        and p.access_suspended_at is null
    );
$$;

create or replace function private.mark_document_request_uploaded()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.request_id is not null
    and (
      new.uploaded_by = (select auth.uid())
      or (select private.is_admin())
    )
  then
    update public.document_requests
    set status = 'uploaded', updated_at = now()
    where id = new.request_id
      and engagement_id = new.engagement_id;
  end if;
  return new;
end;
$$;

create or replace function private.advance_engagement_after_nda()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.user_id = (select auth.uid()) then
    update public.engagements
    set status = 'interview_in_progress', updated_at = now()
    where id = new.engagement_id
      and status = 'setup_required';
  end if;
  return new;
end;
$$;

create or replace function private.advance_engagement_after_interview()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'submitted'
    and old.status is distinct from new.status
    and (
      new.respondent_id = (select auth.uid())
      or (select private.is_admin())
    )
  then
    update public.engagements
    set
      status = 'documents_outstanding',
      submitted_at = coalesce(submitted_at, now()),
      updated_at = now()
    where id = new.engagement_id
      and status in ('setup_required', 'interview_in_progress');
  end if;
  return new;
end;
$$;

create or replace function private.mark_clarification_answered()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not new.is_internal and not (select private.is_admin()) then
    update public.clarification_threads
    set status = 'answered', updated_at = now()
    where id = new.thread_id
      and status = 'open';
  end if;
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function private.is_admin() from public, anon;
revoke all on function private.is_org_member(uuid) from public, anon;
revoke all on function private.can_access_engagement(uuid) from public, anon;
revoke all on function private.mark_document_request_uploaded() from public, anon, authenticated;
revoke all on function private.advance_engagement_after_nda() from public, anon, authenticated;
revoke all on function private.advance_engagement_after_interview() from public, anon, authenticated;
revoke all on function private.mark_clarification_answered() from public, anon, authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_org_member(uuid) to authenticated;
grant execute on function private.can_access_engagement(uuid) to authenticated;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();
create trigger organisations_set_updated_at
before update on public.organisations
for each row execute function private.set_updated_at();
create trigger engagements_set_updated_at
before update on public.engagements
for each row execute function private.set_updated_at();
create trigger questionnaire_sections_set_updated_at
before update on public.questionnaire_sections
for each row execute function private.set_updated_at();
create trigger questionnaire_questions_set_updated_at
before update on public.questionnaire_questions
for each row execute function private.set_updated_at();
create trigger questionnaire_responses_set_updated_at
before update on public.questionnaire_responses
for each row execute function private.set_updated_at();
create trigger questionnaire_responses_advance_engagement
after update of status on public.questionnaire_responses
for each row execute function private.advance_engagement_after_interview();
create trigger questionnaire_response_items_set_updated_at
before update on public.questionnaire_response_items
for each row execute function private.set_updated_at();
create trigger document_requests_set_updated_at
before update on public.document_requests
for each row execute function private.set_updated_at();
create trigger documents_set_updated_at
before update on public.documents
for each row execute function private.set_updated_at();
create trigger documents_mark_request_uploaded
after insert on public.documents
for each row execute function private.mark_document_request_uploaded();
create trigger nda_acceptances_advance_engagement
after insert on public.nda_acceptances
for each row execute function private.advance_engagement_after_nda();
create trigger clarification_threads_set_updated_at
before update on public.clarification_threads
for each row execute function private.set_updated_at();
create trigger clarification_messages_mark_answered
after insert on public.clarification_messages
for each row execute function private.mark_clarification_answered();
create trigger analysis_findings_set_updated_at
before update on public.analysis_findings
for each row execute function private.set_updated_at();
create trigger deliverables_set_updated_at
before update on public.deliverables
for each row execute function private.set_updated_at();
create trigger deliverable_sections_set_updated_at
before update on public.deliverable_sections
for each row execute function private.set_updated_at();
create trigger internal_notes_set_updated_at
before update on public.internal_notes
for each row execute function private.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_organisation_id uuid;
  new_engagement_id uuid;
  requested_name text;
begin
  requested_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'company_name', '')), '');

  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    coalesce(new.email, ''),
    'client'
  );

  insert into public.organisations (name, legal_name)
  values (coalesce(requested_name, 'Neues Mandat'), requested_name)
  returning id into new_organisation_id;

  insert into public.organisation_members (organisation_id, user_id, role)
  values (new_organisation_id, new.id, 'owner');

  insert into public.engagements (
    organisation_id,
    client_owner_id,
    title
  )
  values (
    new_organisation_id,
    new.id,
    concat('Buyer Objection Report · ', coalesce(requested_name, 'Neues Mandat'))
  )
  returning id into new_engagement_id;

  insert into public.questionnaire_responses (engagement_id, respondent_id)
  values (new_engagement_id, new.id);

  insert into public.document_requests (
    engagement_id,
    title,
    description,
    category,
    sort_order
  )
  values
    (new_engagement_id, 'Jahresabschlüsse', 'Letzte drei abgeschlossene Geschäftsjahre.', 'financial', 10),
    (new_engagement_id, 'Aktuelle BWA und Summen-/Saldenliste', 'Aktueller Monat und Vergleichszeitraum.', 'financial', 20),
    (new_engagement_id, 'Kundenumsatzanalyse', 'Umsatz nach Kunde für mindestens 24 Monate.', 'customers', 30),
    (new_engagement_id, 'Wesentliche Kundenverträge', 'Verträge der wichtigsten Kundenbeziehungen.', 'contracts', 40),
    (new_engagement_id, 'Organigramm und Rollen', 'Aktuelles Organigramm mit Verantwortlichkeiten.', 'management', 50),
    (new_engagement_id, 'Gesellschaftsunterlagen', 'Aktuelle gesellschaftsrechtliche Kerndokumente.', 'corporate', 60);

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

alter table public.profiles enable row level security;
alter table public.organisations enable row level security;
alter table public.organisation_members enable row level security;
alter table public.engagements enable row level security;
alter table public.nda_versions enable row level security;
alter table public.nda_acceptances enable row level security;
alter table public.questionnaire_sections enable row level security;
alter table public.questionnaire_questions enable row level security;
alter table public.questionnaire_options enable row level security;
alter table public.questionnaire_responses enable row level security;
alter table public.questionnaire_response_items enable row level security;
alter table public.document_requests enable row level security;
alter table public.documents enable row level security;
alter table public.document_versions enable row level security;
alter table public.clarification_threads enable row level security;
alter table public.clarification_messages enable row level security;
alter table public.analysis_findings enable row level security;
alter table public.deliverables enable row level security;
alter table public.deliverable_sections enable row level security;
alter table public.internal_notes enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_select_self_or_admin
on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select private.is_admin()));

create policy profiles_update_self_or_admin
on public.profiles for update to authenticated
using (id = (select auth.uid()) or (select private.is_admin()))
with check (id = (select auth.uid()) or (select private.is_admin()));

create policy organisations_select_member
on public.organisations for select to authenticated
using ((select private.is_org_member(id)));

create policy organisations_update_admin
on public.organisations for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy organisation_members_select_member
on public.organisation_members for select to authenticated
using ((select private.is_org_member(organisation_id)));

create policy organisation_members_admin_write
on public.organisation_members for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy engagements_select_member
on public.engagements for select to authenticated
using ((select private.can_access_engagement(id)));

create policy engagements_admin_write
on public.engagements for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy nda_versions_authenticated_read
on public.nda_versions for select to authenticated
using (is_active or (select private.is_admin()));

create policy nda_versions_admin_write
on public.nda_versions for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy nda_acceptances_select_member
on public.nda_acceptances for select to authenticated
using ((select private.can_access_engagement(engagement_id)));

create policy nda_acceptances_insert_self
on public.nda_acceptances for insert to authenticated
with check (
  user_id = (select auth.uid())
  and (select private.can_access_engagement(engagement_id))
  and exists (
    select 1 from public.nda_versions v
    where v.id = nda_version_id
      and v.is_active
      and v.version = nda_version
      and v.content_hash = nda_acceptances.content_hash
  )
);

create policy questionnaire_sections_read
on public.questionnaire_sections for select to authenticated
using (is_active or (select private.is_admin()));
create policy questionnaire_questions_read
on public.questionnaire_questions for select to authenticated
using (is_active or (select private.is_admin()));
create policy questionnaire_options_read
on public.questionnaire_options for select to authenticated
using (true);

create policy questionnaire_definitions_admin_write
on public.questionnaire_sections for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));
create policy questionnaire_questions_admin_write
on public.questionnaire_questions for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));
create policy questionnaire_options_admin_write
on public.questionnaire_options for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy questionnaire_responses_select_member
on public.questionnaire_responses for select to authenticated
using ((select private.can_access_engagement(engagement_id)));
create policy questionnaire_responses_insert_member
on public.questionnaire_responses for insert to authenticated
with check (
  respondent_id = (select auth.uid())
  and (select private.can_access_engagement(engagement_id))
);
create policy questionnaire_responses_update_owner_or_admin
on public.questionnaire_responses for update to authenticated
using (respondent_id = (select auth.uid()) or (select private.is_admin()))
with check (respondent_id = (select auth.uid()) or (select private.is_admin()));

create policy questionnaire_items_select_member
on public.questionnaire_response_items for select to authenticated
using (
  exists (
    select 1 from public.questionnaire_responses r
    where r.id = response_id
      and (select private.can_access_engagement(r.engagement_id))
  )
);
create policy questionnaire_items_insert_owner
on public.questionnaire_response_items for insert to authenticated
with check (
  answered_by = (select auth.uid())
  and exists (
    select 1 from public.questionnaire_responses r
    where r.id = response_id
      and (r.respondent_id = (select auth.uid()) or (select private.is_admin()))
      and r.status in ('draft', 'reopened')
  )
);
create policy questionnaire_items_update_owner
on public.questionnaire_response_items for update to authenticated
using (
  exists (
    select 1 from public.questionnaire_responses r
    where r.id = response_id
      and (r.respondent_id = (select auth.uid()) or (select private.is_admin()))
      and r.status in ('draft', 'reopened')
  )
)
with check (
  answered_by = (select auth.uid()) or (select private.is_admin())
);

create policy document_requests_select_member
on public.document_requests for select to authenticated
using ((select private.can_access_engagement(engagement_id)));
create policy document_requests_admin_write
on public.document_requests for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy documents_select_member
on public.documents for select to authenticated
using ((select private.can_access_engagement(engagement_id)));
create policy documents_insert_member
on public.documents for insert to authenticated
with check (
  uploaded_by = (select auth.uid())
  and (select private.is_org_member(organisation_id))
  and (select private.can_access_engagement(engagement_id))
  and storage_path like organisation_id::text || '/' || engagement_id::text || '/%'
);
create policy documents_update_member
on public.documents for update to authenticated
using ((select private.can_access_engagement(engagement_id)))
with check (
  (select private.can_access_engagement(engagement_id))
  and (
    uploaded_by = (select auth.uid())
    or (select private.is_admin())
  )
);
create policy documents_delete_admin
on public.documents for delete to authenticated
using ((select private.is_admin()));

create policy document_versions_select_member
on public.document_versions for select to authenticated
using (
  exists (
    select 1 from public.documents d
    where d.id = document_id
      and (select private.can_access_engagement(d.engagement_id))
  )
);
create policy document_versions_insert_member
on public.document_versions for insert to authenticated
with check (
  uploaded_by = (select auth.uid())
  and exists (
    select 1 from public.documents d
    where d.id = document_id
      and (select private.can_access_engagement(d.engagement_id))
  )
);

create policy clarification_threads_select_member
on public.clarification_threads for select to authenticated
using ((select private.can_access_engagement(engagement_id)));
create policy clarification_threads_admin_insert
on public.clarification_threads for insert to authenticated
with check ((select private.is_admin()));
create policy clarification_threads_admin_update
on public.clarification_threads for update to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy clarification_messages_select_member
on public.clarification_messages for select to authenticated
using (
  (not is_internal or (select private.is_admin()))
  and exists (
    select 1 from public.clarification_threads t
    where t.id = thread_id
      and (select private.can_access_engagement(t.engagement_id))
  )
);
create policy clarification_messages_insert_member
on public.clarification_messages for insert to authenticated
with check (
  author_id = (select auth.uid())
  and (not is_internal or (select private.is_admin()))
  and exists (
    select 1 from public.clarification_threads t
    where t.id = thread_id
      and t.status <> 'closed'
      and (select private.can_access_engagement(t.engagement_id))
  )
);

create policy analysis_findings_select_published
on public.analysis_findings for select to authenticated
using (
  (select private.is_admin())
  or (
    client_visible
    and status = 'approved'
    and (select private.can_access_engagement(engagement_id))
  )
);
create policy analysis_findings_admin_write
on public.analysis_findings for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy deliverables_select_published
on public.deliverables for select to authenticated
using (
  (select private.is_admin())
  or (
    status = 'published'
    and published_at is not null
    and (select private.can_access_engagement(engagement_id))
  )
);
create policy deliverables_admin_write
on public.deliverables for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy deliverable_sections_select_published
on public.deliverable_sections for select to authenticated
using (
  exists (
    select 1 from public.deliverables d
    where d.id = deliverable_id
      and (
        (select private.is_admin())
        or (
          d.status = 'published'
          and d.published_at is not null
          and (select private.can_access_engagement(d.engagement_id))
        )
      )
  )
);
create policy deliverable_sections_admin_write
on public.deliverable_sections for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy internal_notes_admin_only
on public.internal_notes for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy audit_logs_admin_select
on public.audit_logs for select to authenticated
using ((select private.is_admin()));
create policy audit_logs_authenticated_insert
on public.audit_logs for insert to authenticated
with check (
  actor_id = (select auth.uid())
  and (
    engagement_id is null
    or (select private.can_access_engagement(engagement_id))
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'deal-room-documents',
  'deal-room-documents',
  false,
  26214400,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/png',
    'image/jpeg'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy storage_dealroom_select
on storage.objects for select to authenticated
using (
  bucket_id = 'deal-room-documents'
  and (storage.foldername(name))[1] ~* '^[0-9a-f-]{36}$'
  and (storage.foldername(name))[2] ~* '^[0-9a-f-]{36}$'
  and (select private.is_org_member(((storage.foldername(name))[1])::uuid))
  and (select private.can_access_engagement(((storage.foldername(name))[2])::uuid))
);

create policy storage_dealroom_insert
on storage.objects for insert to authenticated
with check (
  bucket_id = 'deal-room-documents'
  and (storage.foldername(name))[1] ~* '^[0-9a-f-]{36}$'
  and (storage.foldername(name))[2] ~* '^[0-9a-f-]{36}$'
  and (select private.is_org_member(((storage.foldername(name))[1])::uuid))
  and (select private.can_access_engagement(((storage.foldername(name))[2])::uuid))
);

create policy storage_dealroom_update
on storage.objects for update to authenticated
using (
  bucket_id = 'deal-room-documents'
  and (storage.foldername(name))[2] ~* '^[0-9a-f-]{36}$'
  and (select private.can_access_engagement(((storage.foldername(name))[2])::uuid))
)
with check (
  bucket_id = 'deal-room-documents'
  and (storage.foldername(name))[1] ~* '^[0-9a-f-]{36}$'
  and (storage.foldername(name))[2] ~* '^[0-9a-f-]{36}$'
  and (select private.is_org_member(((storage.foldername(name))[1])::uuid))
  and (select private.can_access_engagement(((storage.foldername(name))[2])::uuid))
);

create policy storage_dealroom_delete
on storage.objects for delete to authenticated
using (
  bucket_id = 'deal-room-documents'
  and (storage.foldername(name))[2] ~* '^[0-9a-f-]{36}$'
  and (
    owner_id = (select auth.uid()::text)
    or (select private.is_admin())
  )
  and (select private.can_access_engagement(((storage.foldername(name))[2])::uuid))
);

revoke all on all tables in schema public from anon, authenticated;
grant usage on schema public to authenticated;
grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;
grant select on public.organisations, public.organisation_members, public.engagements to authenticated;
grant select on public.nda_versions to authenticated;
grant select, insert on public.nda_acceptances to authenticated;
grant select on public.questionnaire_sections, public.questionnaire_questions, public.questionnaire_options to authenticated;
grant select, insert, update on public.questionnaire_responses, public.questionnaire_response_items to authenticated;
grant select on public.document_requests to authenticated;
grant select, insert, update, delete on public.documents to authenticated;
grant select, insert on public.document_versions to authenticated;
grant select, insert, update on public.clarification_threads, public.clarification_messages to authenticated;
grant select, insert, update, delete on public.analysis_findings, public.deliverables, public.deliverable_sections to authenticated;
grant select, insert, update, delete on public.internal_notes to authenticated;
grant select, insert on public.audit_logs to authenticated;
grant insert, select, update, delete on storage.objects to authenticated;

insert into public.nda_versions (
  version,
  title,
  content,
  content_hash,
  is_active,
  effective_at
)
values (
  'technical-draft-2026-07',
  'Verschwiegenheitsvereinbarung – technische Vorlage',
  'TECHNISCHE VORLAGE – VOR OPERATIVER NUTZUNG JURISTISCH ZU PRÜFEN. Die Parteien beabsichtigen, vertrauliche Informationen ausschließlich zur Vorbereitung des Coridoor Buyer Objection Reports auszutauschen. Vertrauliche Informationen dürfen nur zweckgebunden genutzt, angemessen geschützt und nur berechtigten Personen zugänglich gemacht werden. Gesetzliche Offenlegungspflichten bleiben unberührt. Aufbewahrung, Löschung, Haftung, Laufzeit, Gerichtsstand und anwendbares Recht sind in der finalen anwaltlich freigegebenen Fassung verbindlich zu regeln.',
  encode(extensions.digest('coridoor-nda-technical-draft-2026-07', 'sha256'), 'hex'),
  true,
  now()
);

commit;
