"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export type ToastType = "success" | "error" | "info";

export type ShowToastOptions = {
  title: string;
  description: string;
  type?: ToastType;
};

type ToastItem = Required<ShowToastOptions> & {
  id: number;
};

type ToastContextValue = {
  showToast: (toast: ShowToastOptions) => void;
};

const TOAST_DURATION_MS = 5000;
const ToastContext = createContext<ToastContextValue | null>(null);

const toastIcon: Record<ToastType, string> = {
  success: "✓",
  error: "×",
  info: "i",
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast deve ser usado dentro de ToastProvider.");
  return context;
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const welcomeHandled = useRef(false);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: ShowToastOptions) => {
    const item: ToastItem = {
      ...toast,
      id: ++nextId.current,
      type: toast.type ?? "success",
    };
    setToasts((current) => [item, ...current]);
  }, []);

  useEffect(() => {
    if (welcomeHandled.current) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("welcome") !== "1") return;

    welcomeHandled.current = true;
    url.searchParams.delete("welcome");
    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
    showToast({
      title: "Login realizado",
      description: "Que bom ter você por aqui. Sua conta está pronta para usar.",
      type: "success",
    });
  }, [showToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss(toast.id), TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [onDismiss, toast.id]);

  const style = {
    "--toast-duration": `${TOAST_DURATION_MS}ms`,
  } as CSSProperties & Record<"--toast-duration", string>;

  return (
    <div
      className={`toast-card toast-${toast.type}`}
      role={toast.type === "error" ? "alert" : "status"}
      style={style}
    >
      <span className="toast-icon" aria-hidden="true">{toastIcon[toast.type]}</span>
      <div className="toast-copy">
        <strong>{toast.title}</strong>
        <p>{toast.description}</p>
      </div>
      <button
        type="button"
        className="toast-close"
        aria-label={`Fechar notificação: ${toast.title}`}
        onClick={() => onDismiss(toast.id)}
      >
        ×
      </button>
      <span className="toast-progress" aria-hidden="true" />
    </div>
  );
}
