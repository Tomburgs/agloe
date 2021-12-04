import { css } from 'otion';
import { useEffect, useRef, useState } from 'react';
import { Map as MapLibre } from 'maplibre-gl';
import { skeleton } from '../styles/skeleton';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapProps {
  onLoaded?: (map: MapLibre) => void;
}

const container = css({
  position: 'relative',
});

const map = css({
  height: '550px',
  width: '500px',
  borderRadius: '0 0 10px 10px',
});

const placeholder = skeleton + css({
  height: '550px',
});

export function Map({ onLoaded }: MapProps): JSX.Element {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const mapInstanceRef = useRef<MapLibre | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mapContainerRef.current === null) {
      return;
    }

    const map = new MapLibre({
      container: mapContainerRef.current,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAP_TOKEN}`,
      zoom: 1,
      maxBounds: [
        /*
         * These bounds are taken directly from OSM PBF headers & hardcoded.
         * In future we may need to change these to be dynamically fetched.
         */
        [24.097802639008, 56.943557974387],
        [24.117500782013, 56.953938339056],
      ]
    });

    mapInstanceRef.current = map;
    map.on('load', () => {
      setIsLoaded(true);
      onLoaded?.(map);
    });
  }, []);

  return (
    <div className={container}>
      {!isLoaded && (
        <div className={placeholder} />
      )}
      <div
        ref={mapContainerRef}
        className={map}
        style={isLoaded ? {} : { visibility: 'hidden', position: 'absolute' }}
      />
    </div>
  );
}
