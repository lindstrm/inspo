"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  label: string;
  hint?: string;
  getText: () => string;
};

const COPIED_MS = 1600;

/** Generic copy-to-clipboard action in the card's typed grammar. Reusable anywhere. */
export function CopyButton({ label, hint, getText }: Props) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const copy = async () => {
    const text = getText();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_MS);
  };

  return (
    <button className={`btn-copy ${copied ? "copied" : ""}`} onClick={() => void copy()}>
      <span>{copied ? "Copied to clipboard" : label}</span>
      {hint && !copied && <span className="copy-hint">{hint}</span>}
    </button>
  );
}
