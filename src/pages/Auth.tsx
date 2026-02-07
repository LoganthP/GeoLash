import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Map, Shield, FileText, MapPin, Users, Building, ArrowLeft } from "lucide-react";

type AuthModule = "admin" | "officer" | "employee" | null;

export default function Auth() {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedModule, setSelectedModule] = useState<AuthModule>("admin");

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await signIn(loginEmail, loginPassword);
    if (!error) {
      if (selectedModule === "admin") navigate("/admin");
      else navigate("/");
    }
    setIsSubmitting(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName, selectedModule as any);
    if (!error) {
      // Auto-login after signup since auto-confirm is enabled
      await signIn(signupEmail, signupPassword);
      if (selectedModule === "admin") navigate("/admin");
      else navigate("/");
    }
    setIsSubmitting(false);
  };

  const getModuleTitle = () => {
    switch (selectedModule) {
      case "admin": return "Admin Portal";
      case "officer": return "Officer Portal";
      case "employee": return "Manager & Employee Portal";
      default: return "Welcome";
    }
  };

  const getModuleIcon = () => {
    switch (selectedModule) {
      case "admin": return Shield;
      default: return Map;
    }
  };

  const ModuleIcon = getModuleIcon();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-background to-accent/10 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <h1 className="text-3xl font-display font-bold">GeoLash</h1>
          </div>
          <h1 className="text-4xl font-display font-bold leading-tight mb-4">
            Digital Land Records
            <br />
            Management System
          </h1>
          <p className="text-muted-foreground text-lg max-w-md">
            Secure, transparent, and efficient land record management with interactive mapping and real-time verification.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Map className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Interactive GIS Mapping</h3>
              <p className="text-sm text-muted-foreground">
                Visualize land parcels with satellite imagery and detailed boundaries
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Verified Records</h3>
              <p className="text-sm text-muted-foreground">
                Tamper-proof land records with complete ownership history
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Digital Documents</h3>
              <p className="text-sm text-muted-foreground">
                Upload, verify, and manage all land-related documents digitally
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">

        <Card className="w-full max-w-md glass-card border-border/50 animate-in slide-in-from-right-8 duration-300">
          <CardHeader className="text-center relative">

            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <ModuleIcon className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-display">{getModuleTitle()}</CardTitle>
            <CardDescription>
              Sign in to access the {selectedModule} module
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password (min 6 chars)"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
