// server/src/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import { db } from "./db";
import { persons } from "./schema";
import { eq } from "drizzle-orm";

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

// GET /api/persons/:id → uma pessoa pelo id
app.get("/api/persons/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await db.select().from(persons).where(eq(persons.id, id));

    if (result.length === 0) {
      return res.status(404).json({ error: "Pessoa não encontrada" });
    }

    res.json(result[0]);
  } catch (error) {
    console.error("Erro ao buscar pessoa:", error);
    res.status(500).json({ error: "Erro ao buscar pessoa" });
  }
});

// POST /api/persons → cria nova pessoa
app.post("/api/persons", async (req, res) => {
  try {
    const body = req.body;

    if (!body.name || !body.document || !body.personType) {
      return res.status(400).json({ error: "Campos obrigatórios: name, document, personType" });
    }

    const id = body.id || crypto.randomUUID(); // Node 18+

    const [inserted] = await db
      .insert(persons)
      .values({
        id,
        personType: body.personType,           // "pf" ou "pj"
        name: body.name,
        document: body.document,
        email: body.email ?? null,
        birthDate: body.birthDate ?? null,
        foundationDate: body.foundationDate ?? null,
        isActive: body.isActive ?? true,
        registrationStatus: body.registrationStatus ?? null,
        registrationStatusDate: body.registrationStatusDate ?? null
      })
      .returning();

    res.status(201).json(inserted);
  } catch (error) {
    console.error("Erro ao criar pessoa:", error);
    res.status(500).json({ error: "Erro ao criar pessoa" });
  }
});

// PUT /api/persons/:id → atualiza pessoa existente
app.put("/api/persons/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;

    const [updated] = await db
      .update(persons)
      .set({
        personType: body.personType,
        name: body.name,
        document: body.document,
        email: body.email ?? null,
        birthDate: body.birthDate ?? null,
        foundationDate: body.foundationDate ?? null,
        isActive: body.isActive ?? true,
        registrationStatus: body.registrationStatus ?? null,
        registrationStatusDate: body.registrationStatusDate ?? null,
        updatedAt: new Date()
      })
      .where(eq(persons.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Pessoa não encontrada para atualização" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar pessoa:", error);
    res.status(500).json({ error: "Erro ao atualizar pessoa" });
  }
});

// porta padrão
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`FINAPP2P backend rodando em http://localhost:${PORT}`);
});
