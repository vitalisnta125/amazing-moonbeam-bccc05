import {
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import "../styles.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { name: "theme-color", content: "#080c14" },
      { name: "apple-mobile-web-app-title", content: "EXECURE" },
      { title: "EXECURE — The Behaviour Operating System for Traders" },
      {
        name: "description",
        content:
          "EXECURE is the behaviour operating system for traders. Pre-trade checks, session plans, journaling, and discipline tracking.",
      },
    ],
    links: [
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "alternate icon", href: "/favicon.ico", sizes: "16x16 32x32" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      { rel: "manifest", href: "/site.webmanifest" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap",
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
      <div className="text-center">
        <h1 className="text-6xl font-black text-[var(--color-brand)] mb-4">
          404
        </h1>
        <p className="text-[var(--color-text-secondary)] text-lg mb-8">
          This page doesn't exist.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-[var(--color-brand)] text-[var(--color-surface)] rounded-lg font-semibold hover:bg-[var(--color-brand-dark)] transition-colors"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
