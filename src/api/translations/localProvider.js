import jsYaml from 'js-yaml';

/**
 * Local provider — reads bundled public-domain translations from
 * /data/translations/*.yaml.
 *
 * Each translation file holds passages keyed by "Book/Chapter".
 * This is a starter shape; for production, you'd compile the full text
 * into a more efficient indexed format.
 */
const translationFiles = import.meta.glob('/data/translations/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true
});

const cache = {};

function loadTranslation(translationId) {
  if (cache[translationId]) return cache[translationId];
  const path = `/data/translations/${translationId.toLowerCase()}.yaml`;
  const raw = translationFiles[path];
  if (!raw) {
    cache[translationId] = { passages: {} };
    return cache[translationId];
  }
  try {
    const parsed = jsYaml.load(raw);
    cache[translationId] = parsed;
    return parsed;
  } catch (err) {
    console.error(`Failed to load ${translationId}:`, err);
    cache[translationId] = { passages: {} };
    return cache[translationId];
  }
}

export async function localProvider(translationId, reference) {
  const data = loadTranslation(translationId);
  const key = `${reference.book}/${reference.chapter}`;
  const passage = data.passages?.[key];
  if (!passage) {
    return {
      translation: translationId,
      reference,
      verses: [
        {
          number: 1,
          text: `(${translationId}: ${reference.book} ${reference.chapter} not yet bundled. Add it to /data/translations/${translationId.toLowerCase()}.yaml or contribute via pull request.)`
        }
      ]
    };
  }
  return {
    translation: translationId,
    reference,
    verses: passage.verses
  };
}
