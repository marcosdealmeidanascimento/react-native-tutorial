import { useRevealFocusedInput } from "@/components/ui/KeyboardAwareScrollView";
import { colors, radius, shadow, spacing, fonts } from "@/src/theme";
import { Feather } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { TextInput, type TextInputProps } from "react-native-paper";

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ComponentProps<typeof Feather>["name"];
  title: string;
  description?: string;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Feather name={icon} size={26} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {description && <Text style={styles.emptyDescription}>{description}</Text>}
    </View>
  );
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <View style={styles.formError}>
      <Feather name="alert-circle" size={16} color={colors.danger} />
      <Text style={styles.formErrorText}>{message}</Text>
    </View>
  );
}

/**
 * Outlined text input with the app's styling. Inside a KeyboardAwareScrollView it scrolls itself
 * above the keyboard when focused.
 */
export function Field(props: TextInputProps) {
  const revealFocusedInput = useRevealFocusedInput();
  return (
    <TextInput
      mode="outlined"
      outlineStyle={{ borderRadius: 14 }}
      outlineColor={colors.border}
      {...props}
      onFocus={(e) => {
        props.onFocus?.(e);
        revealFocusedInput?.();
      }}
      style={[{ backgroundColor: colors.surface, marginBottom: spacing.md - 4 }, props.style]}
    />
  );
}
Field.Icon = TextInput.Icon;

export { confirm } from "@/components/ui/ConfirmDialog";

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    ...shadow.card,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    marginBottom: spacing.sm + 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  sectionAction: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.primary,
  },
  empty: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  emptyDescription: {
    marginTop: 6,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.muted,
    textAlign: "center",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md - 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.muted,
  },
  detailValue: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.text,
    flexShrink: 1,
    textAlign: "right",
    marginLeft: spacing.md,
  },
  formError: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.dangerSoft,
    borderRadius: 12,
    padding: spacing.sm + 4,
    marginBottom: spacing.md - 4,
  },
  formErrorText: {
    flex: 1,
    color: colors.danger,
    fontFamily: fonts.semibold,
  },
});
