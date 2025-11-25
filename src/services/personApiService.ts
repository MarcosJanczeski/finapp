// src/services/personApiService.ts

import {
  Person,
  PersonType,
  PersonCompany,
  PersonIndividual,
  createCompany,
  createIndividual
} from "../domain/person.js";

const API_BASE_URL = "http://localhost:3000";

// mapApiPersonToDomain = mapearPessoaApiParaDominio
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
      foundationDate: row.foundationDate ?? undefined,
      mainCnae: row.mainCnae ?? undefined,
      companySize: row.companySize ?? undefined,
      capitalSocial: row.capitalSocial ?? undefined,
      phones: undefined,
      address: undefined,
      partners: undefined
    });

    company.foundationDate = row.foundationDate ?? undefined;
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

// mapDomainPersonToApi = mapearPessoaDominioParaApi
export function mapDomainPersonToApi(person: Person): any {
  const common = {
    id: person.id,
    personType:
      person.personType === PersonType.Company
        ? "pj"
        : "pf",
    name: person.name,
    document: person.document,
    email: person.email ?? null,
    isActive: person.isActive
  };

  if (person.personType === PersonType.Company) {
    const company = person as PersonCompany;
    return {
      ...common,
      foundationDate: company.foundationDate ?? null,
      registrationStatus: company.registrationStatus ?? null,
      registrationStatusDate: company.registrationStatusDate ?? null
    };
  } else {
    const individual = person as PersonIndividual;
    return {
      ...common,
      birthDate: individual.birthDate ?? null
    };
  }
}

// fetchAllPersons = buscarTodasPessoas
export async function fetchAllPersons(): Promise<Person[]> {
  const resp = await fetch(`${API_BASE_URL}/api/persons`);
  if (!resp.ok) {
    throw new Error("Erro ao buscar pessoas no backend");
  }
  const data = await resp.json();
  return (data as any[]).map(mapApiPersonToDomain);
}

// fetchPersonById = buscarPessoaPorId
export async function fetchPersonById(id: string): Promise<Person | null> {
  const resp = await fetch(`${API_BASE_URL}/api/persons/${id}`);
  if (resp.status === 404) return null;
  if (!resp.ok) {
    throw new Error("Erro ao buscar pessoa no backend");
  }
  const row = await resp.json();
  return mapApiPersonToDomain(row);
}

// fetchPersonByDocument = buscarPessoaPorDocumento
export async function fetchPersonByDocument(document: string): Promise<Person | null> {
    const trimmed = document.trim();
    if (!trimmed) {
        return null;
    }

    const url = `${API_BASE_URL}/api/persons?document=${encodeURIComponent(trimmed)}`;

    const resp = await fetch(url);
    if (!resp.ok) {
        throw new Error("Erro ao buscar pessoa por documento no backend");
    }

    const data = (await resp.json()) as any[];

    if (!data || data.length === 0) {
        return null;
    }

    // como nosso backend devolve array, pegamos o primeiro
    return mapApiPersonToDomain(data[0]);
}

// savePerson = salvarPessoa
export async function savePerson(person: Person, isNew: boolean): Promise<Person> {
  const payload = mapDomainPersonToApi(person);

  const url = isNew
    ? `${API_BASE_URL}/api/persons`
    : `${API_BASE_URL}/api/persons/${person.id}`;

  const method = isNew ? "POST" : "PUT";

  const resp = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!resp.ok) {
    throw new Error("Erro ao salvar pessoa no backend");
  }

  const row = await resp.json();
  return mapApiPersonToDomain(row);
}
