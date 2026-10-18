import { Field } from "@/components/ui/common";
import { colors, radius, spacing } from "@/src/theme";
import type { Payment, PaymentInput } from "@/types/api";
import {
  displayDateToISO,
  formatAmountInput,
  formatDate,
  maskDateInput,
  parseAmount,
  toISODate,
} from "@/utils/format";
import { Feather } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Switch } from "react-native-paper";

type FeatherIcon = ComponentProps<typeof Feather>["name"];

export const PAYMENT_METHODS: { value: string; icon: FeatherIcon }[] = [
  { value: "PIX", icon: "zap" },
  { value: "Cartão de crédito", icon: "credit-card" },
  { value: "Débito", icon: "smartphone" },
  { value: "Boleto", icon: "file-text" },
  { value: "Transferência", icon: "repeat" },
  { value: "Dinheiro", icon: "dollar-sign" },
];

export function paymentMethodIcon(method?: string | null): FeatherIcon {
  return PAYMENT_METHODS.find((m) => m.value.toLowerCase() === method?.toLowerCase())?.icon ?? "credit-card";
}

export type PaymentDraft = {
  description: string;
  amount: string;
  dueDate: string;
  recurring: boolean;
  method: string;
};

export const emptyPaymentDraft = (): PaymentDraft => ({
  description: "",
  amount: "",
  dueDate: formatDate(toISODate(new Date())),
  recurring: false,
  method: "PIX",
});

export const paymentToDraft = (payment: Payment): PaymentDraft => ({
  description: payment.description ?? "",
  amount: formatAmountInput(Number(payment.amount)),
  dueDate: formatDate(payment.dueDate),
  recurring: !!payment.recurring,
  method: payment.method ?? "PIX",
});

export function draftToPaymentInput(draft: PaymentDraft): { input?: PaymentInput; error?: string } {
  const amount = parseAmount(draft.amount);
  const dueDate = displayDateToISO(draft.dueDate);

  if (!draft.description.trim()) return { error: "Informe uma descrição." };
  if (!amount || amount <= 0) return { error: "Informe um valor maior que zero." };
  if (!dueDate) return { error: "Data de vencimento inválida. Use DD/MM/AAAA." };

  return {
    input: {
      description: draft.description.trim(),
      amount,
      dueDate,
      recurring: draft.recurring,
      method: draft.method,
    },
  };
}

type Props = {
  draft: PaymentDraft;
  onChange: (draft: PaymentDraft) => void;
};

export default function PaymentForm({ draft, onChange }: Props) {
  const update = <K extends keyof PaymentDraft>(field: K, value: PaymentDraft[K]) =>
    onChange({ ...draft, [field]: value });

  return (
    <View>
      <Field
        label="Descrição"
        placeholder="Ex.: Aluguel"
        value={draft.description}
        onChangeText={(text) => update("description", text)}
        left={<Field.Icon icon="text" />}
      />
      <View style={styles.row}>
        <Field
          label="Valor (R$)"
          placeholder="0,00"
          keyboardType="decimal-pad"
          value={draft.amount}
          onChangeText={(text) => update("amount", text.replace(/[^\d.,]/g, ""))}
          style={styles.half}
        />
        <Field
          label="Vencimento"
          placeholder="DD/MM/AAAA"
          keyboardType="number-pad"
          value={draft.dueDate}
          onChangeText={(text) => update("dueDate", maskDateInput(text))}
          style={styles.half}
        />
      </View>

      <Text style={styles.label}>Forma de pagamento</Text>
      <View style={styles.methods}>
        {PAYMENT_METHODS.map((method) => {
          const selected = method.value === draft.method;
          return (
            <Pressable
              key={method.value}
              onPress={() => update("method", method.value)}
              style={[styles.method, selected && styles.methodSelected]}
            >
              <Feather name={method.icon} size={14} color={selected ? "#fff" : colors.primary} />
              <Text style={[styles.methodText, selected && { color: "#fff" }]}>{method.value}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.switchTitle}>Pagamento recorrente</Text>
          <Text style={styles.switchSubtitle}>Repete todo mês</Text>
        </View>
        <Switch value={draft.recurring} onValueChange={(value) => update("recurring", value)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm + 4,
  },
  half: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.sm + 2,
  },
  methods: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  method: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  methodSelected: {
    backgroundColor: colors.primary,
  },
  methodText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutralSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  switchTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  switchSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: colors.muted,
  },
});
