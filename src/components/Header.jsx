import { formatYear } from '../utils/time.js';
import { useAtlasStore } from '../store/atlasStore.js';

export default function Header() {
  const currentYear = useAtlasStore((s) => s.currentYear);

  return (
    <header className="app-header">
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
    </header>
  );
}
