import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLandRecords, useUpdateLandRecord } from "@/hooks/useLandRecords";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Shield,
  Users,
  FileCheck,
  CheckCircle,
  XCircle,
  Loader2,
  UserCog,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AuditLogsTab } from "@/components/admin/AuditLogsTab";
import { AppRole } from "@/types/auth";

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
  user_id: string;
}

const roleColors: Record<AppRole, string> = {
  admin: "bg-destructive/10 text-destructive border-destructive/20",
  officer: "bg-primary/10 text-primary border-primary/20",
  manager: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  employee: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  citizen: "bg-secondary text-secondary-foreground",
  tester: "bg-pink-500/10 text-pink-500 border-pink-500/20",
};

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: landRecords, isLoading: recordsLoading } = useLandRecords({ status: "pending" });
  const updateRecord = useUpdateLandRecord();

  // Initialize mock data if empty
  useState(() => {
    const stored = localStorage.getItem("mock_all_users");
    if (!stored) {
      const initialUsers = [
        { id: "1", user_id: "1", email: "loganthp55@gmail.com", full_name: "Loganth Admin", role: "admin" },
        { id: "2", user_id: "2", email: "officer@example.com", full_name: "Officer Dave", role: "officer" },
        { id: "3", user_id: "3", email: "tester@example.com", full_name: "Tester Tim", role: "tester" },
        { id: "4", user_id: "4", email: "citizen@example.com", full_name: "Citizen Jane", role: "citizen" },
      ];
      localStorage.setItem("mock_all_users", JSON.stringify(initialUsers));
    }
  });

  // Fetch users with their roles
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      // Return mock data from local storage
      const stored = localStorage.getItem("mock_all_users");
      if (stored) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return JSON.parse(stored) as UserWithRole[];
      }
      return [];
    },
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      // Update local storage
      const stored = localStorage.getItem("mock_all_users");
      if (stored) {
        const users = JSON.parse(stored) as UserWithRole[];
        const updatedUsers = users.map(u =>
          u.user_id === userId ? { ...u, role: newRole } : u
        );
        localStorage.setItem("mock_all_users", JSON.stringify(updatedUsers));

        // Also update current session if it matches
        const currentSession = localStorage.getItem("mock_user");
        if (currentSession) {
          const parsed = JSON.parse(currentSession);
          if (parsed.id === userId || parsed.email === users.find(u => u.user_id === userId)?.email) {
            localStorage.setItem("mock_role", newRole);
            // Trigger a window event to notify other components if needed, or just let them re-read on refresh
          }
        }
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Role updated", description: "User role has been updated successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update role", description: error.message, variant: "destructive" });
    },
  });

  const handleVerifyRecord = async (id: string, status: "verified" | "disputed") => {
    await updateRecord.mutateAsync({ id, status });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          Admin Panel
        </h1>
        <p className="text-muted-foreground">Manage users, roles, and verify land records</p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="verification" className="gap-2">
            <FileCheck className="w-4 h-4" />
            Verification
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <History className="w-4 h-4" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="w-5 h-5 text-primary" />
                User Roles
              </CardTitle>
              <CardDescription>
                Manage user access levels. Admins have full access, Officers can manage records, Citizens have limited access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : users && users.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Current Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.full_name || "Unnamed User"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn(roleColors[user.role])}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={user.role}
                            onValueChange={(value: AppRole) =>
                              updateRoleMutation.mutate({ userId: user.user_id, newRole: value })
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="citizen">Citizen</SelectItem>
                              <SelectItem value="employee">Employee</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="officer">Officer</SelectItem>
                              <SelectItem value="tester">Tester</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No users found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-primary" />
                Pending Verification
              </CardTitle>
              <CardDescription>
                Review and verify submitted land records. Only verified records are visible to the public.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recordsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : landRecords && landRecords.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Survey Number</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {landRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.survey_number}</TableCell>
                        <TableCell>{record.owner_name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {record.village}, {record.taluka}
                        </TableCell>
                        <TableCell>{record.area_acres} acres</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-success hover:text-success"
                              onClick={() => handleVerifyRecord(record.id, "verified")}
                              disabled={updateRecord.isPending}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleVerifyRecord(record.id, "disputed")}
                              disabled={updateRecord.isPending}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pending records to verify</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <AuditLogsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
