import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface OwnershipRecord {
  id: string;
  land_record_id: string;
  owner_name: string;
  owner_id: string | null;
  transfer_type: "purchase" | "inheritance" | "gift" | "partition" | "government_allotment";
  transfer_date: string;
  document_number: string | null;
  consideration_amount: number | null;
  created_at: string;
}

export function useOwnershipHistory(landRecordId: string | undefined) {
  return useQuery({
    queryKey: ["ownership-history", landRecordId],
    queryFn: async () => {
      if (!landRecordId) return [];

      const { data, error } = await supabase
        .from("ownership_history")
        .select("*")
        .eq("land_record_id", landRecordId)
        .order("transfer_date", { ascending: false });

      if (error) throw error;
      return data as OwnershipRecord[];
    },
    enabled: !!landRecordId,
  });
}

export function useAddOwnershipRecord() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: Omit<OwnershipRecord, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("ownership_history")
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["ownership-history", variables.land_record_id],
      });
      toast({
        title: "Ownership record added",
        description: "The ownership history has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add ownership record",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
