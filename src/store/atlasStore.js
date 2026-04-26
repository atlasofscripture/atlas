import { create } from 'zustand';

/**
 * Central state for Atlas of Scripture.
 *
 * The "current year" drives everything — the globe, the layers, the reader.
 * Layers are toggleable. Selection is what's highlighted. Reader translations
 * are an independent dual-pane choice.
 *
 * Years are numeric: negative = BCE, positive = CE. Year 0 doesn't exist
 * historically, but we allow it as a clean midpoint for math; entities should
 * use real BCE/CE values.
 */
export const useAtlasStore = create((set, get) => ({
  // ---------- Data ----------
  dataLoaded: false,
  people: {},
  places: {},
  events: {},
  journeys: {},
  relationships: [],
  sources: {},
  translations: {},

  setData: (data) => set({ ...data, dataLoaded: true }),

  // ---------- Time ----------
  // Default: ~47 CE (middle of Paul's first missionary journey, our seed slice)
  currentYear: 47,
  timelineMin: -4000,
  timelineMax: 100,
  isPlaying: false,
  playbackSpeed: 1, // years per second

  setCurrentYear: (year) => set({ currentYear: year }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

  // ---------- Layers ----------
  // Each layer is a self-contained module. Toggle visibility independently.
  layers: {
    geography: { visible: true, label: 'Geography' },
    people: { visible: true, label: 'People' },
    places: { visible: true, label: 'Places' },
    journeys: { visible: true, label: 'Journeys' },
    events: { visible: true, label: 'Events' },
    influence: { visible: false, label: 'Influence networks' },
    contention: { visible: false, label: 'Contested accounts' }
  },

  toggleLayer: (key) =>
    set((state) => ({
      layers: {
        ...state.layers,
        [key]: { ...state.layers[key], visible: !state.layers[key].visible }
      }
    })),

  // ---------- Selection ----------
  selectedEntity: null, // { type: 'person' | 'place' | 'event' | 'journey', id: string }
  selectEntity: (entity) => set({ selectedEntity: entity }),
  clearSelection: () => set({ selectedEntity: null }),

  // ---------- Reader ----------
  reader: {
    leftTranslation: 'KJV',
    rightTranslation: 'BSB',
    currentReference: null // e.g. { book: 'Acts', chapter: 13, verse: 1 }
  },

  setLeftTranslation: (t) =>
    set((state) => ({ reader: { ...state.reader, leftTranslation: t } })),
  setRightTranslation: (t) =>
    set((state) => ({ reader: { ...state.reader, rightTranslation: t } })),
  setReference: (ref) =>
    set((state) => ({ reader: { ...state.reader, currentReference: ref } })),

  // ---------- Derived helpers ----------
  /**
   * Returns true if an entity is "active" in the current year — meaning it
   * existed and was relevant at that point on the timeline.
   */
  isEntityActive: (entity) => {
    const year = get().currentYear;
    if (!entity) return false;
    const start = entity.activeFrom ?? entity.bornAt ?? -Infinity;
    const end = entity.activeTo ?? entity.diedAt ?? Infinity;
    return year >= start && year <= end;
  }
}));
