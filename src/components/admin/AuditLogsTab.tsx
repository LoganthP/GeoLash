import { useState } from "react";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { History, Loader2, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const actionColors: Record<string, string> = {
  INSERT: "bg-success/10 text-success border-success/20",
  UPDATE: "bg-primary/10 text-primary border-primary/20",
  DELETE: "bg-destructive/10 text-destructive border-destructive/20",
};

const roleColors: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive",
  officer: "bg-primary/10 text-primary",
  citizen: "bg-secondary text-secondary-foreground",
};

export function AuditLogsTab() {
  const [actionFilter, setActionFilter] = useState<string>("all");
  const { data: logs, isLoading } = useAuditLogs({ action: actionFilter });

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Role Change Audit Log
            </CardTitle>
            <CardDescription>
              Track all role changes with timestamps and responsible users
            </CardDescription>
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="INSERT">Created</SelectItem>
              <SelectItem value="UPDATE">Updated</SelectItem>
              <SelectItem value="DELETE">Deleted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : logs && logs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>User Affected</TableHead>
                <TableHead>Role Change</TableHead>
                <TableHead>Changed By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(log.created_at), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(actionColors[log.action])}>
                      {log.action === "INSERT"
                        ? "Created"
                        : log.action === "UPDATE"
                        ? "Updated"
                        : "Deleted"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{log.user_name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{log.user_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {log.old_role && (
                        <Badge variant="outline" className={cn("text-xs", roleColors[log.old_role])}>
                          {log.old_role}
                        </Badge>
                      )}
                      {log.old_role && log.new_role && (
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      )}
                      {log.new_role && (
                        <Badge variant="outline" className={cn("text-xs", roleColors[log.new_role])}>
                          {log.new_role}
                        </Badge>
                      )}
                      {!log.old_role && !log.new_role && (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{log.changed_by_name || "System"}</p>
                      <p className="text-xs text-muted-foreground">{log.changed_by_email}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No audit logs found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
