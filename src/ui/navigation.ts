// src/ui/navigation.ts

export type ScreenId = "screen-persons-list" | "screen-person-detail";

// showScreen = mostrarTela
export function showScreen(screenId: ScreenId): void {
    const screens = document.querySelectorAll<HTMLElement>("[data-screen]");

    screens.forEach((screen) => {
        screen.hidden = screen.id !== screenId;
    });

    // Atualiza o título da seção no cabeçalho
    const titleSection = document.getElementById("app-title-section");
    if (titleSection) {
        if (screenId === "screen-persons-list") {
            titleSection.textContent = "Pessoas";
        } else if (screenId === "screen-person-detail") {
            titleSection.textContent = "Pessoa";
        }
    }
    // mostra/esconde o FAB conforme a tela
    const fab = document.getElementById("fab-add-person") as HTMLButtonElement | null;
    if (fab) {
        fab.hidden = screenId !== "screen-persons-list";
    }
}

// initNavigation = iniciarNavegacao
export function initNavigation(): void {
    // Por enquanto só garantimos que a tela inicial é a lista
    showScreen("screen-persons-list");
}
