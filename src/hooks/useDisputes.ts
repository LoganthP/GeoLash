import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Dispute {
  id: string;
  land_record_id: string;
  case_number: string;
  title: string;
  description: string | null;
  dispute_type: "boundary" | "ownership" | "inheritance" | "encroachment" | "other";
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  filed_by: string;
  assigned_to: string | null;
  filed_date: string;
  resolution_date: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useDisputes(filters?: {
  status?: string;
  priority?: string;
}) {
  return useQuery({
    queryKey: ["disputes", filters],
    queryFn: async () => {
      // Mock Data Initialization
      const stored = localStorage.getItem("mock_disputes");
      let disputes: any[] = [];
      const landRecords = JSON.parse(localStorage.getItem("mock_land_records") || "[]");

      if (stored) {
        disputes = JSON.parse(stored);
      } else {
        disputes = [
          {
            id: "d1",
            land_record_id: "4", // Linked to SUR-104 (Disputed status record)
            case_number: "DSP-KH38XJ92L",
            title: "Boundary Encroachment Issue",
            description: "Neighbor claims 3 meters of land on the north side.",
            dispute_type: "boundary",
            status: "open",
            priority: "high",
            filed_by: "1",
            assigned_to: "2",
            filed_date: new Date(Date.now() - 432000000).toISOString(),
            resolution_date: null,
            resolution_notes: null,
            created_at: new Date(Date.now() - 432000000).toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "d2",
            land_record_id: "2", // Linked to SUR-102 (Pending record)
            case_number: "DSP-992KJ29A",
            title: "Ownership Document Verification",
            description: "Original sale deed is missing signatures.",
            dispute_type: "ownership",
            status: "in_progress",
            priority: "medium",
            filed_by: "1",
            assigned_to: "2",
            filed_date: new Date(Date.now() - 100000000).toISOString(),
            resolution_date: null,
            resolution_notes: null,
            created_at: new Date(Date.now() - 100000000).toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "d3",
            land_record_id: "1", // Linked to SUR-101
            case_number: "DSP-773JKS88",
            title: "Inheritance Claim",
            description: "Claim filed by distant relative.",
            dispute_type: "inheritance",
            status: "resolved",
            priority: "low",
            filed_by: "3",
            assigned_to: "1",
            filed_date: new Date(Date.now() - 800000000).toISOString(),
            resolution_date: new Date().toISOString(),
            resolution_notes: "Claim dismissed due to lack of evidence.",
            created_at: new Date(Date.now() - 800000000).toISOString(),
            updated_at: new Date().toISOString(),
          }
        ];
        localStorage.setItem("mock_disputes", JSON.stringify(disputes));
      }

      // Join with land records for display
      const joinedDisputes = disputes.map(d => {
        const record = landRecords.find((r: any) => r.id === d.land_record_id);
        return {
          ...d,
          land_records: record ? {
            survey_number: record.survey_number,
            owner_name: record.owner_name
          } : { survey_number: "Unknown", owner_name: "Unknown" }
        };
      });

      // Filter locally
      let filtered = [...joinedDisputes];

      if (filters?.status && filters.status !== "all") {
        filtered = filtered.filter(d => d.status === filters.status);
      }

      if (filters?.priority && filters.priority !== "all") {
        filtered = filtered.filter(d => d.priority === filters.priority);
      }

      await new Promise(resolve => setTimeout(resolve, 300));
      return filtered;
    },
  });
}

export function useCreateDispute() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: {
      land_record_id: string;
      title: string;
      description?: string;
      dispute_type: Dispute["dispute_type"];
      priority?: Dispute["priority"];
    }) => {
      const { data: userData } = await supabase.auth.getUser();

      // Generate case number
      const caseNumber = `DSP-${Date.now().toString(36).toUpperCase()}`;

      const { data, error } = await supabase
        .from("disputes")
        .insert({
          ...input,
          case_number: caseNumber,
          filed_by: userData.user?.id!,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
      toast({
        title: "Dispute filed",
        description: "Your dispute has been successfully filed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to file dispute",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateDispute() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Dispute> & { id: string }) => {
      const { data, error } = await supabase
        .from("disputes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
      toast({
        title: "Dispute updated",
        description: "The dispute status has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update dispute",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
