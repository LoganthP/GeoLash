import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  status: "verified" | "pending" | "disputed";
  popupContent?: string;
  polygonCoordinates?: [number, number][] | null;
}

interface LeafletMapProps {
  markers?: MapMarker[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (marker: MapMarker) => void;
  selectedMarkerId?: string | null;
  className?: string;
  showControls?: boolean;
  onSearchLocation?: (lat: number, lng: number, name: string) => void;
  activeLayer?: "satellite" | "terrain";
  onMapStyleChange?: (style: "satellite" | "terrain") => void;
  onMapReady?: (map: L.Map) => void;
}

const statusColors = {
  verified: "#22c55e",
  pending: "#f59e0b",
  disputed: "#ef4444",
};

export function LeafletMap({
  markers = [],
  center = [20.5937, 78.9629], // Default to India center
  zoom = 5,
  onMarkerClick,
  selectedMarkerId,
  className,
  showControls = true,
  onSearchLocation,
  activeLayer,
  onMapStyleChange,
  onMapReady,
}: LeafletMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.CircleMarker>>(new Map());
  const polygonsRef = useRef<Map<string, L.Polygon>>(new Map());
  // Internal state only used if activeLayer prop is not provided, but we want to force control via props if possible
  const [localMapStyle, setLocalMapStyle] = useState<"satellite" | "terrain">("satellite");
  const [hasFittedBounds, setHasFittedBounds] = useState(false);

  // Use prop if available, otherwise local state
  const currentMapStyle = activeLayer || localMapStyle;
  const setMapStyle = (style: "satellite" | "terrain") => {
    setLocalMapStyle(style);
    onMapStyleChange?.(style);
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = L.map(mapContainer.current, {
      center,
      zoom,
      zoomControl: false,
    });

    // Add zoom control to top-left
    if (showControls) {
      L.control.zoom({ position: "topleft" }).addTo(map);
    }

    // Add satellite layer
    const satelliteLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles &copy; Esri",
        maxZoom: 19,
      }
    );

    const terrainLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }
    );

    satelliteLayer.addTo(map);
    mapRef.current = map;
    onMapReady?.(map);

    // Store layers for switching
    (map as any)._customLayers = { satellite: satelliteLayer, terrain: terrainLayer };
    (map as any)._currentLayer = "satellite"; // Initial layer added is satellite

    // If initial style is different, switch immediately
    if (activeLayer && activeLayer !== "satellite") {
      map.removeLayer(satelliteLayer);
      terrainLayer.addTo(map);
      (map as any)._currentLayer = activeLayer;
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Fit map to show all markers when they first load
  useEffect(() => {
    const map = mapRef.current;
    if (!map || hasFittedBounds || markers.length === 0) return;

    const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    setHasFittedBounds(true);
  }, [markers, hasFittedBounds]);

  // Handle layer switching
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const layers = (map as any)._customLayers;
    const currentLayer = (map as any)._currentLayer;

    if (layers[currentMapStyle] && currentLayer !== currentMapStyle) {
      map.removeLayer(layers[currentLayer]);
      layers[currentMapStyle].addTo(map);
      (map as any)._currentLayer = currentMapStyle;
    }
  }, [currentMapStyle]);

  // Sync prop activeLayer with internal state not needed anymore as we use derived state
  // kept blank to replace the deleted effect properly
  useEffect(() => { }, []);

  // Update markers and polygons
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers and polygons
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();
    polygonsRef.current.forEach((polygon) => polygon.remove());
    polygonsRef.current.clear();

    // Add new markers and polygons
    markers.forEach((markerData) => {
      const isSelected = selectedMarkerId === markerData.id;

      // Add polygon if coordinates exist
      if (markerData.polygonCoordinates && markerData.polygonCoordinates.length >= 3) {
        const polygon = L.polygon(markerData.polygonCoordinates, {
          color: statusColors[markerData.status],
          fillColor: statusColors[markerData.status],
          fillOpacity: isSelected ? 0.4 : 0.2,
          weight: isSelected ? 3 : 2,
        });

        polygon.on("click", () => {
          onMarkerClick?.(markerData);
        });

        polygon.addTo(map);
        polygonsRef.current.set(markerData.id, polygon);
      }

      // Add marker
      const circleMarker = L.circleMarker([markerData.lat, markerData.lng], {
        radius: isSelected ? 12 : 8,
        fillColor: statusColors[markerData.status],
        color: isSelected ? "#ffffff" : statusColors[markerData.status],
        weight: isSelected ? 3 : 2,
        opacity: 1,
        fillOpacity: 0.8,
      });

      if (markerData.popupContent) {
        circleMarker.bindPopup(markerData.popupContent, {
          className: "custom-popup",
        });
      }

      circleMarker.on("click", () => {
        onMarkerClick?.(markerData);
      });

      circleMarker.addTo(map);
      markersRef.current.set(markerData.id, circleMarker);
    });
  }, [markers, selectedMarkerId, onMarkerClick]);

  // Update selected marker/polygon styling and pan to selected
  useEffect(() => {
    const map = mapRef.current;

    markersRef.current.forEach((marker, id) => {
      const markerData = markers.find((m) => m.id === id);
      if (!markerData) return;

      const isSelected = selectedMarkerId === id;
      marker.setStyle({
        radius: isSelected ? 12 : 8,
        color: isSelected ? "#ffffff" : statusColors[markerData.status],
        weight: isSelected ? 3 : 2,
      });

      // Update polygon style too
      const polygon = polygonsRef.current.get(id);
      if (polygon) {
        polygon.setStyle({
          fillOpacity: isSelected ? 0.4 : 0.2,
          weight: isSelected ? 3 : 2,
        });
      }

      // Pan to selected marker and open popup
      if (isSelected && map) {
        map.setView([markerData.lat, markerData.lng], Math.max(map.getZoom(), 14), {
          animate: true,
          duration: 0.5,
        });
        marker.openPopup();
      }
    });
  }, [selectedMarkerId, markers]);

  // Geocoding search function exposed via ref
  const searchLocation = async (query: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      );
      const results = await response.json();
      if (results.length > 0) {
        const { lat, lon, display_name } = results[0];
        const map = mapRef.current;
        if (map) {
          map.setView([parseFloat(lat), parseFloat(lon)], 14, { animate: true });
          onSearchLocation?.(parseFloat(lat), parseFloat(lon), display_name);
        }
        return { lat: parseFloat(lat), lng: parseFloat(lon), name: display_name };
      }
      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };

  // Expose search function
  (window as any).__mapSearchLocation = searchLocation;

  return (
    <div className={cn("relative w-full h-full", className)}>
      <div ref={mapContainer} className="absolute inset-0 z-0" />

      {/* Map Style Toggle */}
      {showControls && (
        <div className="absolute top-20 left-3 z-[1000] flex flex-col gap-1">
          <button
            onClick={() => setMapStyle("satellite")}
            className={cn(
              "p-2 rounded-md transition-colors",
              currentMapStyle === "satellite"
                ? "bg-primary text-primary-foreground"
                : "bg-background/90 hover:bg-background text-foreground"
            )}
            title="Satellite View"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={() => setMapStyle("terrain")}
            className={cn(
              "p-2 rounded-md transition-colors",
              currentMapStyle === "terrain"
                ? "bg-primary text-primary-foreground"
                : "bg-background/90 hover:bg-background text-foreground"
            )}
            title="Terrain View"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] glass-card rounded-lg p-3 text-xs space-y-1.5">
        <div className="font-medium mb-2">Legend</div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-muted-foreground">Verified</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning" />
          <span className="text-muted-foreground">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span className="text-muted-foreground">Disputed</span>
        </div>
      </div>
    </div>
  );
}
