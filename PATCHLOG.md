# OldRoot Website Patch Log

This file is the release ledger for meaningful public website changes. Each deployed site update should add an entry here and, when visitor-facing, a short matching note in `news.html`.

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
