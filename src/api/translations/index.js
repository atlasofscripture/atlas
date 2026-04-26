/**
 * Translation API.
 *
 * Each translation has a "provider" — a function that takes a reference
 * and returns a passage. Public-domain translations are bundled directly
 * (loaded from /data/translations/). Copyrighted translations require the
 * user to supply their own API key and use a remote provider.
 *
 * This thin abstraction lets us add or swap translations without touching
 * the reader UI.
 */
import { localProvider } from './localProvider.js';

export const AVAILABLE_TRANSLATIONS = [
  { id: 'KJV', name: 'King James Version (1769)', provider: 'local', license: 'public domain' },
  { id: 'ASV', name: 'American Standard Version (1901)', provider: 'local', license: 'public domain' },
  { id: 'WEB', name: 'World English Bible', provider: 'local', license: 'public domain' },
  { id: 'BSB', name: 'Berean Standard Bible', provider: 'local', license: 'public domain' },
  { id: 'YLT', name: "Young's Literal Translation", provider: 'local', license: 'public domain' }
  // Future:
  // { id: 'ESV', provider: 'esv-api', license: 'requires API key' },
  // { id: 'NRSV', provider: 'api-bible', license: 'requires API key' }
];

const PROVIDERS = {
  local: localProvider
};

/**
 * Fetch a passage in a given translation.
 *
 * Returns: { translation: 'KJV', reference: {...}, verses: [{ number, text }] }
 */
export async function fetchPassage(translationId, reference) {
  const meta = AVAILABLE_TRANSLATIONS.find((t) => t.id === translationId);
  if (!meta) {
    return { translation: translationId, reference, verses: [] };
  }
  const provider = PROVIDERS[meta.provider];
  if (!provider) {
    return { translation: translationId, reference, verses: [] };
  }
  return provider(translationId, reference);
}
