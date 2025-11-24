import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema"; // nossas tabelas

// createPool = criarPoolConexao
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// db = conexão tipada pelo Drizzle
export const db = drizzle(pool, { schema });

export type DB = typeof db;
