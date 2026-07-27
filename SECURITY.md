# Security

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability or for data belonging to
an engagement. Contact the Coridoor operator through the private channel shown
in the production imprint. Include the affected route, impact, reproduction
steps, and only synthetic evidence.

## Implemented controls

- Supabase Auth with confirmed email and server-side session validation
- Row Level Security on every application table
- private Storage bucket with organisation and engagement scoped policies
- short-lived signed download URLs
- MIME type, extension, and file-size allowlists
- immutable NDA acceptance records with version and content hash
- controlled publication of findings and deliverables
- audit events for sensitive workflow actions
- CSP-adjacent browser headers, no indexing of protected areas, and no-store
  caching for authenticated routes

Production legal text, SMTP, retention periods, incident contacts, and the
operator identity must be approved and configured before customer onboarding.
