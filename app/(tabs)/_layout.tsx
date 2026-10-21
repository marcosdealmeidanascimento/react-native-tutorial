import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";
import { colors, fonts, shadow } from "@/src/theme";
import Feather from "@expo/vector-icons/Feather";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FeatherIcon = ComponentProps<typeof Feather>["name"];

const TAB_ICONS: Record<string, FeatherIcon> = {
  index: "home",
  payments: "credit-card",
  incomes: "trending-up",
  profile: "user",
};

/** Floating pill bar: the active tab expands into a green pill with its label, the others show only the icon. */
function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();

  // The floating bar would otherwise sit over the form while typing.
  if (keyboardHeight > 0) return null;

  return (
    <View style={[styles.bar, { bottom: Math.max(insets.bottom, 12) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const title = descriptors[route.key].options.title ?? route.name;

        const onPress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={title}
            style={[styles.item, focused && styles.itemFocused]}
          >
            <Feather
              name={TAB_ICONS[route.name] ?? "circle"}
              size={focused ? 20 : 21}
              color={focused ? colors.onPrimary : colors.muted}
            />
            {focused && <Text style={styles.label}>{title}</Text>}
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <FloatingTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: "Início" }} />
      <Tabs.Screen name="payments" options={{ title: "Pagamentos" }} />
      <Tabs.Screen name="incomes" options={{ title: "Receitas" }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 16,
    right: 16,
    height: 68,
    borderRadius: 34,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.floating,
  },
  item: {
    width: 52,
    height: 48,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  itemFocused: {
    width: "auto",
    paddingHorizontal: 18,
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.onPrimary,
  },
});
