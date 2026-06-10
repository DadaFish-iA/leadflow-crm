import { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router";
import { Sidebar, MobileHeader } from "@/components/Sidebar";
import { DashboardPage } from "@/pages/DashboardPage";
import { LeadsPage } from "@/pages/LeadsPage";
import { LeadDetailPage } from "@/pages/LeadDetailPage";
import { LeadFormPage } from "@/pages/LeadFormPage";
import { ImportPage } from "@/pages/ImportPage";
import { SettingsPage } from "@/pages/SettingsPage";
import "./App.css";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/") return "dashboard";
    if (path.startsWith("/leads")) return "leads";
    if (path === "/import") return "import";
    if (path === "/settings") return "settings";
    return "dashboard";
  };

  const handleTabChange = (tab: string) => {
    switch (tab) {
      case "dashboard":
        navigate("/");
        break;
      case "leads":
        navigate("/leads");
        break;
      case "import":
        navigate("/import");
        break;
      case "settings":
        navigate("/settings");
        break;
    }
  };

  const handleViewLead = (id: number) => {
    navigate(`/leads/${id}`);
  };

  const handleEditLead = (id: number) => {
    navigate(`/leads/${id}/edit`);
  };

  const handleAddLead = () => {
    navigate("/leads/new");
  };

  return (
    <div className="min-h-screen bg-gray-50/80">
      <MobileHeader onMenuClick={() => setSidebarCollapsed(false)} />

      <Sidebar
        activeTab={getActiveTab()}
        onTabChange={handleTabChange}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main
        className={`transition-all duration-300 min-h-screen pt-16 lg:pt-0 ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Routes>
            <Route
              path="/"
              element={<DashboardPage onViewLead={handleViewLead} />}
            />
            <Route
              path="/leads"
              element={
                <LeadsPage
                  onViewLead={handleViewLead}
                  onEditLead={handleEditLead}
                  onAddLead={handleAddLead}
                />
              }
            />
            <Route
              path="/leads/new"
              element={
                <LeadFormPage onSave={() => navigate("/leads")} onCancel={() => navigate("/leads")} />
              }
            />
            <Route
              path="/leads/:id"
              element={
                <LeadDetailRoute onBack={() => navigate("/leads")} />
              }
            />
            <Route
              path="/leads/:id/edit"
              element={
                <LeadEditRoute
                  onSave={() => navigate("/leads")}
                  onCancel={() => navigate("/leads")}
                />
              }
            />
            <Route path="/import" element={<ImportPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function LeadDetailRoute({ onBack }: { onBack: () => void }) {
  const id = parseInt(useLocation().pathname.split("/").pop() || "0", 10);
  return <LeadDetailPage leadId={id} onBack={onBack} />;
}

function LeadEditRoute({
  onSave,
  onCancel,
}: {
  onSave: () => void;
  onCancel: () => void;
}) {
  const id = parseInt(
    useLocation().pathname.split("/").slice(-2, -1)[0] || "0",
    10,
  );
  return <LeadFormPage leadId={id} onSave={onSave} onCancel={onCancel} />;
}
