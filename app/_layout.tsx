import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider, useAuth } from "@/config/auth";
import { colors, paperTheme } from "@/src/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, Stack, useSegments } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { PaperProvider } from "react-native-paper";
import Logo from "../components/logo";

function AppLoading() {
  return (
    <LinearGradient colors={colors.heroGradient} style={styles.container}>
      <Logo width={110} height={110} />
      <Text style={styles.title}>Finance Dashboard</Text>
      <ActivityIndicator size="small" color="#fff" style={styles.loader} />
    </LinearGradient>
  );
}

function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuth, loading } = useAuth();
  const segments = useSegments();

  if (loading) {
    return <AppLoading />;
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
    <PaperProvider theme={paperTheme}>
      <AuthProvider>
        <ToastProvider>
          <RouteGuard>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="auth" options={{ animation: "fade" }} />
            </Stack>
          </RouteGuard>
        </ToastProvider>
      </AuthProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    marginTop: 16,
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  loader: {
    marginTop: 24,
  },
});
