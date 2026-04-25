import { NavLink } from "react-router-dom";
import {
  BookOpen,
  LayoutDashboard,
  GraduationCap,
  Layers,
  ClipboardList,
  TrendingUp,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { to: "/dashboard/courses", icon: GraduationCap, label: "My Courses" },
  { to: "/flashcards", icon: Layers, label: "Flashcards" },
  { to: "/dashboard/quizzes", icon: ClipboardList, label: "Quizzes" },
  { to: "/dashboard/progress", icon: TrendingUp, label: "Progress" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <aside className="h-full w-64 shrink-0 border-r border-white/[0.06] bg-card/40 backdrop-blur-xl flex flex-col">
      <div className="px-5 py-5 border-b border-white/[0.06] flex items-center gap-2">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <BookOpen className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-display font-bold text-base leading-none">
            StudyMate
          </div>
          <div className="text-[10px] tracking-widest uppercase text-muted-foreground mt-1">
            AI for Students
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/dashboard"}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/15 text-foreground ring-1 ring-inset ring-primary/30"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/[0.06]">
        <div className="rounded-xl p-4 bg-gradient-to-br from-indigo-600/15 to-fuchsia-600/15 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Upgrade
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Unlock unlimited chats, quizzes, and flashcards.
          </p>
          <button className="w-full text-xs font-semibold py-2 rounded-md bg-white text-black hover:bg-white/90 transition">
            Go Pro — ₹299/mo
          </button>
        </div>
      </div>
    </aside>
  );
}
