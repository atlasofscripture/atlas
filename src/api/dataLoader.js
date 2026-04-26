import jsYaml from 'js-yaml';

/**
 * Loads the atlas data at startup.
 *
 * Data is authored as YAML files (one entity per file) and committed to the
 * repo for human readability and review. A build step (scripts/build-data.js)
 * compiles them into a single JSON bundle for fast runtime loading.
 *
 * In development, we can also import the YAML directly using Vite's glob
 * import. We pick whichever works first.
 */

// Vite's import.meta.glob pulls all matching files at build time.
// `as: 'raw'` gives us the file contents as strings, which we parse as YAML.
const peopleFiles = import.meta.glob('/data/people/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true
});
const placeFiles = import.meta.glob('/data/places/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true
});
const eventFiles = import.meta.glob('/data/events/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true
});
const journeyFiles = import.meta.glob('/data/journeys/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true
});
const relationshipFiles = import.meta.glob('/data/relationships/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true
});
const sourceFiles = import.meta.glob('/data/sources/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true
});

function parseEach(files) {
  const result = {};
  for (const [path, raw] of Object.entries(files)) {
    try {
      const parsed = jsYaml.load(raw);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item && item.id) result[item.id] = item;
        }
      } else if (parsed && parsed.id) {
        result[parsed.id] = parsed;
      } else {
        // Unkeyed — store under filename
        const key = path.split('/').pop().replace(/\.yaml$/, '');
        result[key] = parsed;
      }
    } catch (err) {
      console.error(`Failed to parse ${path}:`, err);
    }
  }
  return result;
}

function parseRelationships(files) {
  const all = [];
  for (const [path, raw] of Object.entries(files)) {
    try {
      const parsed = jsYaml.load(raw);
      if (Array.isArray(parsed)) {
        all.push(...parsed);
      } else if (parsed && Array.isArray(parsed.relationships)) {
        all.push(...parsed.relationships);
      }
    } catch (err) {
      console.error(`Failed to parse relationships ${path}:`, err);
    }
  }
  return all;
}

export async function loadAllData() {
  return {
    people: parseEach(peopleFiles),
    places: parseEach(placeFiles),
    events: parseEach(eventFiles),
    journeys: parseEach(journeyFiles),
    relationships: parseRelationships(relationshipFiles),
    sources: parseEach(sourceFiles)
  };
}
