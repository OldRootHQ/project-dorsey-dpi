/* OR-WEB-0101: Reader's Choice live ballot; no local-only vote submissions. */
(() => {
  'use strict';
  const form = document.getElementById('oldrootPollForm');
  const status = document.getElementById('oldrootPollStatus');
  const submit = document.getElementById('oldrootPollSubmit');
  const note = document.getElementById('oldrootPollDisclosure');
  if (!form || !status || !submit) return;

  const names = new Set(['Gila Monster', 'Latch', 'Anchorage', 'Flying Saucer']);
  const rawBase = window.OLDROOT_POLL_CONFIG && window.OLDROOT_POLL_CONFIG.apiBase;
  let apiBase = '';
  if (typeof rawBase === 'string' && rawBase.trim()) {
    try {
      const url = new URL(rawBase);
      if (url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash) {
        apiBase = url.href.replace(/\/$/, '');
      }
    } catch (_) { /* Bad configuration: keep the poll closed. */ }
  }

  let open = false;
  let busy = false;
  const pickKey = 'oldroot-reader-voter-id-v1';
  const say = message => { status.textContent = message; };
  const setBusy = value => {
    busy = value;
    submit.disabled = value || !open;
    submit.textContent = value ? 'Submitting…' : open ? 'Cast my vote →' : 'Voting opens soon';
  };

  // A random pseudonymous per-browser token, never a claim of one-person-one-vote.
  function voterId() {
    let id;
    try { id = localStorage.getItem(pickKey); } catch (_) {}
    if (typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id)) return id;
    id = crypto.randomUUID();
    try { localStorage.setItem(pickKey, id); } catch (_) {}
    return id;
  }

  async function start() {
    setBusy(false);
    if (!apiBase) {
      say('Community voting has not opened. No votes are being collected yet.');
      if (note) note.textContent = 'Live voting and owner-only results will become available when the secure vote service is connected.';
      return;
    }
    say('Checking voting availability…');
    try {
      const response = await fetch(apiBase + '/api/status', { method: 'GET', cache: 'no-store' });
      if (!response.ok) throw Error('status unavailable');
      const data = await response.json();
      open = data.open === true;
      if (!open) {
        say('Community voting is currently closed.');
      } else {
        say('One vote per browser. Results remain private until OldRoot announces the winner.');
      }
    } catch (_) {
      open = false;
      say('Voting is temporarily unavailable. Nothing has been submitted.');
    }
    if (note) note.textContent = 'Votes are recorded only when the live service confirms success. Results are private to OldRoot Studios; one vote per browser with server-side anti-abuse limits.';
    setBusy(false);
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!open || busy || !apiBase) return;
    const choice = new FormData(form).get('nextIssue');
    if (!names.has(choice)) { say('Please select one character.'); return; }
    setBusy(true);
    say('Sending your vote securely…');
    try {
      const response = await fetch(apiBase + '/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice, voterId: voterId() }),
        cache: 'no-store'
      });
      const result = await response.json();
      if (response.ok && result.status === 'recorded') {
        say('Vote confirmed! Thanks for supporting the next OldRoot issue.');
        open = false; // Prevent an accidental second submission in this session.
      } else if (response.status === 409) {
        say('A vote has already been recorded from this browser. Thank you!');
        open = false;
      } else if (response.status === 429) {
        say('Voting is temporarily limited to prevent spam. Please try later.');
      } else if (response.status === 403) {
        say('Voting is closed for now.');
        open = false;
      } else {
        say('Your vote was not confirmed. Please try again later.');
      }
    } catch (_) {
      say('Your vote could not be confirmed. Check your connection before trying again.');
    }
    setBusy(false);
  });

  start();
})();
