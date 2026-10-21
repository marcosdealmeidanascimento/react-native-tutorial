import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";
import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewProps,
} from "react-native";

// Lets inputs inside the scroll view (see Field) ask to be scrolled into view when they gain focus,
// so moving from one field to the next also keeps the active one visible.
const RevealFocusedInputContext = createContext<(() => void) | null>(null);
export const useRevealFocusedInput = () => useContext(RevealFocusedInputContext);

type Props = ScrollViewProps & {
  /**
   * true (default): the scroll view reaches the bottom of the screen, so the keyboard covers its lower part
   * and extra bottom space is added. false: a parent already moved it above the keyboard (e.g. BottomSheet),
   * so it only needs to scroll the focused input into view.
   */
  bottomAnchored?: boolean;
  /** Space kept between the focused input and the keyboard. */
  extraOffset?: number;
  children: ReactNode;
};

/**
 * ScrollView for forms: makes room for the software keyboard and scrolls the focused input above it.
 * Works in Expo Go (no native module): it relies only on Keyboard events and layout measurements.
 */
export default function KeyboardAwareScrollView({
  bottomAnchored = true,
  extraOffset = 24,
  contentContainerStyle,
  onScroll,
  onLayout,
  children,
  ...rest
}: Props) {
  const keyboardHeight = useKeyboardHeight();
  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<View>(null);
  const viewportHeight = useRef(0);
  const scrollY = useRef(0);
  const covered = bottomAnchored ? keyboardHeight : 0;

  const revealFocusedInput = useCallback(() => {
    // Wait a frame so focus and the new bottom padding are already laid out.
    requestAnimationFrame(() => {
      const input = TextInput.State.currentlyFocusedInput();
      const content = contentRef.current;
      if (!input || !content) return;

      input.measureLayout(
        content,
        (_x, y, _width, height) => {
          const visibleHeight = viewportHeight.current - covered;
          if (visibleHeight <= 0) return;
          const visibleTop = scrollY.current;
          const visibleBottom = visibleTop + visibleHeight;

          if (y + height + extraOffset > visibleBottom) {
            scrollRef.current?.scrollTo({ y: y + height + extraOffset - visibleHeight, animated: true });
          } else if (y - extraOffset < visibleTop) {
            scrollRef.current?.scrollTo({ y: Math.max(0, y - extraOffset), animated: true });
          }
        },
        // The focused input belongs to another scroll view (e.g. a sheet): nothing to do here.
        () => {},
      );
    });
  }, [covered, extraOffset]);

  // Keyboard opened (or changed height): bring the focused input above it.
  useEffect(() => {
    if (keyboardHeight > 0) revealFocusedInput();
  }, [keyboardHeight, revealFocusedInput]);

  const basePaddingBottom = Number(StyleSheet.flatten(contentContainerStyle)?.paddingBottom ?? 0);

  return (
    <RevealFocusedInputContext.Provider value={revealFocusedInput}>
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        scrollEventThrottle={16}
        {...rest}
        contentContainerStyle={[contentContainerStyle, { paddingBottom: basePaddingBottom + covered }]}
        onLayout={(e) => {
          viewportHeight.current = e.nativeEvent.layout.height;
          onLayout?.(e);
        }}
        onScroll={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
          scrollY.current = e.nativeEvent.contentOffset.y;
          onScroll?.(e);
        }}
      >
        {/* Measurement anchor for the focused input; collapsable=false keeps it as a real native view. */}
        <View ref={contentRef} collapsable={false}>
          {children}
        </View>
      </ScrollView>
    </RevealFocusedInputContext.Provider>
  );
}
