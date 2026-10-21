import { ConfirmHost } from "@/components/ui/ConfirmDialog";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider, useAuth } from "@/config/auth";
import { colors, paperTheme } from "@/src/theme";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { PaperProvider } from "react-native-paper";
import Logo from "../components/logo";

// Uses the system font on purpose: it is also shown while Plus Jakarta Sans is still loading.
function AppLoading() {
  return (
    <LinearGradient colors={colors.heroGradient} style={styles.container}>
      <StatusBar style="light" />
      <Logo width={110} height={110} />
      <Text style={styles.title}>Finance Dashboard</Text>
      <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
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
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  // On a load error, carry on with the system font rather than blocking the app.
  if (!fontsLoaded && !fontError) {
    return <AppLoading />;
  }

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
          <ConfirmHost />
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
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
  },
  loader: {
    marginTop: 24,
  },
});
