import * as Cesium from 'cesium';
import { isActiveInYear, getPersonLocationAtYear } from '../utils/time.js';

/**
 * Influence layer — visualizes non-genealogical relationships:
 * mentor/disciple, prophet/audience, apostle/church, teacher/student.
 *
 * Drawn as arcs between the influencer and the influenced, only when both
 * are alive in the current year. Distinct from family lineage (which is its
 * own future layer).
 */
const INFLUENCE_TYPES = new Set([
  'mentored',
  'discipled',
  'taught',
  'prophesied_to',
  'commissioned',
  'wrote_to',
  'planted_church'
]);

export function renderInfluenceLayer(ctx, visible, prevHandle) {
  const { viewer, currentYear, data } = ctx;

  if (prevHandle) {
    prevHandle.entityIds.forEach((id) => {
      const e = viewer.entities.getById(id);
      if (e) viewer.entities.remove(e);
    });
  }

  if (!visible) return { entityIds: [] };

  const entityIds = [];

  data.relationships.forEach((rel) => {
    if (!INFLUENCE_TYPES.has(rel.type)) return;

    // Both ends must be people active in this year
    const from = data.people[rel.from];
    const to = data.people[rel.to];
    if (!from || !to) return;
    if (!isActiveInYear(from, currentYear)) return;
    if (!isActiveInYear(to, currentYear)) return;

    const fromLoc = getPersonLocationAtYear(from, currentYear, data);
    const toLoc = getPersonLocationAtYear(to, currentYear, data);
    if (!fromLoc || !toLoc) return;

    const id = `influence:${rel.from}:${rel.type}:${rel.to}`;
    const entity = viewer.entities.add({
      id,
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          fromLoc.lng, fromLoc.lat, 100_000,
          toLoc.lng, toLoc.lat, 100_000
        ]),
        width: 2,
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.fromCssColorString('#9d6ec4').withAlpha(0.7),
          dashLength: 12
        }),
        arcType: Cesium.ArcType.GEODESIC
      }
    });

    entity.atlasEntity = { type: 'relationship', id };
    entityIds.push(id);
  });

  return { entityIds };
}
