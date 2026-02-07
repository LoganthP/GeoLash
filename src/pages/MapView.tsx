import { useState } from "react";
import { Layers, MapPin, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLandRecords } from "@/hooks/useLandRecords";
import { LeafletMap, MapMarker } from "@/components/map/LeafletMap";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useMapSettings } from "@/hooks/useMapSettings";

const statusColors = {
  verified: "bg-success",
  pending: "bg-warning",
  disputed: "bg-destructive",
};

const MapView = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedParcel, setSelectedParcel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { data: landRecords, isLoading } = useLandRecords();
  const { activeLayer, setLayer } = useMapSettings();

  // Filter records that have coordinates
  const mappedRecords = landRecords?.filter(r => r.latitude && r.longitude) || [];

  console.log("Debug - All Records:", landRecords);
  console.log("Debug - Mapped Records:", mappedRecords.map(r => ({
    id: r.id,
    lat: r.latitude,
    lng: r.longitude,
    survey: r.survey_number
  })));

  // Convert to map markers with polygon support
  const markers: MapMarker[] = mappedRecords.map(record => {
    // Parse polygon coordinates if they exist
    let polygonCoords: [number, number][] | null = null;
    if (record.polygon_coordinates) {
      try {
        const coords = record.polygon_coordinates as number[][];
        if (Array.isArray(coords) && coords.length >= 3) {
          polygonCoords = coords as [number, number][];
        }
      } catch {
        // Invalid polygon data, skip
      }
    }

    return {
      id: record.id,
      lat: parseFloat(String(record.latitude)),
      lng: parseFloat(String(record.longitude)),
      title: record.survey_number,
      status: record.status as "verified" | "pending" | "disputed",
      polygonCoordinates: polygonCoords,
      popupContent: `
        <div style="min-width: 180px;">
          <strong>${record.survey_number}</strong>
          <p style="margin: 4px 0; font-size: 12px; color: #666;">
            ${record.owner_name}
          </p>
          <p style="margin: 4px 0; font-size: 12px; color: #666;">
            ${record.area_acres} acres • ${record.village}
          </p>
        </div>
      `,
    };
  });

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedParcel(marker.id);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const searchFn = (window as any).__mapSearchLocation;
      if (searchFn) {
        const result = await searchFn(searchQuery);
        if (result) {
          toast({
            title: "Location found",
            description: result.name,
          });
        } else {
          toast({
            title: "Location not found",
            description: "Try a different search term",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Could not search for location",
        variant: "destructive",
      });
    }
    setIsSearching(false);
  };

  const selectedRecord = landRecords?.find(r => r.id === selectedParcel);

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">
            Map View
          </h1>
          <p className="text-muted-foreground mt-1">
            Interactive visualization of land parcels
          </p>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Map Container */}
        <div className="flex-1 glass-card rounded-xl card-shadow overflow-hidden relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <LeafletMap
              markers={markers}
              center={markers.length > 0 ? [markers[0].lat, markers[0].lng] : [20.5937, 78.9629]}
              zoom={markers.length > 0 ? 10 : 5}
              onMarkerClick={handleMarkerClick}
              selectedMarkerId={selectedParcel}
              activeLayer={activeLayer}
              onMapStyleChange={setLayer}
              className="w-full h-full"
            />
          )}

          {/* Search on Map */}
          <form
            onSubmit={handleSearch}
            className="absolute top-4 right-4 z-[1000] w-64"
          >
            <div className="relative">
              <Input
                placeholder="Search location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-card border-0 pr-10"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </form>

          {/* No data message */}
          {!isLoading && mappedRecords.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-[500]">
              <div className="text-center p-6">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-semibold mb-2">No Mapped Parcels</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Add coordinates to land records to see them on the map
                </p>
                <Button onClick={() => navigate("/register")}>
                  Register Property
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Parcel List */}
        <div className="w-80 glass-card rounded-xl card-shadow overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold">Land Parcels</h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {mappedRecords.length} parcels with coordinates
            </p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {isLoading ? (
              <div className="p-4 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : mappedRecords.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No parcels with location data
              </div>
            ) : (
              mappedRecords.map((record) => (
                <button
                  key={record.id}
                  className={cn(
                    "w-full p-4 text-left transition-colors",
                    selectedParcel === record.id
                      ? "bg-primary/10"
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => setSelectedParcel(record.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{record.survey_number}</span>
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        statusColors[record.status as keyof typeof statusColors]
                      )}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{record.owner_name}</p>
                  <p className="text-xs text-muted-foreground">{record.area_acres} acres</p>
                </button>
              ))
            )}
          </div>

          {/* Selected Parcel Details */}
          {selectedRecord && (
            <div className="p-4 border-t border-border bg-primary/5">
              <h4 className="font-medium mb-2">{selectedRecord.survey_number}</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Owner:</span> {selectedRecord.owner_name}
                </p>
                <p>
                  <span className="text-muted-foreground">Area:</span> {selectedRecord.area_acres} acres
                </p>
                <p>
                  <span className="text-muted-foreground">Location:</span> {selectedRecord.village}
                </p>
              </div>
              <Button
                size="sm"
                className="w-full mt-3"
                onClick={() => navigate(`/records/${selectedRecord.id}`)}
              >
                View Details
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;
