-- Static product definitions only. User and engagement data is created through Auth.
insert into public.questionnaire_sections (key, title, description, sort_order)
values
  ('company', 'Unternehmensprofil', 'Firmierung, Branche und Leistungsversprechen.', 10),
  ('financials', 'Finanzielle Entwicklung', 'Umsatz und Ergebnisentwicklung.', 20),
  ('earnings', 'Ergebnisqualität', 'Bereinigungen und wiederkehrende Ergebnisbeiträge.', 30),
  ('customers', 'Kundenstruktur', 'Konzentration, Laufzeiten und Abhängigkeiten.', 40),
  ('commercial', 'Umsatzwiederholung und Verträge', 'Umsatzmodell und Pipelinequalität.', 50),
  ('dependency', 'Founder Dependency', 'Operative und kommerzielle Inhaberabhängigkeit.', 60),
  ('management', 'Management und Schlüsselpersonen', 'Führungstiefe und Vertretbarkeit.', 70),
  ('operations', 'Operative Prozesse', 'Dokumentation und Prozessstabilität.', 80),
  ('data', 'Datenqualität und Reporting', 'Belastbarkeit und Aktualität des Reportings.', 90),
  ('technology', 'Technologie und Systeme', 'Systemlandschaft und kritische Abhängigkeiten.', 100),
  ('risks', 'Offene Risiken', 'Bereits bekannte Deal- und Betriebsrisiken.', 110),
  ('review', 'Review und Bestätigung', 'Vollständigkeitsbestätigung.', 120)
on conflict (key) do update set
  title = excluded.title,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true;

with questions (
  section_key,
  key,
  label,
  description,
  kind,
  is_required,
  validation,
  condition,
  sort_order
) as (
  values
    ('company', 'company_legal_name', 'Vollständige Firmierung', null, 'text', true, '{}'::jsonb, null::jsonb, 10),
    ('company', 'company_industry', 'Branche und Kernleistung', 'Beschreiben Sie knapp, womit das Unternehmen den überwiegenden Umsatz erzielt.', 'textarea', true, '{}'::jsonb, null::jsonb, 20),
    ('financials', 'revenue_current', 'Umsatz des letzten abgeschlossenen Geschäftsjahres', null, 'currency', true, '{"min":0}'::jsonb, null::jsonb, 10),
    ('financials', 'ebitda_current', 'Bereinigtes EBITDA des letzten Geschäftsjahres', null, 'currency', true, '{}'::jsonb, null::jsonb, 20),
    ('earnings', 'adjustments_present', 'Enthält das Ergebnis Bereinigungen?', null, 'boolean', true, '{}'::jsonb, null::jsonb, 10),
    ('earnings', 'adjustments_detail', 'Art, Betrag und Beleglage der Bereinigungen', 'Trennen Sie wiederkehrende von einmaligen Effekten.', 'textarea', true, '{}'::jsonb, '{"questionId":"adjustments_present","operator":"equals","value":true}'::jsonb, 20),
    ('customers', 'largest_customer_share', 'Umsatzanteil des größten Kunden', null, 'percent', true, '{"min":0,"max":100}'::jsonb, null::jsonb, 10),
    ('customers', 'largest_customer_contract', 'Vertragslaufzeit, Kündigungsfrist und Wechselkosten', null, 'textarea', true, '{}'::jsonb, '{"questionId":"largest_customer_share","operator":"greaterThan","value":20}'::jsonb, 20),
    ('commercial', 'revenue_model', 'Umsatzmodell', null, 'multiple', true, '{}'::jsonb, null::jsonb, 10),
    ('commercial', 'pipeline_quality', 'Wie belastbar ist die dokumentierte Vertriebspipeline?', null, 'single', true, '{}'::jsonb, null::jsonb, 20),
    ('dependency', 'founder_sales', 'Übernimmt der Inhaber zentrale Vertriebsaktivitäten?', null, 'boolean', true, '{}'::jsonb, null::jsonb, 10),
    ('dependency', 'founder_sales_share', 'Anteil persönlich gewonnener oder betreuter Kunden', null, 'percent', true, '{"min":0,"max":100}'::jsonb, '{"questionId":"founder_sales","operator":"equals","value":true}'::jsonb, 20),
    ('management', 'management_depth', 'Welche Funktionen können sechs Monate ohne den Inhaber operieren?', null, 'textarea', true, '{}'::jsonb, null::jsonb, 10),
    ('operations', 'core_processes', 'Welche Kernprozesse sind dokumentiert und vertretbar?', null, 'textarea', true, '{}'::jsonb, null::jsonb, 10),
    ('data', 'reporting_close', 'Zeit bis zum belastbaren Monatsabschluss', null, 'single', true, '{}'::jsonb, null::jsonb, 10),
    ('technology', 'systems', 'Geschäftskritische Systeme und bekannte Abhängigkeiten', null, 'textarea', true, '{}'::jsonb, null::jsonb, 10),
    ('risks', 'open_risks', 'Welche Themen würde ein kritischer Käufer zuerst ansprechen?', null, 'textarea', true, '{}'::jsonb, null::jsonb, 10),
    ('review', 'confirmation', 'Ich bestätige, dass die Angaben nach bestem Wissen vollständig sind.', null, 'boolean', true, '{}'::jsonb, null::jsonb, 10)
)
insert into public.questionnaire_questions (
  section_id,
  key,
  label,
  description,
  kind,
  is_required,
  validation,
  condition,
  sort_order
)
select
  section.id,
  questions.key,
  questions.label,
  questions.description,
  questions.kind,
  questions.is_required,
  questions.validation,
  questions.condition,
  questions.sort_order
from questions
join public.questionnaire_sections section on section.key = questions.section_key
on conflict (key) do update set
  section_id = excluded.section_id,
  label = excluded.label,
  description = excluded.description,
  kind = excluded.kind,
  is_required = excluded.is_required,
  validation = excluded.validation,
  condition = excluded.condition,
  sort_order = excluded.sort_order,
  is_active = true;

with options (question_key, value, label, sort_order) as (
  values
    ('revenue_model', 'recurring', 'Wiederkehrende Verträge', 10),
    ('revenue_model', 'framework', 'Rahmenverträge', 20),
    ('revenue_model', 'projects', 'Projektgeschäft', 30),
    ('revenue_model', 'transactional', 'Transaktionsbasiert', 40),
    ('revenue_model', 'one_off', 'Einmalverkauf', 50),
    ('pipeline_quality', 'crm_weighted', 'CRM-basiert und gewichtet', 10),
    ('pipeline_quality', 'partial', 'Teilweise dokumentiert', 20),
    ('pipeline_quality', 'informal', 'Überwiegend informell', 30),
    ('reporting_close', 'ten_days', 'Bis 10 Arbeitstage', 10),
    ('reporting_close', 'twenty_days', '11–20 Arbeitstage', 20),
    ('reporting_close', 'over_twenty', 'Mehr als 20 Arbeitstage', 30),
    ('reporting_close', 'none', 'Kein standardisierter Abschluss', 40)
)
insert into public.questionnaire_options (question_id, value, label, sort_order)
select question.id, options.value, options.label, options.sort_order
from options
join public.questionnaire_questions question on question.key = options.question_key
on conflict (question_id, value) do update set
  label = excluded.label,
  sort_order = excluded.sort_order;
