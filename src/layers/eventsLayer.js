import * as Cesium from 'cesium';

/**
 * Events layer — natural events, miracles, battles, covenants, etc.
 *
 * Events have a single year (or year range) and a location. They appear
 * briefly around their year and fade. The categoryRing color encodes type:
 * natural, miraculous, military, political, religious.
 */
const CATEGORY_COLORS = {
  natural: '#3a7d8a',
  miraculous: '#c9a036',
  military: '#8a2a2a',
  political: '#5a3a8a',
  religious: '#7a8a3a',
  default: '#888888'
};

const VISIBILITY_WINDOW = 5; // years before and after the event

export function renderEventsLayer(ctx, visible, prevHandle) {
  const { viewer, currentYear, data } = ctx;

  if (prevHandle) {
    prevHandle.entityIds.forEach((id) => {
      const e = viewer.entities.getById(id);
      if (e) viewer.entities.remove(e);
    });
  }

  if (!visible) return { entityIds: [] };

  const entityIds = [];

  Object.values(data.events).forEach((event) => {
    if (!event.coordinates) return;

    const eventStart = event.startYear ?? event.year;
    const eventEnd = event.endYear ?? event.year;
    if (eventStart === undefined) return;

    // Show the event when current year is near it
    const inWindow =
      currentYear >= eventStart - VISIBILITY_WINDOW &&
      currentYear <= eventEnd + VISIBILITY_WINDOW;
    if (!inWindow) return;

    const color =
      CATEGORY_COLORS[event.category] || CATEGORY_COLORS.default;

    // Pulse intensity is based on distance from the event year
    const distance = Math.max(
      0,
      Math.min(
        Math.abs(currentYear - eventStart),
        Math.abs(currentYear - eventEnd)
      )
    );
    const intensity = 1 - distance / VISIBILITY_WINDOW;

    const id = `event:${event.id}`;
    const entity = viewer.entities.add({
      id,
      name: event.name,
      position: Cesium.Cartesian3.fromDegrees(
        event.coordinates.lng,
        event.coordinates.lat
      ),
      ellipse: {
        semiMinorAxis: 30_000 + intensity * 50_000,
        semiMajorAxis: 30_000 + intensity * 50_000,
        material: Cesium.Color.fromCssColorString(color).withAlpha(
          0.2 + intensity * 0.3
        ),
        outline: true,
        outlineColor: Cesium.Color.fromCssColorString(color),
        height: 0,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      },
      label: {
        text: event.name,
        font: 'italic 12px "Cormorant Garamond", serif',
        fillColor: Cesium.Color.fromCssColorString('#f4ead5'),
        outlineColor: Cesium.Color.fromCssColorString('#1a0f08'),
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.TOP,
        pixelOffset: new Cesium.Cartesian2(0, 12),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5_000_000)
      }
    });

    entity.atlasEntity = { type: 'event', id: event.id };
    entityIds.push(id);
  });

  return { entityIds };
}
