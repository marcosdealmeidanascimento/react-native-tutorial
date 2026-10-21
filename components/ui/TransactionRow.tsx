import { colors, radius, spacing, fonts } from "@/src/theme";
import { formatCurrency } from "@/utils/format";
import { Feather } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  icon: ComponentProps<typeof Feather>["name"];
  iconColor: string;
  iconBackground: string;
  title: string;
  subtitle: string;
  amount: number;
  kind: "income" | "expense";
  badge?: ReactNode;
  onPress?: () => void;
  /** Dims the amount (e.g. cancelled payments). */
  muted?: boolean;
};

export default function TransactionRow({
  icon,
  iconColor,
  iconBackground,
  title,
  subtitle,
  amount,
  kind,
  badge,
  onPress,
  muted,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.neutralSoft }]}
    >
      <View style={[styles.icon, { backgroundColor: iconBackground }]}>
        <Feather name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.right}>
        <Text
          style={[
            styles.amount,
            { color: muted ? colors.muted : kind === "income" ? colors.success : colors.text },
            muted && { textDecorationLine: "line-through" },
          ]}
        >
          {kind === "income" ? "+ " : "- "}
          {formatCurrency(amount)}
        </Text>
        {badge}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md - 4,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.sm + 4,
    borderRadius: radius.md,
  },
  icon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.muted,
  },
  right: {
    alignItems: "flex-end",
    gap: 6,
  },
  amount: {
    fontSize: 15,
    fontFamily: fonts.bold,
  },
});
