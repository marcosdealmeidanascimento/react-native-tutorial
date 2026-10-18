import { colors, radius, shadow } from "@/src/theme";
import Feather from "@expo/vector-icons/Feather";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function TabIcon({ name, color, focused }: { name: ComponentProps<typeof Feather>["name"]; color: string; focused: boolean }) {
  return (
    <View style={[styles.icon, focused && styles.iconFocused]}>
      <Feather name={name} size={21} color={color} />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
        tabBarStyle: [styles.bar, { bottom: Math.max(insets.bottom, 12) }],
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: (props) => <TabIcon name="home" {...props} />,
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: "Pagamentos",
          tabBarIcon: (props) => <TabIcon name="credit-card" {...props} />,
        }}
      />
      <Tabs.Screen
        name="incomes"
        options={{
          title: "Receitas",
          tabBarIcon: (props) => <TabIcon name="trending-up" {...props} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: (props) => <TabIcon name="user" {...props} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    marginHorizontal: 16,
    height: 72,
    paddingTop: 8,
    paddingBottom: 8,
    borderRadius: radius.lg,
    borderTopWidth: 0,
    backgroundColor: colors.surface,
    ...shadow.floating,
  },
  item: {
    paddingVertical: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  icon: {
    width: 44,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  iconFocused: {
    backgroundColor: colors.primarySoft,
  },
});
