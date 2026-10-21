import PaymentSheet from "@/components/PaymentSheet";
import { PaymentItem } from "@/components/TransactionItems";
import { EmptyState } from "@/components/ui/common";
import Screen, { TAB_BAR_SPACE } from "@/components/ui/Screen";
import { STATUS_LABELS } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { paymentsApi } from "@/services/finance";
import { colors, radius, shadow, spacing, fonts } from "@/src/theme";
import type { PaymentStatus } from "@/types/api";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { FAB } from "react-native-paper";

const FILTERS: (PaymentStatus | null)[] = [null, "PENDING", "PAID", "FAILED", "CANCELLED"];

export default function PaymentsScreen() {
  const toast = useToast();
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [sheet, setSheet] = useState<{ id: number | null } | null>(null);

  const fetchPage = useCallback(
    (page: number) => paymentsApi.list({ page, size: 15, sort: "dueDate,desc", status }),
    [status],
  );
  const { items, loading, refreshing, error, loadMore, refresh, reload } = usePaginatedList(fetchPage);

  // Reload silently when coming back to the tab (e.g. after creating a payment on Home).
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      refresh();
    }, [refresh]),
  );

  return (
    <Screen title="Pagamentos" subtitle="Suas contas">
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {FILTERS.map((filter) => {
            const selected = filter === status;
            return (
              <Pressable
                key={filter ?? "ALL"}
                onPress={() => setStatus(filter)}
                style={[styles.filter, selected && styles.filterSelected]}
              >
                <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                  {filter ? STATUS_LABELS[filter] : "Todos"}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <View
            style={[
              styles.rowWrapper,
              index === 0 && styles.first,
              index === items.length - 1 && styles.last,
            ]}
          >
            <PaymentItem payment={item} onPress={() => setSheet({ id: item.id })} />
          </View>
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          loading ? null : (
            <EmptyState
              icon={error ? "wifi-off" : "inbox"}
              title={error ? "Erro ao carregar" : "Nenhum pagamento"}
              description={error ?? "Toque em + para cadastrar um novo pagamento."}
            />
          )
        }
        ListFooterComponent={loading ? <ActivityIndicator style={{ marginVertical: spacing.lg }} color={colors.primary} /> : null}
      />

      <FAB icon="plus" label="Novo" color={colors.onPrimary} style={styles.fab} onPress={() => setSheet({ id: null })} />

      <PaymentSheet
        visible={!!sheet}
        paymentId={sheet?.id ?? null}
        onClose={() => setSheet(null)}
        onChanged={(message) => {
          toast.show(message);
          reload();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg - 4,
    paddingVertical: spacing.sm + 4,
  },
  filter: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.textSecondary,
  },
  filterTextSelected: {
    color: colors.onPrimary,
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.xs,
    paddingBottom: TAB_BAR_SPACE + 60,
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
    backgroundColor: colors.primary,
    borderRadius: radius.md + 2,
    ...shadow.floating,
  },
});
