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
