import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Document {
  id: string;
  land_record_id: string | null;
  title: string;
  document_type: string;
  file_url: string;
  file_name: string;
  file_size: number | null;
  uploaded_by: string;
  verified: boolean | null;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
}

export function useDocuments(landRecordId?: string) {
  return useQuery({
    queryKey: ["documents", landRecordId],
    queryFn: async () => {
      let query = supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (landRecordId) {
        query = query.eq("land_record_id", landRecordId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Document[];
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: {
      land_record_id?: string;
      title: string;
      document_type: string;
      file: File;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      // Upload file to storage
      const fileExt = input.file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("land-documents")
        .upload(filePath, input.file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("land-documents")
        .getPublicUrl(filePath);

      // Save document record
      const { data, error } = await supabase
        .from("documents")
        .insert({
          land_record_id: input.land_record_id || null,
          title: input.title,
          document_type: input.document_type,
          file_url: urlData.publicUrl,
          file_name: input.file.name,
          file_size: input.file.size,
          uploaded_by: userData.user.id,
        })
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      if (variables.land_record_id) {
        queryClient.invalidateQueries({
          queryKey: ["documents", variables.land_record_id],
        });
      }
      toast({
        title: "Document uploaded",
        description: "The document has been successfully uploaded.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to upload document",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useVerifyDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (documentId: string) => {
      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("documents")
        .update({
          verified: true,
          verified_by: userData.user?.id,
          verified_at: new Date().toISOString(),
        })
        .eq("id", documentId)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error("Verification failed - you may not have permission");
      }
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({
        title: "Document verified",
        description: "The document has been marked as verified.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to verify document",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (document: Document) => {
      // Extract file path from URL
      const urlParts = document.file_url.split("/");
      const filePath = urlParts.slice(-2).join("/"); // e.g., "documents/filename.pdf"

      // Delete from storage first
      const { error: storageError } = await supabase.storage
        .from("land-documents")
        .remove([filePath]);

      // Even if storage deletion fails, try to delete the record
      // (file might already be deleted or not exist)

      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", document.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete document",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
