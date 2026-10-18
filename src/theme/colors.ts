export const colors = {
  primary: "#5B4CF5",
  primaryDark: "#3B2FC9",
  primarySoft: "#EEECFF",
  secondary: "#1E1B4B",

  success: "#12B981",
  successSoft: "#E3F8F0",
  danger: "#EF4565",
  dangerSoft: "#FDE9ED",
  warning: "#F5A524",
  warningSoft: "#FEF4E2",
  neutralSoft: "#EEF0F4",

  background: "#F4F5FA",
  surface: "#FFFFFF",
  border: "#E7E9F0",

  text: "#0F1222",
  textSecondary: "#5B6178",
  muted: "#9AA0B4",

  heroGradient: ["#1E1B4B", "#3B2FC9", "#7C5CFF"] as const,
};

export type Colors = typeof colors;
