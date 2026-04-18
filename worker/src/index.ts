export interface Env {
  LEADS: KVNamespace;
  ADMIN_USER: string;
  ADMIN_PASS: string;
  TG_BOT_TOKEN?: string;
  TG_CHAT_ID?: string;
}

type Lead = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  service: string;
  userAgent?: string;
  origin?: string;
  ip?: string;
};

const ALLOWED_ORIGINS = new Set([
  'https://res-prod.ru',
  'https://www.res-prod.ru',
  'https://polltov.github.io',
  'http://localhost:4321',
  'http://localhost:4333',
  'http://127.0.0.1:4321',
  'http://127.0.0.1:4333',
  'http://127.0.0.1:4334',
]);

function corsHeaders(origin: string | null): Record<string, string> {
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://res-prod.ru';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(obj: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function basicAuthOk(req: Request, env: Env): boolean {
  const h = req.headers.get('Authorization') || '';
  if (!h.startsWith('Basic ')) return false;
  try {
    const decoded = atob(h.slice(6));
    const idx = decoded.indexOf(':');
    if (idx < 0) return false;
    const u = decoded.slice(0, idx);
    const p = decoded.slice(idx + 1);
    return (
      u.length > 0 &&
      p.length > 0 &&
      u === env.ADMIN_USER &&
      p === env.ADMIN_PASS
    );
  } catch {
    return false;
  }
}

async function handleLead(req: Request, env: Env, headers: Record<string, string>) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: 'invalid JSON' }, 400, headers);
  }

  const name = String(body?.name ?? '').trim().slice(0, 200);
  const phone = String(body?.phone ?? '').trim().slice(0, 50);
  const service = String(body?.service ?? '').trim().slice(0, 200);
  const consent = body?.consent === true;

  if (!name || !phone || !service) {
    return json({ ok: false, error: 'missing fields' }, 400, headers);
  }
  if (!consent) {
    return json({ ok: false, error: 'consent required' }, 400, headers);
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const lead: Lead = {
    id,
    createdAt,
    name,
    phone,
    service,
    userAgent: req.headers.get('User-Agent') || undefined,
    origin: req.headers.get('Origin') || undefined,
    ip: req.headers.get('CF-Connecting-IP') || undefined,
  };

  const key = `lead:${createdAt}:${id}`;
  await env.LEADS.put(key, JSON.stringify(lead));

  if (env.TG_BOT_TOKEN && env.TG_CHAT_ID) {
    const text = [
      '🎬 Новая заявка с сайта RES.PROD',
      '',
      `Имя: ${name}`,
      `Телефон: ${phone}`,
      `Тип ролика: ${service}`,
    ].join('\n');
    await fetch(`https://api.telegram.org/bot${env.TG_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TG_CHAT_ID, text }),
    }).catch(() => null);
  }

  return json({ ok: true, id }, 200, headers);
}

async function handleList(req: Request, env: Env, headers: Record<string, string>) {
  if (!basicAuthOk(req, env)) {
    return new Response('Unauthorized', {
      status: 401,
      headers: {
        ...headers,
        'WWW-Authenticate': 'Basic realm="RES.PROD admin", charset="UTF-8"',
      },
    });
  }

  const list = await env.LEADS.list({ prefix: 'lead:', limit: 1000 });
  const leads: Lead[] = [];
  for (const k of list.keys) {
    const v = await env.LEADS.get(k.name);
    if (v) {
      try {
        leads.push(JSON.parse(v) as Lead);
      } catch {
        // skip malformed
      }
    }
  }
  leads.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return json({ ok: true, leads }, 200, headers);
}

async function handleDelete(req: Request, env: Env, headers: Record<string, string>) {
  if (!basicAuthOk(req, env)) {
    return new Response('Unauthorized', { status: 401, headers });
  }
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return json({ ok: false, error: 'id required' }, 400, headers);
  const list = await env.LEADS.list({ prefix: 'lead:' });
  const key = list.keys.find((k) => k.name.endsWith(':' + id));
  if (!key) return json({ ok: false, error: 'not found' }, 404, headers);
  await env.LEADS.delete(key.name);
  return json({ ok: true }, 200, headers);
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const origin = req.headers.get('Origin');
    const headers = corsHeaders(origin);

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    if (url.pathname === '/api/lead' && req.method === 'POST') {
      return handleLead(req, env, headers);
    }
    if (url.pathname === '/api/leads' && req.method === 'GET') {
      return handleList(req, env, headers);
    }
    if (url.pathname === '/api/lead' && req.method === 'DELETE') {
      return handleDelete(req, env, headers);
    }
    if (url.pathname === '/' || url.pathname === '/healthz') {
      return json({ ok: true, service: 'res-prod-leads' }, 200, headers);
    }

    return new Response('Not found', { status: 404, headers });
  },
};
