// Public URL of the Cloudflare Worker that stores leads.
// Overridable at build time via PUBLIC_LEADS_API env var.
export const LEADS_API: string =
  (import.meta.env.PUBLIC_LEADS_API as string | undefined) ||
  'https://res-prod-leads.apolitov69.workers.dev';
