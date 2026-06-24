import type { Config } from "tailwindcss";

/**
 * U.S. neuroergonomic design tokens
 * High contrast (WCAG AA+), calm palette, institutional trust
 * See docs/PROMPT_MARCA_NEURO_US.md
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#020617",
        paper: "#FFFFFF",
        folio: "#FFFFFF",
        trust: "#1E40AF",
        trustDeep: "#1E3A8A",
        action: "#1D4ED8",
        "action-hover": "#1E3AFF",
        verify: "#047857",
        cite: "#DBEAFE",
        /** Secondary body text — dark enough for AA on white (#334155 ≈ 7:1) */
        mist: "#334155",
        /** Strong secondary labels */
        muted: "#1E293B",
        /** On dark backgrounds */
        onDark: "#F8FAFC",
        onDarkMuted: "#E2E8F0",
      },
      fontFamily: {
        display: ["var(--font-libre-baskerville)", "Georgia", "serif"],
        body: ["var(--font-source-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        body: ["1.0625rem", { lineHeight: "1.7" }],
        lead: ["1.25rem", { lineHeight: "1.65", fontWeight: "500" }],
      },
      boxShadow: {
        folio: "0 1px 0 rgba(2, 6, 23, 0.08), 0 8px 24px rgba(2, 6, 23, 0.08)",
        lift: "0 12px 40px rgba(2, 6, 23, 0.12)",
        card: "0 4px 24px rgba(2, 6, 23, 0.1)",
        "card-hover": "0 16px 48px rgba(2, 6, 23, 0.14)",
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, #020617 0%, #1E3A8A 48%, #1D4ED8 100%)",
        "mesh-light":
          "radial-gradient(at 80% 20%, rgba(29, 78, 216, 0.06) 0%, transparent 50%), radial-gradient(at 20% 80%, rgba(4, 120, 87, 0.05) 0%, transparent 50%)",
      },
      animation: {
        "fade-up": "fadeUp 0.7s ease-out both",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
