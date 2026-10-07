import { createFileRoute, Link } from "@tanstack/react-router";
import { LogoMark, Wordmark } from "../components/Logo";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LogoMark size={34} />
            <span className="text-xl font-black tracking-tight text-[var(--color-text-primary)]">
              <Wordmark />
            </span>
            <span className="text-[9px] font-bold text-[var(--color-brand)] bg-[var(--color-brand)]/10 border border-[var(--color-brand)]/20 px-1.5 py-0.5 rounded">
              BETA
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors no-underline"
            >
              Open App
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-secondary)] mb-6">
          THE BEHAVIOUR OPERATING SYSTEM FOR TRADERS
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.1] mb-6 text-[var(--color-text-primary)]">
          Before{" "}
          <br className="sm:hidden" />
          you{" "}
          <span className="text-[var(--color-brand)] relative">
            execute
            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[var(--color-brand)]/40 rounded-full" />
          </span>
          .
          <br />
          Prepare.
        </h1>
        <p className="text-base sm:text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
          Most traders come after the loss. EXECURE works before
          the trade — testing your psychology, your rules, and your
          edge into every session.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#pricing"
            className="px-8 py-4 bg-[var(--color-brand)] text-[var(--color-surface)] rounded-xl font-bold text-base hover:bg-[var(--color-brand-dark)] transition-colors no-underline"
          >
            Join the Waitlist
          </a>
          <a
            href="#features"
            className="px-8 py-4 border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl font-bold text-base hover:bg-[var(--color-surface-elevated)] transition-colors no-underline"
          >
            See how it works →
          </a>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: "78%", label: "NO REGRET COMPLETION RATE" },
            { value: "92%", label: "REDUCED RULE BREAKS" },
            { value: "0", label: "ZERO-EMOTION BREACHES" },
          ].map((stat) => (
            <div key={stat.label} className="text-center py-6 px-4 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border-glow)]">
              <div className="text-3xl sm:text-4xl font-black text-[var(--color-brand)] mb-2">
                {stat.value}
              </div>
              <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* We own the before */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20 border-t border-[var(--color-border)]">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-4">
          01 — EXECURE CORE
        </p>
        <h2 className="text-3xl sm:text-4xl font-black mb-12 text-[var(--color-text-primary)]">
          We own the{" "}
          <span className="text-[var(--color-brand)]">before</span>.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 text-[var(--color-text-primary)]">
              TradeSync / Engagement
            </h3>
            <ul className="space-y-3">
              {[
                "Pre-trade checklist — verify before entry",
                "Session plan every time",
                "Emotional + rule mapping",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[var(--color-brand)] flex-shrink-0" />
                  <span className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 text-[var(--color-text-primary)]">
              Pre-Trade Intelligence
            </h3>
            <ul className="space-y-3">
              {[
                "Psychology check before entry",
                "Rule enforcement via identity loops",
                "Behaviour patterns over time",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[var(--color-brand)] flex-shrink-0" />
                  <span className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Pre-trade check preview */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20 border-t border-[var(--color-border)]">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-4">
          02 — PRE-TRADE CHECK
        </p>
        <h2 className="text-3xl sm:text-4xl font-black mb-12 text-[var(--color-text-primary)]">
          Pre-trade check
        </h2>
        <div className="max-w-2xl mx-auto bg-[var(--color-surface-card)] border border-[var(--color-border-glow)] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                SESSION READINESS — LONDON OPEN
              </p>
            </div>
            <span className="text-sm font-black text-[var(--color-brand)]">3/5</span>
          </div>
          <div className="p-6 space-y-3">
            {[
              { text: "My bias aligns with the higher timeframe momentum", status: "green" },
              { text: "I have not over-traded in my previous session", status: "green" },
              { text: "I have reviewed the key news events for this session", status: "green" },
              { text: "I have confirmed the key levels for this session", status: "amber" },
              { text: "My emotional state is calm and execution-ready", status: "amber" },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-3 py-2 px-3 rounded-lg"
                style={{
                  backgroundColor:
                    item.status === "green"
                      ? "rgba(0, 255, 136, 0.05)"
                      : "rgba(245, 158, 11, 0.05)",
                }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor:
                      item.status === "green" ? "var(--color-brand)" : "var(--color-amber)",
                  }}
                />
                <span className="text-sm text-[var(--color-text-primary)]">{item.text}</span>
              </div>
            ))}
          </div>
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--color-text-secondary)]">Readiness</span>
              <span className="text-xs font-bold text-[var(--color-brand)]">60%</span>
            </div>
            <div className="h-2 bg-[var(--color-surface)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--color-brand)]"
                style={{ width: "60%" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Your edge, engineered */}
      <section id="features" className="max-w-5xl mx-auto px-4 sm:px-6 py-20 border-t border-[var(--color-border)]">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-4">
          03 — YOUR FEATURES
        </p>
        <h2 className="text-3xl sm:text-4xl font-black mb-4 text-[var(--color-text-primary)]">
          Your edge,{" "}
          <span className="text-[var(--color-brand)]">engineered</span>.
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-12 max-w-xl text-base leading-relaxed">
          Every feature is built to keep you inside your trading identity. You don't trade until you clear this.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
              ),
              title: "Pre-trade check",
              desc: "Customisable readiness protocol before every session. You don't trade until you clear this.",
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
                  <path d="M12 6v6l4 2" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                </svg>
              ),
              title: "Trader DNA",
              desc: "A psychological profile built over time. Shows your real habits — and your real bias.",
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-amber)" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              ),
              title: "Elite mode",
              desc: "Stricter rules, higher threshold. For when you want full control over your identity.",
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2">
                  <path d="M12 2a8 8 0 018 8c0 6-8 12-8 12S4 16 4 10a8 8 0 018-8z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              ),
              title: "AI coach insights",
              desc: "Personalised nudges to help you stay inside your identity.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-6 hover:border-[var(--color-border-glow)] transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="text-base font-bold mb-2 text-[var(--color-text-primary)]">
                {f.title}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-4 sm:px-6 py-20 border-t border-[var(--color-border)]">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-4">
          04 — PRICING
        </p>
        <h2 className="text-3xl sm:text-4xl font-black mb-12 text-[var(--color-text-primary)]">
          Simple.{" "}
          <span className="text-[var(--color-text-secondary)]">Honest.</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-2xl p-8">
            <div className="mb-6">
              <span className="text-4xl font-black text-[var(--color-text-primary)]">£0</span>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">Free forever</p>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "Pre-trade checklist",
                "Session plan builder",
                "Journal + logging",
                "Up to 3 trades/session",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5">
                    <path d="M4 8l3 3 5-5" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="#waitlist"
              className="block w-full py-3 text-center rounded-xl border border-[var(--color-border)] text-[var(--color-text-primary)] font-semibold text-sm hover:bg-[var(--color-surface-elevated)] transition-colors no-underline"
            >
              Join waitlist
            </a>
          </div>

          <div className="bg-[var(--color-surface-card)] border border-[var(--color-brand)]/20 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[var(--color-brand)] text-[var(--color-surface)] text-[10px] font-bold uppercase px-3 py-1 rounded-bl-lg">
              Popular
            </div>
            <div className="mb-6">
              <span className="text-4xl font-black text-[var(--color-text-primary)]">£12</span>
              <span className="text-sm text-[var(--color-text-secondary)] ml-1">/month</span>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">Pro</p>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "Everything in Free",
                "Trader DNA insights",
                "Elite mode",
                "AI coach engine",
                "Full session review",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--color-brand)" strokeWidth="1.5">
                    <path d="M4 8l3 3 5-5" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="#waitlist"
              className="block w-full py-3 text-center rounded-xl bg-[var(--color-brand)] text-[var(--color-surface)] font-semibold text-sm hover:bg-[var(--color-brand-dark)] transition-colors no-underline"
            >
              Get early access
            </a>
          </div>
        </div>
      </section>

      {/* CTA - Secure Your Edge */}
      <section id="waitlist" className="max-w-5xl mx-auto px-4 sm:px-6 py-20 border-t border-[var(--color-border)]">
        <div className="text-center">
          <h2 className="text-3xl sm:text-5xl font-black mb-4 uppercase tracking-tight text-[var(--color-text-primary)]">
            SECURE YOUR
            <br />
            <span className="text-[var(--color-brand)]">EDGE</span>.
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-8 text-sm">
            Join the waitlist. First 500 users get Pro free for 3 months.
          </p>
          <div className="flex max-w-md mx-auto gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-brand)] transition-colors placeholder:text-[var(--color-text-muted)]"
            />
            <button className="px-6 py-3 bg-[var(--color-brand)] text-[var(--color-surface)] rounded-xl font-bold text-sm hover:bg-[var(--color-brand-dark)] transition-colors cursor-pointer border-none">
              Join
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <span className="flex items-center gap-2 opacity-40">
            <LogoMark size={24} />
            <span className="text-xl font-black text-[var(--color-text-primary)]">
              <Wordmark />
            </span>
          </span>
          <span className="text-xs text-[var(--color-text-muted)]">
            The behaviour operating system for traders. &copy; 2024
          </span>
        </div>
      </footer>
    </div>
  );
}
