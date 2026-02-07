import { useState, useRef } from "react";
import { Upload, FileText, Image, FileCheck, Download, Trash2, Eye, Plus, Search, Filter, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useDocuments, useUploadDocument, useVerifyDocument, useDeleteDocument, Document } from "@/hooks/useDocuments";
import { useAuth } from "@/contexts/AuthContext";

const statusStyles = {
  verified: "bg-success/10 text-success border-success/30",
  pending: "bg-warning/10 text-warning border-warning/30",
};

const getFileIcon = (name: string) => {
  if (name.endsWith(".pdf")) return FileText;
  if (name.endsWith(".jpg") || name.endsWith(".png") || name.endsWith(".jpeg")) return Image;
  return FileCheck;
};

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return "Unknown";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const documentTypes = [
  { value: "sale_deed", label: "Sale Deed" },
  { value: "mutation", label: "Mutation Certificate" },
  { value: "registry", label: "Registry" },
  { value: "title_deed", label: "Title Deed" },
  { value: "encumbrance", label: "Encumbrance Certificate" },
  { value: "map", label: "Survey Map" },
  { value: "other", label: "Other" },
];

const Documents = () => {
  const { userRole } = useAuth();
  const { data: documents, isLoading } = useDocuments();
  const uploadDocument = useUploadDocument();
  const verifyDocument = useVerifyDocument();
  const deleteDocument = useDeleteDocument();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
  
  // Upload form state
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = userRole === "admin" || userRole === "officer";

  const filteredDocs = (documents || []).filter((doc) => {
    const matchesSearch =
      doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || doc.document_type === typeFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "verified" ? doc.verified : !doc.verified);
      
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setUploadFile(files[0]);
      setUploadTitle(files[0].name.replace(/\.[^/.]+$/, ""));
      setIsUploadDialogOpen(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadFile(files[0]);
      setUploadTitle(files[0].name.replace(/\.[^/.]+$/, ""));
      setIsUploadDialogOpen(true);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle || !uploadType) return;
    
    setUploadProgress(0);
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null || prev >= 90) return prev;
        return prev + 10;
      });
    }, 200);
    
    try {
      await uploadDocument.mutateAsync({
        title: uploadTitle,
        document_type: uploadType,
        file: uploadFile,
      });
      setUploadProgress(100);
      setTimeout(() => {
        setUploadProgress(null);
        setIsUploadDialogOpen(false);
        resetUploadForm();
      }, 500);
    } catch (error) {
      setUploadProgress(null);
    } finally {
      clearInterval(progressInterval);
    }
  };

  const resetUploadForm = () => {
    setUploadTitle("");
    setUploadType("");
    setUploadFile(null);
  };

  const handleView = (doc: Document) => {
    window.open(doc.file_url, "_blank");
  };

  const handleDownload = async (doc: Document) => {
    const response = await fetch(doc.file_url);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.file_name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleVerify = async (doc: Document) => {
    await verifyDocument.mutateAsync(doc.id);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteDocument.mutateAsync(deleteTarget);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">
            Documents
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload and manage land record documents
          </p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="glow">
              <Plus className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Upload a new document to the system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Enter document title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Document Type</Label>
                <Select value={uploadType} onValueChange={setUploadType}>
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
                <Label>File</Label>
                {uploadFile ? (
                  <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm truncate flex-1">{uploadFile.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUploadFile(null)}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to select a file
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
              </div>
              {uploadProgress !== null && (
                <div>
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {uploadProgress === 100 ? "Upload complete!" : `Uploading... ${uploadProgress}%`}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsUploadDialogOpen(false); resetUploadForm(); }}>
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!uploadFile || !uploadTitle || !uploadType || uploadDocument.isPending}
              >
                {uploadDocument.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upload Zone */}
      <div
        className={cn(
          "glass-card rounded-xl p-8 border-2 border-dashed transition-all text-center",
          isDragging ? "border-primary bg-primary/5" : "border-border"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-display font-semibold mb-2">
          Drop files here to upload
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Supports PDF, JPG, PNG up to 10MB
        </p>
        <input
          type="file"
          className="hidden"
          id="browse-files"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
        />
        <Button variant="outline" onClick={() => document.getElementById("browse-files")?.click()}>
          Browse Files
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Document Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {documentTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={statusFilter === "all"}
              onCheckedChange={() => setStatusFilter("all")}
            >
              All Statuses
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter === "verified"}
              onCheckedChange={() => setStatusFilter("verified")}
            >
              Verified
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter === "pending"}
              onCheckedChange={() => setStatusFilter("pending")}
            >
              Pending
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Documents Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No documents found</p>
          <p className="text-sm">Upload your first document to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const FileIcon = getFileIcon(doc.file_name);
            const status = doc.verified ? "verified" : "pending";
            const typeLabel = documentTypes.find(t => t.value === doc.document_type)?.label || doc.document_type;
            
            return (
              <div
                key={doc.id}
                className="glass-card rounded-xl p-4 card-shadow hover:elevated-shadow transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate" title={doc.title}>
                      {doc.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">{typeLabel}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {doc.file_name}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant="outline" className={statusStyles[status]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(doc.file_size)}
                  </span>
                </div>
                
                <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                  <p>Uploaded {new Date(doc.created_at).toLocaleDateString()}</p>
                </div>
                
                <div className="mt-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(doc)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(doc)}>
                    <Download className="w-4 h-4" />
                  </Button>
                  {isAdmin && !doc.verified && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-success"
                      onClick={() => handleVerify(doc)}
                      disabled={verifyDocument.isPending}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive"
                    onClick={() => setDeleteTarget(doc)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteDocument.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Documents;
