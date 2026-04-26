import { useAtlasStore } from '../store/atlasStore.js';

const LAYER_DESCRIPTIONS = {
  geography: 'Terrain and ancient coastlines',
  people: 'Individuals at their location in the current year',
  places: 'Cities, towns, and sites',
  journeys: 'Animated travel paths',
  events: 'Battles, miracles, and natural events',
  influence: 'Mentor, prophet, and apostolic relationships',
  contention: 'Disputed accounts and locations'
};

export default function LayerPanel() {
  const layers = useAtlasStore((s) => s.layers);
  const toggleLayer = useAtlasStore((s) => s.toggleLayer);

  return (
    <div className="panel">
      <div className="panel__header">
        <h2 className="panel__title">Layers</h2>
        <p className="panel__subtitle">Toggle what appears on the globe</p>
      </div>
      <ul className="layer-list">
        {Object.entries(layers).map(([key, layer]) => (
          <li key={key} className="layer-list__item">
            <label className="layer-toggle">
              <input
                type="checkbox"
                checked={layer.visible}
                onChange={() => toggleLayer(key)}
              />
              <span className="layer-toggle__indicator" />
              <span className="layer-toggle__body">
                <span className="layer-toggle__label">{layer.label}</span>
                <span className="layer-toggle__desc">
                  {LAYER_DESCRIPTIONS[key]}
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>

      <div className="panel__divider" />

      <div className="panel__legend">
        <h3 className="panel__legend-title">Legend</h3>
        <ul className="legend-list">
          <li>
            <span className="legend-swatch" style={{ background: '#9a3a2a' }} />
            Person
          </li>
          <li>
            <span className="legend-swatch" style={{ background: '#d4a574' }} />
            Place
          </li>
          <li>
            <span className="legend-swatch" style={{ background: '#e8a838' }} />
            Journey path
          </li>
          <li>
            <span className="legend-swatch" style={{ background: '#c9a036' }} />
            Miraculous event
          </li>
          <li>
            <span className="legend-swatch" style={{ background: '#8a2a2a' }} />
            Military event
          </li>
          <li>
            <span className="legend-swatch" style={{ background: '#9d6ec4' }} />
            Influence link
          </li>
          <li>
            <span
              className="legend-swatch"
              style={{
                background: 'transparent',
                border: '2px solid #c94a4a'
              }}
            />
            Contested account
          </li>
        </ul>
      </div>
    </div>
  );
}
