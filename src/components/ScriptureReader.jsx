import { useEffect, useState } from 'react';
import { useAtlasStore } from '../store/atlasStore.js';
import { fetchPassage, AVAILABLE_TRANSLATIONS } from '../api/translations/index.js';

/**
 * Side-by-side scripture reader.
 *
 * Two synchronized panes. Each pane renders the same passage in a different
 * translation. Verses are aligned by reference, so you can see exactly how
 * a single verse differs between renderings.
 *
 * The active reference comes from the store. When the user selects an
 * entity on the globe (a person, event, etc.), its primary scripture
 * reference is loaded here.
 */
export default function ScriptureReader() {
  const {
    reader,
    setLeftTranslation,
    setRightTranslation,
    setReference
  } = useAtlasStore();

  const [leftPassage, setLeftPassage] = useState(null);
  const [rightPassage, setRightPassage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Default to a seed reference if none set
  const reference = reader.currentReference || {
    book: 'Acts',
    chapter: 13
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetchPassage(reader.leftTranslation, reference),
      fetchPassage(reader.rightTranslation, reference)
    ]).then(([l, r]) => {
      if (cancelled) return;
      setLeftPassage(l);
      setRightPassage(r);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [reader.leftTranslation, reader.rightTranslation, reference.book, reference.chapter]);

  const refLabel = `${reference.book} ${reference.chapter}${
    reference.verse ? `:${reference.verse}` : ''
  }`;

  // Build a unified verse list keyed by verse number for alignment
  const allVerseNumbers = new Set();
  if (leftPassage) leftPassage.verses.forEach((v) => allVerseNumbers.add(v.number));
  if (rightPassage) rightPassage.verses.forEach((v) => allVerseNumbers.add(v.number));
  const verses = Array.from(allVerseNumbers).sort((a, b) => a - b);

  const leftMap = new Map((leftPassage?.verses || []).map((v) => [v.number, v.text]));
  const rightMap = new Map((rightPassage?.verses || []).map((v) => [v.number, v.text]));

  return (
    <div className="reader">
      <div className="reader__header">
        <h2 className="reader__title">{refLabel}</h2>
        <button
          className="reader__nav-btn"
          onClick={() =>
            setReference({
              ...reference,
              chapter: Math.max(1, reference.chapter - 1)
            })
          }
          aria-label="Previous chapter"
        >
          ‹
        </button>
        <button
          className="reader__nav-btn"
          onClick={() =>
            setReference({ ...reference, chapter: reference.chapter + 1 })
          }
          aria-label="Next chapter"
        >
          ›
        </button>
      </div>

      <div className="reader__columns">
        <div className="reader__column">
          <select
            className="reader__select"
            value={reader.leftTranslation}
            onChange={(e) => setLeftTranslation(e.target.value)}
          >
            {AVAILABLE_TRANSLATIONS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id} — {t.name}
              </option>
            ))}
          </select>
          <div className="reader__body">
            {loading && <p className="reader__placeholder">Loading…</p>}
            {!loading &&
              verses.map((n) => (
                <p key={`l-${n}`} className="reader__verse">
                  <span className="reader__verse-num">{n}</span>{' '}
                  {leftMap.get(n) || (
                    <span className="reader__missing">—</span>
                  )}
                </p>
              ))}
          </div>
        </div>

        <div className="reader__column">
          <select
            className="reader__select"
            value={reader.rightTranslation}
            onChange={(e) => setRightTranslation(e.target.value)}
          >
            {AVAILABLE_TRANSLATIONS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.id} — {t.name}
              </option>
            ))}
          </select>
          <div className="reader__body">
            {loading && <p className="reader__placeholder">Loading…</p>}
            {!loading &&
              verses.map((n) => (
                <p key={`r-${n}`} className="reader__verse">
                  <span className="reader__verse-num">{n}</span>{' '}
                  {rightMap.get(n) || (
                    <span className="reader__missing">—</span>
                  )}
                </p>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
