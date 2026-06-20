import { AuthProvider, useAuth } from "@/config/auth";
import { Redirect, Stack, useSegments } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Logo from "../components/logo";

function AppLoading() {
  return (
    <View style={styles.container}>
      <Logo width={120} height={120} />
      <Text style={styles.subtitle}>
        Finance dashboard
      </Text>
      <ActivityIndicator size="small" color="#6366F1" style={styles.loader} />
    </View>
  )
}

function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuth, loading } = useAuth();
  const segments = useSegments();

  if (loading) {
    return (
      <AppLoading />
    );
  }

  const isAuthRoute = segments[0] === "auth";

  if (!isAuth && !isAuthRoute) {
    return <Redirect href="/auth" />;
  }

  if (isAuth && isAuthRoute) {
    return <Redirect href="/" />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RouteGuard>
        <Stack screenOptions={{
          headerShown: false
        }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </RouteGuard>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "#F8FAFC",
    padding: 24,
  },

  title: {
    marginTop: 24,
    fontWeight: "700",
  },

  subtitle: {
    marginTop: 8,
    opacity: 0.6,
  },

  loader: {
    marginTop: 24,
  },
});