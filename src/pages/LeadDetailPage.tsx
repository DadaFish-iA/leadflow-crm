import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SourceBadge } from "@/components/SourceBadge";
import { StatusBadge } from "@/components/StatusBadge";
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageSquare,
  Send,
  User,
  DollarSign,
  Building2,
} from "lucide-react";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  type LeadStatus,
} from "@/types";

interface LeadDetailPageProps {
  leadId: number;
  onBack: () => void;
}

export function LeadDetailPage({ leadId, onBack }: LeadDetailPageProps) {
  const [newNote, setNewNote] = useState("");
  const utils = trpc.useUtils();

  const { data: lead, isLoading } = trpc.lead.byId.useQuery({ id: leadId });
  const { data: notes } = trpc.lead.notes.useQuery({ leadId });

  const addNote = trpc.lead.addNote.useMutation({
    onSuccess: () => {
      utils.lead.notes.invalidate({ leadId });
      setNewNote("");
    },
  });

  const updateStatus = trpc.lead.updateStatus.useMutation({
    onSuccess: () => {
      utils.lead.byId.invalidate({ id: leadId });
      utils.lead.list.invalidate();
    },
  });

  const handleAddNote = () => {
    if (newNote.trim()) {
      addNote.mutate({ leadId, contenido: newNote.trim() });
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeAgo = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 30) return `Hace ${diffDays} dias`;
    return formatDate(date);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando...</div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Lead no encontrado</div>
      </div>
    );
  }

  const allNotes = notes || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
                  {lead.nombre.charAt(0)}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {lead.nombre}
                  </h1>
                  <div className="flex items-center gap-2 mt-1.5">
                    <SourceBadge source={lead.fuente} />
                    <StatusBadge status={lead.estado} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Cambiar Estado
              </p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    "nuevo",
                    "contactado",
                    "en-seguimiento",
                    "convertido",
                    "no-interesado",
                    "pendiente",
                  ] as LeadStatus[]
                ).map((status) => (
                  <button
                    key={status}
                    onClick={() =>
                      updateStatus.mutate({ id: lead.id, status })
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      lead.estado === status ? "ring-2" : "hover:bg-gray-50"
                    }`}
                    style={
                      lead.estado === status
                        ? {
                            backgroundColor: `${STATUS_COLORS[status]}15`,
                            color: STATUS_COLORS[status],
                            boxShadow: `0 0 0 2px ${STATUS_COLORS[status]}40`,
                          }
                        : {}
                    }
                  >
                    {STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Informacion de Contacto
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">
                    {lead.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Telefono</p>
                  <p className="text-sm font-medium text-gray-900">
                    {lead.telefono}
                  </p>
                </div>
              </div>
              {lead.presupuesto && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Presupuesto</p>
                    <p className="text-sm font-medium text-gray-900">
                      {lead.presupuesto}
                    </p>
                  </div>
                </div>
              )}
              {lead.campana && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Campana</p>
                    <p className="text-sm font-medium text-gray-900">
                      {lead.campana}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {lead.mensaje && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                Mensaje Original
              </h2>
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
                <p className="text-sm text-gray-700 italic">
                  &ldquo;{lead.mensaje}&rdquo;
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Notas y Seguimiento
            </h2>

            <div className="flex gap-3 mb-6">
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Agregar una nota o seguimiento..."
                className="flex-1 min-h-[80px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.metaKey) handleAddNote();
                }}
              />
            </div>
            <div className="flex justify-end mb-6">
              <Button
                onClick={handleAddNote}
                size="sm"
                className="gap-1.5 bg-blue-500 hover:bg-blue-600"
              >
                <Send className="w-3.5 h-3.5" />
                Agregar Nota
              </Button>
            </div>

            <div className="space-y-4">
              {allNotes.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No hay notas registradas</p>
                  <p className="text-xs mt-1">Agrega el primer seguimiento</p>
                </div>
              )}

              {[...allNotes]
                .sort(
                  (a, b) =>
                    new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
                )
                .map((note) => (
                  <div
                    key={note.id}
                    className="flex gap-3 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {note.autor}
                        </span>
                        <span className="text-xs text-gray-400">.</span>
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(note.fecha)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {note.contenido}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Linea de Tiempo
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <div className="w-px h-full bg-gray-200" />
                </div>
                <div className="pb-4">
                  <p className="text-xs font-medium text-gray-900">
                    Lead registrado
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {formatDate(lead.fechaRegistro)}
                  </p>
                </div>
              </div>

              {lead.fechaUltimoContacto && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <div className="w-px h-full bg-gray-200" />
                  </div>
                  <div className="pb-4">
                    <p className="text-xs font-medium text-gray-900">
                      Ultimo contacto
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {formatDate(lead.fechaUltimoContacto)}
                    </p>
                  </div>
                </div>
              )}

              {allNotes.map((note, i) => (
                <div key={note.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                    {i < allNotes.length - 1 && (
                      <div className="w-px h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-xs font-medium text-gray-700">
                      Nota agregada
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {formatTimeAgo(note.fecha)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {lead.tags
                ?.split(",")
                .map((t) => t.trim())
                .filter(Boolean)
                .map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                )) || <p className="text-xs text-gray-400">Sin tags</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Acciones Rapidas
            </h3>
            <div className="space-y-2">
              <a
                href={`mailto:${lead.email}`}
                className="flex items-center gap-2.5 w-full p-2.5 rounded-lg hover:bg-blue-50 text-sm text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Enviar email
              </a>
              <a
                href={`https://wa.me/${lead.telefono.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 w-full p-2.5 rounded-lg hover:bg-green-50 text-sm text-gray-700 hover:text-green-600 transition-colors"
              >
                <Phone className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
