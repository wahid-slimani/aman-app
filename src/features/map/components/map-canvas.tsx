"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type Props = {
  latitude: number;
  longitude: number;
  onLocationSelect?: (latitude: number, longitude: number) => void;
  onZoomChange?: (zoom: number) => void;
  onPointSelect?: (pointId: string) => void;
  showAllMode?: boolean;
  className?: string;
  points?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    label?: string;
  }>;
};

const FALLBACK_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors"
    }
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm"
    }
  ]
};

const ALGERIA_BOUNDS = new maplibregl.LngLatBounds([-8.67, 18.96], [11.99, 37.2]);

function getMapTilerStyleUrl(mapKey: string): string {
  return `https://api.maptiler.com/maps/streets-v2/style.json?key=${encodeURIComponent(mapKey)}`;
}

async function resolveMapStyle(): Promise<string | StyleSpecification> {
  const mapKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  if (!mapKey) {
    return FALLBACK_STYLE;
  }

  const styleUrl = getMapTilerStyleUrl(mapKey);
  try {
    const response = await fetch(styleUrl, { method: "GET" });
    if (response.ok) {
      const payload = (await response.json()) as Partial<StyleSpecification>;
      if (payload.version === 8 && payload.sources && payload.layers) {
        return styleUrl;
      }
      return FALLBACK_STYLE;
    }
  } catch {
    // Network failure falls back to a public tile style.
  }

  return FALLBACK_STYLE;
}

export function MapCanvas({
  latitude,
  longitude,
  onLocationSelect,
  onZoomChange,
  onPointSelect,
  showAllMode,
  className,
  points
}: Props) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const pointMarkersRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const onLocationSelectRef = useRef<Props["onLocationSelect"]>(onLocationSelect);
  const onZoomChangeRef = useRef<Props["onZoomChange"]>(onZoomChange);
  const onPointSelectRef = useRef<Props["onPointSelect"]>(onPointSelect);
  const showAllModeRef = useRef<boolean>(Boolean(showAllMode));
  const initialCoordsRef = useRef<{ latitude: number; longitude: number }>({ latitude, longitude });

  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  useEffect(() => {
    onZoomChangeRef.current = onZoomChange;
  }, [onZoomChange]);

  useEffect(() => {
    onPointSelectRef.current = onPointSelect;
  }, [onPointSelect]);

  useEffect(() => {
    showAllModeRef.current = Boolean(showAllMode);
  }, [showAllMode]);

  useEffect(() => {
    const el = elementRef.current;
    if (!el || mapRef.current) {
      return;
    }

    const pointMarkers = pointMarkersRef.current;
    let disposed = false;

    void (async () => {
      const style = await resolveMapStyle();
      if (disposed) {
        return;
      }

      const map = new maplibregl.Map({
        container: el,
        style,
        center: [initialCoordsRef.current.longitude, initialCoordsRef.current.latitude],
        zoom: showAllModeRef.current ? 5 : 10
      });
      mapRef.current = map;
      onZoomChangeRef.current?.(map.getZoom());

      if (showAllModeRef.current) {
        map.fitBounds(ALGERIA_BOUNDS, { padding: 24, duration: 0, maxZoom: 6 });
      }

      const marker = new maplibregl.Marker({ color: "#0f172a", draggable: true })
        .setLngLat([initialCoordsRef.current.longitude, initialCoordsRef.current.latitude])
        .addTo(map);
      markerRef.current = marker;

      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        onLocationSelectRef.current?.(Number(lngLat.lat.toFixed(6)), Number(lngLat.lng.toFixed(6)));
      });

      map.on("click", (event) => {
        const target = event.originalEvent.target;
        if (target instanceof HTMLElement && target.closest("[data-map-point-marker='true']")) {
          return;
        }

        const nextLat = Number(event.lngLat.lat.toFixed(6));
        const nextLng = Number(event.lngLat.lng.toFixed(6));
        marker.setLngLat([nextLng, nextLat]);
        onLocationSelectRef.current?.(nextLat, nextLng);
      });

      map.on("zoomend", () => {
        onZoomChangeRef.current?.(map.getZoom());
      });
    })();

    return () => {
      disposed = true;
      for (const marker of pointMarkers.values()) {
        marker.remove();
      }
      pointMarkers.clear();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    if (showAllMode) {
      map.fitBounds(ALGERIA_BOUNDS, { padding: 24, duration: 450, maxZoom: 6 });
      return;
    }

    const nextCenter = [longitude, latitude] as [number, number];
    map.easeTo({ center: nextCenter, duration: 450 });
    markerRef.current?.setLngLat(nextCenter);
  }, [latitude, longitude, showAllMode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const nextPoints = points ?? [];
    const nextIds = new Set(nextPoints.map((point) => point.id));

    for (const [id, marker] of pointMarkersRef.current.entries()) {
      if (!nextIds.has(id)) {
        marker.remove();
        pointMarkersRef.current.delete(id);
      }
    }

    for (const point of nextPoints) {
      const existing = pointMarkersRef.current.get(point.id);
      if (existing) {
        existing.setLngLat([point.longitude, point.latitude]);
        continue;
      }

      const el = document.createElement("button");
      el.type = "button";
      el.className = "h-3.5 w-3.5 rounded-full border border-white bg-[#d21034] shadow";
      el.dataset.mapPointMarker = "true";
      el.setAttribute("aria-label", point.label ?? point.id);
      el.addEventListener("mousedown", (event) => event.stopPropagation());
      el.addEventListener("click", (event) => {
        event.stopPropagation();
      });
      el.addEventListener("click", () => {
        onPointSelectRef.current?.(point.id);
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([point.longitude, point.latitude])
        .addTo(map);

      pointMarkersRef.current.set(point.id, marker);
    }
  }, [points]);

  return <div className={className ?? "h-[42vh] w-full rounded-xl border border-slate-200"} ref={elementRef} />;
}
