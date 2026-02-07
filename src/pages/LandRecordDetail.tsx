import { useParams, useNavigate } from "react-router-dom";
import { useLandRecord } from "@/hooks/useLandRecords";
import { useOwnershipHistory } from "@/hooks/useOwnershipHistory";
import { useDocuments } from "@/hooks/useDocuments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentUpload } from "@/components/documents/DocumentUpload";
import { OwnershipHistoryForm } from "@/components/ownership/OwnershipHistoryForm";
import {
  ArrowLeft,
  MapPin,
  User,
  Calendar,
  Ruler,
  IndianRupee,
  FileText,
  History,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  ExternalLink,
  Upload,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { LeafletMap, MapMarker } from "@/components/map/LeafletMap";

const statusConfig = {
  verified: {
    label: "Verified",
    icon: CheckCircle,
    className: "bg-success/10 text-success border-success/20",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-warning/10 text-warning border-warning/20",
  },
  disputed: {
    label: "Disputed",
    icon: AlertTriangle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

const transferTypeLabels: Record<string, string> = {
  purchase: "Purchase/Sale",
  inheritance: "Inheritance",
  gift: "Gift Deed",
  partition: "Partition",
  government_allotment: "Government Allotment",
};

const documentTypeLabels: Record<string, string> = {
  sale_deed: "Sale Deed",
  mutation: "Mutation",
  registry: "Registry",
  title_deed: "Title Deed",
  encumbrance: "Encumbrance Certificate",
  map: "Land Map",
  other: "Other",
};

export default function LandRecordDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: record, isLoading: recordLoading } = useLandRecord(id);
  const { data: ownershipHistory, isLoading: historyLoading } = useOwnershipHistory(id);
  const { data: documents, isLoading: docsLoading } = useDocuments(id);

  if (recordLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
          </div>
          <Skeleton className="h-96" />
        </div>
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

  const StatusIcon = statusConfig[record.status].icon;

  const mapMarker: MapMarker | null = record.latitude && record.longitude
    ? {
      id: record.id,
      lat: Number(record.latitude),
      lng: Number(record.longitude),
      title: record.survey_number,
      status: record.status,
    }
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/records")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-display font-bold">
                {record.survey_number}
              </h1>
              <Badge
                variant="outline"
                className={cn("gap-1", statusConfig[record.status].className)}
              >
                <StatusIcon className="w-3 h-3" />
                {statusConfig[record.status].label}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {record.district}, India
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/records/${id}/edit`)}>
            Edit Record
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Details Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Survey Number</p>
                  <p className="font-medium">{record.survey_number}</p>
                </div>
                {record.khasra_number && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Khasra Number</p>
                    <p className="font-medium">{record.khasra_number}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Land Type</p>
                  <p className="font-medium capitalize">{record.land_type || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Area (Acres)</p>
                  <p className="font-medium flex items-center gap-1">
                    <Ruler className="w-4 h-4 text-muted-foreground" />
                    {record.area_acres}
                  </p>
                </div>
                {record.area_hectares && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Area (Hectares)</p>
                    <p className="font-medium">{record.area_hectares}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Registration Date</p>
                  <p className="font-medium flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {record.registration_date
                      ? format(new Date(record.registration_date), "dd MMM yyyy")
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="border-t border-border mt-6 pt-6">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Owner Information
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Owner Name</p>
                    <p className="font-medium">{record.owner_name}</p>
                  </div>
                  {record.father_name && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Father's Name</p>
                      <p className="font-medium">{record.father_name}</p>
                    </div>
                  )}
                </div>
              </div>

              {(record.market_value || record.government_value) && (
                <div className="border-t border-border mt-6 pt-6">
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-primary" />
                    Valuation
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    {record.market_value && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Market Value</p>
                        <p className="font-medium text-lg">
                          ₹{Number(record.market_value).toLocaleString("en-IN")}
                        </p>
                      </div>
                    )}
                    {record.government_value && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Government Value</p>
                        <p className="font-medium text-lg">
                          ₹{Number(record.government_value).toLocaleString("en-IN")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs for History & Documents */}
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="history" className="gap-2">
                <History className="w-4 h-4" />
                Ownership History
              </TabsTrigger>
              <TabsTrigger value="documents" className="gap-2">
                <FileText className="w-4 h-4" />
                Documents ({documents?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="mt-4">
              <Card className="glass-card">
                <CardContent className="pt-6">
                  {historyLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-20" />
                      ))}
                    </div>
                  ) : ownershipHistory && ownershipHistory.length > 0 ? (
                    <div className="relative">
                      <div className="flex justify-end mb-4">
                        <OwnershipHistoryForm
                          landRecordId={id!}
                          trigger={
                            <Button variant="outline" size="sm">
                              <Plus className="w-4 h-4 mr-2" />
                              Add Transfer
                            </Button>
                          }
                        />
                      </div>
                      <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-border" />
                      <div className="space-y-6">
                        {ownershipHistory.map((entry, index) => (
                          <div key={entry.id} className="relative pl-10">
                            <div
                              className={cn(
                                "absolute left-2.5 w-3 h-3 rounded-full border-2",
                                index === 0
                                  ? "bg-primary border-primary"
                                  : "bg-background border-muted-foreground"
                              )}
                            />
                            <div className="glass-card rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-medium">{entry.owner_name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {transferTypeLabels[entry.transfer_type]}
                                  </p>
                                </div>
                                <Badge variant="outline">
                                  {format(new Date(entry.transfer_date), "dd MMM yyyy")}
                                </Badge>
                              </div>
                              {(entry.document_number || entry.consideration_amount) && (
                                <div className="flex gap-4 text-sm text-muted-foreground">
                                  {entry.document_number && (
                                    <span>Doc: {entry.document_number}</span>
                                  )}
                                  {entry.consideration_amount && (
                                    <span>
                                      Amount: ₹
                                      {Number(entry.consideration_amount).toLocaleString("en-IN")}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No ownership history available</p>
                      <OwnershipHistoryForm
                        landRecordId={id!}
                        trigger={
                          <Button variant="outline" className="mt-4">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Transfer Record
                          </Button>
                        }
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <Card className="glass-card">
                <CardContent className="pt-6">
                  {docsLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-16" />
                      ))}
                    </div>
                  ) : documents && documents.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex justify-end mb-4">
                        <DocumentUpload
                          landRecordId={id!}
                          trigger={
                            <Button variant="outline" size="sm">
                              <Upload className="w-4 h-4 mr-2" />
                              Upload New
                            </Button>
                          }
                        />
                      </div>
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{doc.title}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>{documentTypeLabels[doc.document_type]}</span>
                                {doc.verified && (
                                  <Badge variant="outline" className="bg-success/10 text-success text-xs">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                              <a href={doc.file_url} download={doc.file_name}>
                                <Download className="w-4 h-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No documents uploaded</p>
                      <DocumentUpload
                        landRecordId={id!}
                        trigger={
                          <Button variant="outline" className="mt-4">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Document
                          </Button>
                        }
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Map */}
        <div className="space-y-6">
          <Card className="glass-card overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-64">
                {mapMarker ? (
                  <LeafletMap
                    markers={[mapMarker]}
                    center={[mapMarker.lat, mapMarker.lng]}
                    zoom={15}
                    showControls={false}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-secondary/30 text-muted-foreground">
                    <div className="text-center">
                      <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Location not available</p>
                    </div>
                  </div>
                )}
              </div>
              {record.latitude && record.longitude && (
                <div className="p-4 border-t border-border text-sm">
                  <p className="text-muted-foreground">
                    Coordinates: {Number(record.latitude).toFixed(6)}, {Number(record.longitude).toFixed(6)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Request Mutation
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate(`/disputes/new?recordId=${id}`)}>
                <AlertTriangle className="w-4 h-4 mr-2" />
                File Dispute
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Download Extract
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
