import { Field } from "@/components/ui/common";
import { spacing } from "@/src/theme";
import type { Income, IncomeInput } from "@/types/api";
import {
  displayDateToISO,
  formatAmountInput,
  formatDate,
  maskDateInput,
  parseAmount,
  toISODate,
} from "@/utils/format";
import { StyleSheet, View } from "react-native";

export type IncomeDraft = {
  description: string;
  amount: string;
  receivedDate: string;
};

export const emptyIncomeDraft = (): IncomeDraft => ({
  description: "",
  amount: "",
  receivedDate: formatDate(toISODate(new Date())),
});

export const incomeToDraft = (income: Income): IncomeDraft => ({
  description: income.description ?? "",
  amount: formatAmountInput(Number(income.amount)),
  receivedDate: formatDate(income.receivedDate),
});

export function draftToIncomeInput(draft: IncomeDraft): { input?: IncomeInput; error?: string } {
  const amount = parseAmount(draft.amount);
  const receivedDate = displayDateToISO(draft.receivedDate);

  if (!draft.description.trim()) return { error: "Informe uma descrição." };
  if (!amount || amount <= 0) return { error: "Informe um valor maior que zero." };
  if (!receivedDate) return { error: "Data de recebimento inválida. Use DD/MM/AAAA." };

  return { input: { description: draft.description.trim(), amount, receivedDate } };
}

type Props = {
  draft: IncomeDraft;
  onChange: (draft: IncomeDraft) => void;
};

export default function IncomeForm({ draft, onChange }: Props) {
  const update = <K extends keyof IncomeDraft>(field: K, value: IncomeDraft[K]) =>
    onChange({ ...draft, [field]: value });

  return (
    <View>
      <Field
        label="Descrição"
        placeholder="Ex.: Salário"
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
          label="Recebido em"
          placeholder="DD/MM/AAAA"
          keyboardType="number-pad"
          value={draft.receivedDate}
          onChangeText={(text) => update("receivedDate", maskDateInput(text))}
          style={styles.half}
        />
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
});
