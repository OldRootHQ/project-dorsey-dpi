# OldRoot Reader's Choice — real voting backend

The OldRoot website is static GitHub Pages. Real community votes **cannot** be reliably counted or privately administered using localStorage. This independent Cloudflare Worker + D1 service stores shared votes; no third-party script is inserted into the existing homepage.

## Before turning on voting

1. Create or sign into **your own Cloudflare account**. This does not require migrating `oldroothq.com` away from its current hosting.
2. Install Wrangler locally (`npm install -g wrangler`) and run `wrangler login`.
3. Create D1 storage: `wrangler d1 create oldroot-votes`. Paste its `database_id` into `wrangler.toml`.
4. From this directory, run `wrangler d1 execute oldroot-votes --remote --file=./schema.sql`.
5. Set **two different random, secret values**, at least 32 characters each, using:
   - `wrangler secret put VOTE_PEPPER`
   - `wrangler secret put ADMIN_TOKEN`
   Generate them using a secure password manager; do not commit, paste into chat, or email them. `ADMIN_TOKEN` is the credential for your private results dashboard.
6. Run `wrangler deploy`. Copy the deployed HTTPS Worker base URL, e.g. `https://oldroot-reader-poll.<your-subdomain>.workers.dev`, **without** `/api`.
7. Edit the public repo's `poll-config.js` and fill in that URL as `apiBase`. Do not put the admin token or pepper there.
8. Visit `https://oldroothq.com/` and cast a test vote on a separate browser/device. Visit the unlisted `https://oldroothq.com/poll-results.html`, enter your `ADMIN_TOKEN`, and verify the count. **Remove test votes** only through your private database console if needed before launch.

## Behavior and limits

- Visitors choose one of Gila Monster, Latch, Anchorage, Flying Saucer. POST `/api/vote` stores one vote per random browser ID and rejects repeats. No public `/results` endpoint exists.
- Votes are saved in Cloudflare D1 with HMAC pseudonymous browser and IP identifiers, no raw IP addresses, emails or names. At most 8 accepted votes per IP each UTC day. This is **basic** anti-abuse, not fraud-proof identification: users can clear browser IDs or use another device or address. Shared networks may hit the daily cap.
- The admin dashboard uses an owner bearer token, held only in page memory. GET `/api/admin/results` returns totals and category counts only when authorized. There is no public link from the homepage to this dashboard.
- Cross-origin requests are allowed only from `ALLOWED_ORIGIN` (`https://oldroothq.com`). Secret values are set using `wrangler secret`, not stored in GitHub.
- The homepage button remains deliberately disabled until the Worker is connected and `/api/status` confirms voting is open. Local preview selections are **not** counted as community votes.
- Close voting by setting `POLL_OPEN=false` in `wrangler.toml` and redeploying, then optionally announce the winner or publish results separately. Results stay private by default.
- For stronger protection before a large public contest, add Cloudflare Turnstile and bot/rate-limit rules, and consider login-based identity verification.

The Worker project is **not deployed by a GitHub Pages deployment**. It must be connected to the owner's Cloudflare account separately. Never show the private token to website visitors.
