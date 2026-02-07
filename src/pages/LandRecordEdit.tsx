import { useParams, useNavigate } from "react-router-dom";
import { useLandRecord, useUpdateLandRecord } from "@/hooks/useLandRecords";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function LandRecordEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: record, isLoading } = useLandRecord(id);
  const updateMutation = useUpdateLandRecord();

  const [isFetchingCoords, setIsFetchingCoords] = useState(false);
  const [formData, setFormData] = useState({
    survey_number: "",
    khasra_number: "",
    owner_name: "",
    father_name: "",
    area_acres: "",
    area_hectares: "",
    district: "",
    land_type: "",
    latitude: "",
    longitude: "",
    market_value: "",
    government_value: "",
    status: "pending" as "verified" | "pending" | "disputed",
  });

  useEffect(() => {
    if (record) {
      setFormData({
        survey_number: record.survey_number || "",
        khasra_number: record.khasra_number || "",
        owner_name: record.owner_name || "",
        father_name: record.father_name || "",
        area_acres: record.area_acres?.toString() || "",
        area_hectares: record.area_hectares?.toString() || "",
        district: record.district || "",
        land_type: record.land_type || "",
        latitude: record.latitude?.toString() || "",
        longitude: record.longitude?.toString() || "",
        market_value: record.market_value?.toString() || "",
        government_value: record.government_value?.toString() || "",
        status: record.status,
      });
    }
  }, [record]);

  const handleGetCoordinates = async () => {
    const { district } = formData;

    if (!district) {
      toast.error("Please enter a District first.");
      return;
    }

    setIsFetchingCoords(true);
    try {
      // Generalize search: District, India
      const query = `${district}, India`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      );
      const results = await response.json();

      if (results && results.length > 0) {
        const { lat, lon, display_name } = results[0];
        setFormData(prev => ({
          ...prev,
          latitude: String(lat),
          longitude: String(lon)
        }));
        toast.success("Location updated successfully!");
        console.log("Detected location:", display_name);
      } else {
        toast.error("Could not auto-detect location.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error("Failed to fetch location data.");
    } finally {
      setIsFetchingCoords(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    await updateMutation.mutateAsync({
      id,
      survey_number: formData.survey_number,
      khasra_number: formData.khasra_number || null,
      owner_name: formData.owner_name,
      father_name: formData.father_name || null,
      area_acres: parseFloat(formData.area_acres),
      area_hectares: formData.area_hectares ? parseFloat(formData.area_hectares) : null,
      district: formData.district,
      taluka: null,
      village: null,
      land_type: formData.land_type || null,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      market_value: formData.market_value ? parseFloat(formData.market_value) : null,
      government_value: formData.government_value ? parseFloat(formData.government_value) : null,
      status: formData.status,
    });

    navigate(`/records/${id}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Record Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The land record you're looking for doesn't exist.
        </p>
        <Button onClick={() => navigate("/records")}>Back to Records</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/records/${id}`)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold">Edit Land Record</h1>
          <p className="text-muted-foreground">Update details for {record.survey_number}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="survey_number">Survey Number *</Label>
                <Input
                  id="survey_number"
                  value={formData.survey_number}
                  onChange={(e) => setFormData({ ...formData, survey_number: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="khasra_number">Khasra Number</Label>
                <Input
                  id="khasra_number"
                  value={formData.khasra_number}
                  onChange={(e) => setFormData({ ...formData, khasra_number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="land_type">Land Type</Label>
                <Select
                  value={formData.land_type}
                  onValueChange={(value) => setFormData({ ...formData, land_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agricultural">Agricultural</SelectItem>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner_name">Owner Name *</Label>
                <Input
                  id="owner_name"
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="father_name">Father's Name</Label>
                <Input
                  id="father_name"
                  value={formData.father_name}
                  onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district">District *</Label>
                <div className="flex gap-2">
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleGetCoordinates}
                    title="Recalculate coordinates from district"
                    disabled={isFetchingCoords}
                  >
                    {isFetchingCoords ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area_acres">Area (Acres) *</Label>
                <Input
                  id="area_acres"
                  type="number"
                  step="0.01"
                  value={formData.area_acres}
                  onChange={(e) => setFormData({ ...formData, area_acres: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area_hectares">Area (Hectares)</Label>
                <Input
                  id="area_hectares"
                  type="number"
                  step="0.01"
                  value={formData.area_hectares}
                  onChange={(e) => setFormData({ ...formData, area_hectares: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude (Auto)</Label>
                <Input
                  id="latitude"
                  type="text"
                  readOnly
                  className="bg-muted"
                  value={formData.latitude}
                  placeholder="e.g., 19.0760"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude (Auto)</Label>
                <Input
                  id="longitude"
                  type="text"
                  readOnly
                  className="bg-muted"
                  value={formData.longitude}
                  placeholder="e.g., 72.8777"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="market_value">Market Value (₹)</Label>
                <Input
                  id="market_value"
                  type="number"
                  value={formData.market_value}
                  onChange={(e) => setFormData({ ...formData, market_value: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="government_value">Government Value (₹)</Label>
                <Input
                  id="government_value"
                  type="number"
                  value={formData.government_value}
                  onChange={(e) => setFormData({ ...formData, government_value: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "verified" | "pending" | "disputed") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="disputed">Disputed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate(`/records/${id}`)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
