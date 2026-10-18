import IncomeForm, {
  draftToIncomeInput,
  emptyIncomeDraft,
  incomeToDraft,
  type IncomeDraft,
} from "@/components/IncomeForm";
import BottomSheet, { SheetCloseButton } from "@/components/ui/BottomSheet";
import { confirm, DetailRow, FormError } from "@/components/ui/common";
import { incomesApi } from "@/services/finance";
import { colors, radius, spacing } from "@/src/theme";
import type { Income } from "@/types/api";
import { formatCurrency, formatDate } from "@/utils/format";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

type Props = {
  visible: boolean;
  /** null opens the sheet in "create" mode. */
  incomeId: number | null;
  onClose: () => void;
  onChanged: (message: string) => void;
};

type Mode = "view" | "edit" | "create";

export default function IncomeSheet({ visible, incomeId, onClose, onChanged }: Props) {
  const [income, setIncome] = useState<Income | null>(null);
  const [mode, setMode] = useState<Mode>("view");
  const [draft, setDraft] = useState<IncomeDraft>(emptyIncomeDraft);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setError(null);
    setIncome(null);

    if (incomeId == null) {
      setMode("create");
      setDraft(emptyIncomeDraft());
      return;
    }

    setMode("view");
    incomesApi
      .get(incomeId)
      .then(setIncome)
      .catch(() => setError("Não foi possível carregar a receita."));
  }, [visible, incomeId]);

  const run = async (action: () => Promise<unknown>, message: string) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      onChanged(message);
      onClose();
    } catch (e: any) {
      setError(e?.message || "Algo deu errado. Tente novamente.");
    } finally {
      setBusy(false);
    }
  };

  const handleSave = () => {
    const { input, error: validationError } = draftToIncomeInput(draft);
    if (!input) return setError(validationError ?? null);

    if (mode === "create") {
      run(() => incomesApi.create(input), "Receita adicionada");
    } else if (income) {
      run(() => incomesApi.update(income.id, input), "Receita atualizada");
    }
  };

  const handleDelete = async () => {
    if (!income) return;
    const ok = await confirm("Excluir receita", `Deseja excluir "${income.description}"?`, "Excluir");
    if (ok) run(() => incomesApi.remove(income.id), "Receita excluída");
  };

  if (mode === "create" || mode === "edit") {
    return (
      <BottomSheet visible={visible} title={mode === "create" ? "Nova receita" : "Editar receita"} onClose={onClose}>
        <IncomeForm draft={draft} onChange={setDraft} />
        <View style={{ height: spacing.md }} />
        <FormError message={error} />
        <Button mode="contained" loading={busy} disabled={busy} onPress={handleSave} style={styles.button} contentStyle={styles.buttonContent}>
          {mode === "create" ? "Adicionar receita" : "Salvar alterações"}
        </Button>
        {mode === "edit" && (
          <Button onPress={() => setMode("view")} style={styles.button} contentStyle={styles.buttonContent}>
            Voltar
          </Button>
        )}
      </BottomSheet>
    );
  }

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      header={
        income ? (
          <LinearGradient colors={["#0B8A61", "#12B981"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <View style={styles.heroTop}>
              <View style={styles.heroIcon}>
                <Feather name="arrow-down-left" size={18} color="#fff" />
              </View>
              <SheetCloseButton onPress={onClose} light />
            </View>
            <Text style={styles.heroLabel}>{income.description}</Text>
            <Text style={styles.heroAmount}>{formatCurrency(income.amount)}</Text>
          </LinearGradient>
        ) : (
          <View style={styles.loadingHeader}>
            <SheetCloseButton onPress={onClose} />
          </View>
        )
      }
    >
      {!income ? (
        error ? <FormError message={error} /> : <ActivityIndicator style={{ marginVertical: spacing.xl }} color={colors.primary} />
      ) : (
        <>
          <DetailRow label="Recebido em" value={formatDate(income.receivedDate)} />
          <View style={{ height: spacing.lg }} />
          <FormError message={error} />
          <Button
            mode="contained-tonal"
            icon="pencil"
            disabled={busy}
            onPress={() => {
              setDraft(incomeToDraft(income));
              setError(null);
              setMode("edit");
            }}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Editar
          </Button>
          <Button
            mode="outlined"
            icon="trash-can-outline"
            textColor={colors.danger}
            loading={busy}
            disabled={busy}
            onPress={handleDelete}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Excluir
          </Button>
        </>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: spacing.lg,
    paddingBottom: spacing.lg + 4,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroLabel: {
    marginTop: spacing.lg,
    color: "rgba(255,255,255,0.8)",
    fontSize: 15,
    fontWeight: "600",
  },
  heroAmount: {
    marginTop: 4,
    color: "#fff",
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: -1,
  },
  loadingHeader: {
    alignItems: "flex-end",
    padding: spacing.md,
  },
  button: {
    marginTop: spacing.sm + 2,
    borderRadius: radius.md,
  },
  buttonContent: {
    height: 52,
  },
});
