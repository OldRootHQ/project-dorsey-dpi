# OldRoot HQ 2.1 — Cosmic Carbon Visual System (Draft)

**Status:** Protected, unmerged work on PR #86. Do not merge or deploy without creator approval.

## Approved creator decisions — 26 October 2026

- **Page atmosphere:** deep emerald-black cosmic field inspired by the creator's green-nebula reference.
- **No graffiti in the page-wide background.** No words, spray-paint tags or writing over the nebula.
- **Panels:** restrained dark matte carbon-fiber / composite weave with readable warm ivory copy, green/gold trim and substantial black depth.
- **Publisher identity:** large approved OldRoot wordmark in the sticky masthead; darker black / green feature plaque beside "Extraordinary people. Unforgettable stories."
- **Distress:** optional only on narrowly selected brand panels. This implementation does **not** add background graffiti.
- **Never modify the eight creator-approved transparent portrait masters** or the eight-panel roster, identities or colors.
- **Keep all existing UI functionality:** 3-character randomized rotating spotlight + manual controls, world globe, filters, lightboxes, forms, consent/CAPTCHA, publishing status and nav/footer links.
- **Theme coverage:** homepage, character dossiers, location entries, lore, marketplace, dispatches, OPI, studio forms and supporting routes.

## Implementation

- `assets/branding/oldroot-cosmic-field.svg`: original, scalable emerald-black cosmic field. No graffiti. Procedural vector nebula / sparse stars / vignette. CSS-backed, does not mutate reference or character artwork.
- `brand.css`: scoped `oldroot-after-dark` cosmic background, carbon composite surface tokens, sitewide high-specificity carbon overrides, accessible heading and text colors, enlarged masthead, footer.
- `living-comic-home.css`: per-homepage dark feature plaque, cosmic hero, composite featured sections, preserved portrait grid and legible lower-page sections.
- `living-comic-locations.css`: accessible carbon directory cards.
- `marketplace.css`: light headings on dark cosmic backdrop.
- `index.html`: dark green browser theme-color.
- `tests/cosmic-carbon.spec.js` plus updated visual contrast assertions.

## Boundaries

- **Do not** rebuild lore or change canon to accommodate visual styling.
- **Do not** put graffiti or words in the cosmic background.
- Do not turn the weave into an obvious checkerboard or a high-contrast racecar texture.
- Do not remove approved artwork or hide the Masthead/Contact links.
- Keep the interactive globe and OPI readout mechanically intact.
- Do not publish unfinished merchandise or introduce buying actions.

## QA / release gate

1. All Playwright tests pass on the **exact final commit**.
2. Inspect desktop/mobile screenshots for homepage plus characters, dossiers, locations, lore, marketplace and OPI.
3. Confirm no illegible dark-on-dark areas, no overflow and the enlarged masthead does not clip navigation on mobile.
4. Creator explicitly approves actual revised screenshots.
5. Only then consider merging draft PR #86 to the default branch; verify oldroothq.com after merge.


## Palette refinement — HQ 2.2 (creator-approved, 26 October 2026)

- Previous café/cream and repeated gold UI highlights are superseded by a **fresh lime-green family taken as inspiration from the approved OldRoot mark** and **sharp comic white**. This is a CSS interface refinement, not a change to the approved logo artwork.
- Tokens: `--or-lime: #BEF37A`, `--or-lime-bright: #C9FF82`, `--or-lime-pale: #E1F7CB`, `--or-comic-white: #FAFFFC`, with cool readable secondary text `#C9D9CF`.
- Use bright lime for selected navigation, micro-labels, panel edges, active states and contact actions. Use comic white for main headings and body anchors. Keep textured carbon panels dark. Do **not** blanket large text regions with neon green.
- The black/green logo plaque, cosmic nebula, eight hero artworks and original logo files are left untouched. **No graffiti in the main background.**
- Test actual rendered CSS on desktop and phone before release; ensure no stale gold/cream UI styling or faded contrast on Locations, Marketplace, dossiers and footer.
