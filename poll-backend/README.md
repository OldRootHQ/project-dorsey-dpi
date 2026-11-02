# OldRoot Reader's Choice — Cloudflare Worker + D1

The OldRoot website is static; real Reader's Choice ballots are recorded through the separately deployed `oldroot-reader-poll` Cloudflare Worker and `oldroot-votes` D1 database. This does NOT require changes to Namecheap, website DNS, or the existing static website host.

## Active ballot: six characters (v2)

1. Gila Monster
2. Agent Emerald
3. Kincast
4. Isiah Ivory
5. Liontone
6. Remedie

**Important deployment order (while `POLL_OPEN=false`):**

1. Keep `POLL_OPEN` **false** in the live Worker's Cloudflare dashboard.
2. In Cloudflare D1 -> `oldroot-votes` -> Console, execute the statements in `schema-v2.sql`. They add a `votes_v2` table plus indexes. No old data is deleted: the original `votes` table remains untouched. Do NOT rerun the historical `schema.sql` for this update.
3. Verify the new table exists with `SELECT COUNT(*) AS votes FROM votes_v2;` (a new ballot should show zero).
4. Edit `oldroot-reader-poll` Worker code in Cloudflare to match `src/worker.js`, then Deploy. **Keep the existing D1 binding `DB`, secrets `ADMIN_TOKEN` and `VOTE_PEPPER`, and the text variables `ALLOWED_ORIGIN=https://oldroothq.com` and `POLL_OPEN=false`.** The Worker is deployed separately, not by source control Pages.
5. Validate `/api/status` returns `{"open":false}`; validate unauthenticated `/api/admin/results` returns `{"error":"Unauthorized"}`.
6. Merge and deploy the website ballot / owner dashboard from the same change. The frontend remains disabled while `POLL_OPEN=false`.
7. On `https://oldroothq.com/poll-results.html`, enter `ADMIN_TOKEN` (from password manager) to confirm **six** result rows with correct zero counts. Never paste the real token into source control, messages, console logs, or website source files.
8. After testing and explicit owner approval, set `POLL_OPEN=true` in Cloudflare. Only then can the homepage collect actual votes.

The site's `poll-config.js` contains the Worker URL, which is public. It must NEVER include either secret.

## Historical data

The original `votes` table enforced the earlier four-character ballot. This update uses a separate `votes_v2` table so the old table is preserved without carrying obsolete votes into the new contest. No destructive migration or dropping tables is required. Later Admin Mode can manage multiple ballots from one admin interface.

The current Worker supports `POST /api/my-vote` with `{ "voterId": "..." }` to retrieve the browser's saved choice, and `POST /api/vote` to create a first vote or update that same row. The vote-change feature requires no additional D1 migration; it uses the existing unique `voter_hash` constraint in `votes_v2`. Deploy the updated Worker before publishing the matching website frontend.

## Safeguards and limitations

- One pseudonymous browser ID per active vote. A reader can change their selection while voting is open; the Worker updates that browser's existing `votes_v2` row, so the old choice loses one count and the new choice gains one. A daily per-IP limit applies to first-time votes. This is not identity verification or fraud-proof protection.
- The Worker HMAC-hashes browser IDs and IP addresses using `VOTE_PEPPER`; raw IPs are not written to D1.
- Owner-only results require a `Bearer ADMIN_TOKEN`; the unlisted owner webpage is not itself private, but its data is protected by authentication.
- Allowed cross-origin browser requests come from `https://oldroothq.com`.
- For high-stakes/large public contests, use stronger controls such as Cloudflare Turnstile, worker-side additional bot/rate limits, and/or authenticated voter accounts.
- Do not publish final results, cast live test votes, or open voting until the owner has checked the complete system.

## Wrangler deployments later

`wrangler.toml` is synchronized to the D1 binding and defaults to `POLL_OPEN="false"`. CLI deployment from `poll-backend` uses `wrangler deploy`, but should only be used after verifying the actual remote environment and secrets. Changes to source control do not deploy the Cloudflare Worker.
