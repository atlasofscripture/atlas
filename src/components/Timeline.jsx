import { useEffect, useRef } from 'react';
import { useAtlasStore } from '../store/atlasStore.js';
import { formatYear } from '../utils/time.js';

/**
 * Timeline scrubber — drives the entire atlas.
 *
 * Moving the scrubber updates `currentYear` in the store, which cascades to
 * the globe layers and the scripture reader. The play button advances time
 * automatically at `playbackSpeed` years per second.
 *
 * Era markers below the track show major biblical periods at a glance.
 */
const ERAS = [
  { from: -2000, to: -1500, label: 'Patriarchs' },
  { from: -1500, to: -1000, label: 'Exodus & Conquest' },
  { from: -1000, to: -586, label: 'Kingdoms' },
  { from: -586, to: -538, label: 'Exile' },
  { from: -538, to: -167, label: 'Second Temple' },
  { from: -167, to: -63, label: 'Hasmonean' },
  { from: -63, to: 70, label: 'Roman Judea' },
  { from: 30, to: 100, label: 'Apostolic' }
];

export default function Timeline() {
  const {
    currentYear,
    timelineMin,
    timelineMax,
    isPlaying,
    playbackSpeed,
    setCurrentYear,
    setPlaying,
    setPlaybackSpeed
  } = useAtlasStore();
  const animationRef = useRef(null);
  const lastTickRef = useRef(null);

  // Animation loop while playing
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      lastTickRef.current = null;
      return;
    }

    const tick = (now) => {
      if (lastTickRef.current === null) lastTickRef.current = now;
      const delta = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      const next = currentYear + delta * playbackSpeed;
      if (next >= timelineMax) {
        setCurrentYear(timelineMax);
        setPlaying(false);
      } else {
        setCurrentYear(next);
        animationRef.current = requestAnimationFrame(tick);
      }
    };

    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, currentYear, playbackSpeed, timelineMax, setCurrentYear, setPlaying]);

  const range = timelineMax - timelineMin;
  const percent = ((currentYear - timelineMin) / range) * 100;

  return (
    <div className="timeline">
      <div className="timeline__controls">
        <button
          className="timeline__btn"
          onClick={() => setPlaying(!isPlaying)}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '❚❚' : '▶'}
        </button>
        <select
          className="timeline__speed"
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
        >
          <option value={1}>1×</option>
          <option value={5}>5×</option>
          <option value={25}>25×</option>
          <option value={100}>100×</option>
          <option value={500}>500×</option>
        </select>
      </div>

      <div className="timeline__track-wrap">
        <div className="timeline__eras">
          {ERAS.map((era) => {
            const left = ((era.from - timelineMin) / range) * 100;
            const width = ((era.to - era.from) / range) * 100;
            return (
              <div
                key={era.label}
                className="timeline__era"
                style={{ left: `${left}%`, width: `${width}%` }}
                title={`${formatYear(era.from)} – ${formatYear(era.to)}`}
              >
                <span>{era.label}</span>
              </div>
            );
          })}
        </div>

        <input
          type="range"
          className="timeline__slider"
          min={timelineMin}
          max={timelineMax}
          step={0.5}
          value={currentYear}
          onChange={(e) => setCurrentYear(Number(e.target.value))}
        />

        <div className="timeline__ticks">
          {[-2000, -1500, -1000, -500, 0, 500].map((y) => (
            <span
              key={y}
              className="timeline__tick"
              style={{
                left: `${((y - timelineMin) / range) * 100}%`
              }}
            >
              {formatYear(y)}
            </span>
          ))}
        </div>

        <div
          className="timeline__cursor-label"
          style={{ left: `${percent}%` }}
        >
          {formatYear(currentYear)}
        </div>
      </div>
    </div>
  );
}
