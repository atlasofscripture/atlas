import * as Cesium from 'cesium';
import { isActiveInYear } from '../utils/time.js';

/**
 * Places layer — cities, towns, regions, sites of interest.
 *
 * Idempotent: pass the previous handle in to update; this function clears and
 * re-creates entities when relevant inputs change. Returns a handle for the
 * next call.
 */
export function renderPlacesLayer(ctx, visible, prevHandle) {
  const { viewer, currentYear, data } = ctx;

  // Clear previous entities
  if (prevHandle) {
    prevHandle.entityIds.forEach((id) => {
      const e = viewer.entities.getById(id);
      if (e) viewer.entities.remove(e);
    });
  }

  if (!visible) return { entityIds: [] };

  const entityIds = [];

  Object.values(data.places).forEach((place) => {
    if (!isActiveInYear(place, currentYear)) return;
    if (!place.coordinates) return;

    const id = `place:${place.id}`;
    const entity = viewer.entities.add({
      id,
      name: place.name,
      position: Cesium.Cartesian3.fromDegrees(
        place.coordinates.lng,
        place.coordinates.lat
      ),
      point: {
        pixelSize: 8,
        color: Cesium.Color.fromCssColorString('#d4a574'),
        outlineColor: Cesium.Color.fromCssColorString('#1a0f08'),
        outlineWidth: 1.5,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      },
      label: {
        text: place.name,
        font: '13px "Cormorant Garamond", serif',
        fillColor: Cesium.Color.fromCssColorString('#f4ead5'),
        outlineColor: Cesium.Color.fromCssColorString('#1a0f08'),
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -10),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 8_000_000),
        translucencyByDistance: new Cesium.NearFarScalar(2_000_000, 1.0, 8_000_000, 0.0)
      }
    });

    entity.atlasEntity = { type: 'place', id: place.id };
    entityIds.push(id);
  });

  return { entityIds };
}
