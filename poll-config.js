/* OR-WEB-0101: Live Cloudflare voting API.
   Public voting remains OFF until Cloudflare's POLL_OPEN is explicitly set to true.
   The URL is public; never place ADMIN_TOKEN or VOTE_PEPPER in website files. */
window.OLDROOT_POLL_CONFIG = Object.freeze({
  apiBase: 'https://oldroot-reader-poll.mmerancio02.workers.dev'
});
