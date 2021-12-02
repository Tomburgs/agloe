import { css } from 'otion';
import { useEffect, useRef } from 'react';
import { Map as MapLibre } from 'maplibre-gl';

type LatLon = [number, number];

export interface MapboxProps {
  coordinates: LatLon;
}

const map = css({
  height: '600px',
});

export function Map(): JSX.Element {
  const mapInstanceRef = useRef<MapLibre | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    mapInstanceRef.current = new MapLibre({
      container: mapContainerRef.current,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAP_TOKEN}`,
      maxBounds: [
        /*
         * These bounds are taken directly from OSM PBF headers & hardcoded.
         * In future we may need to change these to be dynamically fetched.
         */
        [24.097802639008, 56.943557974387],
        [24.117500782013, 56.953938339056],
      ]
    })
  }, []);

  console.log(mapInstanceRef);

  return <div ref={mapContainerRef} className={map} />
}
