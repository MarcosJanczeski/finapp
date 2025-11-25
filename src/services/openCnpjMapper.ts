// src/services/openCnpjMapper.ts

import {
    PersonCompany,
    PersonType,
    Partner,
    Address,
    Phone,
    createCompany
} from "../domain/person.js";

// ==============================
// TIPOS PARA RESPOSTA DA API
// (mantemos snake_case para refletir a API)
// ==============================

export interface OpenCnpjTelephone {
    ddd: string;
    numero: string;
    is_fax: boolean;
}

export interface OpenCnpjPartner {
    nome_socio: string;
    cnpj_cpf_socio: string;
    qualificacao_socio: string;
    data_entrada_sociedade?: string;
    identificador_socio: string;
    faixa_etaria?: string;
}

export interface OpenCnpjApiCompany {
    cnpj: string;
    razao_social: string;
    nome_fantasia?: string | null;

    situacao_cadastral?: string | null;
    data_situacao_cadastral?: string | null;
    data_inicio_atividade?: string | null;

    cnae_principal?: string | null;
    cnaes_secundarios?: string[] | null;
    cnaes_secundarios_count?: number | null;

    natureza_juridica?: string | null;

    logradouro?: string | null;
    numero?: string | null;
    complemento?: string | null;
    bairro?: string | null;
    cep?: string | null;
    uf?: string | null;
    municipio?: string | null;

    email?: string | null;
    telefones?: OpenCnpjTelephone[] | null;

    capital_social?: string | null;
    porte_empresa?: string | null;

    opcao_simples?: boolean | null;
    data_opcao_simples?: string | null;
    opcao_mei?: boolean | null;
    data_opcao_mei?: string | null;

    QSA?: OpenCnpjPartner[] | null;
}

// ==============================
// FUNÇÃO DE MAPEAMENTO
// ==============================

export function mapOpenCnpjToPersonCompany(data: OpenCnpjApiCompany): PersonCompany {
    // Telefones
    const phones: Phone[] = (data.telefones ?? []).map((t) => ({
        ddd: t.ddd,
        number: t.numero,
        isFax: t.is_fax
    }));

    // Endereço
    const address: Address | undefined =
        data.logradouro && data.municipio && data.uf
            ? {
                  street: data.logradouro,
                  number: data.numero ?? "",
                  complement: data.complemento ?? undefined,
                  district: data.bairro ?? "",
                  zipCode: data.cep ?? "",
                  city: data.municipio,
                  state: data.uf
              }
            : undefined;

    // Sócios (QSA)
    const partners: Partner[] = (data.QSA ?? []).map((s) => ({
        name: s.nome_socio,
        document: s.cnpj_cpf_socio,
        role: s.qualificacao_socio,
        entryDate: s.data_entrada_sociedade,
        type: s.identificador_socio,
        ageRange: s.faixa_etaria
    }));

    // Cria a PersonCompany usando nossa função de fábrica do domínio
    const company: PersonCompany = createCompany({
        id: data.cnpj,
        name: data.razao_social,
        document: data.cnpj,

        tradeName: data.nome_fantasia ?? undefined,
        email: data.email ?? undefined,
        phones,
        address,

        cadastralStatus: data.situacao_cadastral ?? undefined,
        cadastralStatusDate: data.data_situacao_cadastral ?? undefined,
        foundationDate: data.data_inicio_atividade ?? undefined,

        mainCnae: data.cnae_principal ?? undefined,
        secondaryCnaes: data.cnaes_secundarios ?? undefined,

        legalNature: data.natureza_juridica ?? undefined,
        capitalSocial: data.capital_social ?? undefined,
        companySize: data.porte_empresa ?? undefined,

        simplesOption: data.opcao_simples ?? null,
        meiOption: data.opcao_mei ?? null,

        partners
    });

    return company;
}
