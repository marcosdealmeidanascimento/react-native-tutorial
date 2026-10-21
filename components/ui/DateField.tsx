import { Field } from "@/components/ui/common";
import { colors, fonts, radius, shadow, spacing } from "@/src/theme";
import { addMonths, displayDateToISO, formatDate, formatMonthYear, parseISODate, toISODate } from "@/utils/format";
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { BackHandler, Keyboard, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { Portal } from "react-native-paper";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

type Props = {
  label: string;
  /** "DD/MM/AAAA", the format the form drafts keep. */
  value: string;
  onChange: (value: string) => void;
  style?: ViewStyle;
};

/** Read-only field that opens a calendar instead of asking the user to type the date. */
export default function DateField({ label, value, onChange, style }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => {
          Keyboard.dismiss();
          setOpen(true);
        }}
        style={style}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value || "selecionar data"}`}
      >
        {/* The input only draws the field; the Pressable takes the touch. */}
        <View pointerEvents="none">
          <Field label={label} value={value} editable={false} right={<Field.Icon icon="calendar-month-outline" />} />
        </View>
      </Pressable>
      <CalendarPopup
        visible={open}
        selected={displayDateToISO(value)}
        onSelect={(iso) => {
          onChange(formatDate(iso));
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

function CalendarPopup({
  visible,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  /** "YYYY-MM-DD" or null. */
  selected: string | null;
  onSelect: (iso: string) => void;
  onClose: () => void;
}) {
  const [month, setMonth] = useState(() => addMonths(selected ? parseISODate(selected) : new Date(), 0));

  // Every time it opens, start on the month of the current value.
  useEffect(() => {
    if (visible) setMonth(addMonths(selected ? parseISODate(selected) : new Date(), 0));
  }, [visible, selected]);

  // Registered after the bottom sheet's handler, so back closes the calendar first.
  useEffect(() => {
    if (!visible) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [visible, onClose]);

  if (!visible) return null;

  const today = toISODate(new Date());
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array<null>(month.getDay()).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toISODate(new Date(year, monthIndex, i + 1))),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));

  return (
    <Portal>
      <View style={StyleSheet.absoluteFill}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fechar calendário" />
        <View style={styles.center} pointerEvents="box-none">
          <View style={styles.card}>
            <View style={styles.header}>
              <Pressable onPress={() => setMonth(addMonths(month, -1))} style={styles.arrow} hitSlop={8} accessibilityLabel="Mês anterior">
                <Feather name="chevron-left" size={20} color={colors.text} />
              </Pressable>
              <Text style={styles.monthLabel}>{formatMonthYear(month)}</Text>
              <Pressable onPress={() => setMonth(addMonths(month, 1))} style={styles.arrow} hitSlop={8} accessibilityLabel="Próximo mês">
                <Feather name="chevron-right" size={20} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.week}>
              {WEEKDAYS.map((day, i) => (
                <Text key={i} style={styles.weekday}>
                  {day}
                </Text>
              ))}
            </View>

            {weeks.map((week, w) => (
              <View key={w} style={styles.week}>
                {week.map((iso, d) => {
                  if (!iso) return <View key={d} style={styles.cell} />;
                  const isSelected = iso === selected;
                  const isToday = iso === today;
                  return (
                    <Pressable
                      key={d}
                      onPress={() => onSelect(iso)}
                      style={styles.cell}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={formatDate(iso)}
                    >
                      <View style={[styles.day, isToday && styles.today, isSelected && styles.selected]}>
                        <Text style={[styles.dayText, isSelected && styles.selectedText]}>{Number(iso.slice(8))}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ))}

            <View style={styles.footer}>
              <Pressable onPress={onClose} style={styles.footerButton}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable onPress={() => onSelect(today)} style={[styles.footerButton, styles.todayButton]}>
                <Text style={styles.todayText}>Hoje</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 2, 14, 0.75)",
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    padding: spacing.lg - 4,
  },
  card: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: spacing.md,
    ...shadow.card,
    ...shadow.floating,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm + 4,
  },
  arrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutralSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  monthLabel: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  week: {
    flexDirection: "row",
  },
  weekday: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors.muted,
    paddingVertical: spacing.sm,
  },
  cell: {
    flex: 1,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  day: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  today: {
    borderWidth: 1,
    borderColor: colors.heroBorder,
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayText: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  selectedText: {
    fontFamily: fonts.bold,
    color: colors.onPrimary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.sm + 4,
  },
  footerButton: {
    height: 44,
    paddingHorizontal: spacing.md + 2,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  todayButton: {
    backgroundColor: colors.primarySoft,
  },
  cancelText: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.textSecondary,
  },
  todayText: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.primary,
  },
});
