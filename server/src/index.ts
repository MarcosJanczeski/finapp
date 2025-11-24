// server/src/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import { db } from "./db";
import { persons } from "./schema";

const app = express();

// middlewares básicos
app.use(cors());
app.use(express.json());

// healthcheck
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "FINAPP2P backend is running" });
});

// GET /api/persons → lista pessoas
app.get("/api/persons", async (req, res) => {
  try {
    const result = await db.select().from(persons).orderBy(persons.name);
    res.json(result);
  } catch (error) {
    console.error("Erro ao buscar persons:", error);
    res.status(500).json({ error: "Erro ao buscar pessoas" });
  }
});

// porta padrão
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`FINAPP2P backend rodando em http://localhost:${PORT}`);
});
