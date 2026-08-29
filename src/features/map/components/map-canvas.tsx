"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type Props = {
  latitude: number;
  longitude: number;
};

export function MapCanvas({ latitude, longitude }: Props) {
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) {
      return;
    }

    const mapKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
    if (!mapKey) {
      return;
    }

    const map = new maplibregl.Map({
      container: el,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapKey}`,
      center: [longitude, latitude],
      zoom: 10
    });

    new maplibregl.Marker({ color: "#0f172a" }).setLngLat([longitude, latitude]).addTo(map);

    return () => {
      map.remove();
    };
  }, [latitude, longitude]);

  return <div className="h-[42vh] w-full rounded-xl border border-slate-200" ref={elementRef} />;
}
