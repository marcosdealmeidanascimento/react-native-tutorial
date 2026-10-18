import { TAB_BAR_SPACE } from "@/components/ui/Screen";
import { colors, radius } from "@/src/theme";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Snackbar } from "react-native-paper";

type ToastContextType = { show: (message: string) => void };

const ToastContext = createContext<ToastContextType>({ show: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const show = useCallback((text: string) => setMessage(text), []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <Snackbar
        visible={!!message}
        onDismiss={() => setMessage(null)}
        duration={2500}
        wrapperStyle={{ bottom: TAB_BAR_SPACE - 30 }}
        style={{ backgroundColor: colors.text, borderRadius: radius.md }}
      >
        {message}
      </Snackbar>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
