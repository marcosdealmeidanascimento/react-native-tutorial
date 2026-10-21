import { colors, radius, shadow, fonts } from "@/src/theme";
import { addMonths, formatMonthYear } from "@/utils/format";
import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  month: Date;
  onChange: (month: Date) => void;
};

export default function MonthSelector({ month, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Pressable style={styles.arrow} onPress={() => onChange(addMonths(month, -1))} hitSlop={8}>
        <Feather name="chevron-left" size={20} color={colors.text} />
      </Pressable>
      <Text style={styles.label}>{formatMonthYear(month)}</Text>
      <Pressable style={styles.arrow} onPress={() => onChange(addMonths(month, 1))} hitSlop={8}>
        <Feather name="chevron-right" size={20} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    padding: 6,
    ...shadow.card,
  },
  arrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutralSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
});
