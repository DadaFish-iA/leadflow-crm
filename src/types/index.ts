export type LeadSource =
  | "whatsapp-web"
  | "instagram"
  | "facebook"
  | "meta-ads"
  | "formulario-web"
  | "otro";

export type LeadStatus =
  | "nuevo"
  | "contactado"
  | "en-seguimiento"
  | "convertido"
  | "no-interesado"
  | "pendiente";

export interface Lead {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  fuente: LeadSource;
  estado: LeadStatus;
  mensaje: string | null;
  campana: string | null;
  presupuesto: string | null;
  tags: string | null;
  fechaRegistro: Date;
  fechaUltimoContacto: Date | null;
}

export interface LeadNote {
  id: number;
  leadId: number;
  contenido: string;
  fecha: Date;
  autor: string;
}

export interface DashboardStats {
  totalLeads: number;
  nuevosEsteMes: number;
  tasaConversion: number;
  leadsPorFuente: Record<string, number>;
  leadsPorEstado: Record<string, number>;
}

export const SOURCE_LABELS: Record<LeadSource, string> = {
  "whatsapp-web": "WhatsApp Web",
  instagram: "Instagram",
  facebook: "Facebook",
  "meta-ads": "Meta Ads",
  "formulario-web": "Formulario Web",
  otro: "Otro",
};

export const STATUS_LABELS: Record<LeadStatus, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  "en-seguimiento": "En Seguimiento",
  convertido: "Convertido",
  "no-interesado": "No Interesado",
  pendiente: "Pendiente",
};

export const SOURCE_COLORS: Record<LeadSource, string> = {
  "whatsapp-web": "#25D366",
  instagram: "#E4405F",
  facebook: "#1877F2",
  "meta-ads": "#0668E1",
  "formulario-web": "#F59E0B",
  otro: "#6B7280",
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  nuevo: "#3B82F6",
  contactado: "#8B5CF6",
  "en-seguimiento": "#F59E0B",
  convertido: "#10B981",
  "no-interesado": "#EF4444",
  pendiente: "#6B7280",
};

export const STATUS_BG_COLORS: Record<LeadStatus, string> = {
  nuevo: "#EFF6FF",
  contactado: "#F5F3FF",
  "en-seguimiento": "#FFFBEB",
  convertido: "#ECFDF5",
  "no-interesado": "#FEF2F2",
  pendiente: "#F9FAFB",
};

export const SOURCE_OPTIONS: LeadSource[] = [
  "whatsapp-web",
  "instagram",
  "facebook",
  "meta-ads",
  "formulario-web",
  "otro",
];

export const STATUS_OPTIONS: LeadStatus[] = [
  "nuevo",
  "contactado",
  "en-seguimiento",
  "convertido",
  "no-interesado",
  "pendiente",
];
