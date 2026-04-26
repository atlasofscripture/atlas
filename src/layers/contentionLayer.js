import * as Cesium from 'cesium';

/**
 * Contention layer — the project's signature interpretive feature.
 *
 * Marks places and moments where biblical accounts conflict, manuscripts
 * differ, or scholarly views diverge. Each contention has multiple "views"
 * — selecting one shows that view's claims; the user can switch between
 * them.
 *
 * Examples:
 *   - Mt. Sinai: traditional location vs. proposed alternatives
 *   - Saul's death: 1 Samuel 31 vs. 2 Samuel 1 differ
 *   - Two creation accounts: Genesis 1 vs. Genesis 2
 *   - Synoptic differences: which Gospel placed which event when
 *
 * Visualized as ringed markers with a fracture-icon glyph. Clicking opens
 * the contention detail panel showing each view side by side with citations.
 */
export function renderContentionLayer(ctx, visible, prevHandle) {
  const { viewer, currentYear, data } = ctx;

  if (prevHandle) {
    prevHandle.entityIds.forEach((id) => {
      const e = viewer.entities.getById(id);
      if (e) viewer.entities.remove(e);
    });
  }

  if (!visible) return { entityIds: [] };

  const entityIds = [];

  // Contentions live alongside events for now; in future they may be their
  // own data type. We pull any event with a `views` array of length > 1.
  Object.values(data.events).forEach((event) => {
    if (!event.views || event.views.length < 2) return;

    // Show contentions when their associated event is in the timeline window
    const eventYear = event.startYear ?? event.year;
    if (eventYear === undefined) return;
    if (Math.abs(eventYear - currentYear) > 50) return;

    // Render a ring at each proposed view's coordinates
    event.views.forEach((view, i) => {
      if (!view.coordinates) return;

      const id = `contention:${event.id}:view:${i}`;
      const entity = viewer.entities.add({
        id,
        name: `${event.name} — ${view.label}`,
        position: Cesium.Cartesian3.fromDegrees(
          view.coordinates.lng,
          view.coordinates.lat
        ),
        ellipse: {
          semiMinorAxis: 80_000,
          semiMajorAxis: 80_000,
          material: Cesium.Color.TRANSPARENT,
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString('#c94a4a').withAlpha(0.9),
          outlineWidth: 2,
          height: 0
        },
        point: {
          pixelSize: 9,
          color: Cesium.Color.fromCssColorString('#c94a4a'),
          outlineColor: Cesium.Color.fromCssColorString('#f4ead5'),
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        },
        label: {
          text: `${event.name}\n(${view.label})`,
          font: 'italic 11px "Cormorant Garamond", serif',
          fillColor: Cesium.Color.fromCssColorString('#f4ead5'),
          outlineColor: Cesium.Color.fromCssColorString('#1a0f08'),
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          verticalOrigin: Cesium.VerticalOrigin.TOP,
          pixelOffset: new Cesium.Cartesian2(0, 14),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 4_000_000)
        }
      });

      entity.atlasEntity = {
        type: 'contention',
        id: event.id,
        viewIndex: i
      };
      entityIds.push(id);
    });
  });

  return { entityIds };
}
