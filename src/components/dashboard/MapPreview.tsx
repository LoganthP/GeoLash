import { MapPin, Maximize2, Layers, ZoomIn, ZoomOut, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeafletMap, MapMarker } from "@/components/map/LeafletMap";
import { useLandRecords } from "@/hooks/useLandRecords";
import { useState, useRef } from "react";
import L from "leaflet";

export function MapPreview() {
  const { data: records } = useLandRecords();
  const [activeLayer, setActiveLayer] = useState<"satellite" | "terrain">("satellite");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleLayer = () => {
    setActiveLayer(prev => prev === "satellite" ? "terrain" : "satellite");
  };

  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const mapMarkers: MapMarker[] = records?.filter(r => r.latitude && r.longitude).map(r => ({
    id: r.id,
    lat: Number(r.latitude),
    lng: Number(r.longitude),
    title: r.survey_number,
    status: r.status,
    popupContent: `
      <div class="p-2">
        <p class="font-bold">Survey No: ${r.survey_number}</p>
        <p class="text-sm">${r.district}</p>
        <p class="text-xs capitalize status-${r.status}">${r.status}</p>
      </div>
    `
  })) || [];

  return (
    <div ref={containerRef} className="glass-card rounded-xl overflow-hidden card-shadow h-full flex flex-col bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm z-10 relative">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold">Land Parcel Map</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleLayer} title="Toggle Layer">
            <Layers className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleFullscreen} title="Toggle Fullscreen">
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      <div className="relative h-96 md:h-80 flex-1 w-full bg-muted/20">
        <LeafletMap
          markers={mapMarkers}
          showControls={false}
          activeLayer={activeLayer}
          onMapReady={(map) => { mapRef.current = map; }}
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
