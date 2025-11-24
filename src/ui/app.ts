// src/ui/app.ts

export function startApp(): void { // startApp = iniciarAplicação
    alert("startApp foi chamada!");
    const heading = document.querySelector("h1"); // heading = título
    if (heading) {
        heading.textContent = "FINAPP - Sistema iniciado pela camada de UI";
    }

    console.log("UI App started."); // "Aplicação de UI iniciada."
}
