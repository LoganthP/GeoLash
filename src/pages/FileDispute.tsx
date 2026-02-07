import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLandRecords } from "@/hooks/useLandRecords";
import { useCreateDispute, Dispute } from "@/hooks/useDisputes";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, AlertTriangle, Loader2, Send } from "lucide-react";

const disputeTypes: { value: Dispute["dispute_type"]; label: string }[] = [
  { value: "boundary", label: "Boundary Dispute" },
  { value: "ownership", label: "Ownership Dispute" },
  { value: "encroachment", label: "Encroachment" },
  { value: "inheritance", label: "Inheritance Dispute" },
  { value: "other", label: "Other" },
];

const priorityOptions: { value: Dispute["priority"]; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export default function FileDispute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedRecordId = searchParams.get("recordId");
  const { user } = useAuth();
  const { data: landRecords, isLoading: recordsLoading } = useLandRecords();
  const createDispute = useCreateDispute();

  const [formData, setFormData] = useState<{
    land_record_id: string;
    title: string;
    dispute_type: Dispute["dispute_type"] | "";
    priority: Dispute["priority"];
    description: string;
  }>({
    land_record_id: preselectedRecordId || "",
    title: "",
    dispute_type: "",
    priority: "medium",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.dispute_type) return;

    await createDispute.mutateAsync({
      land_record_id: formData.land_record_id,
      title: formData.title,
      dispute_type: formData.dispute_type,
      priority: formData.priority,
      description: formData.description,
    });

    navigate("/disputes");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/disputes")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold">File a Dispute</h1>
          <p className="text-muted-foreground">Report an issue with a land record</p>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Dispute Details
          </CardTitle>
          <CardDescription>
            Please provide accurate information about your dispute. Our team will review and assign it to the appropriate officer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="land_record">Select Land Record *</Label>
              <Select
                value={formData.land_record_id}
                onValueChange={(value) => setFormData({ ...formData, land_record_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={recordsLoading ? "Loading..." : "Select a land record"} />
                </SelectTrigger>
                <SelectContent>
                  {landRecords?.map((record) => (
                    <SelectItem key={record.id} value={record.id}>
                      {record.survey_number} - {record.village}, {record.district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Dispute Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief title describing the dispute"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dispute_type">Dispute Type *</Label>
                <Select
                  value={formData.dispute_type}
                  onValueChange={(value: Dispute["dispute_type"]) => setFormData({ ...formData, dispute_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {disputeTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: Dispute["priority"]) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide detailed information about the dispute, including any relevant history, parties involved, and specific claims..."
                rows={6}
                required
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate("/disputes")}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createDispute.isPending || !formData.land_record_id || !formData.title || !formData.dispute_type}
              >
                {createDispute.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Filing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    File Dispute
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
