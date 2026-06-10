import { trpc } from "@/providers/trpc";
import { StatsCards } from "@/components/StatsCards";
import { SourceChart, StatusChart } from "@/components/Charts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface DashboardPageProps {
  onViewLead: (id: number) => void;
}

export function DashboardPage({ onViewLead }: DashboardPageProps) {
  const { data: stats } = trpc.lead.stats.useQuery();
  const { data: leads } = trpc.lead.list.useQuery();

  const recentLeads = leads
    ? [...leads]
        .sort(
          (a, b) =>
            new Date(b.fechaRegistro).getTime() -
            new Date(a.fechaRegistro).getTime(),
        )
        .slice(0, 5)
    : [];

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  };

  const activeLeads = stats
    ? (stats.leadsPorEstado["nuevo"] || 0) +
      (stats.leadsPorEstado["contactado"] || 0) +
      (stats.leadsPorEstado["en-seguimiento"] || 0) +
      (stats.leadsPorEstado["pendiente"] || 0)
    : 0;

  const totalActiveRate =
    stats && stats.totalLeads > 0
      ? Math.round((activeLeads / stats.totalLeads) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Resumen de tus leads y metricas clave
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
            <ArrowUpRight className="w-4 h-4" />
            <span className="font-medium">
              {stats?.nuevosEsteMes ?? 0} nuevos
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
            <ArrowDownRight className="w-4 h-4" />
            <span className="font-medium">{totalActiveRate}% activos</span>
          </div>
        </div>
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SourceChart stats={stats} />
        <StatusChart stats={stats} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Leads Recientes
        </h3>
        <div className="space-y-2">
          {recentLeads.map((lead) => (
            <button
              key={lead.id}
              onClick={() => onViewLead(lead.id)}
              className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                {lead.nombre.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {lead.nombre}
                </p>
                <p className="text-xs text-gray-500">{lead.email}</p>
              </div>
              <span className="text-xs text-gray-400">
                {formatDate(lead.fechaRegistro)}
              </span>
            </button>
          ))}
          {recentLeads.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              No hay leads registrados
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
