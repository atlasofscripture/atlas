# Data Conventions

This is how Atlas of Scripture data files are structured. Read this before submitting a pull request that adds or modifies data.

## File layout

```
data/
├── people/         One YAML file per person.        Filename = id.
├── places/         One YAML file per place.         Filename = id.
├── events/         One YAML file per event.         Filename = id.
├── journeys/       One YAML file per journey.       Filename = id.
├── relationships/  Files contain arrays of edges. Group by topic/figure.
├── sources/        Citation registry. Group by category.
└── translations/   One file per translation. Filename = id.lower().yaml.
```

## ID conventions

Every entity has a stable `id` — lowercase, snake_case, descriptive enough to disambiguate:

- `paul` — there's only one
- `antioch_syria` — distinguishes from `pisidian_antioch`
- `john_mark` — distinguishes from `john_apostle` and `john_baptist`

IDs are forever. Once published, an id is a stable handle other files reference. To rename, you have to migrate all references.

## Required fields

**Every entity** must have `id`, `name`, and (where claims about it are made) `sources`.

**People:**
- `id`, `name`
- `bornAt`, `diedAt` (numeric years; negative = BCE)
- `summary` — 2-4 sentences of prose
- `references` — list of `{ book, chapter, verse?, note? }`
- `sources` — list of source IDs

**Places:**
- `id`, `name`
- `coordinates: { lat, lng }` (decimal degrees)
- `region` — e.g. "Pamphylia, Roman Empire"
- `summary`

**Events:**
- `id`, `name`, `category` (one of `natural`, `miraculous`, `military`, `political`, `religious`)
- `year` or `startYear`/`endYear`
- `coordinates`
- `summary`
- `references`

**Journeys:**
- `id`, `name`
- `stops` — ordered list of `{ placeId, year, note? }`
- `summary`

## Citations are required

**Every claim must have a source.** This is non-negotiable. The `sources` field on an entity is a list of IDs from `data/sources/`, where each source is a real publication, manuscript, or scholarly work.

If you can't cite it, don't add it. If you're contributing widely-known information ("Jerusalem is in modern Israel"), cite a standard reference work. If you're adding contested information, cite the scholar who argues for it.

## Confidence levels

For disputed material — most often used in a contention event's `views` — use one of these confidence labels:

- `consensus` — virtually all scholars across traditions agree
- `majority` — most scholars agree, with notable dissent
- `disputed` — genuinely contested
- `minority` — held by a serious minority of scholars
- `speculative` — possible but not well-attested

Don't use confidence levels to push a view. Be honest about where each reading actually sits.

## The contention layer

Disagreement is a feature, not a bug. When multiple credible accounts conflict — internal contradictions, manuscript variants, scholarly disputes about location, contested historicity — model them as an event with multiple `views`:

```yaml
views:
  - label: "Traditional location"
    summary: "..."
    confidence: majority
    coordinates: { lat: ..., lng: ... }
    sources: [...]
  - label: "Proposed alternative"
    summary: "..."
    confidence: minority
    coordinates: { lat: ..., lng: ... }
    sources: [...]
```

Don't pick a winner. Show all credible views with their evidence.

## What not to add

- **Theological commentary.** This is a data layer, not a sermon. Summaries describe; they don't preach.
- **Modern political claims.** "X city is rightfully part of Y" is out of scope.
- **Speculation presented as fact.** Mark speculation as speculation.
- **Material from non-canonical or pseudepigraphal works in the canonical layer.** These can have their own toggleable layer in the future, but don't mix them in.

## Translation files

Public-domain translations only. If a translation is copyrighted, integrate via API (with users supplying their own keys) — don't bundle the text.

Always include the `license` field.

## Pull request checklist

- [ ] Every claim has a citation
- [ ] IDs are unique, stable, and descriptive
- [ ] References use the correct book name spelling (see `docs/contributing/book-names.md` — TODO)
- [ ] Coordinates are reasonable (run `npm run validate-data`)
- [ ] Year fields are numeric, not strings
- [ ] If you added a contested event, you included multiple views with their own sources
- [ ] If you removed an entity, you searched the codebase for references to its id
