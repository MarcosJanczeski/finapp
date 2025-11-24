import {
  pgTable,
  varchar,
  text,
  boolean,
  date,
  timestamp
} from "drizzle-orm/pg-core";

export const persons = pgTable("person", {
  id: varchar("id", { length: 50 }).primaryKey(), // vamos usar o mesmo id string do frontend por enquanto

  personType: varchar("person_type", { length: 10 }).notNull(), // "pf" ou "pj"

  name: text("name").notNull(),
  document: varchar("document", { length: 20 }).notNull(),

  email: varchar("email", { length: 100 }),

  // PF: birthDate / PJ: foundationDate
  birthDate: date("birth_date"),
  foundationDate: date("foundation_date"),

  isActive: boolean("is_active").notNull().default(true),

  // Data vinda do OpenCNPJ
  registrationStatus: varchar("registration_status", { length: 10 }),
  registrationStatusDate: date("registration_status_date"),

  createdAt: timestamp("created_at", {
    withTimezone: true
  }).defaultNow(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true
  }).defaultNow()
});
