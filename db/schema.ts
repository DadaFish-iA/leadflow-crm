import {
  mysqlTable,
  serial,
  varchar,
  text,
  timestamp,
  mysqlEnum,
} from "drizzle-orm/mysql-core";

export const leadSourceEnum = [
  "whatsapp-web",
  "instagram",
  "facebook",
  "meta-ads",
  "formulario-web",
  "otro",
] as const;

export const leadStatusEnum = [
  "nuevo",
  "contactado",
  "en-seguimiento",
  "convertido",
  "no-interesado",
  "pendiente",
] as const;

export const leads = mysqlTable("leads", {
  id: serial("id").primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  telefono: varchar("telefono", { length: 50 }).notNull(),
  fuente: mysqlEnum("fuente", [...leadSourceEnum]).notNull().default("otro"),
  estado: mysqlEnum("estado", [...leadStatusEnum]).notNull().default("nuevo"),
  mensaje: text("mensaje"),
  campana: varchar("campana", { length: 255 }),
  presupuesto: varchar("presupuesto", { length: 255 }),
  tags: text("tags"),
  fechaRegistro: timestamp("fecha_registro").defaultNow().notNull(),
  fechaUltimoContacto: timestamp("fecha_ultimo_contacto"),
});

export const leadNotes = mysqlTable("lead_notes", {
  id: serial("id").primaryKey(),
  leadId: serial("lead_id").notNull(),
  contenido: text("contenido").notNull(),
  fecha: timestamp("fecha").defaultNow().notNull(),
  autor: varchar("autor", { length: 255 }).notNull().default("Sistema"),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
export type LeadNote = typeof leadNotes.$inferSelect;
export type InsertLeadNote = typeof leadNotes.$inferInsert;
