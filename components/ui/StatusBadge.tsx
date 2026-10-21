import { colors, radius, fonts } from "@/src/theme";
import type { Payment, PaymentStatus } from "@/types/api";
import { isOverdue } from "@/utils/format";
import { StyleSheet, Text, View } from "react-native";

type Tone = { label: string; color: string; background: string };

export const STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  FAILED: "Falhou",
  CANCELLED: "Cancelado",
};

export function paymentTone(payment: Pick<Payment, "status" | "dueDate">): Tone {
  switch (payment.status) {
    case "PAID":
      return { label: STATUS_LABELS.PAID, color: colors.success, background: colors.successSoft };
    case "FAILED":
      return { label: STATUS_LABELS.FAILED, color: colors.danger, background: colors.dangerSoft };
    case "CANCELLED":
      return { label: STATUS_LABELS.CANCELLED, color: colors.textSecondary, background: colors.neutralSoft };
    default:
      return isOverdue(payment.dueDate)
        ? { label: "Vencido", color: colors.danger, background: colors.dangerSoft }
        : { label: STATUS_LABELS.PENDING, color: colors.info, background: colors.infoSoft };
  }
}

export default function StatusBadge({ payment, light }: { payment: Pick<Payment, "status" | "dueDate">; light?: boolean }) {
  const tone = paymentTone(payment);
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: light ? "rgba(255,255,255,0.2)" : tone.background },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: light ? "#fff" : tone.color }]} />
      <Text style={[styles.text, { color: light ? "#fff" : tone.color }]}>{tone.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 12,
    fontFamily: fonts.semibold,
  },
});
