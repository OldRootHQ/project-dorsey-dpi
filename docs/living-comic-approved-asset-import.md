# OldRoot HQ 2.0 — Approved asset integration

**Draft-only. Do not merge or deploy until the creator reviews the actual website.**

## Canonically approved homepage spotlight order
Two rows by four columns (desktop):
1. Kincast — `#c57a45` café-orange
2. Anchorage — `#174b9a` deep royal blue
3. Isiah Ivory — `#a51f30` crimson
4. Liontone — `#34814b` natural green
5. Agent Emerald — `#123f30` dark green
6. Remedie — `#e3ae38` warm gold
7. Flying Saucer — `#7843ab` purple
8. Gila Monster — `#e97627` orange

Kincast and Gila are diagonally separated. Liontone and Agent Emerald are not neighboring slots. Do not number portraits.

## Correct asset paths once uploaded to the repository

| Spotlight slot | Approved transparent WebP |
| --- | --- |
| Kincast | `assets/approved-home/kincast.webp` |
| Anchorage | `assets/approved-home/anchorage.webp` |
| Isiah Ivory | `assets/approved-home/isiah-ivory.webp` |
| Liontone | `assets/approved-home/liontone.webp` |
| Agent Emerald | `assets/approved-home/agent-emerald.webp` |
| Remedie | `assets/approved-home/remedie.webp` |
| Flying Saucer | `assets/approved-home/flying-saucer.webp` |
| Gila Monster | `assets/approved-home/gila-monster.webp` |
| Main approved logo | `assets/approved-home/primary-logo.webp` |

Corresponding `-master.png` files must also be preserved **byte-for-byte** in the same folder; never manipulate or compress the original master copies. The optimized WebP files are derivatives for web performance, not new illustration designs.

## Safety checks
- Existing code references older repository portraits for six slots; these must be replaced only after the exact approved images have been uploaded.
- Isiah Ivory and Liontone show honest ART IMPORT PENDING placeholders in the draft. Never substitute another character's art.
- Background colors belong in CSS, behind transparent artwork. No permanent gradients, splatters, or color overlays should be baked into the masters.
- The public site contains additional characters beyond the eight-portrait homepage feature; **retain every published character, lore, location, organization and OPI record**.
- Preserve the interactive `#techGlobe` element and its JS on Locations.
- Keep Kincast Issue #1: **Under Observation**, status **In Development**; do not manufacture a working reader or buy button for unlaunched issues.
- Don't merge the draft PR into `main` until real mobile/desktop screenshots and Playwright tests have been reviewed.
