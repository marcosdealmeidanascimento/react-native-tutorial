import IncomeSheet from "@/components/IncomeSheet";
import PaymentSheet from "@/components/PaymentSheet";
import { IncomeItem, PaymentItem } from "@/components/TransactionItems";
import { Card, EmptyState, SectionHeader } from "@/components/ui/common";
import MonthSelector from "@/components/ui/MonthSelector";
import Screen, { TAB_BAR_SPACE } from "@/components/ui/Screen";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/config/auth";
import { incomesApi, paymentsApi, summaryApi } from "@/services/finance";
import { colors, fonts, radius, spacing } from "@/src/theme";
import type { Income, Payment, Summary } from "@/types/api";
import { formatCurrency, initials, monthRange } from "@/utils/format";
import { Feather } from "@expo/vector-icons";
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
          <Pressable onPress={() => router.push("/profile")} style={styles.avatar} accessibilityLabel="Abrir perfil">
            {profilePicture ? (
              <Image source={{ uri: profilePicture }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initials(user?.name)}</Text>
            )}
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.name} numberOfLines={1}>
              {firstName}
            </Text>
          </View>
        </View>

        <MonthSelector month={month} onChange={setMonth} />

        <View style={styles.hero}>
          <View style={[styles.heroRing, styles.heroRingOuter]} />
          <View style={[styles.heroRing, styles.heroRingInner]} />

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
            <HeroStat icon="arrow-down-left" label="Receitas" value={income} color={colors.success} background={colors.successSoft} />
            <HeroStat icon="arrow-up-right" label="Despesas" value={expenses} color={colors.danger} background={colors.dangerSoft} />
          </View>
        </View>

        {error && (
          <View style={styles.error}>
            <Feather name="wifi-off" size={16} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <QuickAction icon="plus" label="Nova receita" color={colors.success} onPress={() => setSheet({ type: "income", id: null })} />
          <QuickAction icon="minus" label="Novo pagamento" color={colors.danger} onPress={() => setSheet({ type: "payment", id: null })} />
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
  background,
}: {
  icon: ComponentProps<typeof Feather>["name"];
  label: string;
  value: number;
  color: string;
  background: string;
}) {
  return (
    <View style={styles.heroStat}>
      <View style={[styles.heroStatIcon, { backgroundColor: background }]}>
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
  onPress,
}: {
  icon: ComponentProps<typeof Feather>["name"];
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.action, pressed && { backgroundColor: colors.neutralSoft }]}>
      <Feather name={icon} size={18} color={color} />
      <Text style={styles.actionLabel} numberOfLines={1}>
        {label}
      </Text>
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
    gap: spacing.sm + 4,
    marginBottom: spacing.lg - 4,
  },
  greeting: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  name: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.text,
    letterSpacing: -0.4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neutralSoft,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  hero: {
    marginTop: spacing.md + 4,
    borderRadius: 28,
    paddingHorizontal: spacing.md + 4,
    paddingTop: spacing.lg - 2,
    paddingBottom: spacing.md + 4,
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: colors.hero,
    borderWidth: 1,
    borderColor: colors.heroBorder,
  },
  heroRing: {
    position: "absolute",
    borderWidth: 1,
    borderColor: colors.heroRing,
  },
  heroRingOuter: {
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -110,
    right: -70,
  },
  heroRingInner: {
    width: 150,
    height: 150,
    borderRadius: 75,
    top: -60,
    right: -30,
  },
  heroLabel: {
    color: colors.onHeroSoft,
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  heroBalance: {
    marginTop: 6,
    color: "#FFFFFF",
    fontSize: 40,
    fontFamily: fonts.bold,
    letterSpacing: -1.6,
    fontVariant: ["tabular-nums"],
  },
  progressTrack: {
    alignSelf: "stretch",
    marginTop: spacing.md,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  progressText: {
    marginTop: spacing.sm,
    color: colors.onHeroSoft,
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  heroStats: {
    alignSelf: "stretch",
    marginTop: spacing.md,
    flexDirection: "row",
    gap: spacing.sm + 2,
  },
  heroStat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 2,
    backgroundColor: colors.heroTile,
    borderRadius: 18,
    padding: spacing.sm + 4,
  },
  heroStatIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  heroStatLabel: {
    color: colors.onHeroSoft,
    fontSize: 11,
    fontFamily: fonts.regular,
  },
  heroStatValue: {
    color: colors.text,
    fontSize: 14,
    fontFamily: fonts.bold,
    fontVariant: ["tabular-nums"],
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
    fontFamily: fonts.semibold,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm + 2,
    marginTop: spacing.md + 4,
  },
  action: {
    flex: 1,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionLabel: {
    flexShrink: 1,
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
});
