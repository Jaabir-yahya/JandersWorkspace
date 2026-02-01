import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Receipt,
  Users,
  Package,
  BarChart3,
  Puzzle,
  Settings,
  ChevronLeft,
  ChevronRight,
  Store,
} from "lucide-react";
import { useUIStore } from "../../store";
import type { AdminView } from "../../types";

interface NavItem {
  id: AdminView;
  label: string;
  icon: ReactNode;
  badge?: number;
}

const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: <Receipt className="w-5 h-5" />,
  },
  { id: "people", label: "People", icon: <Users className="w-5 h-5" /> },
  { id: "items", label: "Items", icon: <Package className="w-5 h-5" /> },
  {
    id: "analytics",
    label: "Analytics",
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: <Puzzle className="w-5 h-5" />,
  },
  { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, currentView, setCurrentView } =
    useUIStore();

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-50 ${
        sidebarCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div
            className={`flex items-center gap-2 ${sidebarCollapsed ? "justify-center w-full" : ""}`}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-primary-foreground" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-semibold text-lg text-foreground">
                Bridge
              </span>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 ${
                currentView === item.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              } ${sidebarCollapsed ? "justify-center" : ""}`}
            >
              {item.icon}
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          {!sidebarCollapsed && (
            <div className="text-xs text-muted-foreground text-center">
              Bridge Admin v1.0
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
