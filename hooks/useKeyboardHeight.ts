import { useEffect, useState } from "react";
import { Keyboard, Platform } from "react-native";

/**
 * Current software-keyboard height (0 when hidden).
 *
 * Needed because with Android edge-to-edge (SDK 54) the window no longer shrinks when the keyboard opens,
 * so layouts have to make room themselves. iOS uses the "will" events to move together with the keyboard.
 */
export function useKeyboardHeight() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const show = Keyboard.addListener(showEvent, (e) => setHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener(hideEvent, () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return height;
}
