"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type ValuesVisibility = {
  hidden: boolean;
  toggle: () => void;
};

const ValuesVisibilityContext = createContext<ValuesVisibility | null>(null);

export function ValuesVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    try {
      setHidden(localStorage.getItem("studio-ugc-hide-values") === "true");
    } catch {
      // Keep the default when storage is unavailable.
    }
  }, []);

  const value = useMemo(
    () => ({
      hidden,
      toggle: () => {
        setHidden((current) => {
          const next = !current;
          try {
            localStorage.setItem("studio-ugc-hide-values", String(next));
          } catch {
            // The preference still applies for this session.
          }
          return next;
        });
      },
    }),
    [hidden],
  );

  return <ValuesVisibilityContext.Provider value={value}>{children}</ValuesVisibilityContext.Provider>;
}

export function useValuesVisibility() {
  const context = useContext(ValuesVisibilityContext);
  if (!context) throw new Error("useValuesVisibility must be used inside ValuesVisibilityProvider");
  return context;
}

export function MoneyValue({ value }: { value: string }) {
  const { hidden } = useValuesVisibility();
  return <>{hidden ? "R$ ••••" : value}</>;
}
