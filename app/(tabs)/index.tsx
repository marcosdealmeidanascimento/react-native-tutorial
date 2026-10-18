import IncomeSheet from "@/components/IncomeSheet";
import PaymentSheet from "@/components/PaymentSheet";
import { IncomeItem, PaymentItem } from "@/components/TransactionItems";
import { Card, EmptyState, SectionHeader } from "@/components/ui/common";
import MonthSelector from "@/components/ui/MonthSelector";
import Screen, { TAB_BAR_SPACE } from "@/components/ui/Screen";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/config/auth";
import { incomesApi, paymentsApi, summaryApi } from "@/services/finance";
import { colors, radius, shadow, spacing } from "@/src/theme";
import type { Income, Payment, Summary } from "@/types/api";
import { formatCurrency, initials, monthRange } from "@/utils/format";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState, type ComponentProps } from "react";
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

type SheetState = { type: "payment" | "income"; id: number | null } | null;

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default function HomeScreen() {
  const { user, profilePicture } = useAuth();
  const toast = useToast();
  const [month, setMonth] = useState(() => new Date());
  const [summary, setSummary] = useState<Summary | null>(null);
  const [upcoming, setUpcoming] = useState<Payment[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheet, setSheet] = useState<SheetState>(null);

  const load = useCallback(async () => {
    const { startDate, endDate } = monthRange(month);
    try {
      const [summaryData, pendingPage, incomesPage] = await Promise.all([
        summaryApi.get(startDate, endDate),
        paymentsApi.list({ status: "PENDING", sort: "dueDate,asc", size: 4 }),
        incomesApi.list({ startDate, endDate, size: 4 }),
      ]);
      setSummary(summaryData);
      setUpcoming(pendingPage.content);
      setIncomes(incomesPage.content);
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Não foi possível carregar o resumo.");
    }
  }, [month]);

  // Reload whenever the tab gains focus so changes made on other tabs show up.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const income = Number(summary?.totalIncome ?? 0);
  const expenses = Number(summary?.totalPayments ?? 0);
  const balance = Number(summary?.balance ?? 0);
  const spentRatio = income > 0 ? Math.min(expenses / income, 1) : expenses > 0 ? 1 : 0;
  const firstName = user?.name?.split(" ")[0] ?? "";

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.name} numberOfLines={1}>
              {firstName} 👋
            </Text>
          </View>
          <Pressable onPress={() => router.push("/profile")} style={styles.avatar}>
            {profilePicture ? (
              <Image source={{ uri: profilePicture }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initials(user?.name)}</Text>
            )}
          </Pressable>
        </View>

        <MonthSelector month={month} onChange={setMonth} />

        <LinearGradient colors={colors.heroGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroGlow} />
          <Text style={styles.heroLabel}>Saldo do mês</Text>
          <Text style={styles.heroBalance} adjustsFontSizeToFit numberOfLines={1}>
            {formatCurrency(balance)}
          </Text>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${spentRatio * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {income > 0
              ? `${Math.round((expenses / income) * 100)}% das receitas comprometidas`
              : "Nenhuma receita registrada neste mês"}
          </Text>

          <View style={styles.heroStats}>
            <HeroStat icon="arrow-down-left" label="Receitas" value={income} color="#6EE7B7" />
            <View style={styles.heroDivider} />
            <HeroStat icon="arrow-up-right" label="Despesas" value={expenses} color="#FCA5B4" />
          </View>
        </LinearGradient>

        {error && (
          <View style={styles.error}>
            <Feather name="wifi-off" size={16} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <QuickAction
            icon="plus"
            label="Nova receita"
            color={colors.success}
            background={colors.successSoft}
            onPress={() => setSheet({ type: "income", id: null })}
          />
          <QuickAction
            icon="minus"
            label="Novo pagamento"
            color={colors.primary}
            background={colors.primarySoft}
            onPress={() => setSheet({ type: "payment", id: null })}
          />
        </View>

        <SectionHeader title="Próximos vencimentos" action="Ver todos" onAction={() => router.push("/payments")} />
        <Card>
          {upcoming.length === 0 ? (
            <EmptyState icon="check-circle" title="Tudo em dia" description="Nenhum pagamento pendente." />
          ) : (
            upcoming.map((payment) => (
              <PaymentItem key={payment.id} payment={payment} onPress={() => setSheet({ type: "payment", id: payment.id })} />
            ))
          )}
        </Card>

        <SectionHeader title="Receitas do mês" action="Ver todas" onAction={() => router.push("/incomes")} />
        <Card>
          {incomes.length === 0 ? (
            <EmptyState icon="trending-up" title="Sem receitas" description="Adicione sua primeira receita deste mês." />
          ) : (
            incomes.map((item) => (
              <IncomeItem key={item.id} income={item} onPress={() => setSheet({ type: "income", id: item.id })} />
            ))
          )}
        </Card>
      </ScrollView>

      <PaymentSheet
        visible={sheet?.type === "payment"}
        paymentId={sheet?.type === "payment" ? sheet.id : null}
        onClose={() => setSheet(null)}
        onChanged={(message) => {
          toast.show(message);
          load();
        }}
      />
      <IncomeSheet
        visible={sheet?.type === "income"}
        incomeId={sheet?.type === "income" ? sheet.id : null}
        onClose={() => setSheet(null)}
        onChanged={(message) => {
          toast.show(message);
          load();
        }}
      />
    </Screen>
  );
}

function HeroStat({
  icon,
  label,
  value,
  color,
}: {
  icon: ComponentProps<typeof Feather>["name"];
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.heroStat}>
      <View style={styles.heroStatIcon}>
        <Feather name={icon} size={16} color={color} />
      </View>
      <View style={{ flexShrink: 1 }}>
        <Text style={styles.heroStatLabel}>{label}</Text>
        <Text style={styles.heroStatValue} numberOfLines={1} adjustsFontSizeToFit>
          {formatCurrency(value)}
        </Text>
      </View>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  color,
  background,
  onPress,
}: {
  icon: ComponentProps<typeof Feather>["name"];
  label: string;
  color: string;
  background: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.action, pressed && { opacity: 0.85 }]}>
      <View style={[styles.actionIcon, { backgroundColor: background }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.md,
    paddingBottom: TAB_BAR_SPACE,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg - 4,
  },
  greeting: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  name: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.5,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.surface,
    ...shadow.card,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 16,
  },
  hero: {
    marginTop: spacing.md,
    borderRadius: radius.xl,
    padding: spacing.lg,
    overflow: "hidden",
    ...shadow.floating,
  },
  heroGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: -90,
    right: -60,
  },
  heroLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    fontWeight: "600",
  },
  heroBalance: {
    marginTop: 6,
    color: "#fff",
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: -1,
  },
  progressTrack: {
    marginTop: spacing.md,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.18)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  progressText: {
    marginTop: spacing.sm,
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
  },
  heroStats: {
    marginTop: spacing.lg - 4,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: radius.md + 2,
    padding: spacing.sm + 6,
  },
  heroDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: "rgba(255,255,255,0.18)",
    marginHorizontal: spacing.sm + 4,
  },
  heroStat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
  },
  heroStatIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroStatLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },
  heroStatValue: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  error: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.dangerSoft,
    padding: spacing.sm + 4,
    borderRadius: radius.md,
  },
  errorText: {
    flex: 1,
    color: colors.danger,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm + 4,
    marginTop: spacing.md,
  },
  action: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
    backgroundColor: colors.surface,
    borderRadius: radius.lg - 4,
    padding: spacing.sm + 4,
    ...shadow.card,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
});
