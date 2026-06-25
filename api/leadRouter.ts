import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import {
  getAllLeads,
  getLeadById,
  searchLeads,
  getFilteredLeads,
  createLead,
  updateLead,
  deleteLead,
  updateLeadStatus,
  getNotesByLeadId,
  addNote,
  getDashboardStats,
  upsertLeadByContact,
} from "./queries/leads";

export const leadRouter = createRouter({
  list: publicQuery.query(() => getAllLeads()),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getLeadById(input.id)),

  search: publicQuery
    .input(z.object({ query: z.string() }))
    .query(({ input }) => searchLeads(input.query)),

  filtered: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        source: z.string().optional(),
        status: z.string().optional(),
      }),
    )
    .query(({ input }) =>
      getFilteredLeads(
        input.search || undefined,
        (input.source as any) || undefined,
        (input.status as any) || undefined,
      ),
    ),

  create: publicQuery
    .input(
      z.object({
        nombre: z.string().min(1, "El nombre es requerido"),
        email: z.string().email("Email invalido"),
        telefono: z.string().min(1, "El telefono es requerido"),
        fuente: z.enum([
          "whatsapp-web",
          "instagram",
          "facebook",
          "meta-ads",
          "formulario-web",
          "otro",
        ]),
        estado: z
          .enum([
            "nuevo",
            "contactado",
            "en-seguimiento",
            "convertido",
            "no-interesado",
            "pendiente",
            "interes-alto",
          ])
          .default("nuevo"),
        mensaje: z.string().optional(),
        campana: z.string().optional(),
        presupuesto: z.string().optional(),
        tags: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const result = await upsertLeadByContact({
        ...input,
        fechaUltimoContacto: new Date(),
      });
      return result.lead;
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          nombre: z.string().optional(),
          email: z.string().optional(),
          telefono: z.string().optional(),
          fuente: z.string().optional(),
          estado: z.string().optional(),
          mensaje: z.string().optional(),
          campana: z.string().optional(),
          presupuesto: z.string().optional(),
          tags: z.string().optional(),
        }),
      }),
    )
    .mutation(({ input }) => updateLead(input.id, input.data as any)),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteLead(input.id)),

  updateStatus: publicQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum([
          "nuevo",
          "contactado",
          "en-seguimiento",
          "convertido",
          "no-interesado",
          "pendiente",
          "interes-alto",
        ]),
      }),
    )
    .mutation(({ input }) => updateLeadStatus(input.id, input.status)),

  notes: publicQuery
    .input(z.object({ leadId: z.number() }))
    .query(({ input }) => getNotesByLeadId(input.leadId)),

  addNote: publicQuery
    .input(
      z.object({
        leadId: z.number(),
        contenido: z.string().min(1, "La nota no puede estar vacia"),
        autor: z.string().default("Usuario"),
      }),
    )
    .mutation(({ input }) => addNote(input.leadId, input.contenido, input.autor)),

  stats: publicQuery.query(() => getDashboardStats()),

  multicanal: publicQuery.query(async () => {
    const allLeads = await getAllLeads();
    return allLeads.filter(
      (l) => l.fuentesAdicionales && l.fuentesAdicionales.length > 0
    );
  }),
});