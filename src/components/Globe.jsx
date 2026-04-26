import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { useAtlasStore } from '../store/atlasStore.js';
import { renderPeopleLayer } from '../layers/peopleLayer.js';
import { renderPlacesLayer } from '../layers/placesLayer.js';
import { renderJourneysLayer } from '../layers/journeysLayer.js';
import { renderEventsLayer } from '../layers/eventsLayer.js';
import { renderInfluenceLayer } from '../layers/influenceLayer.js';
import { renderContentionLayer } from '../layers/contentionLayer.js';

// Configure the Cesium ion token from env. If absent, Cesium falls back to
// limited offline imagery, which is still usable for development.
const ionToken = import.meta.env.VITE_CESIUM_ION_TOKEN;
if (ionToken) {
  Cesium.Ion.defaultAccessToken = ionToken;
}

/**
 * Globe component — the spatial canvas for the atlas.
 *
 * The Cesium viewer is created once and held in a ref. State changes from the
 * store (current year, layer visibility, selection) drive incremental updates
 * to the entities on the globe rather than recreating the viewer.
 *
 * Each layer module is responsible for producing/updating its own entities.
 * This keeps the globe itself ignorant of biblical content — it's just a
 * stage. New layers can be added without touching this file.
 */
export default function Globe() {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const layerHandlesRef = useRef({});

  const {
    currentYear,
    layers,
    people,
    places,
    events,
    journeys,
    relationships,
    selectedEntity,
    selectEntity,
    dataLoaded
  } = useAtlasStore();

  // Initialize the Cesium viewer once
  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    const viewer = new Cesium.Viewer(containerRef.current, {
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      shouldAnimate: true
    });

    // Subtle styling tweaks
    viewer.scene.globe.enableLighting = true;
    viewer.scene.skyAtmosphere.show = true;
    viewer.scene.fog.enabled = true;
    viewer.scene.globe.atmosphereLightIntensity = 7.0;

    // Center on the ancient Near East — the heart of biblical geography
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(35.2, 31.5, 4_500_000)
    });

    // Click handler for entity selection
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((click) => {
      const picked = viewer.scene.pick(click.position);
      if (Cesium.defined(picked) && picked.id && picked.id.atlasEntity) {
        selectEntity(picked.id.atlasEntity);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    viewerRef.current = viewer;

    return () => {
      handler.destroy();
      viewer.destroy();
      viewerRef.current = null;
    };
  }, [selectEntity]);

  // Re-render layers whenever data, year, or layer toggles change.
  // Each layer module manages its own Cesium entities idempotently.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !dataLoaded) return;

    const ctx = {
      viewer,
      currentYear,
      selectedEntity,
      data: { people, places, events, journeys, relationships }
    };

    layerHandlesRef.current.places = renderPlacesLayer(
      ctx,
      layers.places.visible,
      layerHandlesRef.current.places
    );
    layerHandlesRef.current.people = renderPeopleLayer(
      ctx,
      layers.people.visible,
      layerHandlesRef.current.people
    );
    layerHandlesRef.current.journeys = renderJourneysLayer(
      ctx,
      layers.journeys.visible,
      layerHandlesRef.current.journeys
    );
    layerHandlesRef.current.events = renderEventsLayer(
      ctx,
      layers.events.visible,
      layerHandlesRef.current.events
    );
    layerHandlesRef.current.influence = renderInfluenceLayer(
      ctx,
      layers.influence.visible,
      layerHandlesRef.current.influence
    );
    layerHandlesRef.current.contention = renderContentionLayer(
      ctx,
      layers.contention.visible,
      layerHandlesRef.current.contention
    );
  }, [
    dataLoaded,
    currentYear,
    layers,
    people,
    places,
    events,
    journeys,
    relationships,
    selectedEntity
  ]);

  return <div ref={containerRef} className="globe-container" />;
}
