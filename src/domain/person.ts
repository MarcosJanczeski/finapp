// src/domain/person.ts

// ==============================
// TIPOS AUXILIARES
// ==============================

// Endereço
export interface Address {
    street: string;       // logradouro
    number: string;       // número
    complement?: string;  // complemento
    district: string;     // bairro
    city: string;         // município
    state: string;        // UF
    zipCode: string;      // CEP
}

// Telefone
export interface Phone {
    ddd: string;
    number: string;
    isFax: boolean;
}

// Sócio (QSA)
export interface Partner {
    name: string;
    document: string;            // CPF ou CNPJ
    role: string;                // qualificação
    entryDate?: string;          // data de entrada
    type: string;                // PF/PJ
    ageRange?: string;           // faixa etária
}

// ==============================
// TIPOS BASE
// ==============================

export enum PersonType {
    Individual = "INDIVIDUAL",   // Pessoa Física
    Company = "COMPANY"          // Pessoa Jurídica
}

// Base comum a todos
export interface PersonBase {
    id: string;
    name: string;               // nome completo (PF) ou razão social (PJ)
    document: string;           // CPF ou CNPJ
    personType: PersonType;
    isActive: boolean;
    createdAt: Date;
    updatedAt?: Date;

    // Contato
    email?: string;
    phones?: Phone[];
    address?: Address;
}

// ==============================
// PESSOA FÍSICA (PF)
// ==============================

export interface PersonIndividual extends PersonBase {
    personType: PersonType.Individual;
    birthDate?: string;   // YYYY-MM-DD
    // Mais tarde podemos adicionar dados específicos de PF se necessário
}

// ==============================
// PESSOA JURÍDICA (PJ)
// ==============================

export interface PersonCompany extends PersonBase {
    personType: PersonType.Company;

    tradeName?: string;                 // nome fantasia
    cadastralStatus?: string;           // situação cadastral
    cadastralStatusDate?: string;       // data situação cadastral
    openingDate?: string;               // data início atividade

    mainCnae?: string;                  // CNAE principal
    secondaryCnaes?: string[];
    secondaryCnaesCount?: number;

    legalNature?: string;               // natureza jurídica
    capitalSocial?: string;
    companySize?: string;               // porte empresa
    
    registrationStatus?: string;      // Situação cadastral (Ativa / Baixada / etc.)
    registrationStatusDate?: string;  // Data da situação cadastral
    
    simplesOption?: boolean | null;
    meiOption?: boolean | null;

    partners?: Partner[];               // QSA
}

// ==============================
// TIPO UNIFICADO
// ==============================

export type Person = PersonIndividual | PersonCompany;

// ==============================
// FUNÇÕES DE FÁBRICA (HELPERS)
// ==============================

export function createIndividual(params: {
    id: string;
    name: string;
    document: string;
    email?: string;
    phones?: Phone[];
    address?: Address;
}): PersonIndividual {
    return {
        id: params.id,
        name: params.name,
        document: params.document,
        personType: PersonType.Individual,
        isActive: true,
        createdAt: new Date(),
        email: params.email,
        phones: params.phones,
        address: params.address
    };
}

export function createCompany(params: {
    id: string;
    name: string;
    document: string;
    tradeName?: string;
    email?: string;
    phones?: Phone[];
    address?: Address;
    cadastralStatus?: string;
    cadastralStatusDate?: string;
    openingDate?: string;
    mainCnae?: string;
    secondaryCnaes?: string[];
    legalNature?: string;
    capitalSocial?: string;
    companySize?: string;
    simplesOption?: boolean | null;
    meiOption?: boolean | null;
    partners?: Partner[];
}): PersonCompany {
    return {
        id: params.id,
        name: params.name,
        document: params.document,
        personType: PersonType.Company,
        isActive: true,
        createdAt: new Date(),

        tradeName: params.tradeName,
        email: params.email,
        phones: params.phones,
        address: params.address,

        cadastralStatus: params.cadastralStatus,
        cadastralStatusDate: params.cadastralStatusDate,
        openingDate: params.openingDate,

        mainCnae: params.mainCnae,
        secondaryCnaes: params.secondaryCnaes,
        secondaryCnaesCount: params.secondaryCnaes?.length || 0,

        legalNature: params.legalNature,
        capitalSocial: params.capitalSocial,
        companySize: params.companySize,

        simplesOption: params.simplesOption,
        meiOption: params.meiOption,

        partners: params.partners
    };
}
