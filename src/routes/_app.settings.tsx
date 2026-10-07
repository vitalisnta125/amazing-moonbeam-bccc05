import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, PageHeader } from "../components/ui/Page";
import { Panel } from "../components/ui/Panel";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <Page>
      <PageHeader title="Settings" description="Account and other tools." />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
        <Panel label="Account" className="lg:col-span-6">
          <p className="text-[12px] text-fg-3 m-0">Signed in via Netlify Identity.</p>
        </Panel>

        <Panel label="More tools" className="lg:col-span-6">
          <Link
            to="/journal"
            className="flex items-center justify-between gap-3 h-10 px-3 rounded-[4px] no-underline hover:bg-panel-2 -mx-3"
          >
            <span className="min-w-0">
              <span className="block text-[13px] text-fg">Journal</span>
              <span className="block text-[11px] text-fg-3">Daily written debrief</span>
            </span>
            <span className="text-fg-3">→</span>
          </Link>
        </Panel>
      </div>
    </Page>
  );
}
