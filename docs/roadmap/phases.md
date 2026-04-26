# Roadmap

The vision is much larger than the scaffold. This document tracks where the project is going.

## Phase 0 — Scaffold ✅

- Project structure, build pipeline, design system
- Cesium globe with layer architecture
- Timeline scrubber, side-by-side reader, layer toggle panel
- Entity detail panel with citations
- Six layers: places, people, journeys, events, influence, contention
- One worked slice: Paul's first missionary journey (~46–48 CE)

## Phase 1 — A defensible MVP

The goal of Phase 1 is to have something genuinely useful that demonstrates every claim in the README.

- [ ] Full text of all bundled public-domain translations (KJV, ASV, WEB, BSB, YLT) for Acts and the Pauline letters
- [ ] Paul's second and third journeys, plus the journey to Rome
- [ ] All major figures of the early church (Peter, James, John, Stephen, Philip, Apollos, Priscilla, Aquila, Timothy, Titus, Silas, Lydia)
- [ ] All major place entities for the Roman world
- [ ] At least 10 contested events demonstrating the contention layer's range
- [ ] JSON Schema validation for every data file type
- [ ] Build step that compiles YAML to indexed JSON
- [ ] Search bar (entity name, scripture reference)
- [ ] URL-shareable state — paste a link and land on the same year, layers, and selected entity
- [ ] Basic mobile responsiveness

## Phase 2 — Hebrew Bible coverage

- [ ] Patriarchal narratives: Abraham, Isaac, Jacob, Joseph
- [ ] Exodus, wilderness journey, conquest of Canaan
- [ ] Period of Judges
- [ ] United monarchy: Saul, David, Solomon
- [ ] Divided kingdom: every king of Israel and Judah, with reigns visualized as overlapping timeline bands
- [ ] Major prophets and where they prophesied
- [ ] Babylonian and Assyrian conquests, exile, return
- [ ] Original-language layer (Hebrew/Aramaic for OT, Greek for NT) with hover-to-define

## Phase 3 — The interpretive layers come alive

- [ ] Genealogy layer — interactive family trees that link back to globe positions
- [ ] Manuscript variant overlay — show where significant manuscript families differ for a given verse
- [ ] Political boundary morphing — Egypt, Assyria, Babylon, Persia, Greek successor kingdoms, Roman provinces, all with proper temporal bounds
- [ ] Trade route overlay (Via Maris, King's Highway, etc.)
- [ ] Archaeological corroboration markers
- [ ] Canon comparison — toggleable visibility for Apocrypha/Deuterocanonicals, Ethiopian canon, etc.

## Phase 4 — Community features

- [ ] User accounts with optional sync
- [ ] Bookmarks and study notes anchored to entities
- [ ] "Tour" feature — saved playthroughs that walk a viewer through a topic
- [ ] Suggest-an-edit flow that opens a pull request automatically
- [ ] Localized translations of the UI itself
- [ ] Accessibility audit and improvements

## Phase 5 — Reach and integration

- [ ] API integrations for copyrighted translations (ESV API, API.Bible, etc.) with bring-your-own-key
- [ ] Embeddable widget mode for blogs and study sites
- [ ] Integrations with Logos / Olive Tree / Accordance
- [ ] Mobile apps (iOS, Android) wrapping the web build
- [ ] Translation packs in major languages

## Stretch ideas

- **Audio sync.** Play a chapter while the globe shows where the action is happening.
- **Generative summaries.** Per-entity AI-written summaries that pull from the linked references, with full citation chains.
- **Theme tagging.** Filter the globe by theme (covenants, miracles, prophecy fulfillment, exile) across all of scripture.
- **Comparative religious studies overlay.** How the same event is described in Christian, Jewish, Islamic, and secular historical sources.

## What we will not build

- A devotional content engine.
- A theological position generator.
- A "correct interpretation" layer.

The whole project is built around showing the data and the disagreements, not arbitrating them.
