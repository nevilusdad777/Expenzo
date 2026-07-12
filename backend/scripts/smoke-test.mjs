/**
 * API smoke test — run while backend is up:
 *   node backend/scripts/smoke-test.mjs
 *
 * Env:
 *   SMOKE_BASE_URL=http://localhost:5000
 *   SMOKE_TEST_PIN=123456   (required if PIN already configured)
 */

const BASE = process.env.SMOKE_BASE_URL ?? 'http://localhost:5000';
const TEST_PIN = process.env.SMOKE_TEST_PIN ?? '123456';

let cookieHeader = '';

function storeCookies(res) {
  const setCookies = typeof res.headers.getSetCookie === 'function'
    ? res.headers.getSetCookie()
    : [];
  if (setCookies.length === 0) {
    const single = res.headers.get('set-cookie');
    if (single) setCookies.push(single);
  }
  for (const raw of setCookies) {
    const pair = raw.split(';')[0];
    const [name] = pair.split('=');
    const existing = cookieHeader
      .split('; ')
      .filter(Boolean)
      .filter((c) => !c.startsWith(`${name}=`));
    existing.push(pair);
    cookieHeader = existing.join('; ');
  }
}

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  storeCookies(res);
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, data, ok: res.ok };
}

function assert(name, condition, detail = '') {
  if (!condition) {
    throw new Error(`FAIL: ${name}${detail ? ` — ${detail}` : ''}`);
  }
  console.log(`  ✓ ${name}`);
}

async function main() {
  console.log(`\nSmoke test → ${BASE}\n`);

  let r = await request('GET', '/api/health');
  assert('health', r.ok && r.data?.success === true, `status ${r.status}`);

  r = await request('GET', '/api/health/db');
  assert('health/db', r.ok, `status ${r.status}`);

  r = await request('GET', '/api/auth/status');
  assert('auth/status', r.ok, `status ${r.status}`);

  const pinConfigured = r.data?.data?.pinConfigured;

  if (!pinConfigured) {
    r = await request('POST', '/api/auth/setup', {
      pin: TEST_PIN,
      confirmPin: TEST_PIN,
    });
    assert('auth/setup', r.status === 201, JSON.stringify(r.data));
  } else {
    r = await request('POST', '/api/auth/verify', { pin: TEST_PIN, method: 'pin' });
    assert('auth/verify', r.ok, r.data?.message ?? `status ${r.status}`);
  }

  r = await request('GET', '/api/accounts');
  assert('accounts list', r.ok && Array.isArray(r.data?.data), `status ${r.status}`);

  r = await request('GET', '/api/categories');
  assert('categories list', r.ok && Array.isArray(r.data?.data), `status ${r.status}`);

  r = await request('GET', '/api/transactions?limit=5');
  assert('transactions list', r.ok && Array.isArray(r.data?.data), `status ${r.status}`);

  r = await request('GET', '/api/dashboard/summary');
  assert('dashboard summary', r.ok && r.data?.data?.totalBalance !== undefined, `status ${r.status}`);

  r = await request('GET', `/api/dashboard/trend?year=${new Date().getFullYear()}`);
  assert('dashboard trend', r.ok && Array.isArray(r.data?.data), `status ${r.status}`);

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const end = now.toISOString();
  r = await request('GET', `/api/reports?startDate=${start}&endDate=${end}&groupBy=day`);
  assert('reports', r.ok && r.data?.data?.summary, `status ${r.status}`);

  r = await request(
    'GET',
    `/api/charts/category-trend?year=${now.getFullYear()}&type=EXPENSE&limit=3`
  );
  assert('charts category-trend', r.ok && Array.isArray(r.data?.data?.data), `status ${r.status}`);

  r = await request('GET', `/api/charts/yearly-summary?startYear=${now.getFullYear() - 2}&endYear=${now.getFullYear()}`);
  assert('charts yearly-summary', r.ok && Array.isArray(r.data?.data?.years), `status ${r.status}`);

  r = await request('GET', '/api/auth/settings/auto-lock');
  assert('settings auto-lock', r.ok && r.data?.data?.autoLockMinutes, `status ${r.status}`);

  console.log('\nAll smoke tests passed.\n');
}

main().catch((err) => {
  console.error(`\n${err.message}\n`);
  console.error('Tip: set SMOKE_TEST_PIN if your PIN is not 123456.');
  process.exit(1);
});
