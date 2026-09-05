"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);

  function toggleTheme() {
    const next = !dark;
    document.documentElement.dataset.theme = next ? "dark" : "light";
    setDark(next);
    try {
      localStorage.setItem("studio-ugc-theme", next ? "dark" : "light");
    } catch {
      // A preferência continua aplicada mesmo quando o navegador bloqueia storage.
    }
  }

  return (
    <button
      className="icon-button"
      onClick={toggleTheme}
      aria-label="Alternar tema"
    >
      <Icon name={dark ? "moon" : "sun"} size={17} />
    </button>
  );
}
