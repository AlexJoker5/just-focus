import { cn } from "@/lib/cn";
import { Target, Grid3x3, BarChart3, Calendar } from "lucide-react";
import type { TabId } from "@/entries/popup/PopupApp";

interface NavbarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: typeof Target }[] = [
  { id: "focus", label: "Focus", icon: Target },
  { id: "apps", label: "Apps", icon: Grid3x3 },
  { id: "stats", label: "Stats", icon: BarChart3 },
  { id: "schedule", label: "Schedule", icon: Calendar },
];

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  return (
    <nav className="flex items-center border-t border-brand-100 bg-white">
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors duration-150",
              isActive
                ? "text-brand-950"
                : "text-brand-400 hover:text-brand-600"
            )}
          >
            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
            <span
              className={cn(
                "text-[10px] tracking-wide",
                isActive ? "font-semibold" : "font-medium"
              )}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
