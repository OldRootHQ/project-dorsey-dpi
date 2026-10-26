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

## Verified approved-art paths on the draft branch

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
- All eight exact approved portraits and the primary logo are now uploaded to the draft. The original existing dossier and registry artwork remain intact.
- Isiah Ivory and Liontone now have directly referenced approved portrait assets on the homepage (without invented dossier links). All eight render without JavaScript; never substitute another character's artwork.
- Background colors belong in CSS, behind transparent artwork. No permanent gradients, splatters, or color overlays should be baked into the masters.
- The public site contains additional characters beyond the eight-portrait homepage feature; **retain every published character, lore, location, organization and OPI record**.
- Preserve the interactive `#techGlobe` element and its JS on Locations.
- Keep Kincast Issue #1: **Under Observation**, status **In Development**; do not manufacture a working reader or buy button for unlaunched issues.
- Don't merge the draft PR into `main` until real mobile/desktop screenshots and Playwright tests have been reviewed.

## Recovery checkpoint — 25 October 2026

**All eight exact approved homepage portrait PNGs, the Main.Web.Logo primary graphic, and the official IN DEVELOPMENT sticker were recovered from the source Google Docs (Word media export).** Every PNG listed below matched the SHA-256 hash in the approval document byte-for-byte. Transparent WebP derivatives were produced separately. **All 20 verified approved-art files are now committed to the draft branch:** eight transparent PNG portrait masters, their eight optimized WebP derivatives, the primary-logo master and derivative, and the IN DEVELOPMENT sticker master and derivative. No live deployment occurred.

| Master asset | Approved PNG SHA-256 |
| --- | --- |
| `kincast-master.png` | `1a57f2a6d16466f71294af200fa1d62204ef69466fb995da5ef6d8b03f9bb173` |
| `anchorage-master.png` | `5d417524fe8a6743709afe9bfc8ed4fe5e1055116eba12043b1db0cca24bf70e` |
| `isiah-ivory-master.png` | `d39254f66568cc8fce592e7e9a15c2251ba031cb50d66ae945adbc1f69865027` |
| `liontone-master.png` | `4ad6447b527dda07e89026d3df2d9c3c84143874b862b4af45c3953e9907064b` |
| `agent-emerald-master.png` | `6e68e0db8c94d713109c2ce8296192898af0f7e996d2d89834053d3f58000cbb` |
| `remedie-master.png` | `fc6e1beaed01bcbade3b8f1b338a0e74e68576dfad02e0e239c01b993015ca14` |
| `flying-saucer-master.png` | `fc9284e31393b97d78d82311988308dc1151b967d302b5d8e539166ca96deb5b` |
| `gila-monster-master.png` | `759061db4163704d2c8854ef83cc560d837705fe3cfff49537457d6f0cac996e` |
| `primary-logo-master.png` | `3dd60053694e1d735dbbfaa91867b2f473bf361a22a237860624a02dfb7df785` |
| `in-development-sticker-master.png` | `11b34e81066677bf4e142a05f07f5f85645ff51c142e03bb6d0d41bb95383461` |

**Draft integration:** The homepage directly references all eight approved WebP portraits and the approved primary logo in initial HTML/CSS. `approved-home-loader.js` is an optional verification hook, not a requirement for displaying art. No ART IMPORT PENDING panels remain, and no unapproved Isiah/Liontone dossier pages were created. Original character registry and lore data remain intact.

**Completed asset action:** All required PNG/WebP files were added to **`design/living-comic-cafe-cream-home`**, not `main`. Verified Git blob SHA-1 values in the branch exactly match the local approved bundle for all 20 files. Browser checks confirm eight `data-approved-art` panels and the approved logo. Desktop/phone visual review and final creator launch approval remain required.

**Primary logo and variants:** The imported `primary-logo.webp` is now displayed for the homepage hero and shared navigation. Secondary wordmarks, publisher seal, and SlimeTree are archived in `assets/approved-home/variants/` with **no automatic placement approved**.

**Release gate remains closed:** draft PR only, unmerged and not authorized for deployment.
