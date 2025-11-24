// src/ui/personsListView.ts

import {
    Person,
    PersonType
} from "../domain/person.js";
import { personRepository, ensureDemoData } from "../repositories/personRepositoryProvider.js";
import { showScreen } from "./navigation.js";
import { openPersonDetail, openNewPerson } from "./personDetailView.js";

// Tipos das chaves de filtro
type RoleKey = "customer" | "supplier";       // papéis (cliente/fornecedor)
type StatusKey = "active" | "inactive";       // status (ativo/inativo)
type TypeKey = "pf" | "pj";                   // tipo de pessoa (PF/PJ)

// Estado dos filtros: conjuntos (sets)
let selectedRoles = new Set<RoleKey>();       // se vazio => não filtra por papel
let selectedStatuses = new Set<StatusKey>();  // se vazio => não filtra por status
let selectedTypes = new Set<TypeKey>();       // se vazio => não filtra por tipo

let currentSearchTerm = "";

// initPersonsListView = iniciarVisualizacaoListaPessoas
export async function initPersonsListView(): Promise<void> {
    await ensureDemoData();
    setupEventHandlers();
    await reloadPersonsList();
}

// reloadPersonsList = recarregarListaPessoas
export async function reloadPersonsList(): Promise<void> {
    const persons = await personRepository.findAll();
    renderPersonsList(persons);
}

function setupEventHandlers(): void {
    const searchInput = document.getElementById("persons-search") as HTMLInputElement | null;
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            currentSearchTerm = searchInput.value.toLowerCase();
            reloadPersonsList(); // recarrega sempre que o termo mudar
        });
    }

    // Filtros de papel: Clientes / Fornecedores
    const roleButtons = document.querySelectorAll<HTMLButtonElement>("[data-filter-role]");
    roleButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const roleAttr = btn.getAttribute("data-filter-role") as RoleKey | null;
            if (!roleAttr) return;

            toggleFromSet(selectedRoles, roleAttr);
            toggleChipVisual(btn, selectedRoles.has(roleAttr));

            reloadPersonsList();
        });
    });

    // Filtros de status: Ativos / Inativos
    const statusButtons = document.querySelectorAll<HTMLButtonElement>("[data-filter-status]");
    statusButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const statusAttr = btn.getAttribute("data-filter-status") as StatusKey | null;
            if (!statusAttr) return;

            toggleFromSet(selectedStatuses, statusAttr);
            toggleChipVisual(btn, selectedStatuses.has(statusAttr));

            reloadPersonsList();
        });
    });

    // Filtros de tipo: PF / PJ
    const typeButtons = document.querySelectorAll<HTMLButtonElement>("[data-filter-type]");
    typeButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const typeAttr = btn.getAttribute("data-filter-type") as TypeKey | null;
            if (!typeAttr) return;

            toggleFromSet(selectedTypes, typeAttr);
            toggleChipVisual(btn, selectedTypes.has(typeAttr));

            reloadPersonsList();
        });
    });

    const fab = document.getElementById("fab-add-person");
    if (fab) {
        fab.addEventListener("click", () => {
            openNewPerson(); // por padrão PF
        });
    }

}

// Função auxiliar para ligar/desligar itens em um Set
function toggleFromSet<T>(set: Set<T>, value: T): void {
    if (set.has(value)) {
        set.delete(value);
    } else {
        set.add(value);
    }
}

// Atualiza a aparência do chip (ativo/inativo)
function toggleChipVisual(button: HTMLButtonElement, isActive: boolean): void {
    if (isActive) {
        button.classList.add("filter-chip--active");
    } else {
        button.classList.remove("filter-chip--active");
    }
}

function renderPersonsList(persons: Person[]): void {
    const container = document.getElementById("persons-list");
    if (!container) return;

    container.innerHTML = "";

    const filtered = persons.filter((person) => {
        // 1. Filtro por texto (nome + documento)
        const term = currentSearchTerm.trim();
        if (term) {
            const haystack = (person.name + " " + person.document).toLowerCase();
            if (!haystack.includes(term)) {
                return false;
            }
        }

        // 2. Filtro por tipo: PF / PJ
        if (selectedTypes.size > 0) {
            const typeKey: TypeKey =
                person.personType === PersonType.Company ? "pj" : "pf";
            if (!selectedTypes.has(typeKey)) {
                return false;
            }
        }

        // 3. Filtro por status: Ativo / Inativo
        if (selectedStatuses.size > 0) {
            const statusKey: StatusKey = person.isActive ? "active" : "inactive";
            if (!selectedStatuses.has(statusKey)) {
                return false;
            }
        }

        // 4. Filtro por papel: Clientes / Fornecedores
        // Ainda não modelamos isCustomer/isSupplier no domínio.
        // Quando adicionarmos, a lógica vai entrar aqui.
        if (selectedRoles.size > 0) {
            // futuro: aplicar filtro de roles
        }

        return true;
    });

    if (filtered.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "Nenhuma pessoa encontrada.";
        empty.style.fontSize = "0.85rem";
        empty.style.color = "#555";
        container.appendChild(empty);
        return;
    }

    filtered.forEach((person) => {
        const card = document.createElement("article");
        card.className = "person-card";

        const nameEl = document.createElement("div");
        nameEl.className = "person-card__name";
        nameEl.textContent = person.name;

        const docEl = document.createElement("div");
        docEl.className = "person-card__doc";
        docEl.textContent =
            person.personType === PersonType.Company
                ? `CNPJ: ${person.document}`
                : `CPF: ${person.document}`;

        const badgesContainer = document.createElement("div");
        badgesContainer.className = "person-card__badges";

        const badgeType = document.createElement("span");
        badgeType.className =
            "badge " +
            (person.personType === PersonType.Company ? "badge--pj" : "badge--pf");
        badgeType.textContent =
            person.personType === PersonType.Company ? "PJ" : "PF";

        const badgeStatus = document.createElement("span");
        badgeStatus.className =
            "badge " +
            (person.isActive ? "badge--active" : "badge--inactive");
        badgeStatus.textContent = person.isActive ? "Ativo" : "Inativo";

        badgesContainer.appendChild(badgeType);
        badgesContainer.appendChild(badgeStatus);

        card.appendChild(nameEl);
        card.appendChild(docEl);
        card.appendChild(badgesContainer);

        card.addEventListener("click", () => {
            openPersonDetail(person.id);
        });

        container.appendChild(card);
    });
}
