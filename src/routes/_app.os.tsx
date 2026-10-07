import { createFileRoute, useNavigate } from "@tanstack/react-router";
import App from "../App.jsx";
import { OS_TABS, type OsTab } from "../components/shell/nav";

// Behaviour OS control surface. The active tab lives in the URL (?tab=rules) so
// the sidebar can deep-link to Today, Rules, Risk and Leaderboard.
export const Route = createFileRoute("/_app/os")({
  validateSearch: (search: Record<string, unknown>): { tab?: OsTab } => {
    const tab = search.tab;
    return typeof tab === "string" && (OS_TABS as string[]).includes(tab)
      ? { tab: tab as OsTab }
      : {};
  },
  component: OsPage,
});

function OsPage() {
  const { tab } = Route.useSearch();
  const navigate = useNavigate({ from: "/os" });
  return <App tab={tab} onTabChange={(t: OsTab) => navigate({ search: { tab: t } })} />;
}
