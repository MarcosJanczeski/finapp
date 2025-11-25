import {
  pgTable,
  varchar,
  text,
  boolean,
  date,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";


export const persons = pgTable(
  "person",
  {
    id: varchar("id", { length: 50 }).primaryKey(),

    personType: varchar("person_type", { length: 10 }).notNull(), // "pf" ou "pj"

    name: text("name").notNull(),

    // ❗ Alteração importante:
    // documento pode ser NULL (usuário pode não informar)
    // mas documentos NÃO nulos devem ser únicos
    document: varchar("document", { length: 20 }), 

    email: varchar("email", { length: 255 }),

    birthDate: date("birth_date"),
    foundationDate: date("foundation_date"),

    isActive: boolean("is_active").notNull().default(true),

    registrationStatus: varchar("registration_status", { length: 100 }),
    registrationStatusDate: date("registration_status_date"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => {
    return {
      // índice único parcial: só é aplicado quando document NÃO for NULL
      uniqueDocument: uniqueIndex("person_document_unique_not_null")
        .on(table.document)
        .where(sql`${table.document} IS NOT NULL`)
    };
  }
);
