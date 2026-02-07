import { format } from "date-fns";
import { AlertTriangle, Calendar, FileText, MapPin, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DisputeDetailsDialogProps {
  dispute: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

export function DisputeDetailsDialog({
  dispute,
  open,
  onOpenChange,
}: DisputeDetailsDialogProps) {
  if (!dispute) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Dispute Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {dispute.case_number}
            </span>
            <Badge
              variant="outline"
              className={priorityStyles[dispute.priority as keyof typeof priorityStyles]}
            >
              {dispute.priority} priority
            </Badge>
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: `${statusLabels[dispute.status]?.color}20` }}
            >
              <div className={cn("w-1.5 h-1.5 rounded-full", statusLabels[dispute.status]?.color)} />
              {statusLabels[dispute.status]?.label || dispute.status}
            </div>
          </div>

          {/* Title and Description */}
          <div>
            <h3 className="font-display font-semibold text-xl mb-2">{dispute.title}</h3>
            <p className="text-muted-foreground">
              {dispute.description || "No description provided"}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Dispute Type</p>
                <p className="font-medium">
                  {disputeTypeLabels[dispute.dispute_type] || dispute.dispute_type}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Survey Number</p>
                <p className="font-medium">
                  {dispute.land_records?.survey_number || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Land Owner</p>
                <p className="font-medium">
                  {dispute.land_records?.owner_name || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Filed Date</p>
                <p className="font-medium">
                  {format(new Date(dispute.filed_date), "dd MMMM yyyy")}
                </p>
              </div>
            </div>
          </div>

          {/* Resolution Info */}
          {dispute.resolution_date && (
            <div className="p-4 rounded-lg bg-success/5 border border-success/20">
              <p className="text-xs text-muted-foreground mb-1">Resolution Date</p>
              <p className="font-medium mb-2">
                {format(new Date(dispute.resolution_date), "dd MMMM yyyy")}
              </p>
              {dispute.resolution_notes && (
                <>
                  <p className="text-xs text-muted-foreground mb-1">Resolution Notes</p>
                  <p className="text-sm">{dispute.resolution_notes}</p>
                </>
              )}
            </div>
          )}

          {/* Timestamps */}
          <div className="text-xs text-muted-foreground border-t pt-4">
            <p>Created: {format(new Date(dispute.created_at), "dd MMM yyyy, HH:mm")}</p>
            <p>Last Updated: {format(new Date(dispute.updated_at), "dd MMM yyyy, HH:mm")}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
