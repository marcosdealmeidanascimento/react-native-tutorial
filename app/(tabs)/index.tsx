import { useAuth } from "@/config/auth";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

export default function Index() {
  const { logout } = useAuth();
  return (
    <View
      style={styles.container}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Button onPress={logout} icon="logout">Logout</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  }
})
