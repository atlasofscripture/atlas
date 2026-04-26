import { formatYear } from '../utils/time.js';
import { useAtlasStore } from '../store/atlasStore.js';

export default function Header({ onToggleLayers, onToggleReader }) {
  const currentYear = useAtlasStore((s) => s.currentYear);

  return (
    <header className="app-header">
      <button className="app-header__mobile-btn" onClick={onToggleLayers} aria-label="Toggle layers panel">
        ☰
      </button>
      <div className="app-header__brand">
        <div className="app-header__mark">✦</div>
        <div>
          <h1 className="app-header__title">Atlas of Scripture</h1>
          <p className="app-header__subtitle">
            A spatiotemporal study of scripture
          </p>
        </div>
      </div>
      <div className="app-header__year">
        <span className="app-header__year-label">Now viewing</span>
        <span className="app-header__year-value">{formatYear(currentYear)}</span>
      </div>
      <nav className="app-header__nav">
        <a
          href="https://github.com/atlasofscripture/atlas"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
        <a href="#about">About</a>
        <a href="#support">Support</a>
      </nav>
      <button className="app-header__mobile-btn" onClick={onToggleReader} aria-label="Toggle reader panel">
        §
      </button>
    </header>
  );
}
