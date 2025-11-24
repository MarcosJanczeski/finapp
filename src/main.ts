// src/main.ts
import { initNavigation } from "./ui/navigation.js";
import { initPersonsListView } from "./ui/personsListView.js";
import { initPersonDetailView } from "./ui/personDetailView.js";
import { ensureDemoData } from "./repositories/personRepositoryProvider.js";

async function bootstrap(): Promise<void> {
    console.log("FINAPP main entry point loaded.");

    initNavigation();
    initPersonDetailView();

    await ensureDemoData();
    await initPersonsListView();
}

bootstrap().catch((error) => {
    console.error("Erro ao iniciar a aplicação FINAPP:", error);
});
