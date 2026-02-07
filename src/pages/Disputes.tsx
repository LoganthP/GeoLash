import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Clock, User, MapPin, FileText, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useDisputes } from "@/hooks/useDisputes";
import { format, differenceInDays } from "date-fns";
import { DisputeDetailsDialog } from "@/components/disputes/DisputeDetailsDialog";
import { UpdateDisputeDialog } from "@/components/disputes/UpdateDisputeDialog";

const priorityStyles = {
  critical: "bg-destructive/10 text-destructive border-destructive/30",
  high: "bg-destructive/10 text-destructive border-destructive/30",
  medium: "bg-warning/10 text-warning border-warning/30",
  low: "bg-muted/10 text-muted-foreground border-muted-foreground/30",
};

const statusLabels: Record<string, { label: string; color: string }> = {
  open: { label: "Open", color: "bg-warning" },
  in_progress: { label: "In Progress", color: "bg-primary" },
  resolved: { label: "Resolved", color: "bg-success" },
  closed: { label: "Closed", color: "bg-muted-foreground" },
};

const disputeTypeLabels: Record<string, string> = {
  boundary: "Boundary Dispute",
  ownership: "Ownership Claim",
  inheritance: "Inheritance Dispute",
  encroachment: "Encroachment",
  other: "Other",
};

const Disputes = () => {
  const navigate = useNavigate();
  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [activeDispute, setActiveDispute] = useState<any>(null);

  const { data: disputes, isLoading } = useDisputes({
    priority: priorityFilter,
    status: statusFilter,
  });

  const filteredDisputes = disputes || [];

  // Calculate stats
  const totalDisputes = filteredDisputes.length;
  const highPriority = filteredDisputes.filter((d: any) => d.priority === "high" || d.priority === "critical").length;
  const openDisputes = filteredDisputes.filter((d: any) => d.status === "open" || d.status === "in_progress").length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-warning" />
            Land Disputes
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage ongoing land dispute cases
          </p>
        </div>
        <Button className="glow" onClick={() => navigate("/disputes/new")}>
          <Plus className="w-4 h-4 mr-2" />
          File New Dispute
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Disputes", value: totalDisputes, color: "text-foreground" },
          { label: "High Priority", value: highPriority, color: "text-destructive" },
          { label: "Open Cases", value: openDisputes, color: "text-warning" },
          { label: "Resolved", value: filteredDisputes.filter((d: any) => d.status === "resolved").length, color: "text-success" },
        ].map((stat, i) => (
          <div key={i} className="glass-card rounded-xl p-4 card-shadow">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={cn("text-2xl font-display font-bold", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Disputes List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredDisputes.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-semibold mb-2">No Disputes Found</h3>
          <p className="text-muted-foreground text-sm mb-4">
            There are no active disputes matching your filters.
          </p>
          <Button onClick={() => navigate("/disputes/new")}>
            <Plus className="w-4 h-4 mr-2" />
            File New Dispute
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredDisputes.map((dispute: any) => {
            const daysOpen = differenceInDays(new Date(), new Date(dispute.filed_date));
            const progress = dispute.status === "resolved" || dispute.status === "closed" ? 100 :
              dispute.status === "in_progress" ? 50 : 20;

            return (
              <div
                key={dispute.id}
                className={cn(
                  "glass-card rounded-xl card-shadow overflow-hidden cursor-pointer transition-all",
                  selectedDispute === dispute.id && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedDispute(selectedDispute === dispute.id ? null : dispute.id)}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-xs text-muted-foreground">{dispute.case_number}</span>
                        <Badge variant="outline" className={priorityStyles[dispute.priority as keyof typeof priorityStyles]}>
                          {dispute.priority} priority
                        </Badge>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-opacity-10"
                          style={{ backgroundColor: `${statusLabels[dispute.status]?.color}20` }}
                        >
                          <div className={cn("w-1.5 h-1.5 rounded-full", statusLabels[dispute.status]?.color)} />
                          {statusLabels[dispute.status]?.label || dispute.status}
                        </div>
                      </div>
                      <h3 className="font-display font-semibold text-lg mb-1">{dispute.title}</h3>
                      <p className="text-sm text-muted-foreground">{dispute.description || "No description provided"}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                        <Clock className="w-4 h-4" />
                        <span>{daysOpen} days open</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Progress: {progress}%
                      </div>
                      <Progress value={progress} className="h-1.5 w-24 mt-1" />
                    </div>
                  </div>

                  {selectedDispute === dispute.id && (
                    <div className="mt-4 pt-4 border-t border-border animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-muted-foreground text-xs">Dispute Type</p>
                            <p className="font-medium">{disputeTypeLabels[dispute.dispute_type] || dispute.dispute_type}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-muted-foreground text-xs">Survey Number</p>
                            <p className="font-medium">{dispute.land_records?.survey_number || "N/A"}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-muted-foreground text-xs">Filed Date</p>
                            <p className="font-medium">{format(new Date(dispute.filed_date), "dd MMM yyyy")}</p>
                          </div>
                        </div>
                      </div>
                      {dispute.resolution_notes && dispute.status === "resolved" && (
                        <div className="mt-4 p-3 rounded-lg bg-success/5 border border-success/20">
                          <p className="text-xs text-muted-foreground">Resolution Notes</p>
                          <p className="text-sm">{dispute.resolution_notes}</p>
                        </div>
                      )}
                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDispute(dispute);
                            setDetailsDialogOpen(true);
                          }}
                        >
                          View Full Details
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDispute(dispute);
                            setUpdateDialogOpen(true);
                          }}
                        >
                          Add Update
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/documents?land_record_id=${dispute.land_record_id}`);
                          }}
                        >
                          View Documents
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      <DisputeDetailsDialog
        dispute={activeDispute}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />
      <UpdateDisputeDialog
        dispute={activeDispute}
        open={updateDialogOpen}
        onOpenChange={setUpdateDialogOpen}
      />
    </div>
  );
};

export default Disputes;
