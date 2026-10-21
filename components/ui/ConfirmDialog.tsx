import { colors, fonts, radius, shadow, spacing } from "@/src/theme";
import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { Animated, BackHandler, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { Portal } from "react-native-paper";

type FeatherIcon = ComponentProps<typeof Feather>["name"];

type Request = {
  title: string;
  message: string;
  confirmLabel: string;
  destructive: boolean;
  icon: FeatherIcon;
  resolve: (confirmed: boolean) => void;
};

// Set by the mounted <ConfirmHost />; lets confirm() be called from anywhere, like Alert.alert.
let showRequest: ((request: Request) => void) | null = null;

/** Themed confirmation dialog. Resolves true on confirm, false on cancel, backdrop tap or Android back. */
export function confirm(
  title: string,
  message: string,
  confirmLabel = "Confirmar",
  destructive = true,
  icon: FeatherIcon = destructive ? "alert-triangle" : "help-circle",
) {
  return new Promise<boolean>((resolve) => {
    if (!showRequest) return resolve(false);
    showRequest({ title, message, confirmLabel, destructive, icon, resolve });
  });
}

/**
 * Renders the dialog requested through confirm(). Mount once inside PaperProvider. Its Portal mounts
 * only while open, so it stacks above bottom sheets that were already showing.
 */
export function ConfirmHost() {
  const [request, setRequest] = useState<Request | null>(null);
  const current = useRef<Request | null>(null);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    showRequest = (next) => {
      // A new request replaces one still open, which counts as cancelled.
      current.current?.resolve(false);
      current.current = next;
      setRequest(next);
    };
    return () => {
      showRequest = null;
    };
  }, []);

  const close = (confirmed: boolean) => {
    current.current?.resolve(confirmed);
    current.current = null;
    setRequest(null);
  };

  useEffect(() => {
    if (!request) return;
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Registered after the bottom sheet's handler, so back dismisses the dialog first.
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      close(false);
      return true;
    });
    return () => subscription.remove();
  }, [request, progress]);

  if (!request) return null;

  const tone = request.destructive
    ? { icon: colors.danger, iconBackground: colors.dangerSoft, button: colors.dangerStrong, buttonText: "#FFFFFF" }
    : { icon: colors.primary, iconBackground: colors.primarySoft, button: colors.primary, buttonText: colors.onPrimary };
  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] });

  return (
    <Portal>
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.backdrop, { opacity: progress }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => close(false)} accessibilityLabel="Voltar" />
        </Animated.View>
        <View style={styles.center} pointerEvents="box-none">
          <Animated.View
            style={[styles.card, { opacity: progress, transform: [{ scale }] }]}
            accessibilityRole="alert"
            accessibilityViewIsModal
          >
            <View style={[styles.icon, { backgroundColor: tone.iconBackground }]}>
              <Feather name={request.icon} size={24} color={tone.icon} />
            </View>
            <Text style={styles.title}>{request.title}</Text>
            <Text style={styles.message}>{request.message}</Text>

            <View style={styles.buttons}>
              <Pressable
                onPress={() => close(false)}
                style={({ pressed }) => [styles.button, styles.cancel, pressed && styles.pressed]}
                accessibilityRole="button"
              >
                <Text style={styles.cancelText}>Voltar</Text>
              </Pressable>
              <Pressable
                onPress={() => close(true)}
                style={({ pressed }) => [styles.button, { backgroundColor: tone.button }, pressed && styles.pressed]}
                accessibilityRole="button"
              >
                <Text style={[styles.confirmText, { color: tone.buttonText }]} numberOfLines={1} adjustsFontSizeToFit>
                  {request.confirmLabel}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 2, 14, 0.75)",
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: spacing.lg,
    ...shadow.card,
    ...shadow.floating,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 19,
    fontFamily: fonts.bold,
    color: colors.text,
    textAlign: "center",
  },
  message: {
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: "center",
  },
  buttons: {
    alignSelf: "stretch",
    flexDirection: "row",
    gap: spacing.sm + 2,
    marginTop: spacing.lg,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  cancel: {
    backgroundColor: colors.neutralSoft,
  },
  pressed: {
    opacity: 0.85,
  },
  cancelText: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.text,
  },
  confirmText: {
    fontSize: 15,
    fontFamily: fonts.bold,
  },
});
