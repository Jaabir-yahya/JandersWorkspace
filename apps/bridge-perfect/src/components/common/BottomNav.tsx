import { cn } from "../../lib/utils";
import type { BottomNavProps } from "../../types";
import {
  LayoutDashboard,
  PlusCircle,
  List,
  Users,
  Package,
  StickyNote,
} from "lucide-react";

import type { Screen } from "../../types";

const navItems: { id: Screen; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "add-transaction", label: "Add", icon: PlusCircle },
  { id: "transactions", label: "Sales", icon: List },
  { id: "people", label: "People", icon: Users },
  { id: "items", label: "Items", icon: Package },
  { id: "notes", label: "Notes", icon: StickyNote },
];

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 pb-safe z-50">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-lg min-w-[48px]",
                "transition-colors",
                isActive
                  ? "text-green-600 bg-green-50"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
