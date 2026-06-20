/**
 * Vector design tokens — the single source of truth for the look.
 *
 * Direction: "field instrument on warm paper". A hackathon toolkit you hold in
 * one hand while standing in a venue. The screen's job is to tell you what is
 * happening now, what's next, and who to meet — so the system reads like a
 * scheduling instrument, not an editorial page.
 *
 * Tune the whole product from here. `app/globals.css` mirrors these values as
 * CSS custom properties; the primitives consume the variables. Keep both in
 * sync (values here are the canonical source).
 */

/* ------------------------------------------------------------------ */
/*  Colors                                                             */
/* ------------------------------------------------------------------ */
export const colors = {
  /** Near-black plum. Structural text and high-emphasis surfaces. */
  ink: '#16131F',
  /** Warm paper. The working surface everything sits on. */
  surface: '#F6F3EC',
  /** Raised panel (cards, modals) above the paper. */
  panel: '#FFFFFF',
  /** Hairline on paper. Borders, dividers. */
  line: '#E4DED2',

  /** Brand + structure. Reserved for it; never decorative. */
  violet: '#5B3DF5',
  violetSoft: '#EDE9FF',

  /** "Happening now" signal. The one place motion is allowed. */
  live: '#FF5A36',
  liveSoft: '#FFE7E0',

  /** Added / confirmed / go. */
  go: '#0E9F6E',
  goSoft: '#DEF5EC',

  /** Secondary text on paper. */
  muted: '#6B6577',
  /** Tertiary text and inactive icons. */
  mutedSoft: '#9A93A6',

  /** Always-on-dark text (on ink, violet, live, go fills). */
  onDark: '#FFFFFF',
} as const;

/** Avatar fill rotation — deterministic per name. */
export const avatarPalette = [
  colors.violet,
  colors.live,
  colors.go,
  '#B26B00',
  '#0072B5',
] as const;

/* ------------------------------------------------------------------ */
/*  Typography                                                         */
/* ------------------------------------------------------------------ */
/**
 * Three roles, used with intent:
 *  - display: Space Grotesk. Geometric, slightly mechanical. Titles only.
 *  - body:    Inter. Quiet, legible. Prose and labels.
 *  - mono:    JetBrains Mono. Data, times, kickers, tags. The instrument voice.
 *
 * Values reference the CSS variables wired by next/font in app/layout.tsx.
 */
export const fonts = {
  display: "var(--font-display), 'Space Grotesk', system-ui, sans-serif",
  body: "var(--font-body), 'Inter', system-ui, sans-serif",
  mono: "var(--font-mono), 'JetBrains Mono', ui-monospace, monospace",
} as const;

/** Mobile-first type scale (px). Tight at the top, calm in the body. */
export const fontSize = {
  display: 30, // page heroes
  title: 24, // SectionTitle h2
  heading: 16, // card titles
  body: 14, // prose
  meta: 12.5, // secondary meta
  label: 11, // mono kickers / tags / data labels
  micro: 10, // type stamps, fine print
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const lineHeight = {
  tight: 1.05, // display
  snug: 1.25, // titles / card headings
  normal: 1.5, // body prose
} as const;

export const letterSpacing = {
  display: '-0.02em', // big type pulls together
  label: '0.08em', // mono kickers spread out
  tag: '0.02em', // tag pills, lightly
} as const;

/* ------------------------------------------------------------------ */
/*  Radii — consistent, never mixed at random                         */
/* ------------------------------------------------------------------ */
export const radii = {
  sm: 8, // small chips, inner controls
  md: 10, // buttons, icon buttons, inputs
  lg: 12, // avatars, secondary panels
  xl: 16, // cards
  '2xl': 20, // modals
  pill: 999, // tags, toggles
} as const;

/* ------------------------------------------------------------------ */
/*  Spacing — 4px rhythm                                               */
/* ------------------------------------------------------------------ */
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

/* ------------------------------------------------------------------ */
/*  Shadows — paper barely floats. Restraint is the point.            */
/* ------------------------------------------------------------------ */
export const shadows = {
  /** Hairline lift for cards on paper. */
  card: '0 1px 0 rgba(22, 19, 31, 0.02)',
  /** Pressed/active toggle. */
  inset: '0 1px 2px rgba(0, 0, 0, 0.08)',
  /** Modal floats well clear of the page. */
  modal: '0 24px 60px -16px rgba(22, 19, 31, 0.35)',
  /** Focus ring (violet, low alpha) — applied via outline elsewhere. */
  focus: '0 0 0 3px rgba(91, 61, 245, 0.28)',
} as const;

/* ------------------------------------------------------------------ */
/*  Motion                                                             */
/* ------------------------------------------------------------------ */
export const motion = {
  fast: '120ms',
  base: '180ms',
  ease: 'cubic-bezier(0.2, 0, 0, 1)',
} as const;

/** The whole token bag, for ergonomic single-import consumption. */
export const tokens = {
  colors,
  avatarPalette,
  fonts,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  radii,
  spacing,
  shadows,
  motion,
} as const;

export type Tokens = typeof tokens;
export type ColorToken = keyof typeof colors;

export default tokens;
