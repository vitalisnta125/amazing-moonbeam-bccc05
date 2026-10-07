import { createFileRoute, redirect } from "@tanstack/react-router";

// Pre-Trade Check is now part of Today (plain yes/no checks + operating
// rules in one place).
export const Route = createFileRoute("/_app/check")({
  beforeLoad: () => {
    throw redirect({ to: "/today" });
  },
  component: () => null,
});
