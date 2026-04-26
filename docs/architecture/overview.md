# Architecture

## Mental model

Atlas of Scripture is a **time-driven knowledge graph rendered on a globe**. Three things are happening at once:

1. **A timeline scrubber** sets the "current year." Everything else reacts to this single number.
2. **Layers** project the data onto the globe. Each layer is independent: a self-contained module that knows how to draw its slice of the data at the current year.
3. **A scripture reader** stays anchored to the same context shown on the globe.

Data is the source of truth. UI is just a rendering of it.

## Component map

```
┌─────────────────────────────────────────────────────────┐
│                     App (layout)                         │
├──────────┬──────────────────────────┬───────────────────┤
│  Layer   │        Globe             │     Scripture     │
│  Panel   │  (Cesium viewer +        │     Reader        │
│          │   layer modules)         │                   │
│          │                          │                   │
│          │  + Entity Detail panel   │                   │
├──────────┴──────────────────────────┴───────────────────┤
│                     Timeline                             │
└─────────────────────────────────────────────────────────┘
```

Every component reads from and writes to the central Zustand store (`src/store/atlasStore.js`). No prop drilling. The store owns:

- `currentYear`, `isPlaying`, `playbackSpeed`
- `layers` (visibility flags)
- `selectedEntity`
- `reader` (left/right translations, current reference)
- The loaded `data` (people, places, events, journeys, relationships, sources)

## Layer modules

Each globe layer is a single function that takes:

- `ctx` — viewer, current year, selected entity, all data
- `visible` — whether the layer is currently shown
- `prevHandle` — what this layer rendered last time, for cleanup

And returns:

- A new handle (a list of Cesium entity IDs it owns)

The layer is responsible for adding and removing its own Cesium entities idempotently. It never touches another layer's entities. This means **adding a new layer is a single-file change** — write the module, register it in `Globe.jsx`, add a toggle to the store's `layers` map.

## Time semantics

Years are signed numbers: negative is BCE, positive is CE. Internally we allow year zero for clean math; entity files should use historically-real values.

An entity is "active" in a given year if `bornAt/foundedAt/activeFrom <= year <= diedAt/destroyedAt/activeTo`. Each layer decides for itself how to handle entities that aren't active.

A journey progresses stop by stop, each stop having its own year. Layers can ask "where was Paul in year 47?" and get a coordinate back via `getPersonLocationAtYear`.

## Data pipeline

Authoring → version control → load → render.

```
data/people/paul.yaml    →  Vite glob import  →  parsed into store  →  layers render
data/places/*.yaml          (eager, dev mode)
data/events/*.yaml
data/journeys/*.yaml
data/relationships/*.yaml
data/sources/*.yaml
data/translations/*.yaml
```

For production builds, `scripts/build-data.js` (TODO) compiles all YAML into a single indexed JSON bundle for faster startup.

## Why YAML in version control

- **Reviewability.** Every data change is a pull request someone can read and discuss.
- **Citation enforcement.** A `sources:` field on every entity means a missing citation is visible in code review.
- **Approachable.** Bible scholars who don't write code can still contribute. They edit text files; we handle the rest.
- **Diff-friendly.** Small, line-oriented changes show up cleanly in git history.

The trade-off is performance — parsing thousands of YAML files at startup gets slow. The build step compiles them down for production.

## What this scaffold does *not* yet do

- Genealogy/family tree rendering (data structure exists; layer is future work)
- Manuscript variant overlays in the reader
- Polygon overlays for political boundaries that morph over time
- Multi-language original-text view (Hebrew, Greek, Aramaic)
- User accounts, bookmarks, study notes
- Cross-reference graph visualization
- Search

These are roadmap items. See `docs/roadmap/`.
