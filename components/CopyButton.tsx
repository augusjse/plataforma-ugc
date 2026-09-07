"use client";

import { useState } from "react";

type Props = {
  text: string;
  children?: string;
  className?: string;
};

export default function CopyButton({ text, children = "Copiar", className = "button button-light" }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" className={className} onClick={() => void copy()}>
      {copied ? "✓ Copiado!" : children}
    </button>
  );
}
