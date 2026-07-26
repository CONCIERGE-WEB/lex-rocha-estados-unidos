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
        nav: "#040A1F",
        trust: "#1E40AF",
        trustDeep: "#1E3A8A",
        action: "#1D4ED8",
        "action-hover": "#1E3A8A",
        verify: "#047857",
        cite: "#DBEAFE",
        mist: "#475569",
        /** Secondary body text on light surfaces — WCAG AA on white */
        muted: "#334155",
        onDark: "#F8FAFC",
        onDarkMuted: "#CBD5E1",
        // Compatibility aliases for organisms / shadcn leftovers
        background: "#FFFFFF",
        foreground: "#020617",
        primary: {
          DEFAULT: "#020617",
          foreground: "#F8FAFC",
        },
        secondary: {
          DEFAULT: "#DBEAFE",
          foreground: "#020617",
        },
        accent: {
          DEFAULT: "#1D4ED8",
          foreground: "#F8FAFC",
          bright: "#3B82F6",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        border: "#E2E8F0",
        input: "#E2E8F0",
        ring: "#1E40AF",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#020617",
        },
        /** Light surface — never use for text */
        "muted-surface": "#F1F5F9",
        "muted-foreground": "#334155",
      },
      fontFamily: {
        display: ["var(--font-libre-baskerville)", "Georgia", "serif"],
        body: ["var(--font-source-sans)", "system-ui", "sans-serif"],
        sans: ["var(--font-source-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-libre-baskerville)", "Georgia", "serif"],
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
        "fade-up-soft": "fadeUpSoft 0.65s ease-out both",
        "menu-in": "menuIn 0.28s ease-out both",
        "float-pulse": "floatPulse 2.4s ease-in-out infinite",
        "hero-zoom": "heroZoom 18s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeUpSoft: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        menuIn: {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        floatPulse: {
          "0%, 100%": { transform: "scale(1)", boxShadow: "0 12px 40px rgba(2, 6, 23, 0.18)" },
          "50%": { transform: "scale(1.04)", boxShadow: "0 16px 48px rgba(37, 211, 102, 0.35)" },
        },
        heroZoom: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.06)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
