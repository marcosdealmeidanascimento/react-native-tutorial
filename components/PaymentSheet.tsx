import PaymentForm, {
  draftToPaymentInput,
  emptyPaymentDraft,
  paymentToDraft,
  type PaymentDraft,
} from "@/components/PaymentForm";
import BottomSheet, { SheetCloseButton } from "@/components/ui/BottomSheet";
import { confirm, DetailRow, FormError } from "@/components/ui/common";
import StatusBadge from "@/components/ui/StatusBadge";
import { paymentsApi } from "@/services/finance";
import { colors, radius, spacing } from "@/src/theme";
import type { Payment } from "@/types/api";
import { formatCurrency, formatDate, isOverdue } from "@/utils/format";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

type Props = {
  visible: boolean;
  /** null opens the sheet in "create" mode. */
  paymentId: number | null;
  onClose: () => void;
  /** Called after any successful mutation with a message to show the user. */
  onChanged: (message: string) => void;
};

type Mode = "view" | "edit" | "create";

function headerGradient(payment: Payment) {
  if (payment.status === "PAID") return ["#0B8A61", "#12B981"] as const;
  if (payment.status === "CANCELLED" || payment.status === "FAILED") return ["#3F4459", "#7A8099"] as const;
  if (isOverdue(payment.dueDate)) return ["#A51D45", "#EF4565"] as const;
  return colors.heroGradient;
}

export default function PaymentSheet({ visible, paymentId, onClose, onChanged }: Props) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [mode, setMode] = useState<Mode>("view");
  const [draft, setDraft] = useState<PaymentDraft>(emptyPaymentDraft);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setError(null);
    setPayment(null);

    if (paymentId == null) {
      setMode("create");
      setDraft(emptyPaymentDraft());
      return;
    }

    setMode("view");
    paymentsApi
      .get(paymentId)
      .then(setPayment)
      .catch(() => setError("Não foi possível carregar o pagamento."));
  }, [visible, paymentId]);

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
    const { input, error: validationError } = draftToPaymentInput(draft);
    if (!input) return setError(validationError ?? null);

    if (mode === "create") {
      run(() => paymentsApi.create(input), "Pagamento criado");
    } else if (payment) {
      run(() => paymentsApi.update(payment.id, input), "Pagamento atualizado");
    }
  };

  const handleDelete = async () => {
    if (!payment) return;
    const ok = await confirm("Excluir pagamento", `Deseja excluir "${payment.description}"?`, "Excluir");
    if (ok) run(() => paymentsApi.remove(payment.id), "Pagamento excluído");
  };

  const handleCancel = async () => {
    if (!payment) return;
    const ok = await confirm("Cancelar pagamento", "O pagamento ficará marcado como cancelado.", "Cancelar pagamento");
    if (ok) run(() => paymentsApi.markCancelled(payment.id), "Pagamento cancelado");
  };

  if (mode === "create" || mode === "edit") {
    return (
      <BottomSheet
        visible={visible}
        title={mode === "create" ? "Novo pagamento" : "Editar pagamento"}
        onClose={onClose}
      >
        <PaymentForm draft={draft} onChange={setDraft} />
        <View style={{ height: spacing.lg }} />
        <FormError message={error} />
        <Button mode="contained" loading={busy} disabled={busy} onPress={handleSave} style={styles.button} contentStyle={styles.buttonContent}>
          {mode === "create" ? "Criar pagamento" : "Salvar alterações"}
        </Button>
        {mode === "edit" && (
          <Button onPress={() => setMode("view")} style={styles.button} contentStyle={styles.buttonContent}>
            Voltar
          </Button>
        )}
      </BottomSheet>
    );
  }

  const pending = payment?.status === "PENDING";

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      header={
        payment ? (
          <LinearGradient colors={headerGradient(payment)} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <View style={styles.heroTop}>
              <StatusBadge payment={payment} light />
              <SheetCloseButton onPress={onClose} light />
            </View>
            <Text style={styles.heroLabel}>{payment.description}</Text>
            <Text style={styles.heroAmount}>{formatCurrency(payment.amount)}</Text>
          </LinearGradient>
        ) : (
          <View style={styles.loadingHeader}>
            <SheetCloseButton onPress={onClose} />
          </View>
        )
      }
    >
      {!payment ? (
        error ? <FormError message={error} /> : <ActivityIndicator style={{ marginVertical: spacing.xl }} color={colors.primary} />
      ) : (
        <>
          <DetailRow label="Vencimento" value={formatDate(payment.dueDate)} />
          <DetailRow label="Forma de pagamento" value={payment.method || "—"} />
          <DetailRow label="Recorrente" value={payment.recurring ? "Sim, mensal" : "Não"} />
          <View style={{ height: spacing.lg }} />
          <FormError message={error} />

          {pending && (
            <>
              <Button
                mode="contained"
                icon="check"
                buttonColor={colors.success}
                loading={busy}
                disabled={busy}
                onPress={() => run(() => paymentsApi.markPaid(payment.id), "Pagamento marcado como pago")}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                Marcar como pago
              </Button>
              <Button
                mode="contained-tonal"
                icon="pencil"
                disabled={busy}
                onPress={() => {
                  setDraft(paymentToDraft(payment));
                  setError(null);
                  setMode("edit");
                }}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                Editar
              </Button>
            </>
          )}
          <View style={styles.dangerRow}>
            {pending && (
              <Button mode="outlined" textColor={colors.danger} disabled={busy} onPress={handleCancel} style={[styles.button, styles.flex]} contentStyle={styles.buttonContent}>
                Cancelar
              </Button>
            )}
            {payment.status !== "PAID" && (
              <Button mode="outlined" icon="trash-can-outline" textColor={colors.danger} disabled={busy} onPress={handleDelete} style={[styles.button, styles.flex]} contentStyle={styles.buttonContent}>
                Excluir
              </Button>
            )}
          </View>
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
  dangerRow: {
    flexDirection: "row",
    gap: spacing.sm + 2,
  },
  flex: {
    flex: 1,
  },
});
