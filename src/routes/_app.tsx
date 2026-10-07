import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Sidebar } from "../components/shell/Sidebar";
import { TopBar } from "../components/shell/TopBar";
import { MobileNav } from "../components/shell/MobileNav";
import { RecapsProvider } from "../lib/recaps-context";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

// Persistent application shell: sidebar on desktop, context bar on top, and a
// bottom tab bar below 1024px. Only the main region scrolls.
function AppShell() {
  return (
    <div className="app-shell flex bg-bg overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto min-w-0">
          <Outlet />
        </main>
        <MobileNav />
      </div>
    </div>
  );
}

function AppLayout() {
  return (
    <RecapsProvider>
      <AppShell />
    </RecapsProvider>
  );
}
