import KeyboardAwareScrollView from "@/components/ui/KeyboardAwareScrollView";
import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";
import { colors, radius, spacing, fonts } from "@/src/theme";
import { Feather } from "@expo/vector-icons";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  BackHandler,
  Easing,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Portal } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type BottomSheetProps = {
  visible: boolean;
  title?: string;
  onClose: () => void;
  /** Rendered above the scrollable body, edge to edge (e.g. a gradient header). */
  header?: ReactNode;
  children: ReactNode;
};

/**
 * Bottom sheet rendered through Paper's Portal (on top of the whole app, tab bar included).
 *
 * Deliberately not an RN <Modal>: on Android a Modal is a separate window, where keyboard events and
 * resizing are unreliable with edge-to-edge. Staying in the app's window lets the sheet rise with the
 * keyboard (useKeyboardHeight) and scroll the focused field into view (KeyboardAwareScrollView).
 */
export default function BottomSheet({ visible, title, onClose, header, children }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  const { height: windowHeight } = useWindowDimensions();
  const progress = useRef(new Animated.Value(0)).current;
  // Stays mounted while the closing animation runs.
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Keyboard.dismiss();
      Animated.timing(progress, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, progress]);

  // Android back button closes the sheet instead of leaving the screen.
  useEffect(() => {
    if (!visible) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [visible, onClose]);

  if (!mounted) return null;

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [windowHeight, 0] });
  // Above the keyboard there must still be room for the status bar and a peek of the screen behind.
  const maxSheetHeight = Math.max(240, windowHeight - keyboardHeight - insets.top - spacing.lg);

  return (
    <Portal>
      <View style={StyleSheet.absoluteFill} pointerEvents={visible ? "auto" : "none"}>
        <Animated.View style={[styles.backdrop, { opacity: progress }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Fechar" />
        </Animated.View>

        {/* paddingBottom = keyboard height: the sheet sits right on top of the keyboard. */}
        <View style={[styles.anchor, { paddingBottom: keyboardHeight }]} pointerEvents="box-none">
          <Animated.View style={[styles.sheet, { maxHeight: maxSheetHeight, transform: [{ translateY }] }]}>
            {header ?? (
              <View style={styles.header}>
                <View style={styles.handle} />
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{title}</Text>
                  <SheetCloseButton onPress={onClose} />
                </View>
              </View>
            )}
            <KeyboardAwareScrollView
              bottomAnchored={false}
              style={styles.scroll}
              contentContainerStyle={[
                styles.body,
                // With the keyboard open the sheet ends at the keyboard, not at the home indicator.
                { paddingBottom: spacing.lg + (keyboardHeight > 0 ? 0 : insets.bottom) },
              ]}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </KeyboardAwareScrollView>
          </Animated.View>
        </View>
      </View>
    </Portal>
  );
}

export function SheetCloseButton({ onPress, light }: { onPress: () => void; light?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityLabel="Fechar"
      style={[styles.close, light && { backgroundColor: "rgba(255,255,255,0.18)" }]}
    >
      <Feather name="x" size={20} color={light ? "#fff" : colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 2, 14, 0.7)",
  },
  anchor: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: "hidden",
  },
  // Sized by its content, but shrinks (and scrolls) when the sheet hits maxHeight above the keyboard.
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm + 2,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutralSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
});
