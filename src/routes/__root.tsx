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
      { name: "theme-color", content: "#090b0c" },
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
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500;600&display=swap",
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
    <div className="min-h-screen flex items-center justify-center bg-bg px-6">
      <div className="text-center">
        <p className="num text-[13px] text-fg-3 mb-2">404</p>
        <h1 className="text-[20px] font-semibold text-fg m-0 mb-2">Page not found</h1>
        <p className="text-fg-2 text-[13px] mb-6">This page doesn't exist.</p>
        <a href="/" className="btn btn-primary">
          Back to home
        </a>
      </div>
    </div>
  );
}
