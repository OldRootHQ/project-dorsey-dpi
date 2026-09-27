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
