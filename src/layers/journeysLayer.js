import * as Cesium from 'cesium';

/**
 * Journeys layer — draws travel paths (Abraham, Exodus, Paul's missions, etc.)
 *
 * A journey progresses over time. At any given year, only the portion of the
 * journey that has "happened by now" is drawn solid; the rest is dimmed. When
 * the user is past the journey's end, the full path stays visible.
 */
export function renderJourneysLayer(ctx, visible, prevHandle) {
  const { viewer, currentYear, data, selectedEntity } = ctx;

  if (prevHandle) {
    prevHandle.entityIds.forEach((id) => {
      const e = viewer.entities.getById(id);
      if (e) viewer.entities.remove(e);
    });
  }

  if (!visible) return { entityIds: [] };

  const entityIds = [];

  Object.values(data.journeys).forEach((journey) => {
    if (!journey.stops || journey.stops.length < 2) return;

    // Has the journey started yet?
    const startYear = journey.startYear ?? journey.stops[0]?.year;
    if (startYear !== undefined && startYear > currentYear) return;

    // Resolve each stop to coordinates (stops can reference place IDs)
    const resolvedStops = journey.stops
      .map((stop) => {
        const place = data.places[stop.placeId];
        if (!place?.coordinates) return null;
        return {
          ...stop,
          lng: place.coordinates.lng,
          lat: place.coordinates.lat,
          placeName: place.name
        };
      })
      .filter(Boolean);

    if (resolvedStops.length < 2) return;

    // How far along the journey are we?
    const progressedStops = resolvedStops.filter(
      (s) => s.year === undefined || s.year <= currentYear
    );

    const isSelected =
      selectedEntity?.type === 'journey' && selectedEntity.id === journey.id;

    // Draw the progressed portion as a solid polyline
    if (progressedStops.length >= 2) {
      const positions = progressedStops.flatMap((s) => [s.lng, s.lat]);
      const id = `journey:${journey.id}:progressed`;
      const entity = viewer.entities.add({
        id,
        name: journey.name,
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(positions),
          width: isSelected ? 4 : 3,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.25,
            color: Cesium.Color.fromCssColorString(
              journey.color || '#e8a838'
            )
          }),
          clampToGround: true
        }
      });
      entity.atlasEntity = { type: 'journey', id: journey.id };
      entityIds.push(id);
    }

    // Mark each progressed stop with a pin
    progressedStops.forEach((stop, i) => {
      const id = `journey:${journey.id}:stop:${i}`;
      const stopEntity = viewer.entities.add({
        id,
        position: Cesium.Cartesian3.fromDegrees(stop.lng, stop.lat),
        point: {
          pixelSize: 6,
          color: Cesium.Color.fromCssColorString(journey.color || '#e8a838'),
          outlineColor: Cesium.Color.fromCssColorString('#1a0f08'),
          outlineWidth: 1.5,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        }
      });
      stopEntity.atlasEntity = { type: 'journey', id: journey.id };
      entityIds.push(id);
    });
  });

  return { entityIds };
}
