import Feather from '@expo/vector-icons/Feather';
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarLabelVisibilityMode: "unlabeled",
      tabBarActiveTintColor: "#6366F1",
      tabBarInactiveTintColor: "#94A3B8",
      tabBarStyle: {
        height: 70,
        paddingBottom: 8,
        paddingTop: 8,
        backgroundColor: "#FFF",
        elevation: 12,
      }
    }}
    >
      <Tabs.Screen name="index" options={{
        title: "Summary", tabBarIcon({ color, focused }) {
          return (
            <Feather
              name="home"
              size={24}
              color={color}
            />
          );
        },
      }} />

      <Tabs.Screen name="payments" options={{
        title: "Payments", tabBarIcon(props) {
          return <Feather name="credit-card" size={24} color={props.color} />
        },
      }} />

      <Tabs.Screen name="profile" options={{
        title: "Profile", tabBarIcon(props) {
          return <Feather name="user" size={24} color={props.color} />
        },
      }}
      />
    </Tabs>
  );
}
