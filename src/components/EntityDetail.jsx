import { useAtlasStore } from '../store/atlasStore.js';
import { formatYear } from '../utils/time.js';

/**
 * Floating detail panel — slides in when an entity is selected on the globe.
 *
 * Renders a different layout per entity type. Each detail view emphasizes
 * the relationships and references that make the entity meaningful, with
 * citation links into the data source files.
 */
export default function EntityDetail() {
  const { selectedEntity, clearSelection, people, places, events, journeys, sources, setReference } =
    useAtlasStore();

  if (!selectedEntity) return null;

  const renderInner = () => {
    switch (selectedEntity.type) {
      case 'person':
        return <PersonDetail person={people[selectedEntity.id]} sources={sources} />;
      case 'place':
        return <PlaceDetail place={places[selectedEntity.id]} sources={sources} />;
      case 'event':
        return <EventDetail event={events[selectedEntity.id]} sources={sources} />;
      case 'journey':
        return (
          <JourneyDetail
            journey={journeys[selectedEntity.id]}
            places={places}
            sources={sources}
          />
        );
      case 'contention':
        return (
          <ContentionDetail
            event={events[selectedEntity.id]}
            sources={sources}
          />
        );
      default:
        return <p>Selection: {selectedEntity.id}</p>;
    }
  };

  const onSeeReference = (ref) => {
    if (ref) setReference(ref);
  };

  return (
    <div className="detail">
      <button className="detail__close" onClick={clearSelection} aria-label="Close">
        ×
      </button>
      <div className="detail__inner">{renderInner()}</div>
    </div>
  );

  function PersonDetail({ person }) {
    if (!person) return <p>Unknown person.</p>;
    return (
      <>
        <span className="detail__type">Person</span>
        <h3 className="detail__name">{person.name}</h3>
        {person.altNames?.length > 0 && (
          <p className="detail__alt">also: {person.altNames.join(', ')}</p>
        )}
        <p className="detail__lifespan">
          {formatYear(person.bornAt)} – {formatYear(person.diedAt)}
        </p>
        {person.role && <p className="detail__role">{person.role}</p>}
        {person.summary && <p className="detail__summary">{person.summary}</p>}
        {person.references?.length > 0 && (
          <div className="detail__refs">
            <h4>References</h4>
            <ul>
              {person.references.map((ref, i) => (
                <li key={i}>
                  <button
                    className="detail__ref-link"
                    onClick={() => onSeeReference(ref)}
                  >
                    {ref.book} {ref.chapter}
                    {ref.verse ? `:${ref.verse}` : ''}
                  </button>
                  {ref.note && <span> — {ref.note}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
        <Citations sources={person.sources} sourceMap={sources} />
      </>
    );
  }

  function PlaceDetail({ place }) {
    if (!place) return <p>Unknown place.</p>;
    return (
      <>
        <span className="detail__type">Place</span>
        <h3 className="detail__name">{place.name}</h3>
        {place.altNames?.length > 0 && (
          <p className="detail__alt">also: {place.altNames.join(', ')}</p>
        )}
        {place.region && <p className="detail__role">{place.region}</p>}
        {place.summary && <p className="detail__summary">{place.summary}</p>}
        <Citations sources={place.sources} sourceMap={sources} />
      </>
    );
  }

  function EventDetail({ event }) {
    if (!event) return <p>Unknown event.</p>;
    return (
      <>
        <span className="detail__type detail__type--{event.category}">
          {event.category} event
        </span>
        <h3 className="detail__name">{event.name}</h3>
        <p className="detail__lifespan">
          {formatYear(event.startYear ?? event.year)}
          {event.endYear && event.endYear !== event.startYear
            ? ` – ${formatYear(event.endYear)}`
            : ''}
        </p>
        {event.summary && <p className="detail__summary">{event.summary}</p>}
        {event.references?.length > 0 && (
          <div className="detail__refs">
            <h4>References</h4>
            <ul>
              {event.references.map((ref, i) => (
                <li key={i}>
                  <button
                    className="detail__ref-link"
                    onClick={() => onSeeReference(ref)}
                  >
                    {ref.book} {ref.chapter}
                    {ref.verse ? `:${ref.verse}` : ''}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Citations sources={event.sources} sourceMap={sources} />
      </>
    );
  }

  function JourneyDetail({ journey, places }) {
    if (!journey) return <p>Unknown journey.</p>;
    return (
      <>
        <span className="detail__type">Journey</span>
        <h3 className="detail__name">{journey.name}</h3>
        {journey.summary && <p className="detail__summary">{journey.summary}</p>}
        <h4 className="detail__sub">Stops</h4>
        <ol className="detail__stops">
          {journey.stops.map((stop, i) => (
            <li key={i}>
              <strong>{places[stop.placeId]?.name || stop.placeId}</strong>
              {stop.year !== undefined && (
                <span className="detail__stop-year">
                  {' '}
                  · {formatYear(stop.year)}
                </span>
              )}
              {stop.note && <p className="detail__stop-note">{stop.note}</p>}
            </li>
          ))}
        </ol>
        <Citations sources={journey.sources} sourceMap={sources} />
      </>
    );
  }

  function ContentionDetail({ event }) {
    if (!event || !event.views) return <p>No contention data.</p>;
    return (
      <>
        <span className="detail__type detail__type--contention">
          Contested account
        </span>
        <h3 className="detail__name">{event.name}</h3>
        {event.summary && <p className="detail__summary">{event.summary}</p>}
        <h4 className="detail__sub">Views</h4>
        <div className="detail__views">
          {event.views.map((view, i) => (
            <article key={i} className="detail__view">
              <h5>{view.label}</h5>
              {view.summary && <p>{view.summary}</p>}
              {view.confidence && (
                <p className="detail__confidence">
                  Confidence: <em>{view.confidence}</em>
                </p>
              )}
              {view.sources?.length > 0 && (
                <Citations sources={view.sources} sourceMap={sources} compact />
              )}
            </article>
          ))}
        </div>
      </>
    );
  }
}

function Citations({ sources: sourceIds, sourceMap, compact }) {
  if (!sourceIds || sourceIds.length === 0) return null;
  return (
    <div className={`detail__citations ${compact ? 'detail__citations--compact' : ''}`}>
      <h4>Sources</h4>
      <ul>
        {sourceIds.map((id) => {
          const src = sourceMap?.[id];
          if (!src) return <li key={id}>{id}</li>;
          return (
            <li key={id}>
              <strong>{src.author || src.title}</strong>
              {src.year ? `, ${src.year}` : ''}
              {src.title && src.author ? `. ${src.title}` : ''}
              {src.url && (
                <>
                  {' '}
                  <a href={src.url} target="_blank" rel="noreferrer">
                    [link]
                  </a>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
