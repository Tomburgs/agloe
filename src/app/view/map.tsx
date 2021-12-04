import { Icon } from 'components/icon';
import { Map } from 'components/map';
import {
  LngLatBounds,
  LngLatLike,
  Map as MapLibre,
  Marker,
} from 'maplibre-gl';
import { css } from 'otion';
import { useCallback } from 'react';
import { colors } from 'styles/colors';
import { typography } from 'styles/typography';

const head = css({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  boxSizing: 'border-box',
  padding: '0 20px',
  height: 50,
  backgroundColor: '#fafafa',
  borderRadius: '10px 10px 0 0',
});

const back = css({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  border: 'none',
  background: 'none',
  padding: 0,
  selectors: {
    '& path': {
      fill: typography.color.primary,
    },
  },
});

const title = css({
  margin: 0,
  fontSize: typography.size[1],
  fontWeight: 400,
  color: typography.color.primary,
});

interface MapViewProps {
  entity: Entity;
  onBack: VoidFunction;
}

export function MapView({ entity, onBack }: MapViewProps): JSX.Element {
  const onLoadAddMark = useCallback((map: MapLibre) => {
    switch (entity.type) {
      case 'node':
        const marker = new Marker();

        marker.setLngLat([entity.lon, entity.lat]);
        marker.addTo(map);

        map.easeTo({
          center: [entity.lon, entity.lat],
          essential: true,
          duration: 800,
        });

        break;
      case 'way':
        map.addSource('way', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: entity.nodes.map(({ lon, lat }) => [lon, lat]),
            }
          }
        }).addLayer({
          id: 'way',
          type: 'line',
          source: 'way',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': colors.blue,
            'line-width': 8
          }
        });

        const startBounds: LngLatLike = [entity.nodes[0].lon, entity.nodes[0].lat];
        const startLngLatBounds = new LngLatBounds(startBounds, startBounds);

        const bounds = entity.nodes.reduce<LngLatBounds>((bounds, { lon, lat }) => (
          bounds.extend([lon, lat])
        ), startLngLatBounds);

        map.fitBounds(bounds, {
          padding: 40,
          duration: 800,
          essential: true,
        });

        break;
    }
  }, []);

  return (
    <div>
      <div className={head}>
        <button onClick={onBack} className={back}>
          <Icon name="arrow-left" />
        </button>
        <h1 className={title}>{entity.name}</h1>
      </div>
      <Map onLoaded={onLoadAddMark} />
    </div>
  );
}
