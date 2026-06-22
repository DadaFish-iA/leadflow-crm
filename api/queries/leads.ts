import { getDb } from "./connection";
import { leads, leadNotes } from "@db/schema";
import { eq, desc, and, like, or } from "drizzle-orm";
import type { Lead, InsertLead, LeadNote } from "@db/schema";

export type LeadSource = typeof leads.$inferSelect.fuente;
export type LeadStatus = typeof leads.$inferSelect.estado;

export async function getAllLeads(): Promise<Lead[]> {
  return getDb()
    .select()
    .from(leads)
    .orderBy(desc(leads.fechaRegistro));
}

export async function getLeadById(id: number): Promise<Lead | undefined> {
  const [lead] = await getDb()
    .select()
    .from(leads)
    .where(eq(leads.id, id));
  return lead;
}

export async function searchLeads(query: string): Promise<Lead[]> {
  const searchTerm = `%${query}%`;
  return getDb()
    .select()
    .from(leads)
    .where(
      or(
        like(leads.nombre, searchTerm),
        like(leads.email, searchTerm),
        like(leads.telefono, searchTerm),
        like(leads.tags, searchTerm),
      ),
    )
    .orderBy(desc(leads.fechaRegistro));
}

export async function getFilteredLeads(
  search?: string,
  source?: LeadSource,
  status?: LeadStatus,
): Promise<Lead[]> {
  const conditions = [];

  if (search) {
    const searchTerm = `%${search}%`;
    conditions.push(
      or(
        like(leads.nombre, searchTerm),
        like(leads.email, searchTerm),
        like(leads.telefono, searchTerm),
        like(leads.tags, searchTerm),
      ),
    );
  }

  if (source) {
    conditions.push(eq(leads.fuente, source));
  }

  if (status) {
    conditions.push(eq(leads.estado, status));
  }

  if (conditions.length === 0) {
    return getAllLeads();
  }

  return getDb()
    .select()
    .from(leads)
    .where(and(...conditions))
    .orderBy(desc(leads.fechaRegistro));
}

export async function createLead(
  data: Omit<InsertLead, "id" | "fechaRegistro">,
): Promise<Lead> {
  const [result] = await getDb()
    .insert(leads)
    .values({
      ...data,
      fechaRegistro: new Date(),
    })
    .$returningId();

  const lead = await getLeadById(result.id);
  if (!lead) throw new Error("Failed to create lead");
  return lead;
}

export async function updateLead(
  id: number,
  data: Partial<Omit<InsertLead, "id" | "fechaRegistro">>,
): Promise<Lead> {
  await getDb()
    .update(leads)
    .set(data)
    .where(eq(leads.id, id));

  const lead = await getLeadById(id);
  if (!lead) throw new Error("Lead not found");
  return lead;
}

export async function deleteLead(id: number): Promise<void> {
  await getDb().delete(leadNotes).where(eq(leadNotes.leadId, id));
  await getDb().delete(leads).where(eq(leads.id, id));
}

export async function updateLeadStatus(
  id: number,
  status: LeadStatus,
): Promise<Lead> {
  return updateLead(id, { estado: status });
}

// Lead notes
export async function getNotesByLeadId(
  leadId: number,
): Promise<LeadNote[]> {
  return getDb()
    .select()
    .from(leadNotes)
    .where(eq(leadNotes.leadId, leadId))
    .orderBy(desc(leadNotes.fecha));
}

export async function addNote(
  leadId: number,
  contenido: string,
  autor: string = "Usuario",
): Promise<LeadNote> {
  const [result] = await getDb()
    .insert(leadNotes)
    .values({
      leadId,
      contenido,
      fecha: new Date(),
      autor,
    })
    .$returningId();

  const [note] = await getDb()
    .select()
    .from(leadNotes)
    .where(eq(leadNotes.id, result.id));

  await getDb()
    .update(leads)
    .set({ fechaUltimoContacto: new Date() })
    .where(eq(leads.id, leadId));

  if (!note) throw new Error("Failed to create note");
  return note;
}

// Dashboard stats
export async function getDashboardStats(): Promise<{
  totalLeads: number;
  nuevosEsteMes: number;
  tasaConversion: number;
  leadsPorFuente: Record<string, number>;
  leadsPorEstado: Record<string, number>;
  leadsMulticanal: number;
}> {
  const allLeads = await getAllLeads();

  const totalLeads = allLeads.length;

  const now = new Date();
  const mesActual = now.getMonth();
  const anioActual = now.getFullYear();
  const nuevosEsteMes = allLeads.filter((l) => {
    const f = new Date(l.fechaRegistro);
    return f.getMonth() === mesActual && f.getFullYear() === anioActual;
  }).length;

  const convertidos = allLeads.filter((l) => l.estado === "convertido").length;
  const tasaConversion =
    totalLeads > 0 ? Math.round((convertidos / totalLeads) * 100) : 0;

  const leadsPorFuente: Record<string, number> = {
    "whatsapp-web": 0,
    instagram: 0,
    facebook: 0,
    "meta-ads": 0,
    "formulario-web": 0,
    otro: 0,
  };

  const leadsPorEstado: Record<string, number> = {
    nuevo: 0,
    contactado: 0,
    "en-seguimiento": 0,
    convertido: 0,
    "no-interesado": 0,
    pendiente: 0,
    "interes-alto": 0,
  };

  allLeads.forEach((lead) => {
    leadsPorFuente[lead.fuente] = (leadsPorFuente[lead.fuente] || 0) + 1;
    leadsPorEstado[lead.estado] = (leadsPorEstado[lead.estado] || 0) + 1;
  });

  const leadsMulticanal = allLeads.filter(
    (l) => l.fuentesAdicionales && l.fuentesAdicionales.length > 0
  ).length;

  return {
    totalLeads,
    nuevosEsteMes,
    tasaConversion,
    leadsPorFuente,
    leadsPorEstado,
    leadsMulticanal,
  };
}

// Upsert for webhook (create or update by email/phone)
// Returns: lead, created (true if new), wasDuplicate (true if existed)
export async function upsertLeadByContact(
  data: Omit<InsertLead, "id" | "fechaRegistro">,
): Promise<{ lead: Lead; created: boolean; wasDuplicate: boolean }> {
  // Try to find existing lead by email or phone
  const existing = await getDb()
    .select()
    .from(leads)
    .where(
      or(eq(leads.email, data.email), eq(leads.telefono, data.telefono)),
    )
    .limit(1);

  if (existing.length > 0 && existing[0]) {
    const oldLead = existing[0];
    const newFuente = data.fuente;
    
    // Check if source is different
    if (oldLead.fuente !== newFuente) {
      // Build list of additional sources
      const existingAdditional = oldLead.fuentesAdicionales 
        ? oldLead.fuentesAdicionales.split(",").map(s => s.trim()).filter(Boolean)
        : [];
      
      const allSources = [oldLead.fuente, ...existingAdditional];
      
      // Only add if this source is new
      if (!allSources.includes(newFuente)) {
        const updatedAdditional = [...existingAdditional, newFuente].join(",");
        
        const updated = await updateLead(oldLead.id, {
          ...data,
          fuentesAdicionales: updatedAdditional,
          estado: "interes-alto", // Mark as high interest
          fechaUltimoContacto: new Date(),
        });
        
        return { lead: updated, created: false, wasDuplicate: true };
      }
    }
    
    // Same source or already tracked, just update
    const updated = await updateLead(oldLead.id, {
      ...data,
      fechaUltimoContacto: new Date(),
    });
    
    return { lead: updated, created: false, wasDuplicate: false };
  }

  // New lead
  const created = await createLead(data);
  return { lead: created, created: true, wasDuplicate: false };
}