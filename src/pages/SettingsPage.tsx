import { trpc } from "@/providers/trpc";
import {
  Database,
  Webhook,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";

export function SettingsPage() {
  const { data: leads } = trpc.lead.list.useQuery();
  const { data: health } = trpc.webhook.health.useQuery();
  const [copied, setCopied] = useState(false);

  const leadsCount = leads?.length ?? 0;
  const webhookUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/trpc/webhook.ingest`
    : "https://tu-dominio.com/api/trpc/webhook.ingest";

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuracion</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Informacion del sistema y configuracion de integraciones
        </p>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Base de Datos</h2>
            <p className="text-sm text-gray-500">
              {leadsCount} leads almacenados en MySQL
            </p>
          </div>
        </div>
      </div>

      {/* Webhook Endpoint */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Webhook className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">
              Endpoint de Webhook
            </h2>
            <p className="text-sm text-gray-500">
              Usa esta URL para conectar n8n, Make.com o cualquier servicio
            </p>
          </div>
          {health && (
            <span className="ml-auto text-xs px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full font-medium">
              Activo
            </span>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
          <code className="flex-1 text-sm text-gray-700 break-all">
            {webhookUrl}
          </code>
          <button
            onClick={copyWebhookUrl}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0"
            title="Copiar URL"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Como usar con n8n / Make.com
          </h3>

          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                1
              </span>
              <p>
                Crea un workflow en n8n o Make.com con el trigger que necesites
                (Google Sheets, Meta Ads, etc.)
              </p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                2
              </span>
              <p>
                Agrega un nodo HTTP Request (POST) y configura la URL de arriba
              </p>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                3
              </span>
              <p>
                En el body, envia un JSON con los campos: nombre, email,
                telefono, fuente, estado
              </p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-xs text-emerald-400">
{`{
  "nombre": "Maria Gonzalez",
  "email": "maria@email.com",
  "telefono": "+5491123456789",
  "fuente": "meta-ads",
  "estado": "nuevo",
  "mensaje": "Vi la campana en Instagram",
  "campana": "Campana Junio 2026",
  "tags": "instagram, interes-alta"
}`}
            </pre>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-2">
          Acerca de LeadFlow
        </h2>
        <p className="text-sm text-gray-600">
          LeadFlow CRM es una aplicacion fullstack para gestionar leads de
          multiples fuentes. Construido con React, tRPC, Drizzle ORM y MySQL.
        </p>
        <p className="text-sm text-gray-500 mt-2">Version 2.0 - Fullstack</p>
      </div>
    </div>
  );
}
