import { Users, UserPlus, TrendingUp, Activity } from "lucide-react";
import type { DashboardStats } from "@/types";

interface StatsCardsProps {
  stats: DashboardStats | undefined;
}

export function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) return null;

  const cards = [
    {
      title: "Total Leads",
      value: stats.totalLeads,
      icon: Users,
      color: "#3B82F6",
      bgColor: "#EFF6FF",
    },
    {
      title: "Nuevos este mes",
      value: stats.nuevosEsteMes,
      icon: UserPlus,
      color: "#10B981",
      bgColor: "#ECFDF5",
    },
    {
      title: "Tasa de conversion",
      value: `${stats.tasaConversion}%`,
      icon: TrendingUp,
      color: "#8B5CF6",
      bgColor: "#F5F3FF",
    },
    {
      title: "Leads activos",
      value:
        (stats.leadsPorEstado["nuevo"] || 0) +
        (stats.leadsPorEstado["contactado"] || 0) +
        (stats.leadsPorEstado["en-seguimiento"] || 0) +
        (stats.leadsPorEstado["pendiente"] || 0),
      icon: Activity,
      color: "#F59E0B",
      bgColor: "#FFFBEB",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {card.value}
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: card.bgColor }}
            >
              <card.icon className="w-6 h-6" style={{ color: card.color }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
