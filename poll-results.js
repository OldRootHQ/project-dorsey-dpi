/* OR-WEB-0101: Private live poll results. Token stays in RAM, never in browser storage. */
(() => {
  'use strict';
  const panel = document.getElementById('pollResultsChart');
  const form = document.getElementById('pollResultsLogin');
  const tokenInput = document.getElementById('pollAdminToken');
  const state = document.getElementById('pollAdminStatus');
  const total = document.getElementById('pollResultsTotal');
  const updated = document.getElementById('pollResultsUpdated');
  const refresh = document.getElementById('pollResultsRefresh');
  const logout = document.getElementById('pollResultsLogout');
  if (!panel || !form || !tokenInput || !state || !total || !updated || !refresh || !logout) return;

  const raw = window.OLDROOT_POLL_CONFIG && window.OLDROOT_POLL_CONFIG.apiBase;
  let endpoint = '';
  try {
    const u = new URL(raw);
    if (u.protocol === 'https:' && !u.username && !u.password && !u.search && !u.hash) endpoint = u.href.replace(/\/$/, '');
  } catch (_) {}
  let token = '';
  let timer = null;
  const candidates = ['Gila Monster', 'Latch', 'Anchorage', 'Flying Saucer'];
  const say = text => { state.textContent = text; };

  function render(data) {
    const n = Number(data.total);
    if (!Number.isSafeInteger(n) || n < 0 || !Array.isArray(data.votes)) throw Error('bad result');
    const counts = new Map(data.votes.filter(x => candidates.includes(x.choice) && Number.isSafeInteger(x.count) && x.count >= 0).map(x => [x.choice, x.count]));
    if (candidates.reduce((s,c) => s + (counts.get(c) || 0),0) !== n) throw Error('bad totals');
    total.textContent = n.toLocaleString();
    panel.replaceChildren();
    for (const name of candidates) {
      const count = counts.get(name) || 0;
      const pct = n ? (count * 100 / n) : 0;
      const row = document.createElement('div'); row.className = 'result-row';
      const heading = document.createElement('div'); heading.className = 'result-label';
      const nameEl = document.createElement('strong'); nameEl.textContent = name;
      const score = document.createElement('span'); score.textContent = count.toLocaleString() + ' votes · ' + pct.toFixed(1) + '%';
      heading.append(nameEl, score);
      const track = document.createElement('div'); track.className = 'result-track';
      track.setAttribute('role','progressbar');track.setAttribute('aria-label',name+' vote share');
      track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');track.setAttribute('aria-valuenow',pct.toFixed(1));
      const fill = document.createElement('div');fill.className='result-fill';fill.style.width=pct.toFixed(1)+'%';
      track.append(fill);row.append(heading,track);panel.append(row);
    }
    updated.textContent = 'Updated ' + new Date().toLocaleTimeString() + ' · Refreshes every 30 seconds while signed in';
  }
  async function load() {
    if (!endpoint || !token) return;
    try {
      const response = await fetch(endpoint + '/api/admin/results', {
        headers: { 'Authorization': 'Bearer ' + token }, cache: 'no-store'
      });
      if (response.status === 401) { throw Error('Invalid access token.'); }
      if (!response.ok) throw Error('The vote service could not be reached.');
      render(await response.json());
      say('Private results connected.');
    } catch (error) {
      say(error.message || 'Could not load results.');
      if (/Invalid access/.test(error.message || '')) { token = ''; clearInterval(timer); timer = null; }
    }
  }
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!endpoint) { say('Backend not connected yet. See the deployment guide.'); return; }
    token = tokenInput.value.trim();tokenInput.value = '';
    if (!token) return;
    await load();
    if (token && !timer) timer = setInterval(load, 30000);
  });
  refresh.addEventListener('click', load);
  logout.addEventListener('click', () => {
    token = '';clearInterval(timer);timer = null;
    total.textContent = '—';panel.replaceChildren();updated.textContent = '';
    say('Signed out. No login token stored.');
  });
  if (!endpoint) say('Setup needed: the vote service has not been deployed yet.');
})();
