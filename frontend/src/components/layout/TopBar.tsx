import { useNavigate } from "react-router-dom";
import { Bell, LogOut, Menu, Search, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/services/api";
import { getInitials } from "@/lib/utils";

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // ignore — clearing local state is sufficient
    }
    logout();
    toast.success("Logged out");
    navigate("/auth");
  }

  return (
    <header className="h-16 border-b border-white/[0.06] bg-card/40 backdrop-blur-xl px-4 md:px-6 flex items-center gap-4 sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-md hover:bg-white/[0.06]"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1 max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search syllabi, chapters, flashcards..."
          className="pl-9 bg-white/[0.04]"
        />
      </div>

      <button
        className="p-2 rounded-lg hover:bg-white/[0.06] relative"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-400" />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-white/[0.06] transition">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {getInitials(user?.first_name, user?.last_name, user?.username)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:inline text-sm font-medium">
              {user?.first_name || user?.username || "Guest"}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="font-medium text-foreground">
              {user?.first_name} {user?.last_name}
            </div>
            <div className="text-xs text-muted-foreground font-normal">
              {user?.email}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/settings")}>
            <UserIcon className="h-4 w-4 mr-2" /> Profile & Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-300 focus:text-red-200"
          >
            <LogOut className="h-4 w-4 mr-2" /> Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
