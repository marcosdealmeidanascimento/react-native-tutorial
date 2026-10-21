import Logo from "@/components/logo";
import { Field, FormError } from "@/components/ui/common";
import KeyboardAwareScrollView from "@/components/ui/KeyboardAwareScrollView";
import { ApiError } from "@/config/api";
import { useAuth } from "@/config/auth";
import { colors, radius, shadow, spacing, fonts } from "@/src/theme";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { login, register } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const switchMode = (signUp: boolean) => {
    setIsSignUp(signUp);
    setError(null);
  };

  const handleAuth = async () => {
    if ((isSignUp && !name.trim()) || !email.trim() || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        await register(name.trim(), email.trim(), password);
      }
      // After signing up, log straight in so the user lands on the dashboard.
      await login(email.trim(), password);
    } catch (e: any) {
      const status = e instanceof ApiError ? e.status : 0;
      if (status === 429) {
        // Too many failed logins: the API says how long to wait.
        setError(e.message);
      } else if (!isSignUp) {
        setError("E-mail ou senha inválidos.");
      } else {
        // 400/409 carry a user-facing reason from the API (e.g. "Este e-mail já está em uso.").
        setError(status === 400 || status === 409 ? e.message : "Não foi possível criar a conta. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={colors.heroGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.backdrop}>
        <View style={[styles.glow, { top: -80, right: -60 }]} />
        <View style={[styles.glow, { top: 140, left: -100, width: 200, height: 200 }]} />
      </LinearGradient>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg }]}
      >
          <View style={styles.brand}>
            <Logo width={84} height={84} />
            <Text style={styles.title}>Finance Dashboard</Text>
            <Text style={styles.subtitle}>Controle suas finanças com clareza</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.segmented}>
              {[
                { label: "Entrar", value: false },
                { label: "Criar conta", value: true },
              ].map((option) => (
                <Pressable
                  key={option.label}
                  onPress={() => switchMode(option.value)}
                  style={[styles.segment, isSignUp === option.value && styles.segmentActive]}
                >
                  <Text style={[styles.segmentText, isSignUp === option.value && styles.segmentTextActive]}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.cardTitle}>{isSignUp ? "Crie sua conta" : "Bem-vindo de volta"}</Text>
            <Text style={styles.cardSubtitle}>
              {isSignUp ? "Leva menos de um minuto." : "Entre para ver o resumo das suas finanças."}
            </Text>

            {isSignUp && (
              <Field
                label="Nome"
                autoCapitalize="words"
                value={name}
                onChangeText={setName}
                left={<Field.Icon icon="account-outline" />}
              />
            )}
            <Field
              label="E-mail"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
              left={<Field.Icon icon="email-outline" />}
            />
            <Field
              label="Senha"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={handleAuth}
              left={<Field.Icon icon="lock-outline" />}
              right={<Field.Icon icon={showPassword ? "eye-off-outline" : "eye-outline"} onPress={() => setShowPassword((v) => !v)} />}
            />

            <FormError message={error} />

            <Button
              mode="contained"
              loading={loading}
              disabled={loading}
              onPress={handleAuth}
              style={styles.button}
              contentStyle={{ height: 54 }}
              labelStyle={{ fontSize: 16, fontFamily: fonts.semibold }}
            >
              {isSignUp ? "Criar conta" : "Entrar"}
            </Button>
          </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "52%",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(0, 217, 115, 0.07)",
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg - 4,
    justifyContent: "center",
  },
  brand: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    marginTop: spacing.sm + 4,
    color: "#fff",
    fontSize: 26,
    fontFamily: fonts.bold,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 4,
    color: "rgba(255,255,255,0.75)",
    fontSize: 15,
    fontFamily: fonts.regular,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg - 4,
    ...shadow.floating,
  },
  segmented: {
    flexDirection: "row",
    backgroundColor: colors.neutralSoft,
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: spacing.lg - 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.pill,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.muted,
  },
  segmentTextActive: {
    color: colors.onPrimary,
  },
  cardTitle: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  cardSubtitle: {
    marginTop: 4,
    marginBottom: spacing.md,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  button: {
    marginTop: spacing.xs,
    borderRadius: radius.md,
  },
});
