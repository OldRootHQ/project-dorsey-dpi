# OldRoot Power Classification — Migration Architecture (REVIEW DRAFT)

**Status:** Technical proposal only. **Not published canon. Not approved for deployment.**  
**Audit date:** 2026-10-10  
**Scope:** OldRootHQ/project-dorsey-dpi

This document translates the creator's Power Classification handoff into a non-destructive migration plan. It records existing website behavior, mapping candidates, and approval gates. It is **not** a new classification system and does not authorize changing character lore, artwork, or OPI values.

## 1. Classification contract

**Power Classification** answers what kind of being a subject is and how extraordinary capabilities originate. It does not rank fighting power.

**Foundational families:**

1. **Humans** (individual: **Human**): ordinary human origin; superior training, intellect, equipment, wearable frames, pills used for performance, or weapons do not by themselves change biological origin.
2. **Augments** (individual: **Augment**): deliberate changes to biology through experiments, engineered treatments, chemical procedures, or comparable intervention. External equipment by itself does not qualify.
3. **Anomalies** (individual: **Anomaly**): inborn extraordinary conditions or mysterious/unexplained acquired powers not attributable to deliberate enhancement. Confirmed non-divine/unexplained possession may belong here. A genetic mutation is not required.
4. **Ascendants** (individual: **Ascendant**): finite population empowered by the **original Genesis event** involving Abyron. Later experiments, Abyron Powder, and generalized metahuman status do not create an Ascendant.
5. **Divine/cosmic origin family** (**working description only, not an approved public umbrella name**): powers from established divine/cosmic sources. Retain the already published specific terms **Demi-God**, **God**, **Cosmic God**, and **Multi-Dimensional God**, pending creator-approved definitions. A mortal receiving a fraction of an entity's power is not equivalent in power to the entity.

**Source-priority rule for possession:** confirmed divine/cosmic source takes priority over unexplained-possession / Anomaly treatment. Never classify based solely on observed power magnitude.

**Non-equivalences:** origin classification is not OPI, moral alignment, fighting rank, species-level threat rating, or proof of having undergone Genesis. Genesis was not the first source of extraordinary individuals in OldRoot.

## 2. Current repository inventory and migration risk

Current data.js holds 11 character records. Relevant existing fields:

| Existing field / surface | Meaning today | Risk / required treatment |
|---|---|---|
| classification | Hero, Villain, Vigilante, Anti-Hero, or Unaffiliated (role/alignment) | **Do not reinterpret** as Power Classification. |
| role | Similar role/alignment value; used by OPI filters | Preserve as-is. |
| powerClass | Existing labels mix capability descriptors (e.g., Superior Human, Superhuman, E&A Human) with Demi-God | **Do not mass replace** without preservation and a coordinated UI migration. |
| origin | Narrative origin description | Preserve exact established text. |
| originType | Fine-grained provenance/mechanism (e.g., Biotechnology, Experimental Enhancement, Metaphysical / Unexplained) | Keep for advanced origin filtering, not as a competing top-level Power Classification. |
| ascendantStatus | Some explicit Non-Ascendant strings and some nulls | Null means **unassigned in data**, not affirmative Ascendant or Non-Ascendant. Never infer from chronology or from OPI. |
| baseline / conditional | Eleven OPI attributes and situational alternatives | Immutable in a terminology-only change. |
| officialOPI / suppressAggregate | Explicit score exception and analytics visibility controls | Preserve; never turn calculated means into canonical fighting-power ratings. |
| characters.html card data-tags | Independently curated, space-separated search/filter keywords | Must migrate **in sync** with classification checkboxes and card displays. |

Other concrete behavior:
- **characters.html** uses 15 *hard-coded* Power Classification filter options and **hard-coded** per-card data-tags. It does **not** read data.js to render cards. Current class option slugs: non-fit-human, base-human, fit-human, exceptional-human, superior-human, slightly-enhanced-human, enhanced-human, ea-human, superhuman, advanced-superhuman, superior-superhuman, demi-god, god, cosmic-god, multi-dimensional-god.
- **app.js** generates analytics filters from data.js values, including powerClass, originType, and ascendantStatus; powerClass also appears in details, tooltips, and chart group/color semantics. **dpi.html** has a Power Classification color-by selection.
- **lore.html#power-classification** explains the current general purpose but not the proposed origin-family rules.
- **start-here.html**, character dossiers, and the Genesis dossier include established terminology that may not match new top-level labels automatically.
- The currently published 11 data.js records contain **no confirmed Ascendant** value. No example should be invented for the website.
- The historical phrases "Biogenetically Enhanced" and "Mutants" are not among the current registry's 15 Power Classification checkbox names or the 11 data.js powerClass values. Treat renaming them as canon terminology direction, not an unsafe blind search-and-replace.

## 3. Character-by-character mapping worksheet

**Proposed target** is not a license to publish. **Handoff-backed** means directly named in the creator's direction; **review** means the dossier and current metadata suggest the target, but individual publication still needs creator confirmation.

| Character | Existing data.js powerClass | Existing originType | Proposed Power Classification | Confidence / notes |
|---|---|---|---|---|
| Gila Monster / Adrián Zúñiga | Enhanced Human | Biotechnology | **Augment** | **Handoff-backed**: ASC deliberately alters biology. |
| Commotion / Ja'Kori Benson | Exceptional Human | Human / Training | **Human** | **Review**: published dossier explicitly says fully human with no powers. |
| Aftermark / Nico Vélez Rosado | Slightly Enhanced Human | External Anomaly | **Anomaly** | **Review**: extraordinary spatial phenomenon; verify unexplained source and any other origin caveats before publish. |
| Kincast / Micah & Naomi Ellison | Superhuman | Metaphysical / Unexplained | **Anomaly** | **Handoff-backed**: the extraordinary twin-shadow condition is inborn, not Genesis-created or experimentally caused. Preserve Naomi's independent consciousness and two-dimensional existence. |
| Anchorage / Gilmer Simpson | E&A Human | Experimental Enhancement | **Augment** | **Handoff-backed**: Project Ferrum; forced transformation predates Genesis. |
| Agent Emerald / Remington Hampton | Superior Human | Human / Technology / Training | **Human** | **Handoff-backed**: equipment and tactical skill are not biology-altering Augment origin. |
| Latch / Latch Boswell | Unassigned (null) | Human / Training | **Human** | **Handoff-backed**: unenhanced human with exceptional training. |
| Kokio / Kalani Kane | Demi-God | Supernatural / Ritual | **Demi-God** | **Preserve as published**: Takaro-linked empowerment; do not promote her to God/Cosmic God based on OPI. |
| Amari Razman | Unassigned (null) | Human / Training | **Human** | **Review**: published as unenhanced human. |
| Ballestera / Veronica Devoodas | Unassigned (null) | Human / Chemistry | **Human** | **Review**: technology/poisons and preparation, not innate abilities. |
| Remedie / Mandy Ledger | Unassigned (null) | Human / Technology | **Human** | **Review**: external gauntlets/exo-frame do not change human origin. Her registry card uses an "enhanced" tag referring to equipment; do not confuse it with Augment status. |

Notes:
- The current registry contains some characters with unassigned legacy powerClass values; a new origin-family category must **not** be inferred from OPI numbers.
- The divine family is represented by **Kokio / Demi-God**; the other published divine-tier terms have no character mapping in this 11-character dataset.
- No named website character should be given Ascendant status by assumption.
- Old labels such as **Exceptional Human**, **Superior Human**, **Slightly Enhanced Human**, **Enhanced Human**, **E&A Human**, and **Superhuman** must be retained in migration history until their capability-descriptor role is decided.

## 4. Proposed non-destructive field migration

**Before creator approval: NO production/data model change.**

Once approved, the simplest architecture is a *migration of the existing Power Classification field*, not an additional public taxonomy:

1. Snapshot all current character field values and per-card tags.
2. Make **powerClass** the canonical origin-family value (or approved divine tier) **only for individually approved character mappings**. If unknown, keep unassigned; do not guess.
3. Preserve the previous raw powerClass values in a compatibility/history field (suggestion: **legacyPowerClass**) during migration. This is an internal archival data attribute, **not a second visitor-facing classification system**.
4. Whether any former fine-grained labels become visible **capability descriptors** is a creator decision. If approved, give descriptors clearly separate labeling and avoid presenting them as another origin hierarchy. If not approved, retain them privately in migration history; never silently delete them.
5. Continue using **originType** for provenance detail and **ascendantStatus** as an explicit event association/negative when known. Do not synthesize Ascendant status from family, role, or Genesis chronology.
6. Keep **baseline**, **conditional**, **officialOPI**, and **suppressAggregate** unchanged.
7. Update the existing Power Classification UI in place; **do not add a parallel second system/page/filter branded as another classification**. A single top-level filter should use the canonical origin-family values; additional mechanism filters may remain clearly subordinate as Origin Type.
8. Keep the previously published divine labels intact until their distinctions and any family-level heading are creator-approved.

**No automatic legacy-label mapping is valid.** An "Enhanced Human" could be an Augment, a natural Anomaly, an Ascendant, or a human using equipment. Use approved individual origin facts.

## 5. Implementation touchpoints (after approval)

- **data.js:** explicit per-character classification assignment plus reversible archival retention of old powerClass; preserve all metrics/prose.
- **characters.html:** one canonical Power Classification filter, matching per-card tags and display headings; the manually edited registry cannot be treated as generated from data.js.
- **app.js / dpi.html:** dynamic filter options, tooltip / detail labels, search, legend and chart color-by value semantics. Decide how archived descriptors are represented without changing OPI analytics.
- **lore.html:** revise the *existing* Power Classification reference, not a redundant second system. Update glossary only after final names are approved.
- **start-here.html:** accessible explanation distinguishing source of empowerment from measured capabilities.
- **Individual dossiers:** surgical class label corrections only for approved mappings; do not rewrite stories.
- **lore/genesis/index.html:** preserve finite original-Genesis-only Ascendants, Abyron mechanism, and prior extraordinary beings.
- **PATCHLOG.md / tests:** only with an actual implementation/release; do not claim that this proposal changed the public site.

## 6. Minimum QA / no-regression gates for future implementation

1. All 11 registry cards remain present with unchanged art, routes, names, registry order, and unchanged OPI attribute values.
2. Test each approved family in the **existing** registry filter; combined Role + Power Classification + geography filters remain accurate, including option counts and sorting.
3. Cross-check static registry tags against data.js canonical Power Classification for every character; reject stale tags and empty-result filters for assigned characters.
4. OPI Analytics Power Classification facet, search, tooltips, legends, chart-color grouping, and comparison mode read migrated values correctly; Origin Type remains distinct.
5. Human technology cases (Agent Emerald, Remedie) never turn Augment merely because equipment changes performance; Gila Monster and Anchorage retain Augment origins.
6. Kincast remains Anomaly from birth; Kokio remains Demi-God; Ascendant remains original Genesis-only.
7. Test priority order for possession using synthetic fixtures without inventing published characters: established divine source wins over Anomaly; unexplained non-divine possession may qualify as Anomaly.
8. Verify null ascendantStatus stays unassigned where previously null; do not fill from assumptions.
9. Retain all eleven baseline/conditional scores, explicit officialOPI values, and analytics-only mean semantics; no universal combat score or divine thresholds.
10. Run the repository's existing Playwright site smoke suite, registry tests, OPI tests, navigation checks, and page integrity checks before merge.
11. Recheck against latest main and concurrent feature branches before implementing. Do not revert unrelated artwork/layout work.

## 7. Creator approval gates — HOLD FOR SIGNOFF

**Required before public rollout:**

1. **Cosmic umbrella:** use a public umbrella term, or list the four existing deity tiers without one?
2. **Cosmic tier distinctions:** what separates Demi-God, God, Cosmic God, and Multi-Dimensional God? Do not invent thresholds, origin mechanisms, or status promotions.
3. **Legacy capability labels:** retain as optional visible descriptors, retain only as archival compatibility data, or revise/select individual descriptors?
4. **Individual publication list:** explicitly confirm the proposed mappings for Commotion, Aftermark, Amari, Ballestera, and Remedie, alongside named handoff examples. Decide what to do with all previous null classifications.
5. **Display wording:** use singular names (Human/Augment/Anomaly/Ascendant) on individual records and plural names (Humans/Augments/Anomalies/Ascendants) in family explanations, subject to approval.

**Writer-room-only material** about hypothetical upper-end OPI values or writers as perfect 50.0 entities is not authorized for public implementation. Do not add speculative OPI thresholds.

**Release gate:** This proposal alone changes no public website, does not resolve open lore questions, and must stay a draft until creator confirmation plus implementation QA.

---

*OldRoot Studios — Deep Roots. Strange Branches.*
