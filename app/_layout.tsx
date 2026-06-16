import { AuthProvider, useAuth } from "@/config/auth";
import { Redirect, Stack, useSegments } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuth, loading } = useAuth();
  const segments = useSegments();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
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
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </RouteGuard>
    </AuthProvider>
  );
}