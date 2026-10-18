import { paymentMethodIcon } from "@/components/PaymentForm";
import StatusBadge, { paymentTone } from "@/components/ui/StatusBadge";
import TransactionRow from "@/components/ui/TransactionRow";
import { colors } from "@/src/theme";
import type { Income, Payment } from "@/types/api";
import { formatShortDate } from "@/utils/format";

export function PaymentItem({ payment, onPress }: { payment: Payment; onPress?: () => void }) {
  const tone = paymentTone(payment);
  return (
    <TransactionRow
      icon={paymentMethodIcon(payment.method)}
      iconColor={tone.color}
      iconBackground={tone.background}
      title={payment.description}
      subtitle={`${payment.status === "PAID" ? "Pago" : "Vence"} ${formatShortDate(payment.dueDate)} · ${payment.method}${payment.recurring ? " · Mensal" : ""}`}
      amount={Number(payment.amount)}
      kind="expense"
      muted={payment.status === "CANCELLED"}
      badge={<StatusBadge payment={payment} />}
      onPress={onPress}
    />
  );
}

export function IncomeItem({ income, onPress }: { income: Income; onPress?: () => void }) {
  return (
    <TransactionRow
      icon="arrow-down-left"
      iconColor={colors.success}
      iconBackground={colors.successSoft}
      title={income.description}
      subtitle={`Recebido ${formatShortDate(income.receivedDate)}`}
      amount={Number(income.amount)}
      kind="income"
      onPress={onPress}
    />
  );
}
