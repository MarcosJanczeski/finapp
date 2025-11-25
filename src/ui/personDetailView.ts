// src/ui/personDetailView.ts

import {
    Person,
    PersonType,
    PersonCompany,
    PersonIndividual,
    Address,
    Partner,
    createIndividual,
    createCompany
} from "../domain/person.js";
import { personRepository } from "../repositories/personRepositoryProvider.js";
import { showScreen } from "./navigation.js";
import { reloadPersonsList } from "./personsListView.js";
import { OpenCnpjService } from "../services/openCnpjService.js";
import { fetchPersonByDocument } from "../services/personApiService.js";

let currentPerson: Person | null = null;

let isNewPerson = false;

const openCnpjService = new OpenCnpjService();

// initPersonDetailView = iniciarTelaDetalhesPessoa
export function initPersonDetailView(): void {
    setupTabHandlers();
    setupButtons();
}

function setActiveTab(tabId: string): void {
    const tabButtons = document.querySelectorAll<HTMLButtonElement>(".tab-button");
    const panels = document.querySelectorAll<HTMLElement>("[data-tab-panel]");

    tabButtons.forEach((btn) => {
        const btnTab = btn.getAttribute("data-tab");
        const isActive = btnTab === tabId && !btn.hasAttribute("hidden");
        btn.classList.toggle("tab-button--active", isActive);
    });

    panels.forEach((panel) => {
        const panelTab = panel.getAttribute("data-tab-panel");
        const isActive = panelTab === tabId;
        panel.classList.toggle("tab-panel--active", isActive);
    });
}

function setupTabHandlers(): void {
    const tabButtons = document.querySelectorAll<HTMLButtonElement>(".tab-button");

    tabButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            if (btn.hasAttribute("hidden")) return;

            const tab = btn.getAttribute("data-tab");
            if (!tab) return;

            setActiveTab(tab);
        });
    });
}

function setupButtons(): void {
    const backButton = document.getElementById("btn-person-back");
    if (backButton) {
        backButton.addEventListener("click", async () => {
            await reloadPersonsList();
            showScreen("screen-persons-list");
        });
    }

    const toggleActiveButton = document.getElementById(
        "btn-person-toggle-active"
    ) as HTMLButtonElement | null;

    if (toggleActiveButton) {
        toggleActiveButton.addEventListener("click", async () => {
            if (!currentPerson) return;
            currentPerson.isActive = !currentPerson.isActive;
            await personRepository.update(currentPerson);
            updateActiveButtonLabel();
        });
    }

    const saveButton = document.getElementById(
        "btn-person-save"
    ) as HTMLButtonElement | null;

    if (saveButton) {
        saveButton.addEventListener("click", async () => {
            if (!currentPerson) return;

            readFormIntoPerson(currentPerson);

            try {
                if (isNewPerson) {
                    await personRepository.create(currentPerson);
                } else {
                    await personRepository.update(currentPerson);
                }

                await reloadPersonsList();
                showScreen("screen-persons-list");

            } catch (error: any) {
                console.error("Erro ao salvar pessoa:", error);

                if (error instanceof Error && error.message === "duplicate_document") {
                    alert("Este CPF/CNPJ já está cadastrado no FINAPP.\n\nOs dados permanecerão na tela para revisão.");
                    return; // não sai da tela
                }

                alert("Erro ao salvar. Tente novamente.");
            }
        });
    }

    const cnpjButton = document.getElementById(
        "btn-company-search-cnpj"
    ) as HTMLButtonElement | null;

    if (cnpjButton) {
        cnpjButton.addEventListener("click", async () => {
            const cnpjInput = document.getElementById(
                "company-cnpj-search"
            ) as HTMLInputElement | null;
            const statusEl = document.getElementById(
                "company-cnpj-status"
            ) as HTMLParagraphElement | null;

            if (!cnpjInput) return;

            const rawCnpj = cnpjInput.value;
            if (statusEl) {
                statusEl.textContent = "Consultando OpenCNPJ...";
            }

            try {
                const data = await openCnpjService.fetchCompanyByCnpj(rawCnpj);

                if (!currentPerson) {
                    console.warn("Nenhuma pessoa carregada para aplicar os dados do CNPJ.");
                    return;
                }

                // Garante que será tratada como PJ
                currentPerson.personType = PersonType.Company;
                currentPerson.name = data.razao_social ?? currentPerson.name;
                currentPerson.document = data.cnpj ?? currentPerson.document;
                currentPerson.email = data.email ?? currentPerson.email;

                // Telefones: pega o primeiro, se existir
                if (data.telefones && data.telefones.length > 0) {
                    const tel = data.telefones[0];
                    currentPerson.phones = [
                        {
                            ddd: tel.ddd,
                            number: tel.numero,
                            isFax: tel.is_fax
                        }
                    ];
                }

                // Endereço
                currentPerson.address = {
                    zipCode: data.cep ?? "",
                    street: data.logradouro ?? "",
                    number: data.numero ?? "",
                    complement: data.complemento ?? "",
                    district: data.bairro ?? "",
                    city: data.municipio ?? "",
                    state: data.uf ?? ""
                };

                // Campos específicos de empresa (PersonCompany)
                if (currentPerson.personType === PersonType.Company) {
                    const company = currentPerson as PersonCompany;
                    company.tradeName = data.nome_fantasia ?? company.tradeName;
                    company.legalNature = data.natureza_juridica ?? company.legalNature;
                    company.mainCnae = data.cnae_principal ?? company.mainCnae;
                    company.companySize = data.porte_empresa ?? company.companySize;
                    company.capitalSocial = data.capital_social ?? company.capitalSocial;
                }

                // Atualiza o formulário inteiro com os dados novos
                fillFormFromPerson(currentPerson);

                if (statusEl) {
                    statusEl.textContent = "Dados carregados do OpenCNPJ.";
                }
            } catch (error) {
                console.error(error);
                if (statusEl) {
                    statusEl.textContent =
                        error instanceof Error
                            ? error.message
                            : "Erro ao consultar o OpenCNPJ.";
                }
            }
        });
    }
    const typeSelect = document.getElementById("person-type") as HTMLSelectElement | null;
    const searchWebButton = document.getElementById(
        "btn-person-search-web"
    ) as HTMLButtonElement | null;
    const dateLabel = document.getElementById("label-date") as HTMLLabelElement | null;
    typeSelect && typeSelect.addEventListener("change", () => {
        const isPJ = typeSelect.value === "pj";
        if (dateLabel) {
            dateLabel.textContent = isPJ ? "Data de fundação" : "Data de nascimento";
        }
    });

    const documentStatus = document.getElementById(
        "person-document-status"
    ) as HTMLParagraphElement | null;

    if (typeSelect && searchWebButton) {
        const updateSearchWebEnabled = () => {
            const isPJ = typeSelect.value === "pj";
            searchWebButton.disabled = !isPJ;
            if (!isPJ && documentStatus) {
                documentStatus.textContent = "";
            }
        };

        typeSelect.addEventListener("change", () => {
            // atualiza tipo da currentPerson também
            if (currentPerson) {
                currentPerson.personType =
                    typeSelect.value === "pj" ? PersonType.Company : PersonType.Individual;
            }
            updateSearchWebEnabled();
        });

        updateSearchWebEnabled();
    }

    if (searchWebButton) {
        searchWebButton.addEventListener("click", async () => {
            const docInput = document.getElementById(
                "person-document"
            ) as HTMLInputElement | null;

            if (!docInput || !currentPerson) return;

            const rawCnpj = docInput.value;
            if (documentStatus) {
                documentStatus.textContent = "Consultando OpenCNPJ...";
            }

            try {
                // 1️⃣ TENTA BUSCAR PRIMEIRO NO FINAPP
                const existing = await fetchPersonByDocument(rawCnpj);

                if (existing) {
                    // carrega este cadastro existente
                    currentPerson = existing;
                    fillFormFromPerson(currentPerson);
                    alert("Este documento já está cadastrado no FINAPP. Carreguei os dados existentes.");
                    return;
                }

                // 2️⃣ NÃO ACHOU NO FINAPP → BUSCA NO OPENCNPJ
                const data = await openCnpjService.fetchCompanyByCnpj(rawCnpj);

                // garante PJ
                currentPerson.personType = PersonType.Company;
                currentPerson.name = data.razao_social ?? currentPerson.name;
                currentPerson.document = data.cnpj ?? currentPerson.document;
                currentPerson.email = data.email ?? currentPerson.email;

                if (data.telefones && data.telefones.length > 0) {
                    const tel = data.telefones[0];
                    currentPerson.phones = [
                        {
                            ddd: tel.ddd,
                            number: tel.numero,
                            isFax: tel.is_fax
                        }
                    ];
                }

                currentPerson.address = {
                    zipCode: data.cep ?? "",
                    street: data.logradouro ?? "",
                    number: data.numero ?? "",
                    complement: data.complemento ?? "",
                    district: data.bairro ?? "",
                    city: data.municipio ?? "",
                    state: data.uf ?? ""
                };

                if (currentPerson.personType === PersonType.Company) {
                    const company = currentPerson as PersonCompany;
                    company.tradeName = data.nome_fantasia ?? company.tradeName;
                    company.legalNature = data.natureza_juridica ?? company.legalNature;
                    company.mainCnae = data.cnae_principal ?? company.mainCnae;
                    company.companySize = data.porte_empresa ?? company.companySize;
                    company.capitalSocial = data.capital_social ?? company.capitalSocial;
                    company.foundationDate = data.data_inicio_atividade ?? company.foundationDate;
                    company.registrationStatus = data.situacao_cadastral ?? company.registrationStatus;
                    company.registrationStatusDate = data.data_situacao_cadastral ?? company.registrationStatusDate;

                    // quadro societário
                    if (data.QSA && data.QSA.length > 0) {
                        company.partners = data.QSA.map((socio) => ({
                            name: socio.nome_socio,
                            document: socio.cnpj_cpf_socio,
                            role: socio.qualificacao_socio,
                            entryDate: socio.data_entrada_sociedade ?? undefined,
                            type: socio.identificador_socio ?? "",
                            ageRange: socio.faixa_etaria ?? undefined
                        }));
                    } else {
                        company.partners = [];
                    }
                }

                // Atualiza o formulário inteiro com os dados novos (inclui QSA)
                fillFormFromPerson(currentPerson);

                if (documentStatus) {
                    documentStatus.textContent = "Dados carregados do OpenCNPJ.";
                }
            } catch (error) {
                console.error(error);
                if (documentStatus) {
                    documentStatus.textContent =
                        error instanceof Error
                            ? error.message
                            : "Erro ao consultar o OpenCNPJ.";
                }
            }
        });
    }

}

// openNewPerson = abrirCadastroNovo
export async function openNewPerson(initialType: PersonType = PersonType.Individual): Promise<void> {
    isNewPerson = true;

    const id = Date.now().toString(); // simples, por enquanto

    if (initialType === PersonType.Company) {
        currentPerson = createCompany({
            id,
            name: "",
            document: "",
        });
    } else {
        currentPerson = createIndividual({
            id,
            name: "",
            document: "",
        });
    }

    fillFormFromPerson(currentPerson);
    showScreen("screen-person-detail");
}

// openPersonDetail = abrirDetalhesPessoa
export async function openPersonDetail(personId: string): Promise<void> {
    const person = await personRepository.findById(personId);
    if (!person) {
        console.error("Pessoa não encontrada:", personId);
        return;
    }
    currentPerson = person;
    isNewPerson = false;

    fillFormFromPerson(person);
    setActiveTab("general");          // 👈 garante início na aba Geral
    showScreen("screen-person-detail");
}


// Preenche os campos do formulário a partir da Person
function fillFormFromPerson(person: Person): void {
    const title = document.getElementById("person-detail-title");
    if (title) {
        title.textContent = person.name;
    }

    const typeSelect = document.getElementById("person-type") as HTMLSelectElement | null;
    const nameInput = document.getElementById("person-name") as HTMLInputElement | null;
    const docInput = document.getElementById("person-document") as HTMLInputElement | null;
    const dateInput = document.getElementById("person-date") as HTMLInputElement | null;
    const dateLabel = document.getElementById("label-date") as HTMLLabelElement | null;

    if (person.personType === PersonType.Individual) {
        if (dateLabel) dateLabel.textContent = "Data de nascimento";
        if (dateInput) dateInput.value = (person as PersonIndividual).birthDate ?? "";
    } else {
        if (dateLabel) dateLabel.textContent = "Data de fundação";
        if (dateInput) dateInput.value = (person as PersonCompany).foundationDate ?? "";
    }

    const emailInput = document.getElementById("person-email") as HTMLInputElement | null;
    const phoneInput = document.getElementById("person-phone") as HTMLInputElement | null;
    const notesInput = document.getElementById("person-notes") as HTMLTextAreaElement | null;

    if (typeSelect) {
        typeSelect.value =
            person.personType === PersonType.Company ? "pj" : "pf";
    }
    if (nameInput) nameInput.value = person.name;
    if (docInput) docInput.value = person.document;
    if (emailInput) emailInput.value = person.email ?? "";
    if (phoneInput) phoneInput.value = person.phones?.[0]?.number ?? "";
    if (notesInput) notesInput.value = ""; // ainda não temos notes no domínio

    // Endereço
    const address = person.address;
    if (address) {
        setAddressFields(address);
    } else {
        clearAddressFields();
    }

    // Campos de empresa (se for PJ)
    const isCompany = person.personType === PersonType.Company;
    const company = isCompany ? (person as PersonCompany) : null;

    const tabCompany = document.getElementById("tab-company");
    const tabQsa = document.getElementById("tab-qsa");
    const registrationInput = document.getElementById(
        "company-registration-status"
    ) as HTMLInputElement | null;

    // esconde/mostra abas de PJ
    if (tabCompany) {
        tabCompany.toggleAttribute("hidden", !isCompany);
    }
    if (tabQsa) {
        tabQsa.toggleAttribute("hidden", !isCompany);
    }

    const tradeNameInput = document.getElementById(
        "company-trade-name"
    ) as HTMLInputElement | null;
    const legalNatureInput = document.getElementById(
        "company-legal-nature"
    ) as HTMLInputElement | null;
    const mainCnaeInput = document.getElementById(
        "company-main-cnae"
    ) as HTMLInputElement | null;
    const companySizeInput = document.getElementById(
        "company-size"
    ) as HTMLInputElement | null;
    const companyCapitalInput = document.getElementById(
        "company-capital"
    ) as HTMLInputElement | null;

    if (company) {
        if (tradeNameInput) tradeNameInput.value = company.tradeName ?? "";
        if (legalNatureInput) legalNatureInput.value = company.legalNature ?? "";
        if (mainCnaeInput) mainCnaeInput.value = company.mainCnae ?? "";
        if (companySizeInput) companySizeInput.value = company.companySize ?? "";
        if (companyCapitalInput) companyCapitalInput.value = company.capitalSocial ?? "";
        if (registrationInput) {
            if (company.registrationStatus) {
                const dateText = company.registrationStatusDate
                    ? ` desde ${company.registrationStatusDate}`
                    : "";
                registrationInput.value = `${company.registrationStatus}${dateText}`;
            } else {
                registrationInput.value = "";
            }
        }
        renderPartnersList(company.partners ?? []);
    } else {
        if (tradeNameInput) tradeNameInput.value = "";
        if (legalNatureInput) legalNatureInput.value = "";
        if (mainCnaeInput) mainCnaeInput.value = "";
        if (companySizeInput) companySizeInput.value = "";
        if (companyCapitalInput) companyCapitalInput.value = "";
        renderPartnersList([]);
    }

    updateActiveButtonLabel();
}

function renderPartnersList(partners: Partner[]): void {
    const container = document.getElementById("partners-list");
    if (!container) return;

    container.innerHTML = "";

    if (!partners || partners.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "Nenhum sócio informado.";
        empty.className = "small-hint";
        container.appendChild(empty);
        return;
    }

    partners.forEach((partner) => {
        const card = document.createElement("div");
        card.className = "partner-card";

        const name = document.createElement("div");
        name.className = "partner-card__name";
        name.textContent = partner.name;

        const role = document.createElement("div");
        role.className = "partner-card__role";
        role.textContent = partner.role;

        const meta = document.createElement("div");
        meta.className = "partner-card__meta";

        const parts: string[] = [];
        if (partner.document) parts.push(`Doc: ${partner.document}`);
        if (partner.type) parts.push(partner.type);
        if (partner.entryDate) parts.push(`Entrada: ${partner.entryDate}`);
        if (partner.ageRange) parts.push(partner.ageRange);

        meta.textContent = parts.join(" · ");

        card.appendChild(name);
        card.appendChild(role);
        card.appendChild(meta);

        container.appendChild(card);
    });
}

function updateActiveButtonLabel(): void {
    const toggleActiveButton = document.getElementById(
        "btn-person-toggle-active"
    ) as HTMLButtonElement | null;

    const statusBadge = document.getElementById(
        "person-status-badge"
    ) as HTMLSpanElement | null;

    if (!currentPerson) return;

    // Atualiza texto do botão
    if (toggleActiveButton) {
        toggleActiveButton.textContent = currentPerson.isActive
            ? "Inativar"
            : "Ativar";
    }

    // Atualiza badge de status
    if (statusBadge) {
        statusBadge.textContent = currentPerson.isActive ? "Ativo" : "Inativo";

        statusBadge.classList.remove("badge--active", "badge--inactive");

        if (currentPerson.isActive) {
            statusBadge.classList.add("badge--active");
        } else {
            statusBadge.classList.add("badge--inactive");
        }

        // garante que sempre tenha a classe base
        if (!statusBadge.classList.contains("badge")) {
            statusBadge.classList.add("badge");
        }
    }
}

// Lê os campos do formulário de volta para o objeto Person
function readFormIntoPerson(person: Person): void {
    const typeSelect = document.getElementById("person-type") as HTMLSelectElement | null;
    const nameInput = document.getElementById("person-name") as HTMLInputElement | null;
    const docInput = document.getElementById("person-document") as HTMLInputElement | null;
    const emailInput = document.getElementById("person-email") as HTMLInputElement | null;
    const phoneInput = document.getElementById("person-phone") as HTMLInputElement | null;

    if (typeSelect) {
        const value = typeSelect.value;
        person.personType = value === "pj" ? PersonType.Company : PersonType.Individual;
    }

    if (nameInput) person.name = nameInput.value;
    if (docInput) person.document = docInput.value;
    if (emailInput) person.email = emailInput.value;

    const phoneNumber = phoneInput?.value ?? "";
    if (phoneNumber) {
        person.phones = [
            {
                ddd: "",
                number: phoneNumber,
                isFax: false
            }
        ];
    }

    // Endereço
    const address = readAddressFields();
    person.address = address;

    // Se for PJ, atualiza campos específicos
    if (person.personType === PersonType.Company) {
        const company = person as PersonCompany;

        const tradeNameInput = document.getElementById(
            "company-trade-name"
        ) as HTMLInputElement | null;
        const legalNatureInput = document.getElementById(
            "company-legal-nature"
        ) as HTMLInputElement | null;
        const mainCnaeInput = document.getElementById(
            "company-main-cnae"
        ) as HTMLInputElement | null;
        const companySizeInput = document.getElementById(
            "company-size"
        ) as HTMLInputElement | null;
        const companyCapitalInput = document.getElementById(
            "company-capital"
        ) as HTMLInputElement | null;

        if (tradeNameInput) company.tradeName = tradeNameInput.value;
        if (legalNatureInput) company.legalNature = legalNatureInput.value;
        if (mainCnaeInput) company.mainCnae = mainCnaeInput.value;
        if (companySizeInput) company.companySize = companySizeInput.value;
        if (companyCapitalInput) company.capitalSocial = companyCapitalInput.value;
    }
    const dateInput = document.getElementById("person-date") as HTMLInputElement | null;

    if (person.personType === PersonType.Individual) {
        (person as PersonIndividual).birthDate = dateInput?.value || "";
    } else {
        (person as PersonCompany).foundationDate = dateInput?.value || "";
    }

}

// Helpers de endereço
function setAddressFields(address: Address): void {
    (document.getElementById("person-zip") as HTMLInputElement | null)!.value =
        address.zipCode ?? "";
    (document.getElementById("person-street") as HTMLInputElement | null)!.value =
        address.street ?? "";
    (document.getElementById("person-number") as HTMLInputElement | null)!.value =
        address.number ?? "";
    (document.getElementById("person-complement") as HTMLInputElement | null)!.value =
        address.complement ?? "";
    (document.getElementById("person-district") as HTMLInputElement | null)!.value =
        address.district ?? "";
    (document.getElementById("person-city") as HTMLInputElement | null)!.value =
        address.city ?? "";
    (document.getElementById("person-state") as HTMLInputElement | null)!.value =
        address.state ?? "";
}

function clearAddressFields(): void {
    const ids = [
        "person-zip",
        "person-street",
        "person-number",
        "person-complement",
        "person-district",
        "person-city",
        "person-state"
    ];
    ids.forEach((id) => {
        const el = document.getElementById(id) as HTMLInputElement | null;
        if (el) el.value = "";
    });
}

function readAddressFields(): Address {
    const zipCode = (document.getElementById("person-zip") as HTMLInputElement | null)?.value ?? "";
    const street = (document.getElementById("person-street") as HTMLInputElement | null)?.value ?? "";
    const number = (document.getElementById("person-number") as HTMLInputElement | null)?.value ?? "";
    const complement = (document.getElementById("person-complement") as HTMLInputElement | null)?.value ?? "";
    const district = (document.getElementById("person-district") as HTMLInputElement | null)?.value ?? "";
    const city = (document.getElementById("person-city") as HTMLInputElement | null)?.value ?? "";
    const state = (document.getElementById("person-state") as HTMLInputElement | null)?.value ?? "";

    return {
        zipCode,
        street,
        number,
        complement,
        district,
        city,
        state
    };
}
