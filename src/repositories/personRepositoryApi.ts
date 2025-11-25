// src/repositories/personRepositoryApi.ts

import { Person, PersonType, PersonCompany, PersonIndividual, createCompany, createIndividual } from "../domain/person.js";
import { IPersonRepository } from "./personRepository.js";

const API_BASE_URL = "http://localhost:3000";

// mapApiPersonToDomain = converte o formato da API (JSON) para o domínio Person
function mapApiPersonToDomain(row: any): Person {
    const isCompany = row.personType === "pj";

    if (isCompany) {
        const company = createCompany({
            id: row.id ?? "",
            name: row.name ?? "",
            document: row.document ?? "",
            email: row.email ?? undefined,

            tradeName: row.tradeName ?? undefined,
            cadastralStatus: row.registrationStatus ?? undefined,
            cadastralStatusDate: row.registrationStatusDate ?? undefined,
            mainCnae: row.mainCnae ?? undefined,
            companySize: row.companySize ?? undefined,
            capitalSocial: row.capitalSocial ?? undefined,
            foundationDate: row.foundationDate ?? row.openingDate ?? undefined,
            partners: undefined,  // depois preenchemos com QSA se existir

            phones: undefined,
            address: undefined
        });

        company.foundationDate = row.foundationDate ?? row.openingDate ?? undefined;
        company.registrationStatus = row.registrationStatus ?? undefined;
        company.registrationStatusDate = row.registrationStatusDate ?? undefined;
        company.isActive = row.isActive ?? true;

        return company;
    } else {
        const individual = createIndividual({
            id: row.id ?? "",
            name: row.name ?? "",
            document: row.document ?? "",
            email: row.email ?? undefined,
            phones: undefined,
            address: undefined
        });
        individual.isActive = row.isActive ?? true;
        individual.birthDate = row.birthDate ?? undefined;

        return individual;
    }
}

export class PersonRepositoryApi implements IPersonRepository {
    async findAll(): Promise<Person[]> {
        const resp = await fetch(`${API_BASE_URL}/api/persons`);
        if (!resp.ok) {
            throw new Error("Erro ao buscar pessoas no backend");
        }
        const data = await resp.json();
        return (data as any[]).map(mapApiPersonToDomain);
    }

    async findById(id: string): Promise<Person | null> {
        const resp = await fetch(`${API_BASE_URL}/api/persons/${id}`);
        if (resp.status === 404) {
            return null;
        }
        if (!resp.ok) {
            throw new Error("Erro ao buscar pessoa no backend");
        }
        const row = await resp.json();
        return mapApiPersonToDomain(row);
    }

    async create(person: Person): Promise<void> {
        // vamos implementar em um passo separado
        throw new Error("Not implemented");
    }

    async update(person: Person): Promise<void> {
        // vamos implementar em um passo separado
        throw new Error("Not implemented");
    }

    async delete(id: string): Promise<void> {
        // vamos implementar em um passo separado
        throw new Error("Not implemented");
    }
}
