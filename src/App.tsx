import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import LandRecords from "./pages/LandRecords";
import LandRecordDetail from "./pages/LandRecordDetail";
import LandRecordEdit from "./pages/LandRecordEdit";
import PropertyRegistration from "./pages/PropertyRegistration";
import MapView from "./pages/MapView";
import SearchPage from "./pages/SearchPage";
import Disputes from "./pages/Disputes";
import FileDispute from "./pages/FileDispute";
import Documents from "./pages/Documents";
import AdminPanel from "./pages/AdminPanel";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/records" element={<LandRecords />} />
        <Route path="/records/:id" element={<LandRecordDetail />} />
        <Route path="/records/:id/edit" element={<LandRecordEdit />} />
        <Route path="/register" element={<PropertyRegistration />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/disputes" element={<Disputes />} />
        <Route path="/disputes/new" element={<FileDispute />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/admin" element={<AdminPanel />} />

        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<Help />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
