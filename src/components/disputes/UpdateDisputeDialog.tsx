import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateDispute } from "@/hooks/useDisputes";

interface UpdateDisputeDialogProps {
  dispute: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateDisputeDialog({
  dispute,
  open,
  onOpenChange,
}: UpdateDisputeDialogProps) {
  const [status, setStatus] = useState(dispute?.status || "open");
  const [priority, setPriority] = useState(dispute?.priority || "medium");
  const [resolutionNotes, setResolutionNotes] = useState(dispute?.resolution_notes || "");

  const updateDispute = useUpdateDispute();

  const handleSubmit = async () => {
    const updates: any = {
      id: dispute.id,
      status,
      priority,
    };

    if (status === "resolved" || status === "closed") {
      updates.resolution_notes = resolutionNotes;
      updates.resolution_date = new Date().toISOString().split("T")[0];
    }

    await updateDispute.mutateAsync(updates);
    onOpenChange(false);
  };

  if (!dispute) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Dispute</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Case Number</Label>
            <p className="text-sm font-mono text-muted-foreground">{dispute.case_number}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(status === "resolved" || status === "closed") && (
            <div className="space-y-2">
              <Label htmlFor="resolution-notes">Resolution Notes</Label>
              <Textarea
                id="resolution-notes"
                placeholder="Enter resolution notes..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={4}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updateDispute.isPending}>
            {updateDispute.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Update Dispute
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
