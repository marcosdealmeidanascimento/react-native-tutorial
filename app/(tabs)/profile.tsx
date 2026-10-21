import { Card, confirm, Field, FormError } from "@/components/ui/common";
import KeyboardAwareScrollView from "@/components/ui/KeyboardAwareScrollView";
import Screen, { TAB_BAR_SPACE } from "@/components/ui/Screen";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/config/auth";
import { usersApi } from "@/services/finance";
import { colors, radius, shadow, spacing, fonts } from "@/src/theme";
import { initials } from "@/utils/format";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState, type ComponentProps } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

export default function ProfileScreen() {
  const { user, profilePicture, refreshUser, logout, deleteAccount } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
  }, [user]);

  const dirty = name.trim() !== user?.name || email.trim() !== user?.email || password.length > 0;

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim() || !email.trim()) return setError("Nome e e-mail são obrigatórios.");
    if (password && password.length < 6) return setError("A nova senha deve ter pelo menos 6 caracteres.");

    setSaving(true);
    setError(null);
    try {
      await usersApi.update(user.id, { name: name.trim(), email: email.trim(), password: password || null });
      setPassword("");
      await refreshUser();
      toast.show("Perfil atualizado");
    } catch (e: any) {
      setError(e?.message || "Não foi possível atualizar o perfil.");
    } finally {
      setSaving(false);
    }
  };

  const handlePickImage = async () => {
    if (!user) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;

    setUploading(true);
    try {
      await usersApi.uploadProfilePicture(user.id, result.assets[0].uri);
      await refreshUser();
      toast.show("Foto atualizada");
    } catch {
      toast.show("Não foi possível enviar a foto");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    if (await confirm("Sair", "Deseja encerrar sua sessão?", "Sair", false, "log-out")) {
      await logout();
    }
  };

  const handleDeleteAccount = async () => {
    const ok = await confirm(
      "Excluir conta",
      "Sua conta será desativada e você perderá o acesso aos seus dados. Esta ação não pode ser desfeita.",
      "Excluir conta",
    );
    if (!ok) return;
    try {
      await deleteAccount();
    } catch {
      toast.show("Não foi possível excluir a conta");
    }
  };

  return (
    <Screen title="Perfil" subtitle="Sua conta">
      <KeyboardAwareScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <LinearGradient colors={colors.heroGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <Pressable onPress={handlePickImage} style={styles.avatarWrapper} disabled={uploading}>
              <View style={styles.avatar}>
                {profilePicture ? (
                  <Image source={{ uri: profilePicture }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{initials(user?.name)}</Text>
                )}
                {uploading && (
                  <View style={styles.avatarOverlay}>
                    <ActivityIndicator color="#fff" />
                  </View>
                )}
              </View>
              <View style={styles.cameraBadge}>
                <Feather name="camera" size={14} color={colors.onPrimary} />
              </View>
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroName} numberOfLines={1}>
                {user?.name}
              </Text>
              <Text style={styles.heroEmail} numberOfLines={1}>
                {user?.email}
              </Text>
            </View>
          </LinearGradient>

          <Text style={styles.sectionTitle}>Dados da conta</Text>
          <Card style={styles.formCard}>
            <Field label="Nome" value={name} onChangeText={setName} autoCapitalize="words" left={<Field.Icon icon="account-outline" />} />
            <Field
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              left={<Field.Icon icon="email-outline" />}
            />
            <Field
              label="Nova senha"
              placeholder="Deixe em branco para manter"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              left={<Field.Icon icon="lock-outline" />}
              right={<Field.Icon icon={showPassword ? "eye-off-outline" : "eye-outline"} onPress={() => setShowPassword((v) => !v)} />}
            />
            <FormError message={error} />
            <Button
              mode="contained"
              loading={saving}
              disabled={!dirty || saving}
              onPress={handleSave}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              Salvar alterações
            </Button>
          </Card>

          <Text style={styles.sectionTitle}>Sessão</Text>
          <Card>
            <MenuItem icon="log-out" label="Sair da conta" onPress={handleLogout} />
            <View style={styles.separator} />
            <MenuItem icon="trash-2" label="Excluir conta" danger onPress={handleDeleteAccount} />
          </Card>
      </KeyboardAwareScrollView>
    </Screen>
  );
}

function MenuItem({
  icon,
  label,
  danger,
  onPress,
}: {
  icon: ComponentProps<typeof Feather>["name"];
  label: string;
  danger?: boolean;
  onPress: () => void;
}) {
  const color = danger ? colors.danger : colors.text;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: colors.neutralSoft }]}>
      <View style={[styles.menuIcon, { backgroundColor: danger ? colors.dangerSoft : colors.neutralSoft }]}>
        <Feather name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.menuLabel, { color }]}>{label}</Text>
      <Feather name="chevron-right" size={18} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.lg - 4,
    paddingTop: spacing.sm,
    paddingBottom: TAB_BAR_SPACE,
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.xl,
    padding: spacing.lg - 4,
    ...shadow.floating,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    color: "#fff",
    fontSize: 26,
    fontFamily: fonts.bold,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.card,
  },
  heroName: {
    color: "#fff",
    fontSize: 20,
    fontFamily: fonts.bold,
  },
  heroEmail: {
    marginTop: 2,
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    fontFamily: fonts.regular,
  },
  sectionTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm + 4,
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  formCard: {
    padding: spacing.md,
  },
  button: {
    marginTop: spacing.xs,
    borderRadius: radius.md,
  },
  buttonContent: {
    height: 52,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md - 4,
    padding: spacing.sm + 4,
    borderRadius: radius.md,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.semibold,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm + 4,
  },
});
