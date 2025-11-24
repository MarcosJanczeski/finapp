// src/repositories/personRepositoryProvider.ts

import { IPersonRepository } from "./personRepository.js";
import { PersonRepositoryMemory } from "./personRepositoryMemory.js";
import { createIndividual, createCompany } from "../domain/person.js";

export const personRepository: IPersonRepository = new PersonRepositoryMemory();

let demoSeeded = false;

// ensureDemoData = garantirDadosDemonstracao
export async function ensureDemoData(): Promise<void> {
    if (demoSeeded) return;

    const existing = await personRepository.findAll();
    if (existing.length > 0) {
        demoSeeded = true;
        return;
    }

    const p1 = createIndividual({
        id: "1",
        name: "João da Silva",
        document: "12345678900"
    });

    const p2 = createCompany({
        id: "2",
        name: "EMPRESA EXEMPLO LTDA",
        document: "00000000000000",
        tradeName: "EXEMPLO COMÉRCIO"
    });

    await personRepository.create(p1);
    await personRepository.create(p2);

    demoSeeded = true;
}
