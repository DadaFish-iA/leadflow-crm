import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { upsertLeadByContact, createLead } from "./queries/leads";

/**
 * Webhook endpoint for external integrations (n8n, Make.com, etc.)
 * POST /api/trpc/webhook.ingest
 * No authentication required - this is a public endpoint
 */
export const webhookRouter = createRouter({
  ingest: publicQuery
    .input(
      z.object({
        nombre: z.string().min(1, "El nombre es requerido"),
        email: z.string().email("Email invalido"),
        telefono: z.string().min(1, "El telefono es requerido"),
        fuente: z
          .enum([
            "whatsapp-web",
            "instagram",
            "facebook",
            "meta-ads",
            "formulario-web",
            "otro",
          ])
          .default("otro"),
        estado: z
          .enum([
            "nuevo",
            "contactado",
            "en-seguimiento",
            "convertido",
            "no-interesado",
            "pendiente",
          ])
          .default("nuevo"),
        mensaje: z.string().optional(),
        campana: z.string().optional(),
        presupuesto: z.string().optional(),
        tags: z.string().optional(),
        // If true, updates existing lead with same email/phone instead of creating new
        upsert: z.boolean().default(true),
      }),
    )
    .mutation(async ({ input }) => {
      const { upsert, ...leadData } = input;

      try {
        if (upsert) {
          const result = await upsertLeadByContact({
            ...leadData,
            fechaUltimoContacto: new Date(),
          });
          return {
            success: true,
            lead: result.lead,
            created: result.created,
            message: result.created
              ? "Lead creado exitosamente"
              : "Lead actualizado exitosamente",
          };
        } else {
          const lead = await createLead({
            ...leadData,
            fechaUltimoContacto: new Date(),
          });
          return {
            success: true,
            lead,
            created: true,
            message: "Lead creado exitosamente",
          };
        }
      } catch (error: any) {
        return {
          success: false,
          lead: null,
          created: false,
          message: error.message || "Error al procesar el lead",
        };
      }
    }),

  // Health check endpoint for n8n/Make.com
  health: publicQuery.query(() => ({
    status: "ok",
    service: "LeadFlow CRM Webhook",
    timestamp: new Date().toISOString(),
  })),
});
