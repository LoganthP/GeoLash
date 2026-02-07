import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLandRecords } from "@/hooks/useLandRecords";

const statusStyles = {
  verified: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  disputed: "bg-destructive/10 text-destructive border-destructive/20",
};

export function RecentRecordsTable() {
  const navigate = useNavigate();
  const { data: records, isLoading } = useLandRecords();

  // Take only the 5 most recent records
  const recentRecords = records?.slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl card-shadow p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (recentRecords.length === 0) {
    return (
      <div className="glass-card rounded-xl card-shadow p-8 text-center">
        <p className="text-muted-foreground mb-4">No land records yet</p>
        <Button onClick={() => navigate("/register")}>Register First Property</Button>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl card-shadow">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-display font-semibold">Recent Land Records</h3>
        <Button variant="outline" size="sm" onClick={() => navigate("/records")}>
          View All
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Survey No.</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Village</TableHead>
            <TableHead>Area</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentRecords.map((record) => (
            <TableRow 
              key={record.id} 
              className="hover:bg-muted/50 cursor-pointer"
              onClick={() => navigate(`/records/${record.id}`)}
            >
              <TableCell className="font-medium">{record.survey_number}</TableCell>
              <TableCell>{record.owner_name}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{record.village}</div>
                  <div className="text-xs text-muted-foreground">
                    {record.district}
                  </div>
                </div>
              </TableCell>
              <TableCell>{record.area_acres} acres</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={statusStyles[record.status as keyof typeof statusStyles]}
                >
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => navigate(`/records/${record.id}`)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/records/${record.id}`)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/map")}>
                        View on Map
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
