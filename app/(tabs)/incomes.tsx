import IncomeSheet from "@/components/IncomeSheet";
import { IncomeItem } from "@/components/TransactionItems";
import { EmptyState } from "@/components/ui/common";
import MonthSelector from "@/components/ui/MonthSelector";
import Screen, { TAB_BAR_SPACE } from "@/components/ui/Screen";
import { useToast } from "@/components/ui/Toast";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { incomesApi, summaryApi } from "@/services/finance";
import { colors, radius, shadow, spacing } from "@/src/theme";
import { formatCurrency, monthRange } from "@/utils/format";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { FAB } from "react-native-paper";

export default function IncomesScreen() {
  const toast = useToast();
  const [month, setMonth] = useState(() => new Date());
  const [total, setTotal] = useState<number | null>(null);
  const [sheet, setSheet] = useState<{ id: number | null } | null>(null);

  const fetchPage = useCallback(
    (page: number) => incomesApi.list({ page, size: 15, ...monthRange(month) }),
    [month],
  );
  const { items, loading, refreshing, error, loadMore, refresh, reload } = usePaginatedList(fetchPage);

  const loadTotal = useCallback(async () => {
    const { startDate, endDate } = monthRange(month);
    try {
      const summary = await summaryApi.get(startDate, endDate);
      setTotal(Number(summary.totalIncome));
    } catch {
      setTotal(null);
    }
  }, [month]);

  useEffect(() => {
    loadTotal();
  }, [loadTotal]);

  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      refresh();
      loadTotal();
    }, [refresh, loadTotal]),
  );

  return (
    <Screen title="Receitas" subtitle="O que entrou">
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <MonthSelector month={month} onChange={setMonth} />
            <View style={styles.totalCard}>
              <View style={styles.totalIcon}>
                <Feather name="trending-up" size={22} color={colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.totalLabel}>Total recebido no mês</Text>
                <Text style={styles.totalValue}>{total == null ? "—" : formatCurrency(total)}</Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={[styles.rowWrapper, index === 0 && styles.first, index === items.length - 1 && styles.last]}>
            <IncomeItem income={item} onPress={() => setSheet({ id: item.id })} />
          </View>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              refresh();
              loadTotal();
            }}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              icon={error ? "wifi-off" : "inbox"}
              title={error ? "Erro ao carregar" : "Nenhuma receita neste mês"}
              description={error ?? "Toque em + para registrar uma receita."}
            />
          )
        }
        ListFooterComponent={loading ? <ActivityIndicator style={{ marginVertical: spacing.lg }} color={colors.primary} /> : null}
      />

      <FAB icon="plus" label="Nova" color="#fff" style={styles.fab} onPress={() => setSheet({ id: null })} />

      <IncomeSheet
        visible={!!sheet}
        incomeId={sheet?.id ?? null}
        onClose={() => setSheet(null)}
        onChanged={(message) => {
          toast.show(message);
          reload();
          loadTotal();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg - 4,
    paddingBottom: TAB_BAR_SPACE + 60,
  },
  header: {
    paddingTop: spacing.sm + 4,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  totalCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md - 2,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    ...shadow.card,
  },
  totalIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.successSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  totalLabel: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: "600",
  },
  totalValue: {
    marginTop: 2,
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.5,
  },
  rowWrapper: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xs,
  },
  first: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing.xs,
  },
  last: {
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    paddingBottom: spacing.xs,
  },
  fab: {
    position: "absolute",
    right: spacing.lg - 4,
    bottom: TAB_BAR_SPACE - 10,
    backgroundColor: colors.success,
    borderRadius: radius.md + 2,
    ...shadow.floating,
  },
});
