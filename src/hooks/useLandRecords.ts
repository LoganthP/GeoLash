import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface LandRecord {
  id: string;
  survey_number: string;
  khasra_number: string | null;
  owner_name: string;
  owner_id: string | null;
  father_name: string | null;
  area_acres: number;
  area_hectares: number | null;
  district: string;
  taluka: string | null;
  village: string | null;
  land_type: string | null;
  status: "verified" | "pending" | "disputed";
  latitude: number | null;
  longitude: number | null;
  polygon_coordinates: any;
  registration_date: string | null;
  market_value: number | null;
  government_value: number | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CreateLandRecordInput {
  survey_number: string;
  khasra_number?: string;
  owner_name: string;
  father_name?: string;
  area_acres: number;
  area_hectares?: number;
  district: string;
  taluka?: string;
  village?: string;
  land_type?: string;
  latitude?: number;
  longitude?: number;
  polygon_coordinates?: any;
  market_value?: number;
  government_value?: number;
}

export function useLandRecords(filters?: {
  status?: string;
  district?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["land-records", filters],
    queryFn: async () => {
      // Initialize mock data if not present
      const stored = localStorage.getItem("mock_land_records");
      let records: LandRecord[] = [];

      if (stored) {
        records = JSON.parse(stored);
      } else {
        // Generate mock records
        records = [
          {
            id: "1",
            survey_number: "SUR-101",
            owner_name: "Rajesh Kumar",
            district: "Pune",
            village: "Mulshi",
            taluka: "Mulshi",
            area_acres: 5.5,
            land_type: "Agricultural",
            status: "verified",
            latitude: 18.5204,
            longitude: 73.8567,
            polygon_coordinates: [],
            registration_date: new Date().toISOString(),
            market_value: 5000000,
            government_value: 3000000,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: "1",
            khasra_number: null,
            owner_id: null,
            father_name: null,
            area_hectares: null,
          },
          {
            id: "2",
            survey_number: "SUR-102",
            owner_name: "Amit Singh",
            district: "Mumbai Suburban",
            village: "Bandra",
            taluka: "Bandra",
            area_acres: 2.1,
            land_type: "Commercial",
            status: "pending",
            latitude: 19.0596,
            longitude: 72.8295,
            polygon_coordinates: [],
            registration_date: new Date().toISOString(),
            market_value: 15000000,
            government_value: 8000000,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date().toISOString(),
            created_by: "1",
            khasra_number: null,
            owner_id: null,
            father_name: null,
            area_hectares: null,
          },
          {
            id: "3",
            survey_number: "SUR-103",
            owner_name: "Suresh Patil",
            district: "Nashik",
            village: "Deolali",
            taluka: "Nashik",
            area_acres: 10.0,
            land_type: "Agricultural",
            status: "verified",
            latitude: 19.9975,
            longitude: 73.7898,
            polygon_coordinates: [],
            registration_date: new Date(Date.now() - 172800000).toISOString(),
            market_value: 4000000,
            government_value: 2000000,
            created_at: new Date(Date.now() - 172800000).toISOString(),
            updated_at: new Date().toISOString(),
            created_by: "1",
            khasra_number: null,
            owner_id: null,
            father_name: null,
            area_hectares: null,
          },
          {
            id: "4",
            survey_number: "SUR-104",
            owner_name: "Priya Desai",
            district: "Nagpur",
            village: "Sitabuldi",
            taluka: "Nagpur",
            area_acres: 1.5,
            land_type: "Residential",
            status: "disputed",
            latitude: 21.1458,
            longitude: 79.0882,
            polygon_coordinates: [],
            registration_date: new Date(Date.now() - 259200000).toISOString(),
            market_value: 6000000,
            government_value: 3500000,
            created_at: new Date(Date.now() - 259200000).toISOString(),
            updated_at: new Date().toISOString(),
            created_by: "1",
            khasra_number: null,
            owner_id: null,
            father_name: null,
            area_hectares: null,
          },
          {
            id: "5",
            survey_number: "SUR-105",
            owner_name: "Vijay Mallya",
            district: "Aurangabad",
            village: "Waluj",
            taluka: "Aurangabad",
            area_acres: 50.0,
            land_type: "Industrial",
            status: "pending",
            latitude: 19.8762,
            longitude: 75.3433,
            polygon_coordinates: [],
            registration_date: new Date(Date.now() - 500000000).toISOString(),
            market_value: 100000000,
            government_value: 60000000,
            created_at: new Date(Date.now() - 500000000).toISOString(),
            updated_at: new Date().toISOString(),
            created_by: "1",
            khasra_number: null,
            owner_id: null,
            father_name: null,
            area_hectares: null,
          },
          {
            id: "6",
            survey_number: "SUR-106",
            owner_name: "Anjali Sharma",
            district: "Pune",
            village: "Baner",
            taluka: "Haveli",
            area_acres: 0.8,
            land_type: "Residential",
            status: "verified",
            latitude: 18.5590,
            longitude: 73.7868,
            polygon_coordinates: [],
            registration_date: new Date().toISOString(),
            market_value: 9000000,
            government_value: 6500000,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: "1",
            khasra_number: null,
            owner_id: null,
            father_name: null,
            area_hectares: null,
          },
          {
            id: "7",
            survey_number: "SUR-107",
            owner_name: "Ramesh Pawar",
            district: "Satara",
            village: "Koregaon",
            taluka: "Koregaon",
            area_acres: 3.2,
            land_type: "Agricultural",
            status: "pending",
            latitude: 17.6914,
            longitude: 74.0009,
            polygon_coordinates: [],
            registration_date: new Date().toISOString(),
            market_value: 2500000,
            government_value: 1500000,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: "1",
            khasra_number: null,
            owner_id: null,
            father_name: null,
            area_hectares: null,
          },
          {
            id: "8",
            survey_number: "SUR-108",
            owner_name: "Sneha Redkar",
            district: "Ratnagiri",
            village: "Chiplun",
            taluka: "Chiplun",
            area_acres: 1.8,
            land_type: "Residential",
            status: "verified",
            latitude: 17.5323,
            longitude: 73.5186,
            polygon_coordinates: [],
            registration_date: new Date().toISOString(),
            market_value: 4500000,
            government_value: 2800000,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: "1",
            khasra_number: null,
            owner_id: null,
            father_name: null,
            area_hectares: null,
          },
          {
            id: "9",
            survey_number: "SUR-109",
            owner_name: "Vikram Gokhale",
            district: "Kolhapur",
            village: "Karvir",
            taluka: "Karvir",
            area_acres: 12.5,
            land_type: "Agricultural",
            status: "verified",
            latitude: 16.7050,
            longitude: 74.2433,
            polygon_coordinates: [],
            registration_date: new Date().toISOString(),
            market_value: 8000000,
            government_value: 5000000,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: "1",
            khasra_number: null,
            owner_id: null,
            father_name: null,
            area_hectares: null,
          }
        ];
        localStorage.setItem("mock_land_records", JSON.stringify(records));
      }

      // Filter locally
      let filtered = [...records];

      if (filters?.status && filters.status !== "all") {
        filtered = filtered.filter(r => r.status === filters.status);
      }

      if (filters?.district) {
        filtered = filtered.filter(r => r.district.toLowerCase().includes(filters.district!.toLowerCase()));
      }

      if (filters?.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(r =>
          r.survey_number.toLowerCase().includes(search) ||
          r.owner_name.toLowerCase().includes(search) ||
          r.village?.toLowerCase().includes(search)
        );
      }

      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 400));

      return filtered;
    },
  });
}

export function useLandRecord(id: string | undefined) {
  return useQuery({
    queryKey: ["land-record", id],
    queryFn: async () => {
      if (!id) return null;

      const stored = localStorage.getItem("mock_land_records");
      if (stored) {
        const records = JSON.parse(stored) as LandRecord[];
        const record = records.find(r => r.id === id);
        if (record) return record;
      }
      return null;
    },
    enabled: !!id,
  });
}

export function useCreateLandRecord() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateLandRecordInput) => {
      const { data: userData } = await supabase.auth.getUser();

      const newRecord: LandRecord = {
        id: Math.random().toString(36).substring(7),
        ...input,
        khasra_number: input.khasra_number || null,
        owner_id: null,
        father_name: input.father_name || null,
        area_hectares: input.area_hectares || null,
        village: input.village || "-",
        taluka: input.taluka || "-",
        land_type: input.land_type || "Agricultural",
        status: "pending",
        latitude: input.latitude || null,
        longitude: input.longitude || null,
        polygon_coordinates: input.polygon_coordinates || [],
        registration_date: new Date().toISOString(),
        market_value: input.market_value || null,
        government_value: input.government_value || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: userData.user?.id || "mock-user-id",
      };

      // Save to local storage
      const stored = localStorage.getItem("mock_land_records");
      const records = stored ? JSON.parse(stored) : [];
      const updatedRecords = [newRecord, ...records];
      localStorage.setItem("mock_land_records", JSON.stringify(updatedRecords));

      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return newRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["land-records"] });
      toast({
        title: "Land record created",
        description: "The land record has been successfully registered.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create land record",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateLandRecord() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<LandRecord> & { id: string }) => {
      // Mock update logic
      const stored = localStorage.getItem("mock_land_records");
      if (stored) {
        const records = JSON.parse(stored) as LandRecord[];
        const index = records.findIndex(r => r.id === id);

        if (index !== -1) {
          const updatedRecord = {
            ...records[index],
            ...updates,
            updated_at: new Date().toISOString(),
            village: updates.village || records[index].village || "-",
            taluka: updates.taluka || records[index].taluka || "-"
          };

          records[index] = updatedRecord;
          localStorage.setItem("mock_land_records", JSON.stringify(records));

          // Simulate delay
          await new Promise(resolve => setTimeout(resolve, 500));

          return updatedRecord;
        }
      }

      throw new Error("Land record not found or could not be updated");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["land-records"] });
      toast({
        title: "Land record updated",
        description: "The land record has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update land record",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteLandRecord() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("land_records")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["land-records"] });
      toast({
        title: "Land record deleted",
        description: "The land record has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete land record",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
