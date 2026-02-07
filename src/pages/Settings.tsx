import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Bell, Shield, Palette, Save, Loader2, Sun, Moon, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useSearchParams } from "react-router-dom";

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { profile, isLoading: profileLoading, updateProfile, uploadAvatar } = useProfile();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Profile settings - use profile data if available
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  // Initialize form with profile data (avoid setting state during render)
  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name || "");
    setPhone(profile.phone || "");
  }, [profile?.full_name, profile?.phone]);

  const tabFromUrl = useMemo(() => {
    const raw = searchParams.get("tab") || "profile";
    const allowed = new Set(["profile", "notifications", "security", "appearance"]);
    return allowed.has(raw) ? raw : "profile";
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [disputeAlerts, setDisputeAlerts] = useState(true);
  const [recordUpdates, setRecordUpdates] = useState(true);
  
  const handleSaveProfile = async () => {
    await updateProfile.mutateAsync({ full_name: fullName, phone });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAvatar.mutate(file);
    }
  };

  const userInitials = profile?.full_name?.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || "U";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(next) => {
          setActiveTab(next);
          setSearchParams((prev) => {
            const p = new URLSearchParams(prev);
            p.set("tab", next);
            return p;
          });
        }}
        className="space-y-6"
      >
        <TabsList className="glass-card">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="glass-card card-shadow">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadAvatar.isPending}
                  >
                    {uploadAvatar.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Change Photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, GIF or PNG. Max size 2MB.
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="glass-card card-shadow">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for important updates
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dispute Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when disputes are filed or updated
                  </p>
                </div>
                <Switch
                  checked={disputeAlerts}
                  onCheckedChange={setDisputeAlerts}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Record Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when land records are modified
                  </p>
                </div>
                <Switch
                  checked={recordUpdates}
                  onCheckedChange={setRecordUpdates}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="glass-card card-shadow">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button>Update Password</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card className="glass-card card-shadow">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the application looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className={cn(
                      "h-20 flex-col gap-2",
                      theme === "light" && "border-primary ring-2 ring-primary/20"
                    )}
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="w-8 h-8" />
                    Light
                  </Button>
                  <Button 
                    variant="outline" 
                    className={cn(
                      "h-20 flex-col gap-2",
                      theme === "dark" && "border-primary ring-2 ring-primary/20"
                    )}
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="w-8 h-8" />
                    Dark
                  </Button>
                  <Button 
                    variant="outline" 
                    className={cn(
                      "h-20 flex-col gap-2",
                      theme === "system" && "border-primary ring-2 ring-primary/20"
                    )}
                    onClick={() => setTheme("system")}
                  >
                    <Monitor className="w-8 h-8" />
                    System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;