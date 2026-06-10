import { useState, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Save, UserPlus } from "lucide-react";
import { SOURCE_LABELS, STATUS_LABELS } from "@/types";
import type { LeadSource, LeadStatus } from "@/types";

interface LeadFormPageProps {
  leadId?: number;
  onSave: () => void;
  onCancel: () => void;
}

export function LeadFormPage({ leadId, onSave, onCancel }: LeadFormPageProps) {
  const utils = trpc.useUtils();
  const { data: existingLead } = trpc.lead.byId.useQuery(
    { id: leadId! },
    { enabled: !!leadId },
  );

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fuente, setFuente] = useState<LeadSource>("otro");
  const [estado, setEstado] = useState<LeadStatus>("nuevo");
  const [mensaje, setMensaje] = useState("");
  const [campana, setCampana] = useState("");
  const [presupuesto, setPresupuesto] = useState("");
  const [tags, setTags] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existingLead) {
      setNombre(existingLead.nombre);
      setEmail(existingLead.email);
      setTelefono(existingLead.telefono);
      setFuente(existingLead.fuente);
      setEstado(existingLead.estado);
      setMensaje(existingLead.mensaje || "");
      setCampana(existingLead.campana || "");
      setPresupuesto(existingLead.presupuesto || "");
      setTags(existingLead.tags || "");
    }
  }, [existingLead]);

  const createLead = trpc.lead.create.useMutation({
    onSuccess: () => {
      utils.lead.list.invalidate();
      utils.lead.stats.invalidate();
      onSave();
    },
  });

  const updateLead = trpc.lead.update.useMutation({
    onSuccess: () => {
      utils.lead.list.invalidate();
      utils.lead.byId.invalidate({ id: leadId! });
      onSave();
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!nombre.trim()) newErrors.nombre = "El nombre es requerido";
    if (!email.trim()) newErrors.email = "El email es requerido";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email invalido";
    if (!telefono.trim()) newErrors.telefono = "El telefono es requerido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const data = {
      nombre: nombre.trim(),
      email: email.trim(),
      telefono: telefono.trim(),
      fuente,
      estado,
      mensaje: mensaje.trim() || undefined,
      campana: campana.trim() || undefined,
      presupuesto: presupuesto.trim() || undefined,
      tags: tags.trim() || undefined,
    };

    if (leadId) {
      updateLead.mutate({ id: leadId, data });
    } else {
      createLead.mutate(data);
    }
  };

  const isEditing = !!leadId;
  const isSubmitting = createLead.isPending || updateLead.isPending;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            {isEditing ? (
              <Save className="w-5 h-5 text-blue-600" />
            ) : (
              <UserPlus className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {isEditing ? "Editar Lead" : "Nuevo Lead"}
            </h1>
            <p className="text-sm text-gray-500">
              {isEditing
                ? "Actualiza la informacion del lead"
                : "Completa los datos del nuevo lead"}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre completo *</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Maria Gonzalez"
              className={errors.nombre ? "border-red-300" : ""}
            />
            {errors.nombre && (
              <p className="text-xs text-red-500">{errors.nombre}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej: maria@email.com"
              className={errors.email ? "border-red-300" : ""}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="telefono">Telefono *</Label>
          <Input
            id="telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Ej: +54 9 11 2345 6789"
            className={errors.telefono ? "border-red-300" : ""}
          />
          {errors.telefono && (
            <p className="text-xs text-red-500">{errors.telefono}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Fuente</Label>
            <Select
              value={fuente}
              onValueChange={(v) => setFuente(v as LeadSource)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SOURCE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Estado</Label>
            <Select
              value={estado}
              onValueChange={(v) => setEstado(v as LeadStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="mensaje">Mensaje / Consulta</Label>
          <Textarea
            id="mensaje"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Mensaje original del lead..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="campana">Campana (opcional)</Label>
            <Input
              id="campana"
              value={campana}
              onChange={(e) => setCampana(e.target.value)}
              placeholder="Ej: Campana Mayo 2026"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="presupuesto">Presupuesto (opcional)</Label>
            <Input
              id="presupuesto"
              value={presupuesto}
              onChange={(e) => setPresupuesto(e.target.value)}
              placeholder="Ej: USD 100.000 - 150.000"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tags">Tags (separados por coma)</Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Ej: prioridad-alta, 2-ambientes, inversion"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="gap-1.5 bg-blue-500 hover:bg-blue-600"
        >
          <Save className="w-4 h-4" />
          {isEditing
            ? isSubmitting
              ? "Guardando..."
              : "Guardar cambios"
            : isSubmitting
              ? "Creando..."
              : "Crear lead"}
        </Button>
      </div>
    </div>
  );
}
