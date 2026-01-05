import { sql } from "drizzle-orm";
import { pgTable, serial, varchar, timestamp, integer, date, jsonb, index, real, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const washtypes = pgTable("washtypes", {
  wtid: serial("wtid").primaryKey(),
  description: varchar("description", { length: 100 }).notNull(),
  price: real("price").notNull(),
});

export const locations = pgTable("locations", {
  locationId: serial("location_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  motorway: varchar("motorway", { length: 10 }).notNull(),
  area: varchar("area", { length: 50 }).notNull(),
  postcode: varchar("postcode", { length: 10 }).notNull(),
});

export const companies = pgTable("companies", {
  coId: serial("co_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  transportManager: varchar("transport_manager", { length: 100 }),
  transportManagerEmail: varchar("transport_manager_email", { length: 100 }),
  transportManagerPhone: varchar("transport_manager_phone", { length: 20 }),
  poContact: varchar("po_contact", { length: 100 }),
  poContactEmail: varchar("po_contact_email", { length: 100 }),
  poContactPhone: varchar("po_contact_phone", { length: 20 }),
  plContact: varchar("pl_contact", { length: 100 }),
  plContactEmail: varchar("pl_contact_email", { length: 100 }),
  plContactPhone: varchar("pl_contact_phone", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vehicles = pgTable("vehicles", {
  vreg: varchar("vreg", { length: 10 }).primaryKey(),
  coId: integer("co_id").notNull(),
  washFreq: integer("wash_freq").notNull().default(0),
  lastWashDate: date("last_wash_date"),
  lastWashType: integer("last_wash_type"),
});

export const washes = pgTable("washes", {
  washId: serial("wash_id").primaryKey(),
  vreg: varchar("vreg", { length: 10 }).notNull(),
  coId: integer("co_id").notNull(),
  location: varchar("location", { length: 30 }).notNull(),
  driverName: varchar("driver_name", { length: 50 }),
  washType: integer("wash_type").notNull(),
  washDate: timestamp("wash_date").notNull().default(sql`now()`),
});



export const USER_ROLES = [
  "superAdmin",
  "admin",
  "transportAdmin",
  "poAdmin",
  "plAdmin",
  "washAdmin",
  "washOperative",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  password: varchar("password").notNull(),
  profileImageUrl: varchar("profile_image_url"),
  coId: integer("co_id"),
  role: varchar("role", { length: 20 }).default("washOperative").$type<UserRole>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const washLists = pgTable("wash_lists", {
  id: serial("id").primaryKey(),
  coId: integer("co_id").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  generatedAt: timestamp("generated_at").defaultNow(),
  pdfContent: text("pdf_content").notNull(), // Base64 encoded PDF
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  coId: integer("co_id").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  poNumber: varchar("po_number", { length: 50 }),
  generatedAt: timestamp("generated_at").defaultNow(),
  pdfContent: text("pdf_content").notNull(), // Base64 encoded PDF
});

export const pagePermissions = pgTable("page_permissions", {
  id: serial("id").primaryKey(),
  role: varchar("role", { length: 20 }).notNull(),
  pageRoute: varchar("page_route", { length: 50 }).notNull(),
  isAllowed: integer("is_allowed").notNull().default(0), // 0 for false, 1 for true
});

export const session = pgTable("session", {
  sid: text("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire", { precision: 6 }).notNull(),
});

export const SYSTEM_PAGES = [
  { label: "Record Wash", route: "/" },
  { label: "Wash Records", route: "/records" },
  { label: "Manage Wash", route: "/manage-wash" },
  { label: "Manage Fleet", route: "/manage" },
  { label: "Manage Companies", route: "/companies" },
  { label: "Wash Edit", route: "/wash-edit" },
  { label: "Locations", route: "/locations" },
  { label: "Users", route: "/users" },
  { label: "Page Permissions", route: "/permissions" },
] as const;

export const insertWashTypeSchema = createInsertSchema(washtypes).omit({
  wtid: true,
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  locationId: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  coId: true,
  createdAt: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).extend({
  lastWashDate: z.string().optional(),
  lastWashType: z.number().optional(),
});

export const insertWashSchema = createInsertSchema(washes).omit({
  washId: true,
  washDate: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWashListSchema = createInsertSchema(washLists).omit({
  id: true,
  generatedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  generatedAt: true,
});

export const insertPagePermissionSchema = createInsertSchema(pagePermissions).omit({
  id: true,
});

export type InsertWashType = z.infer<typeof insertWashTypeSchema>;
export type WashType = typeof washtypes.$inferSelect;

export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

export type InsertWash = z.infer<typeof insertWashSchema>;
export type Wash = typeof washes.$inferSelect;

export type UpsertUser = typeof users.$inferInsert;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWashList = z.infer<typeof insertWashListSchema>;
export type WashList = typeof washLists.$inferSelect;

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

export type InsertPagePermission = z.infer<typeof insertPagePermissionSchema>;
export type PagePermission = typeof pagePermissions.$inferSelect;
