import { Search, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { NotificationsDropdown } from "@/components/notifications/NotificationsDropdown";

export function Header() {
  const { user, signOut, userRole, switchRole } = useAuth();
  const navigate = useNavigate();

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-card border-b border-border">
      {/* Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <form
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.querySelector('input');
            if (input?.value.trim()) {
              navigate(`/search?q=${encodeURIComponent(input.value.trim())}`);
            }
          }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search land records, survey numbers..."
            className="pl-10 bg-secondary/50 border-border/50 focus:bg-background"
          />
        </form>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <NotificationsDropdown />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium">{userName}</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {userRole || 'citizen'}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate("/settings?tab=profile")}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate("/settings?tab=profile")}>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleSignOut} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
