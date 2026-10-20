/* OR-WEB-0101: Set apiBase only after deploying the Cloudflare D1 vote service.
   Example: apiBase: 'https://oldroot-vote.example.workers.dev'
   A blank apiBase intentionally keeps public voting closed instead of recording fake local votes. */
window.OLDROOT_POLL_CONFIG = Object.freeze({ apiBase: '' });
