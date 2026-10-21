export const colors = {
  // Green accent: actions, active tab, links, income.
  primary: "#00D973",
  primaryDark: "#00B862",
  primarySoft: "rgba(0, 217, 115, 0.14)",
  /** Text and icons drawn on top of `primary`. */
  onPrimary: "#000831",
  secondary: "#000831",

  success: "#00D973",
  successSoft: "rgba(0, 217, 115, 0.14)",
  danger: "#FF4B26",
  dangerSoft: "rgba(250, 43, 0, 0.20)",
  /** Filled destructive buttons: dark enough for white text. */
  dangerStrong: "#C7330E",
  warning: "#F5A524",
  warningSoft: "rgba(245, 165, 36, 0.16)",
  info: "#9CC3F5",
  infoSoft: "rgba(0, 62, 131, 0.45)",
  neutralSoft: "#111A44",

  background: "#00041C",
  surface: "#0A1238",
  border: "#18214D",

  text: "#EEF1FF",
  textSecondary: "#99A0C4",
  muted: "#8088B0",

  // Deep indigo balance card with a green outline.
  hero: "#000831",
  heroBorder: "rgba(0, 217, 115, 0.40)",
  heroRing: "rgba(0, 217, 115, 0.16)",
  heroTile: "#0B1440",
  onHeroSoft: "#A9B0D6",

  heroGradient: ["#000831", "#0A1650"] as const,
};

export type Colors = typeof colors;
