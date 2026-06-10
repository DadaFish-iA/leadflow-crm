import {
  LayoutDashboard,
  Users,
  Upload,
  Settings,
  Menu,
  X,
  Building2,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "leads", label: "Leads", icon: Users },
  { id: "import", label: "Importar", icon: Upload },
  { id: "settings", label: "Configuracion", icon: Settings },
];

export function Sidebar({
  activeTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  return (
    <>
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onToggleCollapse}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full bg-slate-900 text-white z-50 transition-all duration-300 flex flex-col ${
          collapsed
            ? "-translate-x-full lg:translate-x-0 lg:w-20"
            : "w-64"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
          <div
            className={`flex items-center gap-3 ${collapsed ? "lg:justify-center lg:w-full" : ""}`}
          >
            <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span
              className={`font-bold text-lg whitespace-nowrap ${collapsed ? "lg:hidden" : ""}`}
            >
              LeadFlow
            </span>
          </div>
          <button
            onClick={onToggleCollapse}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.id
                  ? "bg-blue-500/15 text-blue-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              } ${collapsed ? "lg:justify-center lg:px-2" : ""}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className={`whitespace-nowrap ${collapsed ? "lg:hidden" : ""}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div
          className={`p-4 border-t border-slate-800 text-xs text-slate-500 ${collapsed ? "lg:text-center" : ""}`}
        >
          <span className={collapsed ? "lg:hidden" : ""}>
            LeadFlow CRM v1.0
          </span>
        </div>
      </aside>
    </>
  );
}

export function MobileHeader({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white z-40 flex items-center px-4">
      <button
        onClick={onMenuClick}
        className="p-2 -ml-2 rounded-lg hover:bg-slate-800 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-2 ml-3">
        <div className="w-7 h-7 bg-blue-500 rounded-md flex items-center justify-center">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold">LeadFlow</span>
      </div>
    </div>
  );
}
