# OldRoot Website Patch Log

This file is the release ledger for meaningful public website changes. Each deployed site update should add an entry here and, when visitor-facing, a short matching note in `news.html`.

## OR-WEB-0061 · October 8, 2026 · Cinematic Character Archives Across All Published Dossiers

- Launched a shared cinematic dossier system for every currently published character: **Gila Monster, Commotion, Aftermark, Kincast, Anchorage, Agent Emerald, Latch, and Kokio**.
- Created `dossier-experience.css` and `dossier-experience.js` with eight canon-informed atmospheric identities, large editorial cover compositions using original approved feature art, legible identity panels, and a polished shared OldRoot interface.
- Added chapter indexes based entirely on each existing biography's headings, prominent illustrated story-record interludes using existing official images, improved dossier typography and section hierarchy, and curated, accessible galleries of the original art.
- Added an interactive OPI category inspector that reads and explains existing official baseline values without recalculating or revising scores; conditional measurements remain separately disclosed where canon provides them.
- Preserved character histories, relationships, classifications, limitations, original image paths, canonical connected-record links, and all not-yet-approved emblems, story details, and dates.
- Added mobile layouts, reduced-motion support, lazy-loaded gallery images, proper alt text, accessible buttons and lightbox focus restoration through the existing site controller.
- Created Playwright regression coverage for all eight dossiers, art archives, chapter navigation, OPI fidelity, keyboard lightbox, and mobile width. Corrected a previous mega-menu keyboard closure issue and a malformed URL test assertion during the rollout.

## OR-WEB-0060 · October 8, 2026 · Sitewide Editorial Mega Navigation

- Rebuilt the Characters, World, and Lore dropdowns into spacious, responsive panels that hang beneath the primary navigation rather than cramped small lists.
- Applied the visual language of the Abyron Powder dossier to navigation throughout OldRoot: deep forest glass, warm metallic borders, atmospheric gradients, cream typography, and restrained context-sensitive color accents.
- Added introductory copy and explanatory descriptions for each destination without changing established page paths, canonical character records, or lore.
- Desktop panels open on hover, focus, or click; moving the pointer beyond the panel, clicking away, scrolling the page, or pressing Escape closes them. A dimmed backdrop focuses attention on the expanded navigation.
- Phones continue using explicit tap-to-open controls with compact scrollable panels and no hover-dependent behavior.
- Preserved keyboard navigation, focus styling, active states, and all existing sitewide grouped-navigation conventions. Corrected the dynamic Upcoming Characters link prefix to ensure it reaches the roster on nested and root pages.
- Updated shared navigation assets, refreshed CSS/JS cache keys across HTML templates, and expanded automated navigation regression checks.

## OR-WEB-0059 · October 8, 2026 · Upcoming Characters Navigation and Abyron Powder Dossier

- Added **Upcoming Characters** to the sitewide Characters navigation menu, linking directly to the established in-development character roster without duplicating records.
- Added **Abyron Powder** as an independent, 20-section lore dossier at `lore/abyron-powder/`, with a unique orange material treatment, quick-jump index, specimen illustration, accessible material facts, and responsive layout.
- Integrated the full creator handoff: genuine Genesis-origin material versus synthetic/cut alternatives, fragmented UMWR and loss of bloom, temporary amplification of existing biological and powered systems, true-Ascendant affinity, crash, dependency, overdose, internal crystalline deposits, Exposure Protocol, finite supply, international and criminal markets, and protective controls.
- Kept the new page in reader-facing editorial prose, not internal writer instructions or unapproved named incidents/programs.
- Updated the parent Abyron and Genesis dossiers to remove superseded statements that Powder mechanics and Genesis Dust terminology were unresolved; linked both to the full new record.
- Updated Lore Index, shared Lore dropdown, sitemap, material sidebar, regression tests, and mobile-layout coverage.
- Preserved the core distinction that Powder amplifies existing systems but does not make new true Ascendants or restore original intact Ax-126.

## OR-WEB-0058 · October 8, 2026 · Gila Monster Emblem Refinement

- Replaced the earlier improvised vector claw mark at the existing shared SVG emblem path with the creator-approved red-ring, triple fiery/scaly-claw artwork, optimized as a compact transparent PNG embedded in the scalable SVG wrapper.
- Updated emblem cache references for the character dossier, registry, Start Here, Tucson, Los Moralistas, homepage spotlight data, and OPI Analytics data; refreshed parent data script version keys.
- Preserved existing Gila Monster full-size illustration assets and all established character lore.
- Updated emblem regression tests to confirm the approved embedded image signature, dimensions, alpha transparency, and propagation across registered identity surfaces.

## OR-WEB-0057 · October 8, 2026 · Abyron Reader-Facing Lore Cleanup

- Removed the reader-facing “Canon Boundaries / What Abyron is not” section from the Abyron dossier; it read as internal development guardrails rather than in-universe reference writing.
- Kept established Abyron properties, origin/discovery lore, Genesis chronology, Powder details, and connected records intact.
- Updated the Abyron regression checks to ensure the internal editorial section does not reappear in the public dossier.

## OR-WEB-0053 · October 7, 2026 · World Index Cosmic Horizon

- Reworked the **Indexed Places** directory on the Locations page so it no longer inherits the bright cream editorial surface that conflicted with the current After Dark redesign.
- Preserved the existing place-specific accent system while moving the directory wrapper, headings, dossier cards, and count treatment into a darker glass / deep-green presentation.
- Added a **Jump to Indexed Places** shortcut before the interactive globe so visitors can bypass the map and move directly into the location dossiers.
- Added a 760×500 **Cosmic Reference** formation graphic to the Locations hero, intentionally matching the visual weight of Abyron's periodic-table panel without copying its structure.
- The graphic expands from **Earth / Local Space** through a stellar field and galactic structure, ending in an **Unresolved Horizon** that quietly foreshadows future cosmic and multiversal scale without defining unrevealed cosmology or locking future canon.
- Advanced the Locations stylesheet cache key and added regression coverage for the dark directory surface, cosmic panel, seven established dossier cards, and deep-link shortcut.

## OR-WEB-0052 · October 7, 2026 · Footer Marker Cleanup

- Removed the centered gold pseudo-node from the top edge of the global OldRoot footer.
- The marker was originally introduced as part of the root-system visual polish, but on OPI Analytics it closely resembled an escaped chart/data point and read as a rendering error.
- Preserved the footer's root-field background, gold border treatment, logo panel, and all navigation content while removing only the ambiguous dot-and-halo marker.
- Advanced the global brand stylesheet cache key and added regression coverage to ensure the footer no longer renders a pseudo data point.

## OR-WEB-0051 · October 7, 2026 · Abyron Powder Lore Expansion

- Expanded Abyron Powder from a two-paragraph glossary treatment into a full canon subdivision inside the Abyron dossier.
- Established the complete currently locked relationship between Genesis and the residual material: the original useful HVA-01 / Abyron sample is destroyed or transformed, leaving altered particulate material later known as **Abyron Powder**.
- Clarified that Abyron Powder is **not the same thing as intact Abyron** and cannot be treated as a substitute for Hampton's lost intact sample.
- Connected the Powder directly to Hampton's need for answers and the **second Abyron search**, which eventually leads to the larger post-Genesis reservoir discoveries.
- Preserved the creator's open boundaries: exact Powder mechanics, performance limits, engineering uses, biological effects, deeper Genesis relationship, and any relationship to older **Genesis Dust** terminology remain unresolved until separately established.
- Updated the Lore Index to route Abyron Powder directly into the expanded Abyron dossier subdivision, added a sidebar jump link, and added regression coverage for the new body of lore and navigation.
- No new Powder mechanics were invented.

## OR-WEB-0050 · October 7, 2026 · Gila Monster Character Emblem

- Established Gila Monster’s first official character mark from the creator-selected three-claw concept: three orange reptilian slashes with scale texture and ivory tips inside a black circular field with a red-orange rim.
- Added the emblem as a scalable transparent-background SVG production asset under Gila Monster’s character asset directory.
- Replaced the dossier’s **CHARACTER LOGO — COMING** placeholder with the finished emblem while preserving the existing full character artwork package.
- Reused the emblem as a compact identity mark on the Character Registry, homepage Character Spotlight, OPI Analytics detail panel, Start Here, Tucson, and Los Moralistas.
- Kept full-body and narrative artwork in major visual roles; the emblem replaces or supplements only compact identity/branding placements where it improves clarity.
- Added optional character-mark support to shared homepage and OPI data/rendering so future registered-character emblems can be added without redesigning those systems.
- Advanced shared character, homepage, and OPI cache keys and added regression coverage for emblem loading, placement, responsive containment, and preservation of Gila Monster’s existing artwork.

## OR-WEB-0049 · October 6, 2026 · Abyron Periodic-Table Header

- Replaced the Abyron dossier hero’s plain text-only technical box with a dedicated periodic-table visual.
- Added a scalable SVG artwork field of subdued element tiles with **Element 126 / Ax / ABYRON** enlarged in bright Abyron-orange over the surrounding table.
- Kept the dossier’s main title **ABYRON**, the Lore dropdown label **ELEMENT 126: ABYRON**, and all Element 126 / Ax-126 canon unchanged.
- Preserved the technical lineage caption **HVA-01 → Abyron → Ax-126** beneath the new visual.
- Added a page-scoped Abyron stylesheet so the larger visual treatment does not change other location or lore dossier headers.
- Added desktop and mobile regression coverage for asset loading, Ax-126 labeling, responsive containment, and the original ABYRON page title.

## OR-WEB-0048 · October 6, 2026 · Abyron 126 Label Correction

- Reverted the accidental OR-WEB-0047 Abyron renumbering: Abyron remains **Element 126 / Ax-126** across active canon and connected records.
- Restored the Abyron dossier’s large top header to its original **ABYRON** presentation.
- Changed only the dynamically generated Lore dropdown label to **ELEMENT 126: ABYRON**, which is the intended placement for the expanded wording.
- Restored Element 126 / Ax-126 references through Abyron, Discovery of Abyron, Genesis, Events, Saint Dorsey, Start Here, Lore Index, Los Moralistas, Agent Emerald, README, and regression coverage.
- Preserved **Malasangre** in Upcoming Characters from OR-WEB-0047; no other Malasangre details were changed or invented.
- Updated navigation and canon regression coverage to prevent the title/menu placement from being mixed up again.

## OR-WEB-0047 · October 6, 2026 · Abyron Element 116 / Malasangre Preview · Abyron Portion Superseded by OR-WEB-0048

- Renumbered active Abyron canon from **Element 126 / Ax-126** to **Element 116 / Ax-116** so the dedicated lore title and connected records remain internally consistent.
- Changed the Abyron dossier title to **ELEMENT 116: ABYRON** and updated its metadata, technical shorthand, atomic-number field, state terminology, engineering references, Genesis links, Discovery record, Lore Index, Start Here, Saint Dorsey, Events, Los Moralistas, and Agent Emerald references.
- Preserved historical patch records that originally shipped the Element 126 wording while marking OR-WEB-0043's atomic-number detail as superseded in the public Dispatches ledger.
- Added **Malasangre** to the Upcoming Characters / In Development registry and homepage sampling pool.
- Malasangre remains a preview only: no identity, powers, Power Classification, affiliation, location, OPI profile, artwork, or release date has been invented.
- Updated regression coverage for Element 116 / Ax-116 and the eight-name Upcoming Characters pool.

## OR-WEB-0046 · October 6, 2026 · Homepage Hero Scale Correction

- Reduced the homepage **DEEP ROOTS. / STRANGE BRANCHES.** headline from an oversized 168 px ceiling to a more balanced 112 px desktop ceiling, with tighter tablet and phone scaling.
- Reduced the homepage hero from an 82vh maximum presentation to a 66vh target with border-box sizing and tightened its padding, gap, CTA spacing, signal-row spacing, and decorative root-map height.
- Kept the change scoped to the homepage hero so Start Here and other editorial headings retain their existing scale.
- Bumped the homepage-only stylesheet cache key to ensure the corrected proportions reach returning visitors.
- Added regression coverage for the compact desktop and mobile hero scale.

## OR-WEB-0045 · October 6, 2026 · Genesis Canon Rewrite

- Replaced the OR-WEB-0044 Genesis content with the new authoritative Genesis handoff rather than layering the rewrite on top of retired canon.
- Established Genesis as an **accidental Saint Dorsey containment catastrophe**: compromised HVA-01 containment slowly loses pressure; Hampton safety systems rapidly cool and stabilize the sample; those reasonable procedures unknowingly complete volumetric-bloom conditions; crystallized Ax-126 shifts effective load distribution; the containment rig damages high-density Hampton energy infrastructure; normal dark-orange vapor appears; a major conventional explosion occurs; approximately three seconds later the remaining lattice enters catastrophic Genesis-state failure.
- Retired the unknown-attacker / villain / weapon framing, giant **600–700 kg** preplanned Saint Dorsey stockpile, **77 Ascendants**, fixed immediate survivor discovery, **Genesis Dust** mechanics, and permanent-quarantine presentation.
- Established the orange Genesis cloud as lasting approximately **14 hours**, with Saint Dorsey held under controlled exclusion for approximately **two days**, and locked the Genesis death toll at **362**.
- Reframed Ascendants as a **small, finite, creator-controlled Genesis-only category** whose exact total is not public in-universe knowledge; public pages intentionally do not hardcode the creator-side ~16 target as an in-world statistic.
- Established that routine post-Genesis medical screening does not reliably identify Ascendants and that manifestations can emerge immediately or months later.
- Added **Abyron Powder** as the current residual-material term while explicitly leaving its detailed mechanics and any relationship to older Genesis Dust terminology unresolved.
- Corrected the Abyron timeline so industrial control, major reservoir discovery, strategic supply, military demand, and black-market diversion develop **after Genesis**, not before it.
- Updated Saint Dorsey as a functioning post-disaster location: Hampton rebuilds into the **Dorsey New General Facility**, growing its local workforce from approximately **400** to approximately **4,000** and driving a major economic/industrial boom.
- Updated the Genesis lore page, Events summary, Lore Index, Abyron dossier, Discovery of Abyron timeline, Start Here, Saint Dorsey dossier, World Index card/data, homepage teaser/latest dispatch, public Dispatches, and regression coverage.
- Preserved the hard three-second delay, brilliant-orange Genesis-state Abyron, nearly black advancing phase boundary, surface-bound cloud behavior, domain formation, first-power-versus-true-domain concept, and the rule that Genesis is one OldRoot origin branch among many.

## OR-WEB-0044 · October 6, 2026 · Dedicated Discovery & Genesis Lore · Partially Superseded by OR-WEB-0045

- Preserved the complete OR-WEB-0043 Abyron integration and added two complementary deep-dive lore records rather than replacing the Ax-126 science dossier.
- Added **Discovery of Abyron** as the dedicated HVA-01 history: downward-moving bubbles, nearly invisible liquid membrane, initial designation, extraction, first recovery, accidental volumetric bloom, first ceramic crystallization, submarine failure, return to depth, liquid reversion, apparent quantity increase, controlled transport, and Hampton’s eventual controlled bloom process.
- Added **Genesis** as the dedicated lore record for Saint Dorsey: the high-grade Ax-126 stockpile, unresolved initial trigger, three-second delay, Genesis-state Abyron, black advancing phase front, surface-hugging vapor, biological-catalyst behavior, exactly 77 Ascendants, domain formation, first-power-versus-true-domain logic, Ascendant potential, Genesis Dust, artificial replication, public-knowledge boundaries, and the rule that Genesis is only one OldRoot origin branch.
- Kept events.html#genesis as the concise historical event summary while routing deeper Genesis reading to the new lore page.
- Added **Abyron**, **Discovery of Abyron**, and **Genesis** directly to the Lore navigation menu and preserved desktop keyboard, mobile, active-state, and no-overflow behavior.
- Updated the Lore Index, Start Here, St. Dorsey, Abyron connected records, sitemap, homepage Latest Dispatch, and regression coverage for the new lore architecture.
- No OR-WEB-0043 canon was removed or retconned.

## OR-WEB-0043 · October 6, 2026 · Abyron Canon Integration · Genesis Portions Superseded by OR-WEB-0045

- Replaced the retired **Hampton’s Matter** concept across active public lore with **Abyron — Element 126 / Ax / Ax-126**.
- Added a dedicated Abyron lore dossier covering HVA-01, the deep-ocean discovery, sinking-bubble mechanism, four major known states, volumetric bloom, UMWR, permanent bloom degradation, engineering properties and weaknesses, supply scale, known reservoir systems, Genesis-state behavior, Genesis Dust, replication limits, and explicit canon boundaries.
- Corrected Genesis so the exact villain / weapon / final attack mechanism remains unresolved rather than hard-locking the event to a missile.
- Reframed the iconic black Genesis wave as the nearly black advancing phase boundary around brilliant orange Genesis-state Abyron and preserved the established roughly three-second delay.
- Expanded the St. Dorsey Hampton site from the older narrow sonar/submarine-storage description into the established specialized deep-ocean research division/site tied to mapping, exploration, HVA-01, and Ax-126 research.
- Connected Los Moralistas to later diverted Ax-126 supply without requiring a direct robbery of Hampton’s original source.
- Updated Agent Emerald’s St. Dorsey reference, Start Here, the Lore Index, homepage St. Dorsey teaser, Latest Dispatch, sitemap, infrastructure registry, and automated canon regression coverage.
- Preserved unresolved coordinates, reservoir locations, particle physics, military grade names, artificial-subject terminology, ultimate Abyron origin, and the exact Genesis trigger as intentionally open.

## OR-WEB-0042 · October 6, 2026 · Homepage Copy Polish

- Smoothed homepage section language so the rotating showcase feels editorial rather than repeatedly announcing its three-item mechanics.
- Reframed Character Spotlight, World Spotlight, Explore OldRoot, Upcoming Characters, and the homepage dispatch summary with more natural copy.
- Preserved all OR-WEB-0041 random-selection behavior, eligibility rules, layout, navigation, and registry coverage unchanged.

## OR-WEB-0041 · October 6, 2026 · Scalable Rotating Homepage

- Rebuilt the homepage around a scalable editorial-sampling model instead of mirroring complete registries.
- Character Spotlight now selects exactly three public characters per visit from the complete public character dataset, without replacement and with equal eligibility for every character.
- Replaced long homepage character summaries with shorter teaser copy while preserving artwork, dossier links, carousel controls, keyboard behavior, swipe/scroll behavior, Pause/Play, and lightbox access.
- Added World Spotlight with exactly three randomly selected established location dossiers per visit. Country-level/reference-only globe records such as Australia and Washington, D.C. remain excluded from the homepage pool unless they become established location dossiers.
- Reduced the homepage Upcoming Characters section to three randomly selected in-development names while keeping the complete seven-name development registry on Dispatches.
- Consolidated overlapping Discover OldRoot and Registries & Systems blocks into one Explore OldRoot gateway with secondary links to Events, Organizations, OPI Analytics, About, and Contact.
- Restored the homepage Latest Dispatch to the current public update instead of the stale September feature.
- Replaced three duplicate Coming Soon book placeholders with one focused Library publishing teaser until finished releases exist.
- Hero counters now derive from the live public character dataset, established-location dataset, and eleven OPI axes rather than relying on manually maintained homepage numbers.
- Extracted location records into shared `location-data.js` so the World Index globe and homepage use the same source of truth.
- Added dedicated homepage data/runtime/style files to keep future growth out of `index.html`, plus regression coverage for three-item sampling, uniqueness, eligibility, complete-registry preservation, cache keys, mobile containment, and World Index behavior.

## OR-WEB-0040 · October 4, 2026 · Upcoming Character Addition

- Added **Remedie** to the Upcoming Characters / In Development previews on the homepage and Dispatches.
- Kept Remedie out of the active Character Registry and OPI Analytics dataset because no public dossier or numeric profile has been established.
- Added no invented identity, role, powers, affiliation, location, biography, or other unrevealed canon.
- Updated regression coverage so both public preview surfaces remain synchronized at seven upcoming characters.

## OR-WEB-0039 · October 4, 2026 · Latch Official OPI Correction

- Published Latch Boswell's locked eleven-category DPI profile exactly as creator-supplied: Strength 9.7, Durability 7.7, Speed 9.3, Agility 8.4, Regeneration 5.3, Senses 7.9, Offense 15.4, Intellect 12.3, Combat 18.6, Mobility 6.0, and Stamina 11.1.
- Established **10.15** as Latch Boswell's official OPI. The eleven locked values total 111.7 and average to 10.1545..., which displays as 10.15.
- Added the official OPI to the Character Registry, Latch dossier, OPI Analytics detail view, metric selectors, tooltips, and character comparison tables.
- Removed Latch's interim unscored state from current public presentation while retaining the generic unscored-record system for future characters who genuinely lack approved values.
- Locked the exact values and official OPI in automated regression coverage. No individual DPI category value was altered.
- OR-WEB-0038's unscored Latch state is superseded by this creator correction.

## OR-WEB-0038 · October 4, 2026 · Latch OPI Unscored Record · Superseded

- Interim state: Latch was added to OPI Analytics as an **unscored** public record. **Superseded by OR-WEB-0039** after creator-supplied locked values and official OPI 10.15 were restored.
- The earlier assumption that Latch lacked creator-approved numeric values is no longer current canon; see OR-WEB-0039.
- Added an Unscored Public OPI Records panel and an OPI Status filter so public characters without numeric ratings remain visible and searchable.
- Updated the analytics record count to eight public characters while numeric OPI-axis comparisons continue to plot only characters with established values.
- Linked Latch's dossier directly to his OPI Analytics presence and added regression coverage for search, filtering, detail presentation, and missing-value handling.

## OR-WEB-0037 · October 4, 2026 · Latch World Index Connection

- Added Australia to the interactive globe as a geographic reference connected to Latch.
- Used Australia only at the country level because Latch's Australian nationality and military background are established while no specific hometown or present-day Australian base is canon.
- Linked Latch's dossier back to the Australia globe reference without creating a new location dossier or inventing city-level canon.
- Updated globe cache keys and regression coverage for the ninth rendered globe node while preserving seven established location dossiers.

## OR-WEB-0036 · October 3, 2026 · Power Classification Corrections

- Reclassified Anchorage from Superhuman to **E&A Human**, using the existing OldRoot Power Classification taxonomy.
- Reclassified Kokio from Superhuman to **Demi-God**, using the existing OldRoot Power Classification taxonomy.
- Propagated both corrections across Character Registry cards, dossiers, homepage Character Spotlight labels, Start Here, OPI Analytics data, and regression coverage.
- Preserved Anchorage's Villain, Non-Ascendant, Baltimore, and pre-Genesis experimental-enhancement records.
- Preserved Kokio's Hero role, human species record, Hilo base, Takaro ritual origin, and exact OPI values; this change affects Power Classification only.
- OR-WEB-0009 remains in the historical ledger as the earlier Anchorage classification state and is superseded by this correction.

## OR-WEB-0035 · October 3, 2026 · Kokio Dossier Visual Refinement

- Replaced Kokio's Registry Data sidebar portrait with the stronger creator-supplied barrier combat image.
- Preserved the seated ceremonial image as supporting dossier artwork and kept the primary dual-hatchet combat image as the dossier feature.
- Added regression coverage so the Registry Data panel keeps the approved combat reference.

## OR-WEB-0034 · October 3, 2026 · Character Release

- Promoted Kalani Kane from the development seed list into the public registry under her canon hero alias, Kokio.
- Added a complete Kokio dossier preserving her Hilo home base, family and Duke Decker relationships, shared ritual origin, Takaro bond, physical/mystical combat system, dual ritual hatchets, durability limits, locked visual identity, and intentionally open canon boundaries.
- Integrated six creator-supplied Kokio illustrations as optimized WebP assets with full-image lightbox access.
- Added Kokio's exact creator-approved eleven-category OPI values without publishing a canonical overall OPI score.
- Added Hilo / eastern Hawaiʻi Island as an established public location and connected it to Kokio across the World Index.
- Removed Kalani from Upcoming Characters while leaving Duke in development.
- Added Kokio and Hilo to sitemap, public counts, discovery surfaces, regression coverage, and automated visual QA.
- Cleaned the stray escaped newline left in the Character Registry stylesheet during the prior Latch release.

## OR-WEB-0033 · October 3, 2026 · Character Release

- Promoted Latch Boswell from Upcoming Characters into the public Character Registry and homepage Character Spotlight.
- Added a complete Latch dossier preserving his Australian military background, 2nd Commando Regiment service, permanent eye injury, recruitment/security role, post-Genesis field work, technical intelligence, combat profile, moral code, and intentionally unresolved first major defeat.
- Integrated the supplied Latch artwork package as optimized WebP assets with full-image lightbox access.
- Added Latch to the public sitemap and automated visual-QA surface.
- Removed Latch from both Upcoming Characters previews.
- Initial release state kept Latch out of numeric OPI comparisons because the values were missing from the then-current implementation. **Superseded by OR-WEB-0039**, which restores his locked DPI profile and official OPI 10.15.

## OR-WEB-0032 · October 3, 2026 · Registry Framing Fix

- Replaced the desktop Character Registry’s ratio-only image sizing with an explicit capped thumbnail height.
- Preserved character-specific object-position crops, full-art lightbox access, and OR-WEB-0031 phone-width framing.
- Added desktop browser regression coverage so portrait source dimensions cannot expand registry cards into full-poster panels again.

## OR-WEB-0031 · October 3, 2026 · Mobile Registry Framing

- Collapsed the phone-width primary navigation behind an accessible Menu control while preserving full desktop navigation and no-JavaScript fallback behavior.
- Reframed Character Registry artwork into consistent mobile editorial crops while keeping full-resolution lightbox access.
- Reduced mobile sticky-header obstruction and adjusted anchor offsets to match the compact masthead.
- Added browser regression coverage for the collapsed/expanded mobile navigation state and registry artwork crop height.

## 2026-09-26 — OR-WEB-0001 — Locations globe stability rebuild

### Changed
- Rebuilt the Locations globe around the original stable global-navigation model.
- Removed the unstable deep-zoom / live city-boundary interaction stack from the globe.
- Capped globe zoom to a controlled global range.
- Preserved Earth View, Space View, drag rotation, location selection, dossier links, and URL hash navigation.
- Removed the extra Washington, D.C. reference node from the public location-node set.
- Marked St. Dorsey globe placement as schematic instead of presenting invented coordinates as canon.
- Added keyboard-accessible location nodes and explicit selection state on location-index buttons.
- Improved mobile interaction so the globe no longer claims all touch scrolling behavior.
- Added reduced-motion handling for pulsing location markers.
- Reduced world-map detail from `countries-50m` to `countries-110m` for a lighter global view.

### Styling
- Added `locations.css` as an isolated Locations feature stylesheet.
- Retained OldRoot Root Green, Deep Root Green, Cream, Parchment, Café/Bark neutrals, Silver, and Old Gold visual language.
- Kept the existing technical console / editorial terminal presentation.

### Validation
- JavaScript syntax check required before merge.
- Internal location/dossier links required before merge.
- Branch diff review required before merge.
- Live deployment verification required after merge.

## 2026-09-26 — OR-WEB-0002 — Automated site smoke-test gate

### Changed
- Added a GitHub Actions smoke-test workflow for website changes.
- Added Chromium tests for the Locations globe covering all five public location nodes, keyboard selection, controlled zoom limits, Earth/Space modes, St. Dorsey schematic status, mobile touch behavior, and world-atlas failure fallback.
- Added JavaScript syntax checks for the site's shared scripts before browser tests run.

### Validation
- The workflow must pass on the repair code before this test gate is merged to main.


## 2026-09-26 — OR-WEB-0003 — Nearby location cluster navigation

### Changed
- Added screen-space proximity clustering for globe locations that render too close together to select reliably.
- Added an OldRoot-styled cluster marker with a visible location count.
- Added a nearby-location navigator with mouse-wheel cycling, arrow-key cycling, Previous/Next controls, direct option selection, and Escape-to-close behavior.
- Reintroduced Washington, D.C. as a geographic reference inside the greater D.C. cluster without adding it to the five established public location dossiers.
- The greater D.C. cluster now resolves Baltimore, St. Dorsey, and Washington, D.C. without overlapping selectable pins.
- Cluster behavior is generic and will automatically apply to future dense regions.

### Styling
- Kept the cluster marker and selector within the existing Root Green, Deep Root Green, Cream, Parchment, and Old Gold console system.
- Added reduced-motion handling for cluster pulse animation.

### Validation
- Browser smoke tests cover cluster creation, three-option D.C. membership, direct selection, next/previous cycling, mouse-wheel cycling, keyboard cycling, reference-state handling, and closing behavior.


## 2026-09-27 — OR-WEB-0004 — Commotion final comic-art integration

### Changed
- Replaced Commotion's temporary website imagery with four final comic-style illustrations assigned to distinct editorial roles.
- Added a primary visual reference to the dossier opening and Character Registry.
- Added a separate stairwell illustration to Combat Style and a separate gun-jammer crowd illustration to Equipment.
- Added a different rooftop illustration to the homepage Character Spotlight so featured art does not repeat the dossier opener.
- Kept the Chicago location dossier focused on the location instead of scattering Commotion artwork into another surface.
- Updated OPI character data to use the primary Commotion visual reference.

### Performance & accessibility
- Created full-resolution WebP derivatives of the supplied artwork for the website, reducing each image from roughly 3.7–4.0 MB PNG source files to roughly 370–421 KB while preserving the 1122 × 1402 display resolution.
- Added descriptive alt text, contextual captions, keyboard-focus treatment, and lightbox access to dossier illustrations.
- Preserved the OldRoot green, cream, parchment, and old-gold interface instead of recoloring the dossier around Commotion's purple costume accents.

### Validation
- Browser smoke tests verify the three-art dossier layout, distinct homepage feature art, registry art, image decode/load success, OPI image reference, and the absence of Commotion artwork on the Chicago dossier.
- Static validation rejects legacy Commotion dummy-image references before merge.


## 2026-09-27 — OR-WEB-0005 — Commotion dossier cover reframing

### Fixed
- Shifted Commotion's dossier cover focal point upward so his mask and face, rather than his chest, anchor the wide desktop crop.
- Scoped the adjustment specifically to Commotion's cover image so shared character artwork framing remains unchanged.

### Validation
- Browser smoke coverage now verifies Commotion's cover uses the intended top-centered focal position.


## 2026-09-30 — OR-WEB-0006 — Anchorage villain import

### Added
- Added Anchorage / Gilmer Simpson as the first Villain-classified character in the public Character Registry.
- Added a complete Anchorage dossier covering his pre-transformation life, forced experimentation, chosen loyalty to his unnamed creators, identity psychology, personality, criminal code, Baltimore underworld role, powers, suppression limits, combat style, movement limitations, and current visual-canon notes.
- Added Anchorage to Baltimore as a known villain and recurring underworld presence without changing Kincast's established status as Baltimore's primary hero.
- Added Anchorage to OPI Analytics with the creator-supplied eleven category values: Strength 32.7, Durability 37.4, Speed 2.5, Agility 2.4, Regeneration 11.8, Senses 5.5, Offense 26.3, Intellect 6.7, Combat 17.1, Mobility 1.6, and Stamina 9.7.
- Added Experimental Enhancement as a registry origin filter.

### Canon safeguards
- Anchorage is explicitly Non-Ascendant and receives no slot among the 77 Ascendants.
- His power origin is preserved as pre-Genesis experimental enhancement occurring approximately one year before Genesis.
- No Power Classification was assigned because the supplied character brief does not establish one.
- No exact organization, scientists, facility, inhalant compound, public civilian-identity status, criminal empire structure, takeover chronology, definitive arch-enemy, supporting cast, romance, future ending, additional metal weakness, new power, transformation, or ultimate form was invented.
- Artwork fields remain empty / placeholder-only by creator instruction.
- Approximate two-ton weight is displayed textually in the dossier but is not converted into a false exact numeric analytics weight.

### Validation
- Dedicated browser coverage verifies registry filtering, Baltimore links, Non-Ascendant status, empty artwork data, exact OPI values, and preservation of the existing Kincast record.


## 2026-09-30 — OR-WEB-0007 — Mobile responsive consistency pass

### Fixed
- Reworked the mobile masthead so the OldRoot wordmark and navigation stack cleanly instead of compressing the navigation into a narrow desktop-style strip.
- Added narrow-screen sizing and spacing for primary page headers, homepage character modules, registry cards, location dossiers, and shared footer content.
- Reflowed character dossiers for phone widths, including safer title sizing, single-column fact rows on very narrow screens, full-width dossier links, and non-chopped editorial illustrations.
- Reworked the Locations console controls for phones, reduced the globe stage to a viewport-appropriate height, simplified mobile HUD clutter, and made the location index a true single-column phone list.
- Reworked OPI Analytics controls so axis selectors, toolbar controls, metadata, and comparison elements stack rather than compress into desktop grids.

### Validation
- Added Playwright phone-width coverage at 390 × 844 across the homepage, registry, Anchorage and Commotion dossiers, Locations, Baltimore, OPI Analytics, Library, and Dispatches.
- The mobile regression gate rejects horizontal document overflow and verifies that the header, globe controls, and OPI axis controls enter their intended phone layouts.


## 2026-09-30 — OR-WEB-0008 — Anchorage sitewide propagation & homepage carousel

### Fixed
- Propagated Anchorage beyond his initial dossier/registry import into all relevant public discovery surfaces.
- Updated the Locations globe data model so one location can expose multiple known characters; Baltimore now links both Kincast and Anchorage in the terminal.
- Updated Baltimore location copy in the homepage world index and Locations dossier index to acknowledge both established characters.
- Updated Start Here from four to five public character records and added Anchorage as the fifth cast-entry route.
- Refreshed the repository README to list all five current public character records.

### Added
- Expanded the homepage Character Spotlight from four entries to a five-slide carousel: Gila Monster, Commotion, Aftermark, Kincast, and Anchorage.
- Added Previous / Next controls, tab selection, a 1–5 slide counter, timed advancement, reduced-motion handling, and pause-on-hover behavior.
- Added an explicit Home tab to the masthead across every static website page, including nested character, location, organization, and library dossiers.
- Added sitewide regression coverage for the five-slide homepage, Anchorage discovery propagation, Baltimore globe links, and Home navigation.

### Artwork status
- The Anchorage homepage slide uses an explicit OldRoot artwork-sync placeholder only. It is not presented as final character art and does not alter Anchorage's empty canonical image field.
- The six creator-supplied Anchorage illustrations remain reserved for the dedicated artwork integration pass once the exact source files are available to the repository workflow.

### Validation
- Browser coverage verifies the five homepage slides, Anchorage links on Start Here / Locations / Baltimore / OPI, multi-character Baltimore globe behavior, and Home navigation across all mastheads.


## 2026-09-30 — OR-WEB-0009 — Anchorage Power Classification correction

### Corrected
- Anchorage's official Power Classification is **Superhuman**.
- Updated the Character Registry, Anchorage dossier, homepage character slide, Start Here entry, and shared character analytics record to use Superhuman consistently.
- OPI Analytics now exposes Anchorage under the existing Superhuman Power Class filter through the corrected shared data record.

### Canon safeguards
- This changes only Anchorage's Power Classification.
- Anchorage remains a Villain, Non-Ascendant, Baltimore character with a pre-Genesis experimental-enhancement origin.
- No OPI category values, powers, biography, relationships, affiliation details, or unrelated character records were changed.

### Validation
- Anchorage regression coverage now requires `powerClass: "Superhuman"` and verifies the Superhuman analytics filter is available.


## 2026-09-30 — OR-WEB-0010 — Homepage character carousel scroll pass

### Changed
- Moved the five-character Character Spotlight directly below the main OldRoot hero so the cast appears substantially earlier on the homepage.
- Converted the spotlight into a native horizontal scroll-snap rail so visitors can swipe or horizontally scroll through all five character slides.
- Kept the existing character tabs, Previous / Next controls, slide counter, and timed advancement synchronized with manual scrolling.
- Made the character tabs themselves horizontally scrollable when space is tight rather than forcing awkward wrapping.

### Accessibility & interaction
- Offscreen carousel panels are marked inactive until they become the selected slide.
- Manual swipe / pointer interaction pauses automatic advancement until interaction ends.
- Reduced-motion behavior remains respected.

### Validation
- Browser coverage verifies that the Character Spotlight appears before Discover OldRoot, contains five slides, has actual horizontal overflow, and advances its scroll position when Next is used.


## 2026-09-30 — OR-WEB-0011 — Anchorage creator-art integration

### Added
- Integrated all five Anchorage PNGs currently present in the repository into the public site.
- Organized the uploaded artwork under `assets/characters/anchorage/` with stable production names for primary, registry, featured, and dossier use.
- Replaced the Anchorage homepage placeholder with a dedicated featured image.
- Replaced the Character Registry placeholder with Anchorage artwork and connected the same compact reference image to OPI Analytics.
- Replaced the Anchorage dossier header and infobox placeholders with creator-supplied artwork.
- Added two additional Anchorage dossier illustrations so the main biography uses three distinct visuals rather than repeating one image.
- Added Anchorage artwork to Baltimore's Known Characters card.

### Asset roles
- `anchorage-primary.png` — dossier opening visual.
- `anchorage-registry.png` — Character Registry, OPI Analytics, and compact Baltimore reference.
- `anchorage-featured.png` — homepage Character Spotlight.
- `anchorage-dossier-01.png` — dossier illustration.
- `anchorage-dossier-02.png` — dossier combat visual reference.

### Cleanup
- Removed the temporary `anchorage-art-pending.svg` asset.
- Replaced the generic uploaded `ChatGPT Image...` repository filenames with organized Anchorage-specific asset paths while retaining the original image blobs unchanged.

### Validation
- Browser coverage verifies the Anchorage registry, homepage, dossier, OPI data, and Baltimore artwork references load successfully.
- Existing mobile, globe, Commotion, sitewide-navigation, and carousel regressions remain in the full test gate.


## 2026-10-01 — OR-WEB-0012 — Anchorage dossier image centering

### Fixed
- Centered Anchorage's right-side dossier reference image within the infobox instead of allowing the raw image dimensions to control its placement.
- Changed the Anchorage illustration in the Abduction & Experimentation section from the shared cover crop to a full centered presentation.
- Kept Anchorage's primary cover image framing unchanged.

### Validation
- Browser coverage verifies both corrected images use centered `contain` framing and are geometrically centered within their containers.


## 2026-10-01 — OR-WEB-0013 — Mobile globe pinch zoom

### Fixed
- Added native two-finger pinch control for the OldRoot Locations globe on touch devices.
- Pinching now changes the globe's own projection scale within the established 0.58×–2.2× zoom limits instead of handing the gesture to browser/page zoom.
- Preserved one-finger horizontal globe rotation with a touch-specific gesture path.
- Preserved normal one-finger vertical page scrolling so the globe does not trap mobile visitors.
- Kept Earth View, Space View, Zoom +, Zoom −, and Reset controls fully available.

### Interface
- Updated Locations guidance to advertise pinch zoom alongside the existing controls.

### Validation
- Phone-width browser coverage verifies `pan-y` page-scroll behavior, touch rotation, synthetic two-pointer pinch zoom, zoom-readout changes, and clean gesture teardown.


## 2026-10-01 — OR-WEB-0014 — Grouped primary navigation

### Changed
- Rebuilt the site masthead into six primary choices: Home, Characters, World, Lore, Library, and Dispatches.
- Added a Characters dropdown containing Character Registry and OPI Analytics.
- Added a World dropdown containing Locations, Events, and Organizations.
- Added a dedicated Lore dropdown containing Start Here and Lore Index, removing both from the crowded top-level row.
- Applied the grouped masthead consistently across all 37 static website pages, including character, location, organization, and library dossiers.

### Interaction
- Desktop users can open category menus by hover or click.
- Touch users can tap a category to open its menu without relying on hover.
- Keyboard users can open menus with Enter / Space or Arrow keys, move through submenu links with Arrow Up / Arrow Down, and close with Escape.
- Active categories and submenu records follow the current section.

### Validation
- Added dedicated browser regression coverage for OPI discoverability, Lore grouping, desktop hover/click/keyboard interaction, mobile tap behavior, active states, nested-page paths, and mobile horizontal-overflow protection.
- Added `nav.js` to the JavaScript syntax validation gate.


## 2026-10-01 — OR-WEB-0015 — OldRoot After Dark homepage prototype

### Prototype
- Rebuilt the homepage visual system around a near-black green canvas instead of cream-dominant surfaces.
- Added layered atmospheric green light, faint network/root traces, restrained gold nodes, film-grain texture, and viewport vignette effects without changing established lore.
- Reworked the opening hero into a large cinematic split composition with a living-index visual field and factual site counters for five public characters, five established places, and eleven OPI axes.
- Enlarged Character Spotlight artwork and converted its surrounding surfaces to dark translucent panels while preserving the existing five-character scroll carousel and navigation behavior.
- Restyled discovery cards, World Index, Dispatch lead, Library, and supporting homepage sections as dark layered surfaces rather than cream cards.
- Preserved the existing OldRoot green / cream / gold brand palette by shifting cream primarily into typography and selective highlights.

### Scope
- This release intentionally prototypes the redesign on the homepage only.
- Character dossiers, registries, Locations, OPI Analytics, Library detail pages, and other site surfaces retain their existing visual systems pending creator review.

### Validation
- Added desktop browser coverage for the dark canvas, hero scale, enlarged character artwork, and dark discovery surfaces.
- Added phone-width containment coverage to prevent horizontal overflow from the new atmospheric and root-network layers.


## 2026-10-01 — OR-WEB-0016 — OldRoot After Dark sitewide rollout

### Expanded
- Promoted the approved OldRoot After Dark homepage prototype into the shared visual system across all 37 static pages.
- Applied the near-black green atmospheric canvas, faint root/network traces, restrained gold signal marks, grain, vignette, darker layered surfaces, and cream-forward typography sitewide.
- Kept page-specific identities instead of flattening every experience into the same card layout.

### Page systems
- Character Registry and character dossiers now use dark translucent registry/dossier surfaces while preserving artwork, OPI bars, lightbox behavior, and readable long-form lore.
- Locations retains its technical globe identity while the terminal, controls, index, and surrounding world surfaces now align with After Dark.
- OPI remains a tactical analytics workstation but now shares the same deeper green canvas and atmospheric framing.
- Start Here, Lore, Events, Organizations, About, Dispatches, Contact, and Support now use the shared cinematic editorial language.
- Library, individual book/product pages, cart, checkout, order confirmation, and bag surfaces now use the dark commerce treatment.
- Masthead and footer are aligned globally with the new dark visual system.

### Delivery
- Added the `oldroot-after-dark` theme marker to every static page.
- Bumped shared stylesheet cache keys across the entire site so mobile and desktop browsers receive the redesign immediately.

### Validation
- Added browser coverage across 17 representative page families to verify dark surfaces are actually rendered.
- Added mobile viewport checks across the major site families.
- Added a static audit requiring all 37 HTML pages to opt into the new theme and current stylesheet versions.


## 2026-10-01 — OR-WEB-0017 — Gila Monster and Kincast creator-art integration

### Added
- Integrated final creator-supplied artwork for Gila Monster and Kincast across the homepage, Character Registry, OPI Analytics, character dossiers, Tucson, and Baltimore.
- Added dedicated production assets for primary, registry, featured, and dossier roles under each character's asset directory.
- Added lightbox access to newly integrated homepage, registry, OPI, dossier, and location artwork.
- Replaced the legacy `gila-monster-full.png` and `kincast-full.png` filler references in active site surfaces.

### Performance
- Production artwork is delivered as optimized WebP files to reduce transfer weight while preserving the creator originals outside the public-site bundle.

### Validation
- Added browser coverage for asset loading, page placement, lightbox behavior, and removal of legacy filler references.
- Existing sitewide smoke coverage remains part of the merge gate.
- Propagated `site.css?v=29` and `character.css?v=18` cache keys across all pages consuming those shared styles so deployed clients do not mix old and new CSS.
- Updated carousel validation to activate the lazy-loaded Kincast slide before checking decoded image dimensions.


## 2026-10-01 — OR-WEB-0018 — Gila Monster OPI senses recalibration

### Updated
- Raised Gila Monster baseline Senses from 15.2 to 22.2.
- Raised Gila Monster conditional Nocturnal Senses from 20.2 to 31.7.
- Recalculated the dossier baseline total to 201.4 and baseline mean to 18.31.
- Updated the Senses bar visualization to 44.4% on the 50-point OPI display scale.
- Bumped the OPI data cache key so the revised values propagate immediately to Analytics.

### Validation
- Added regression assertions for the exact baseline and nocturnal Senses values plus the recalculated dossier summary.


## 2026-10-01 — OR-WEB-0019 — Cache and dead-asset maintenance pass

### Cache consistency
- Standardized every character dossier using the shared image lightbox on `lightbox.js?v=9`; Aftermark, Anchorage, and Commotion were still carrying older cache keys.
- Expanded static regression coverage to enforce the current cache keys for shared lightbox, navigation, shop, Locations, and OPI JavaScript.
- Added `data.js` to the JavaScript syntax gate.

### Cleanup
- Removed five legacy Gila Monster / Kincast image files totaling 9,079,966 bytes (about 8.66 MiB) from the current production tree.
- Removed two duplicate Kincast copies plus one stray duplicate character image outside the production asset folders.
- Found and replaced the final live `gila-monster-full.png` reference on the Los Moralistas dossier with Gila Monster's current registry artwork before deleting the legacy file.
- Preserved all active optimized Gila Monster and Kincast production artwork and all current page references.

### Validation
- Legacy Gila Monster / Kincast asset names are now rejected from active HTML, JavaScript, and CSS during CI.
- No page layout, lore, OPI value, navigation behavior, commerce behavior, or user-facing feature is intentionally changed by this maintenance pass.


## 2026-10-01 — OR-WEB-0020 — Gila Monster dossier cover correction

### Fixed
- Replaced Gila Monster's dossier top cover image with the final non-bible featured artwork.
- Updated the top-cover lightbox source, caption, badge, title, and alt text to match the replacement artwork.
- Kincast and all other character dossiers remain unchanged.

### Validation
- Updated browser regression coverage to require `gila-featured.webp` for both the visible Gila dossier cover and its full-size lightbox source.


## 2026-10-01 — OR-WEB-0021 — Agent Emerald canon import

### Added
- Added Agent Emerald / Remington James “Remy” Hampton as the sixth public character record.
- Added a complete Agent Emerald dossier covering identity, Hampton family conflict, Neegan Walters, Lace Bo Hughes, origin, Dunamis Dynamics, VX-11, Precision / Reflex Stimulant, suit, Vector Talons, Line Driver, combat profile, and exact OPI values.
- Added Seattle / Puget Sound as LOC-006 in the public Locations index and globe, with a dedicated location dossier.
- Updated St. Dorsey to identify the Hampton facility there specifically as specialized sonar and submarine systems storage and development, distinct from the Seattle / Puget Sound logistics and fabrication annex.
- Added Dunamis Dynamics to the Organization Registry with a dedicated company dossier.
- Fixed organization registry filtering so category/search-hidden cards cannot remain visible under the shared card display rules.
- Propagated Agent Emerald to the homepage Character Spotlight, Start Here, Character Registry, OPI Analytics, README registry, Locations, Organizations, and Dispatches.

### OPI
- Added the locked baseline categories: Strength 7.7, Durability 10.9, Speed 8.1, Agility 12.0, Regeneration 5.5, Senses 11.7, Offense 18.5, Intellect 14.8, Combat 19.0, Mobility 15.3, and Stamina 9.2.
- Added Senses — Precision Pill Active at 16.1 as a conditional value only.
- Natural and stimulant-enhanced Senses remain separate; no overall OPI score is published on the Agent Emerald dossier.

### Canon safeguards
- Agent Emerald is recorded as a human vigilante. No Power Classification was invented because the supplied canon does not assign one.
- Ascendant status remains unassigned rather than being inferred.
- No character artwork or personal emblem was invented. The dossier and discovery surfaces use explicit pending placeholders until creator-supplied visuals are available.
- VX-11 remains Remy’s personal design and intellectual property rather than being presented as automatically owned by Dunamis Dynamics.
- Unresolved Neegan Walters history, Monica Hampton divorce timing, Lace Bo Hughes future role, and other intentionally open material remain unresolved.

### Validation
- Added dedicated browser regression coverage for Agent Emerald’s exact profile, OPI values, conditional Senses handling, missing artwork/logo state, Seattle propagation, Dunamis Dynamics propagation, homepage/Start Here discovery, and phone-width containment.
- Updated sitewide character, location, cache-key, static-page, and mobile regression expectations for the expanded public registry.


## 2026-10-01 — OR-WEB-0022 — Agent Emerald Power Classification correction

### Corrected
- Agent Emerald / Remington James “Remy” Hampton is officially classified as **Superior Human**.
- Agent Emerald is the first public OldRoot character assigned to the Superior Human Power Classification.
- Updated the Character Registry, Agent Emerald dossier, homepage Character Spotlight, Start Here, and OPI Analytics shared record to use Superior Human consistently.
- Added the `superior-human` registry tag so the existing Superior Human filter returns Agent Emerald.

### Canon safeguards
- This correction changes only Agent Emerald’s Power Classification and related discovery labels.
- His species remains Human, his role remains Vigilante, and his existing OPI values are unchanged.
- His Ascendant status remains unassigned; no Ascendant status is inferred from the Superior Human classification.

### Validation
- Agent Emerald regression coverage now requires `powerClass: "Superior Human"`.
- The OPI data cache key was bumped so the corrected classification propagates immediately.


## 2026-10-01 — OR-WEB-0023 — Agent Emerald and Aftermark creator-art integration

### Added
- Integrated the full uploaded Agent Emerald artwork set across his dossier, Character Registry, homepage Character Spotlight, OPI Analytics, Seattle location dossier, and Dunamis Dynamics record.
- Added distinct Agent Emerald visuals for his primary dossier cover, registry/profile use, homepage feature, tactical operation, Vector Talons combat, aerial repositioning, close-quarters control, and armored-target combat.
- Integrated the new Aftermark artwork set across his dossier, Character Registry, homepage Character Spotlight, OPI Analytics, and San Juan location record.
- Assigned Aftermark's horizontal artwork only to cover/card surfaces; his vertical Santurce rooftop image serves the infobox/primary portrait and his vertical stairwell image is the dossier-body illustration.

### Cleanup
- Removed the former `assets/characters/aftermark-full.png` filler image after replacing every active reference.
- Removed the generic root-level Agent Emerald `ChatGPT Image...` upload names and the duplicate copied upload after organizing the creator sources under `assets/characters/agent-emerald/source/`.
- Organized the new Aftermark creator sources under `assets/characters/aftermark/source/`.
- Created stable, optimized WebP production derivatives for all active Agent Emerald and Aftermark artwork.

### Performance & accessibility
- Production WebP assets are each under 600 KB while preserving the uploaded source dimensions.
- Added descriptive alt text, contextual captions, lazy loading where appropriate, and lightbox access on dossier, registry, location, organization, and homepage artwork.
- Updated the shared character-art stylesheet cache and OPI data cache to propagate the new visuals cleanly.

### Validation
- Added browser coverage for both characters across homepage, registry, dossiers, OPI, Seattle, San Juan, and Dunamis Dynamics.
- Added static assertions that Aftermark's former filler file is gone, generic Agent Emerald upload names are absent from production code, horizontal Aftermark source art stays off inline dossier-body slots, and all optimized production files remain below 600 KB.
- CI now rejects reintroduction of the deleted Aftermark filler path or the generic Agent Emerald upload filenames.


## 2026-10-02 — OR-WEB-0024 — Upcoming Characters preview

### Added
- Added an **Upcoming Characters / In Development** section to the homepage and Dispatches page.
- Added the creator-supplied names: Latch, Mark Hampton, Neegan Walters, Ballestera, Makari, and Akuaom.
- Mark Hampton and Neegan Walters are explicitly labeled **No OPI Listing**.

### Canon safeguards
- Upcoming-character cards do not invent powers, Power Classifications, locations, affiliations, identities, origins, artwork, or release dates.
- Upcoming names are previews only and are not added to the active Character Registry or OPI Analytics dataset.
- No OPI listing is created for Mark Hampton or Neegan Walters.

### Validation
- Added regression coverage requiring the same six upcoming names on both public preview surfaces and verifying that Mark Hampton and Neegan Walters remain absent from OPI Analytics.


## 2026-10-02 — OR-WEB-0025 — Agent Emerald dossier cover scale correction

### Changed
- Moved Agent Emerald's identity/title panel above his opening artwork so the dossier identifies the character before presenting the visual.
- Reduced Agent Emerald's opening artwork from the generic oversized character-cover treatment to a dedicated compact editorial frame.
- Switched the opening image to contained framing so the full creator artwork remains visible without making the image feel like the entire page.
- Kept the change scoped to Agent Emerald; other character cover dimensions are unchanged.

### Cache
- Bumped the shared character stylesheet cache key to `character.css?v=20`.

### Validation
- Regression coverage verifies Agent Emerald's title appears before the cover, the desktop cover remains under the new compact height limit, the image uses contained framing, and the phone layout remains contained.


## 2026-10-02 — OR-WEB-0026 — Sitewide character dossier cover correction

### Changed
- Standardized all six active character dossiers so the identity/title panel appears before the opening artwork.
- Replaced the oversized generic dossier-cover treatment with one shared compact editorial frame across Commotion, Aftermark, Anchorage, Gila Monster, Kincast, and Agent Emerald.
- Opening artwork now uses contained framing, remains fully available through the lightbox, and is capped at approximately 430px on desktop and 330px on phone-width layouts.
- This supersedes the Agent Emerald-only sizing exception from OR-WEB-0025.

### Aftermark
- Replaced the disliked Santurce-sunrise opening cover with the existing horizontal **Invisible Counterpunch** artwork, which more directly communicates Aftermark's stored-action ability.
- Deleted the rejected `aftermark-cover.webp` production asset and its `aftermark-cover-source.png` creator-source file.
- Preserved Aftermark's remaining uploaded artwork and their existing homepage, registry, OPI, San Juan, primary-portrait, and dossier roles.

### Cache
- Bumped all character dossiers to `character.css?v=21`.

### Validation
- Added sitewide browser coverage for title-before-cover ordering, compact desktop/mobile cover dimensions, contained image framing, loaded artwork, and phone-width containment on every active character dossier.
- Added explicit regression coverage requiring Aftermark's opening cover to use the Invisible Counterpunch asset and requiring the rejected sunrise files to remain deleted.


## 2026-10-02 — OR-WEB-0027 — Framed inline dossier artwork

### Changed
- Slimmed the inline artwork embedded inside character lore sections so illustrations no longer dominate the text column.
- Centered dossier-body figures at a maximum width of 760px on desktop while preserving responsive full-width behavior on phones.
- Added a premium dossier frame treatment using restrained OldRoot gold borders, dark inset framing, corner accents, deeper shadow, and a cleaner caption divider.
- Kept all existing lightbox behavior and full-resolution viewing intact.
- Applied the treatment consistently to Commotion, Aftermark, Anchorage, Gila Monster, Kincast, and Agent Emerald.
- Top dossier covers and right-side infobox portraits are intentionally unaffected.

### Cache
- Bumped all character dossiers to `character.css?v=22`.

### Validation
- Added browser regression coverage requiring inline dossier figures to remain centered, below the desktop width cap, visibly framed, decorated with corner accents, image-loaded, and phone-width safe across all six active character dossiers.


## 2026-10-02 — OR-WEB-0028 — Root Atmosphere visual experiment

### Experiment
- Added a reversible sitewide **Root Atmosphere** layer over the existing OldRoot After Dark visual system.
- Deepened the page canvas toward near-black / ultra-dark green while retaining the established cream, gold, and green content hierarchy.
- Added a translucent branching root network with embedded code-like glyph fragments and subtle green signal nodes.
- Added faint root tendrils inside major content bubbles so cards and dossier panels visually feel connected to the larger root system rather than floating on an empty canvas.
- Kept the decorative network behind readable content and set every atmospheric layer to ignore pointer input.

### Motion & performance
- The global root network uses a very slow low-amplitude drift only on larger screens.
- Mobile disables the drift and lowers root opacity.
- `prefers-reduced-motion: reduce` disables the drift completely.
- The effect uses two lightweight SVG assets plus CSS only; no JavaScript or lore/data changes were introduced.

### Reversibility
- The experiment is isolated in `root-atmosphere.css`, loaded by one import at the top of `brand.css`.
- Removing that import and the two decorative SVG assets restores the previous After Dark background system without touching character content, OPI data, artwork, navigation, or layout logic.

### Cache
- Bumped all static pages to `brand.css?v=12`.

### Validation
- Added browser coverage for the root network, panel tendrils, pointer transparency, reduced-motion behavior, lower mobile intensity, viewport containment, shared cache propagation, and the experiment's single removable dependency.


## 2026-10-03 — OR-WEB-0029 — Root Atmosphere final polish and Character Registry sorting

### Root Atmosphere finalized
- Increased the visibility of the sitewide root network and its code-like glyph fragments without turning the background into a bright neon effect.
- Strengthened root tendrils around major content bubbles and Character Registry cards so the interface feels connected to the larger root system.
- Gave general editorial intro panels a more visible root edge treatment.
- Reworked the Character Registry filter strip from the bright cream control into a dark translucent green-black control with restrained gold accents so it belongs to the finalized After Dark atmosphere.
- Kept mobile intensity reduced and preserved reduced-motion behavior.

### Character Registry sorting
- Added a persistent **Sort by** control to the Character Registry.
- Default order is **Alphabetical**.
- Added **Release order**, using the existing canonical registry sequence from oldest public release to newest.
- Added **Newest added**, which reverses that same registry sequence.
- Sorting remains active when filters are applied and does not create duplicate character records.
- No age sort was added; the control remains focused on stable registry metadata.

### Aftermark artwork
- Replaced Aftermark's punching-bag Character Registry image with the existing **rainy San Juan counter** artwork.
- Deleted `assets/characters/aftermark/aftermark-registry.webp` and its creator-source file after removing the active registry reference.
- Preserved Aftermark's other assigned artwork roles, including his dossier cover, homepage feature, OPI visual, San Juan cover, primary portrait, and dossier illustration.

### Cache
- Updated the Root Atmosphere import to `root-atmosphere.css?v=2`.
- Bumped all static pages to `brand.css?v=13`.

### Validation
- Added regression coverage for alphabetical default sorting, release order, newest-added order, filter/sort interoperability, and phone-width safety.
- Updated artwork tests to require the new Aftermark registry image and require the rejected punching-bag production/source files to remain deleted.
- Expanded Root Atmosphere tests to verify the integrated dark filter control and visible card-root connections.

## 2026-10-03 — OR-WEB-0030 — Production infrastructure

### Changed
- Added canonical URLs, page descriptions, Open Graph metadata, Twitter card metadata, theme color metadata, and homepage WebSite/Organization structured data across the public indexable site.
- Added `sitemap.xml`, `robots.txt`, and a branded noindex OldRoot 404 page.
- Marked cart, checkout, order-confirmation, and generic unrevealed Library title placeholders as noindex.
- Added measured intrinsic width/height attributes to WebP artwork used in public HTML to reduce layout shift without changing presentation.
- Moved World Index topology data into the repository as the primary source, pinned the remote world-atlas fallback, pinned D3/TopoJSON CDN versions, and added a graceful map-engine unavailable state.
- Upgraded the existing GitHub Actions QA workflow rather than adding a competing pipeline.
- Added production-infrastructure smoke tests for metadata, sitemap/noindex boundaries, internal links, local topology, and image markup.
- Added full-page desktop/mobile visual QA captures for core OldRoot surfaces and a 14-day GitHub Actions artifact.
- Repaired stale smoke-test cache assertions left from earlier stylesheet/navigation versions.

### Validation
- Public sitemap boundary: 27 indexable URLs.
- Utility/unrevealed placeholders remain outside search indexing.
- Local topology contains both required `land` and `countries` objects.
- Measurable WebP image markup reserves intrinsic dimensions.
- Final branch requires JavaScript syntax, Playwright smoke coverage, infrastructure checks, visual captures, and diff review before merge.

