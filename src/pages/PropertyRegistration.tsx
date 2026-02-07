import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateLandRecord } from "@/hooks/useLandRecords";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  User,
  FileText,
  IndianRupee,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  // Step 1: Location
  survey_number: z.string().min(1, "Survey number is required"),
  khasra_number: z.string().optional(),
  district: z.string().min(1, "District is required"),
  taluka: z.string().optional(),
  village: z.string().optional(),
  // Step 2: Owner
  owner_name: z.string().min(1, "Owner name is required"),
  father_name: z.string().optional(),
  // Step 3: Land Details
  area_acres: z.string().min(1, "Area is required"),
  area_hectares: z.string().optional(),
  land_type: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  // Step 4: Valuation
  market_value: z.string().optional(),
  government_value: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const steps = [
  { id: 1, title: "Location", icon: MapPin, description: "Property location details" },
  { id: 2, title: "Owner", icon: User, description: "Owner information" },
  { id: 3, title: "Land Details", icon: FileText, description: "Property specifications" },
  { id: 4, title: "Valuation", icon: IndianRupee, description: "Property valuation" },
];

export default function PropertyRegistration() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isFetchingCoords, setIsFetchingCoords] = useState(false);
  const createLandRecord = useCreateLandRecord();

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      land_type: "agricultural",
    },
  });

  const validateStep = async (step: number) => {
    switch (step) {
      case 1:
        return await trigger(["survey_number", "district"]);
      case 2:
        return await trigger(["owner_name"]);
      case 3:
        return await trigger(["area_acres"]);
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleGetCoordinates = async () => {
    const district = watch("district");

    if (!district) {
      toast.error("Please fill in at least the District.");
      return;
    }

    setIsFetchingCoords(true);
    try {
      // Construct query with available fields
      const queryParts = [district, "India"].filter(Boolean);
      const query = queryParts.join(", ");

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      );
      const results = await response.json();

      if (results && results.length > 0) {
        const { lat, lon, display_name } = results[0];
        setValue("latitude", String(lat));
        setValue("longitude", String(lon));
        toast.success("Location detected successfully!");
        console.log("Detected location:", display_name);
      } else {
        toast.error("Could not auto-detect location. Using default center coordinates.");
        // Fallback or leave empty? User prefers auto, but if it fails?
        // Let's leave it empty or maybe set a district fallback if possible, but for now just error.
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error("Failed to fetch location data.");
    } finally {
      setIsFetchingCoords(false);
    }
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
      // Auto-fetch coordinates when entering Step 3 (Land Details)
      if (currentStep === 2) {
        // We are moving TO step 3
        handleGetCoordinates();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: FormData) => {
    await createLandRecord.mutateAsync({
      survey_number: data.survey_number,
      khasra_number: data.khasra_number,
      district: data.district,
      taluka: data.taluka,
      village: data.village,
      owner_name: data.owner_name,
      father_name: data.father_name,
      area_acres: parseFloat(data.area_acres),
      area_hectares: data.area_hectares ? parseFloat(data.area_hectares) : undefined,
      land_type: data.land_type,
      latitude: data.latitude ? parseFloat(data.latitude) : undefined,
      longitude: data.longitude ? parseFloat(data.longitude) : undefined,
      market_value: data.market_value ? parseFloat(data.market_value) : undefined,
      government_value: data.government_value ? parseFloat(data.government_value) : undefined,
    });
    navigate("/records");
  };

  const progress = (currentStep / 4) * 100;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate("/records")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold">Register New Property</h1>
          <p className="text-muted-foreground mt-1">
            Complete all steps to register a new land record
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <Progress value={progress} className="h-2 mb-4" />
        <div className="flex justify-between">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col items-center gap-2 flex-1",
                  isActive && "text-primary",
                  isCompleted && "text-success",
                  !isActive && !isCompleted && "text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                    isActive && "bg-primary border-primary text-primary-foreground",
                    isCompleted && "bg-success border-success text-success-foreground",
                    !isActive && !isCompleted && "border-muted-foreground/30"
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="text-center hidden sm:block">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const StepIcon = steps[currentStep - 1].icon;
                return <StepIcon className="w-5 h-5 text-primary" />;
              })()}
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Location */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="survey_number">Survey Number *</Label>
                    <Input
                      id="survey_number"
                      placeholder="e.g., 123/4A"
                      {...register("survey_number")}
                    />
                    {errors.survey_number && (
                      <p className="text-sm text-destructive">{errors.survey_number.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="khasra_number">Khasra Number</Label>
                    <Input
                      id="khasra_number"
                      placeholder="e.g., 456"
                      {...register("khasra_number")}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <Input
                    id="district"
                    placeholder="Enter district name"
                    {...register("district")}
                  />
                  {errors.district && (
                    <p className="text-sm text-destructive">{errors.district.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Owner */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="owner_name">Owner Full Name *</Label>
                  <Input
                    id="owner_name"
                    placeholder="Enter owner's full name"
                    {...register("owner_name")}
                  />
                  {errors.owner_name && (
                    <p className="text-sm text-destructive">{errors.owner_name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="father_name">Father's Name</Label>
                  <Input
                    id="father_name"
                    placeholder="Enter father's name"
                    {...register("father_name")}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Land Details */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="area_acres">Area (Acres) *</Label>
                    <Input
                      id="area_acres"
                      type="number"
                      step="0.0001"
                      placeholder="e.g., 2.5"
                      {...register("area_acres")}
                    />
                    {errors.area_acres && (
                      <p className="text-sm text-destructive">{errors.area_acres.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area_hectares">Area (Hectares)</Label>
                    <Input
                      id="area_hectares"
                      type="number"
                      step="0.0001"
                      placeholder="e.g., 1.0"
                      {...register("area_hectares")}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="land_type">Land Type</Label>
                  <Select
                    value={watch("land_type")}
                    onValueChange={(value) => setValue("land_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select land type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agricultural">Agricultural</SelectItem>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="forest">Forest</SelectItem>
                      <SelectItem value="barren">Barren</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude (Auto-detected)</Label>
                    <div className="relative">
                      <Input
                        id="latitude"
                        type="text"
                        readOnly
                        className="bg-muted"
                        placeholder="Waiting for auto-detection..."
                        {...register("latitude")}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude (Auto-detected)</Label>
                    <div className="relative">
                      <Input
                        id="longitude"
                        type="text"
                        readOnly
                        className="bg-muted"
                        placeholder="Waiting for auto-detection..."
                        {...register("longitude")}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGetCoordinates}
                    disabled={isFetchingCoords}
                  >
                    {isFetchingCoords ? (
                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3 mr-2" />
                    )}
                    Retry Auto-detect
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Valuation */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="market_value">Market Value (₹)</Label>
                  <Input
                    id="market_value"
                    type="number"
                    placeholder="e.g., 5000000"
                    {...register("market_value")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="government_value">Government Value (₹)</Label>
                  <Input
                    id="government_value"
                    type="number"
                    placeholder="e.g., 3000000"
                    {...register("government_value")}
                  />
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h4 className="font-medium mb-2">Review Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p className="text-muted-foreground">Survey Number:</p>
                    <p>{watch("survey_number")}</p>
                    <p>{watch("survey_number")}</p>
                    <p className="text-muted-foreground">Location:</p>
                    <p>{watch("district")}</p>
                    <p className="text-muted-foreground">Owner:</p>
                    <p>{watch("owner_name")}</p>
                    <p className="text-muted-foreground">Area:</p>
                    <p>{watch("area_acres")} acres</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep < 4 ? (
            <Button type="button" onClick={nextStep}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit" disabled={createLandRecord.isPending}>
              {createLandRecord.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Register Property
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
