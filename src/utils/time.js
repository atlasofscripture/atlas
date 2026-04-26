/**
 * Time-related helpers.
 *
 * Years are numeric: negative = BCE, positive = CE. We don't observe the
 * "no year zero" historical convention internally — entities should still
 * use historically-real values, but math with year=0 won't break.
 */

/**
 * Is an entity (person, place, etc.) "active" at the given year? An entity
 * is active when the year falls within its declared lifespan/usespan. If no
 * bounds are declared, the entity is always considered active.
 */
export function isActiveInYear(entity, year) {
  const start = entity.activeFrom ?? entity.bornAt ?? entity.foundedAt ?? -Infinity;
  const end = entity.activeTo ?? entity.diedAt ?? entity.destroyedAt ?? Infinity;
  return year >= start && year <= end;
}

/**
 * Resolve a person's location at a given year.
 *
 * Lookup order:
 *   1. If they have a journey, find the segment they're in at that year.
 *   2. Else, fall back to their primary residence.
 *   3. Else, their birthplace.
 *   4. Else, null.
 */
export function getPersonLocationAtYear(person, year, data) {
  // Journey lookup — find the most recent stop they've reached
  if (person.journeyId && data.journeys?.[person.journeyId]) {
    const journey = data.journeys[person.journeyId];
    const reached = journey.stops
      .map((stop) => {
        const place = data.places[stop.placeId];
        if (!place?.coordinates) return null;
        return { ...stop, place };
      })
      .filter((s) => s && (s.year === undefined || s.year <= year));

    if (reached.length > 0) {
      const last = reached[reached.length - 1];
      return last.place.coordinates;
    }
  }

  // Residence fallback
  const residenceId = person.residenceId || person.birthplaceId;
  if (residenceId && data.places?.[residenceId]?.coordinates) {
    return data.places[residenceId].coordinates;
  }

  return null;
}

/**
 * Format a year for display: "47 CE", "586 BCE".
 */
export function formatYear(year) {
  if (year === undefined || year === null) return '';
  const rounded = Math.round(year);
  if (rounded < 0) return `${Math.abs(rounded)} BCE`;
  if (rounded === 0) return '1 BCE/CE'; // historical convention quirk
  return `${rounded} CE`;
}
