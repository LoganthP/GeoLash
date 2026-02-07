import { useNavigate } from "react-router-dom";
import { FileText, Map, CheckCircle, AlertTriangle, Plus } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { MapPreview } from "@/components/dashboard/MapPreview";
import { RecentRecordsTable } from "@/components/dashboard/RecentRecordsTable";
import { DisputesList } from "@/components/dashboard/DisputesList";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { useLandRecords } from "@/hooks/useLandRecords";
import { useDisputes } from "@/hooks/useDisputes";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: landRecords } = useLandRecords();
  const { data: disputes } = useDisputes();

  const totalRecords = landRecords?.length || 0;
  const verifiedRecords = landRecords?.filter(r => r.status === 'verified').length || 0;
  const mappedRecords = landRecords?.filter(r => r.latitude && r.longitude).length || 0;
  const activeDisputes = disputes?.filter((d: any) => d.status === 'open' || d.status === 'in_progress').length || 0;

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">
            Welcome back, <span className="text-gradient">{userName}</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of land records and activities in your jurisdiction.
          </p>
        </div>
        <Button onClick={() => navigate("/register")} className="glow">
          <Plus className="w-4 h-4 mr-2" />
          Register Property
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Land Records"
          value={totalRecords.toLocaleString()}
          change={totalRecords > 0 ? `${totalRecords} registered` : "No records yet"}
          changeType={totalRecords > 0 ? "positive" : "neutral"}
          icon={FileText}
        />
        <StatsCard
          title="Mapped Parcels"
          value={mappedRecords.toLocaleString()}
          change={totalRecords > 0 ? `${Math.round((mappedRecords / totalRecords) * 100)}% coverage` : "0% coverage"}
          changeType="neutral"
          icon={Map}
        />
        <StatsCard
          title="Verified Records"
          value={verifiedRecords.toLocaleString()}
          change={totalRecords > 0 ? `${Math.round((verifiedRecords / totalRecords) * 100)}% verified` : "None verified"}
          changeType="positive"
          icon={CheckCircle}
        />
        <StatsCard
          title="Active Disputes"
          value={activeDisputes.toString()}
          change={activeDisputes === 0 ? "No active disputes" : `${activeDisputes} pending`}
          changeType={activeDisputes === 0 ? "positive" : "neutral"}
          icon={AlertTriangle}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Preview */}
        <div className="lg:col-span-2">
          <MapPreview />
        </div>

        {/* Disputes */}
        <div>
          <DisputesList />
        </div>
      </div>

      {/* Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityChart />
        </div>
        <div className="glass-card rounded-xl card-shadow p-4">
          <h3 className="font-display font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: "Register New Land", desc: "Add new land record", action: () => navigate("/register") },
              { label: "View All Records", desc: "Browse land records", action: () => navigate("/records") },
              { label: "Open Map View", desc: "Interactive GIS map", action: () => navigate("/map") },
              { label: "Manage Documents", desc: "Upload & verify docs", action: () => navigate("/documents") },
            ].map((action, i) => (
              <button
                key={i}
                onClick={action.action}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">{i + 1}</span>
                </div>
                <div>
                  <div className="font-medium text-sm">{action.label}</div>
                  <div className="text-xs text-muted-foreground">{action.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Records Table */}
      <RecentRecordsTable />
    </div>
  );
};

export default Dashboard;
