// src/services/openCnpjService.ts

// Tipo baseado na documentação oficial do OpenCNPJ :contentReference[oaicite:1]{index=1}
export interface OpenCnpjCompanyResponse {
    cnpj: string;
    razao_social: string;
    nome_fantasia?: string | null;
    situacao_cadastral?: string | null;
    data_situacao_cadastral?: string | null;
    matriz_filial?: string | null;
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
    telefones?: {
        ddd: string;
        numero: string;
        is_fax: boolean;
    }[] | null;
    capital_social?: string | null;
    porte_empresa?: string | null;
    opcao_simples?: string | null;
    opcao_mei?: string | null;
    QSA?: {
        nome_socio: string;
        cnpj_cpf_socio: string;
        qualificacao_socio: string;
        data_entrada_sociedade?: string | null;
        identificador_socio?: string | null;
        faixa_etaria?: string | null;
    }[] | null;
}

export class OpenCnpjService {
    private readonly baseUrl = "https://api.opencnpj.org"; // GET /{cnpj}

    // fetchCompanyByCnpj = buscarEmpresaPorCnpj
    async fetchCompanyByCnpj(rawCnpj: string): Promise<OpenCnpjCompanyResponse> {
        const cleaned = rawCnpj.replace(/\D/g, "");

        if (cleaned.length !== 14) {
            throw new Error("CNPJ deve ter 14 dígitos.");
        }

        const url = `${this.baseUrl}/${cleaned}`;

        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("CNPJ não encontrado no OpenCNPJ.");
            }
            throw new Error("Erro ao consultar o OpenCNPJ.");
        }

        const data = (await response.json()) as OpenCnpjCompanyResponse;
        return data;
    }
}
