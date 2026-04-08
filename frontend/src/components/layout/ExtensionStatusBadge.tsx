"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Download } from "lucide-react";
import {
  getExtensionHealth,
  ExtensionHealthState,
} from "@/lib/extensionBridge";

const STORE_URL =
  process.env.NEXT_PUBLIC_EXTENSION_STORE_URL?.trim() ||
  "https://chromewebstore.google.com";

export function ExtensionStatusBadge() {
  const [state, setState] = useState<ExtensionHealthState>("NOT_INSTALLED");

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      const health = await getExtensionHealth();
      if (!mounted) return;
      setState(health.state);
    };
    refresh();
    const timer = window.setInterval(refresh, 15000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  if (state === "READY") {
    return (
      <div className="flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-bold text-green-400">
        <CheckCircle2 size={14} />
        Extension Ready
      </div>
    );
  }

  if (state === "INSTALLED_NOT_READY") {
    return (
      <a
        href="https://leetcode.com"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1.5 text-xs font-bold text-yellow-300 hover:bg-yellow-500/20"
      >
        <AlertTriangle size={14} />
        Turn On Extension
      </a>
    );
  }

  return (
    <a
      href={STORE_URL}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-300 hover:bg-blue-500/20"
    >
      <Download size={14} />
      Download Extension
    </a>
  );
}
