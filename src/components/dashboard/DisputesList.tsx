import { useNavigate } from "react-router-dom";
import { AlertTriangle, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDisputes } from "@/hooks/useDisputes";
import { differenceInDays } from "date-fns";

const priorityStyles = {
  critical: "bg-destructive/10 text-destructive",
  high: "bg-destructive/10 text-destructive",
  medium: "bg-warning/10 text-warning",
  low: "bg-muted/10 text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export function DisputesList() {
  const navigate = useNavigate();
  const { data: disputes, isLoading } = useDisputes({ status: "all" });

  // Get active disputes (open or in_progress)
  const activeDisputes = disputes?.filter(
    (d: any) => d.status === "open" || d.status === "in_progress"
  ).slice(0, 3) || [];

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl card-shadow p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl card-shadow">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <h3 className="font-display font-semibold">Active Disputes</h3>
        </div>
        <span className="text-sm text-muted-foreground">
          {activeDisputes.length} active
        </span>
      </div>
      <div className="divide-y divide-border">
        {activeDisputes.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No active disputes
          </div>
        ) : (
          activeDisputes.map((dispute: any) => {
            const daysOpen = differenceInDays(new Date(), new Date(dispute.filed_date));
            
            return (
              <div
                key={dispute.id}
                className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => navigate("/disputes")}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-muted-foreground">
                        {dispute.case_number}
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase",
                          priorityStyles[dispute.priority as keyof typeof priorityStyles]
                        )}
                      >
                        {dispute.priority}
                      </span>
                    </div>
                    <h4 className="font-medium text-sm truncate">{dispute.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dispute.land_records?.survey_number || "Survey N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <Clock className="w-3 h-3" />
                      <span>{daysOpen} days</span>
                    </div>
                    <span className="text-xs font-medium text-primary">
                      {statusLabels[dispute.status] || dispute.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="p-3 border-t border-border">
        <button 
          className="w-full text-center text-sm font-medium text-primary hover:underline"
          onClick={() => navigate("/disputes")}
        >
          View All Disputes →
        </button>
      </div>
    </div>
  );
}
