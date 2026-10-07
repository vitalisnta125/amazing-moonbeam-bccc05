import { createFileRoute, Outlet } from "@tanstack/react-router";
import { TopBar } from "../components/TopBar";
import { BottomNav } from "../components/BottomNav";
import { EliteModeProvider, useEliteMode } from "../lib/elite-mode-context";
import { SessionPlanProvider } from "../lib/session-plan-context";
import { DashboardPrefsProvider } from "../lib/dashboard-prefs-context";
import { RecapsProvider } from "../lib/recaps-context";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppShell() {
  const { eliteMode } = useEliteMode();

  return (
    <div
      className={`app-shell flex flex-col bg-[var(--color-surface)] overflow-hidden elite-transition ${eliteMode ? "elite-mode" : ""}`}
    >
      <TopBar />
      <main className="flex-1 overflow-y-auto min-w-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

function AppLayout() {
  return (
    <EliteModeProvider>
      <SessionPlanProvider>
        <RecapsProvider>
          <DashboardPrefsProvider>
            <AppShell />
          </DashboardPrefsProvider>
        </RecapsProvider>
      </SessionPlanProvider>
    </EliteModeProvider>
  );
}
