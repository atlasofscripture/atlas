import { useEffect, useState } from 'react';
import Globe from './components/Globe.jsx';
import Timeline from './components/Timeline.jsx';
import ScriptureReader from './components/ScriptureReader.jsx';
import LayerPanel from './components/LayerPanel.jsx';
import EntityDetail from './components/EntityDetail.jsx';
import Header from './components/Header.jsx';
import { useAtlasStore } from './store/atlasStore.js';
import { loadAllData } from './api/dataLoader.js';

export default function App() {
  const setData = useAtlasStore((s) => s.setData);
  const dataLoaded = useAtlasStore((s) => s.dataLoaded);
  const [mobilePanel, setMobilePanel] = useState(null);

  useEffect(() => {
    loadAllData().then(setData);
  }, [setData]);

  const togglePanel = (panel) => {
    setMobilePanel((prev) => (prev === panel ? null : panel));
  };

  return (
    <div className="app">
      <Header
        onToggleLayers={() => togglePanel('layers')}
        onToggleReader={() => togglePanel('reader')}
      />
      <main className="app-main">
        <aside className={`app-sidebar app-sidebar--left${mobilePanel === 'layers' ? ' app-sidebar--open' : ''}`}>
          <LayerPanel />
        </aside>
        <section className="app-globe-region">
          <Globe />
          <EntityDetail />
        </section>
        <aside className={`app-sidebar app-sidebar--right${mobilePanel === 'reader' ? ' app-sidebar--open' : ''}`}>
          <ScriptureReader />
        </aside>
      </main>
      <footer className="app-timeline">
        <Timeline />
      </footer>
      {mobilePanel && (
        <div className="app-overlay" onClick={() => setMobilePanel(null)} />
      )}
      {!dataLoaded && (
        <div className="app-loading">
          <div className="app-loading__inner">
            <div className="app-loading__pulse" />
            <p>Loading the atlas&hellip;</p>
          </div>
        </div>
      )}
    </div>
  );
}
