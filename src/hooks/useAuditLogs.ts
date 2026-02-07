import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AuditLogEntry {
  id: string;
  user_id: string;
  changed_by: string;
  old_role: string | null;
  new_role: string | null;
  action: string;
  created_at: string;
  // Joined data
  user_email?: string;
  user_name?: string;
  changed_by_email?: string;
  changed_by_name?: string;
}

interface UseAuditLogsOptions {
  action?: string;
  limit?: number;
}

export function useAuditLogs(options: UseAuditLogsOptions = {}) {
  const { action, limit = 50 } = options;

  return useQuery({
    queryKey: ["audit-logs", action, limit],
    queryFn: async () => {
      // Mock data
      const mockLogs: AuditLogEntry[] = [
        {
          id: "1",
          user_id: "2",
          changed_by: "1",
          old_role: "citizen",
          new_role: "officer",
          action: "UPDATE",
          created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          user_email: "officer@example.com",
          user_name: "Officer Dave",
          changed_by_email: "loganthp55@gmail.com",
          changed_by_name: "Loganth Admin",
        },
        {
          id: "2",
          user_id: "3",
          changed_by: "1",
          old_role: "citizen",
          new_role: "tester",
          action: "UPDATE",
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          user_email: "tester@example.com",
          user_name: "Tester Tim",
          changed_by_email: "loganthp55@gmail.com",
          changed_by_name: "Loganth Admin",
        },
        {
          id: "3",
          user_id: "4",
          changed_by: "system",
          old_role: null,
          new_role: "citizen",
          action: "INSERT",
          created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          user_email: "citizen@example.com",
          user_name: "Citizen Jane",
          changed_by_email: "system@geolash.com",
          changed_by_name: "System",
        },
        {
          id: "4",
          user_id: "2",
          changed_by: "1",
          old_role: "citizen",
          new_role: "officer",
          action: "UPDATE",
          created_at: new Date(Date.now() - 200000000).toISOString(),
          user_email: "officer@example.com",
          user_name: "Officer Dave",
          changed_by_email: "loganthp55@gmail.com",
          changed_by_name: "Loganth Admin",
        }
      ];

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      let filteredLogs = [...mockLogs];
      if (action && action !== "all") {
        filteredLogs = filteredLogs.filter(log => log.action === action);
      }

      return filteredLogs;
    },
  });
}
