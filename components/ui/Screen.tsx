import { colors, spacing, fonts } from "@/src/theme";
import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Space reserved at the bottom of scrollable content so the floating tab bar never covers it. */
export const TAB_BAR_SPACE = 120;

type ScreenProps = {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
};

export default function Screen({ title, subtitle, right, children }: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      {title && (
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            <Text style={styles.title}>{title}</Text>
          </View>
          {right}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    fontFamily: fonts.semibold,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  title: {
    fontSize: 30,
    fontFamily: fonts.bold,
    color: colors.text,
    letterSpacing: -0.5,
  },
});
