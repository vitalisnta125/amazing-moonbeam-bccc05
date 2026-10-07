import { createFileRoute, redirect } from "@tanstack/react-router";

// Session is now merged into Today (operating rules + pre-trade check +
// session lock in one place).
export const Route = createFileRoute("/_app/session")({
  beforeLoad: () => {
    throw redirect({ to: "/today" });
  },
  component: () => null,
});
