import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Loader2, FileText } from "lucide-react";

interface DocumentUploadProps {
  landRecordId: string;
  trigger?: React.ReactNode;
}

const documentTypes = [
  { value: "sale_deed", label: "Sale Deed" },
  { value: "mutation", label: "Mutation" },
  { value: "registry", label: "Registry" },
  { value: "title_deed", label: "Title Deed" },
  { value: "encumbrance", label: "Encumbrance Certificate" },
  { value: "map", label: "Land Map" },
  { value: "other", label: "Other" },
];

export function DocumentUpload({ landRecordId, trigger }: DocumentUploadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user || !title || !documentType) return;

    setUploading(true);
    try {
      // Create unique file path
      const fileExt = selectedFile.name.split(".").pop();
      const filePath = `${user.id}/${landRecordId}/${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("land-documents")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("land-documents")
        .getPublicUrl(filePath);

      // Create document record
      const { error: insertError } = await supabase.from("documents").insert({
        land_record_id: landRecordId,
        title,
        document_type: documentType,
        file_name: selectedFile.name,
        file_url: publicUrl,
        file_size: selectedFile.size,
        uploaded_by: user.id,
      });

      if (insertError) throw insertError;

      toast({
        title: "Document uploaded",
        description: "The document has been successfully uploaded.",
      });

      // Reset form
      setTitle("");
      setDocumentType("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setOpen(false);

      // Refresh documents list
      queryClient.invalidateQueries({ queryKey: ["documents", landRecordId] });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Upload Document
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Document Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Document Type *</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File *</Label>
            <Input
              ref={fileInputRef}
              id="file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
              onChange={handleFileSelect}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={uploading || !selectedFile || !title || !documentType}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
