import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { SOURCE_LABELS, SOURCE_COLORS, STATUS_LABELS, STATUS_COLORS } from "@/types";
import type { DashboardStats } from "@/types";

interface ChartsProps {
  stats: DashboardStats | undefined;
}

export function SourceChart({ stats }: ChartsProps) {
  if (!stats) return null;

  const data = Object.entries(stats.leadsPorFuente)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      name: SOURCE_LABELS[key as keyof typeof SOURCE_LABELS] || key,
      value,
      color: SOURCE_COLORS[key as keyof typeof SOURCE_COLORS] || "#6B7280",
    }));

  if (data.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-4">
        Leads por Fuente
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`${value} leads`, "Cantidad"]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              fontSize: "13px",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span className="text-xs text-gray-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusChart({ stats }: ChartsProps) {
  if (!stats) return null;

  const data = Object.entries(stats.leadsPorEstado).map(([key, value]) => ({
    name: STATUS_LABELS[key as keyof typeof STATUS_LABELS] || key,
    value,
    color: STATUS_COLORS[key as keyof typeof STATUS_COLORS] || "#6B7280",
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-4">
        Leads por Estado
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="#f3f4f6"
          />
          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            width={110}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number) => [`${value} leads`, "Cantidad"]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              fontSize: "13px",
            }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
