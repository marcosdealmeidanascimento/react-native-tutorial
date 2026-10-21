import { configureFonts, MD3DarkTheme, type MD3Theme } from "react-native-paper";
import { colors } from "./colors";

export { colors };

/**
 * Plus Jakarta Sans, loaded in app/_layout.tsx. Custom fonts ignore `fontWeight` on Android,
 * so each weight is its own family: use these instead of fontWeight.
 */
export const fonts = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const shadow = {
  // Shadows don't read on a dark background, so cards are outlined instead.
  card: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  floating: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.55,
    shadowRadius: 28,
    elevation: 12,
  },
};

export const paperTheme: MD3Theme = {
  ...MD3DarkTheme,
  roundness: 4,
  fonts: configureFonts({ config: { fontFamily: fonts.semibold } }),
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    onPrimary: colors.onPrimary,
    primaryContainer: colors.primarySoft,
    onPrimaryContainer: colors.primary,
    secondary: colors.textSecondary,
    secondaryContainer: colors.neutralSoft,
    onSecondaryContainer: colors.text,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.neutralSoft,
    onSurface: colors.text,
    onSurfaceVariant: colors.textSecondary,
    outline: colors.border,
    error: colors.danger,
    inverseSurface: colors.text,
    inverseOnSurface: colors.onPrimary,
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level1: colors.surface,
      level2: colors.surface,
      level3: colors.surface,
    },
  },
};
