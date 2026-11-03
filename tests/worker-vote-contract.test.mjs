// Isolated, in-memory Worker contract checks. Never talks to live Cloudflare or D1.
// Test credentials are artificial and this suite does not modify production settings.
import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../poll-backend/src/worker.js', import.meta.url), 'utf8');
const worker = (await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'))).default;
const candidates = ['Gila Monster', 'Agent Emerald', 'Kincast', 'Isiah Ivory', 'Liontone', 'Remedie'];
const origin = 'https://oldroothq.com';

class SimulatedD1 {
  constructor() { this.rows = []; this.queries = []; }
  prepare(statement) {
    // If the Worker accidentally queries the original table, fail this test.
    assert.match(statement, /\bvotes_v2\b/, 'must use the new six-candidate table');
    this.queries.push(statement);
    return {
      all: async () => {
        assert.match(statement, /^SELECT choice, COUNT/);
        return { results: candidates.map(choice => ({
          choice, count: this.rows.filter(row => row.choice === choice).length
        })).filter(row => row.count) };
      },
      bind: (...values) => ({
        first: async () => {
          if (statement.startsWith('SELECT choice FROM votes_v2')) {
            const existing = this.rows.find(row => row.voter_hash === values[0]);
            return existing ? { choice: existing.choice } : null;
          }
          if (statement.startsWith('SELECT COUNT(*) AS n')) {
            return { n: this.rows.filter(row => row.ip_hash === values[0] && row.created_at >= values[1]).length };
          }
          throw new Error('Unrecognized SELECT statement');
        },
        run: async () => {
          if (statement.startsWith('UPDATE votes_v2 SET choice=')) {
            const row = this.rows.find(row => row.voter_hash === values[2]);
            if (!row) return { meta: { changes: 0 } };
            assert.ok(candidates.includes(values[0]));
            row.choice = values[0];
            row.ip_hash = values[1];
            return { meta: { changes: 1 } };
          }
          assert.match(statement, /^INSERT OR IGNORE INTO votes_v2/);
          if (this.rows.some(row => row.voter_hash === values[0])) return { meta: { changes: 0 } };
          assert.ok(candidates.includes(values[2]));
          this.rows.push({
            id: this.rows.length + 1,
            voter_hash: values[0],
            ip_hash: values[1],
            choice: values[2],
            created_at: new Date().toISOString()
          });
          return { meta: { changes: 1 } };
        }
      })
    };
  }
}

function environment(db = new SimulatedD1(), open = false) {
  return {
    DB: db,
    VOTE_PEPPER: 'test-only-pepper-not-production-xxxxxxxxxxxxxxxx',
    ADMIN_TOKEN: 'test-only-admin-token-not-production-xxxxxxxxxxx',
    POLL_OPEN: open ? 'true' : 'false',
    ALLOWED_ORIGIN: origin
  };
}

async function call(env, path, { method = 'GET', choice, voterId = randomUUID(), ip = '192.0.2.8', from = origin, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (from !== null) headers.Origin = from;
  if (ip !== null) headers['CF-Connecting-IP'] = ip;
  if (token !== undefined) headers.Authorization = 'Bearer ' + token;
  const request = new Request('https://oldroot-reader-poll.example.invalid' + path, {
    method, headers,
    ...(method === 'POST' ? { body: JSON.stringify({ choice, voterId }) } : {})
  });
  const response = await worker.fetch(request, env);
  return { status: response.status, headers: response.headers, body: await response.json() };
}

test('closed production-like configuration never accepts a vote', async () => {
  const db = new SimulatedD1(), env = environment(db, false);
  const status = await call(env, '/api/status');
  assert.deepEqual(status.body, { open: false });
  const attempt = await call(env, '/api/vote', { method: 'POST', choice: 'Gila Monster' });
  assert.equal(attempt.status, 403);
  assert.deepEqual(attempt.body, { error: 'Voting closed' });
  assert.equal(db.rows.length, 0);
});

test('open mode is ONLY simulated: first vote, same-browser update, all six private totals', async () => {
  const db = new SimulatedD1(), env = environment(db, true);
  const voterId = randomUUID();
  const first = await call(env, '/api/vote', { method: 'POST', choice: 'Gila Monster', voterId });
  assert.equal(first.status, 201);
  assert.deepEqual(first.body, { status: 'recorded', choice: 'Gila Monster' });
  const unchanged = await call(env, '/api/vote', { method: 'POST', choice: 'Gila Monster', voterId });
  assert.equal(unchanged.status, 200);
  assert.deepEqual(unchanged.body, { status: 'unchanged', choice: 'Gila Monster', previousChoice: 'Gila Monster' });
  const updated = await call(env, '/api/vote', { method: 'POST', choice: 'Remedie', voterId });
  assert.equal(updated.status, 200);
  assert.deepEqual(updated.body, { status: 'updated', choice: 'Remedie', previousChoice: 'Gila Monster' });
  const saved = await call(env, '/api/my-vote', { method: 'POST', voterId });
  assert.equal(saved.status, 200);
  assert.deepEqual(saved.body, { hasVote: true, choice: 'Remedie' });
  const second = await call(env, '/api/vote', { method: 'POST', choice: 'Remedie' });
  assert.equal(second.status, 201);
  assert.equal(db.rows.length, 2);
  assert.ok(db.rows.every(row => !('ip' in row) && !('voterId' in row)));
  assert.ok(db.rows.every(row => /^[a-f0-9]{64}$/.test(row.ip_hash) && /^[a-f0-9]{64}$/.test(row.voter_hash)));
  const hidden = await call(env, '/api/admin/results');
  assert.equal(hidden.status, 401);
  assert.deepEqual(hidden.body, { error: 'Unauthorized' });
  const wrong = await call(env, '/api/admin/results', { token: 'invalid-token-invalid-token-xxxxxxxxxxxx' });
  assert.equal(wrong.status, 401);
  const owner = await call(env, '/api/admin/results', { token: env.ADMIN_TOKEN });
  assert.equal(owner.status, 200);
  assert.equal(owner.body.total, 2);
  assert.deepEqual(owner.body.votes, candidates.map(choice => ({
    choice, count: choice === 'Remedie' ? 2 : 0
  })));
});

test('invalid choices and other website origins are blocked before storage', async () => {
  const db = new SimulatedD1(), env = environment(db, true);
  assert.equal((await call(env, '/api/vote', { method: 'POST', choice: 'Flying Saucer' })).status, 400);
  assert.equal((await call(env, '/api/vote', { method: 'POST', choice: 'Gila Monster', voterId: 'test-only' })).status, 400);
  assert.equal((await call(env, '/api/vote', { method: 'POST', choice: 'Gila Monster', from: 'https://other.example' })).status, 403);
  assert.equal((await call(env, '/api/vote', { method: 'POST', choice: 'Gila Monster', from: null })).status, 403);
  assert.equal((await call(env, '/api/vote', { method: 'POST', choice: 'Gila Monster', ip: null })).status, 503);
  assert.equal(db.rows.length, 0);
});

test('IP-based daily throttle blocks ninth accepted vote in simulated database', async () => {
  const db = new SimulatedD1(), env = environment(db, true);
  const ids = [];
  for (let i = 0; i < 8; i += 1) {
    const voterId = randomUUID();
    ids.push(voterId);
    const accepted = await call(env, '/api/vote', { method: 'POST', choice: candidates[i % candidates.length], voterId });
    assert.equal(accepted.status, 201, 'simulated accepted vote #' + (i + 1));
  }
  const changed = await call(env, '/api/vote', { method: 'POST', choice: 'Remedie', voterId: ids[0] });
  assert.equal(changed.status, 200, 'updating an existing vote must not consume a ninth first-vote allowance');
  assert.equal(db.rows.length, 8);
  const ninth = await call(env, '/api/vote', { method: 'POST', choice: 'Remedie' });
  assert.equal(ninth.status, 429);
  assert.deepEqual(ninth.body, { error: 'Rate limited' });
  assert.equal(db.rows.length, 8);
});

test('CORS preflight is limited to OldRoot origin', async () => {
  const env = environment();
  const request = from => new Request('https://oldroot-reader-poll.example.invalid/api/vote', {
    method: 'OPTIONS', headers: { Origin: from, 'Access-Control-Request-Method': 'POST' }
  });
  const allowed = await worker.fetch(request(origin), env);
  assert.equal(allowed.status, 204);
  assert.equal(allowed.headers.get('Access-Control-Allow-Origin'), origin);
  const blocked = await worker.fetch(request('https://other.example'), env);
  assert.equal(blocked.status, 403);
});
