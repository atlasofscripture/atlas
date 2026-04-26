import * as Cesium from 'cesium';
import { isActiveInYear, getPersonLocationAtYear } from '../utils/time.js';

/**
 * People layer — shows where each person is "located" at the current year.
 *
 * A person's location at a given year is derived from their journey (if they
 * have one) or falls back to their primary residence. People who weren't
 * alive (or relevant) in the current year are hidden.
 */
export function renderPeopleLayer(ctx, visible, prevHandle) {
  const { viewer, currentYear, data, selectedEntity } = ctx;

  if (prevHandle) {
    prevHandle.entityIds.forEach((id) => {
      const e = viewer.entities.getById(id);
      if (e) viewer.entities.remove(e);
    });
  }

  if (!visible) return { entityIds: [] };

  const entityIds = [];

  Object.values(data.people).forEach((person) => {
    if (!isActiveInYear(person, currentYear)) return;

    const location = getPersonLocationAtYear(person, currentYear, data);
    if (!location) return;

    const isSelected =
      selectedEntity?.type === 'person' && selectedEntity.id === person.id;

    const id = `person:${person.id}`;
    const entity = viewer.entities.add({
      id,
      name: person.name,
      position: Cesium.Cartesian3.fromDegrees(location.lng, location.lat),
      point: {
        pixelSize: isSelected ? 14 : 10,
        color: Cesium.Color.fromCssColorString(
          isSelected ? '#e8a838' : '#9a3a2a'
        ),
        outlineColor: Cesium.Color.fromCssColorString('#f4ead5'),
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      },
      label: {
        text: person.name,
        font: '600 12px "Inter", sans-serif',
        fillColor: Cesium.Color.fromCssColorString('#f4ead5'),
        outlineColor: Cesium.Color.fromCssColorString('#1a0f08'),
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -14),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 6_000_000)
      }
    });

    entity.atlasEntity = { type: 'person', id: person.id };
    entityIds.push(id);
  });

  return { entityIds };
}
