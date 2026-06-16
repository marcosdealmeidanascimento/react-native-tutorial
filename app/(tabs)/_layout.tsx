import Feather from '@expo/vector-icons/Feather';
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "tomato" }}>
      <Tabs.Screen name="index" options={{
        title: "Summary", tabBarIcon(props) {
          return <Feather name="home" size={24} color={props.color} />
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
