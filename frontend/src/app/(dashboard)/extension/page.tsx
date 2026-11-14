"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bookmark, Check, Copy, KeyRound, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ExtensionLiveStatus } from "@/components/dashboard/ExtensionLiveStatus";
import { Panel } from "@/components/ui/Panel";
import { dsaApi } from "@/lib/api";
import { buildBookmarklet } from "@/lib/bookmarklet";

interface DeviceItem {
  id: string;
  name: string;
  tokenPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
}

const relative = (iso: string | null) => {
  if (!iso) return "never";
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
};

function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] py-1.5 pl-3 pr-1.5">
      <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-[var(--text-primary)]" title={value}>
        {value}
      </code>
      <button
        onClick={() => {
          navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }}
        aria-label={`Copy ${label}`}
        className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer"
      >
        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
      </button>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4 px-5 py-4">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[var(--border-medium)] text-xs font-medium text-[var(--text-secondary)] tabular">
        {n}
      </span>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="text-sm font-medium text-[var(--text-primary)]">{title}</div>
        {children}
      </div>
    </li>
  );
}

type InstallTab = "bookmark" | "userscript" | "extension";

const INSTALL_TABS: Array<{ id: InstallTab; label: string; hint: string }> = [
  { id: "extension", label: "Extension", hint: "Everything: auto-sync, submit from the editor, history import" },
  { id: "userscript", label: "Userscript", hint: "Auto-sync accepted solves, via Tampermonkey" },
  { id: "bookmark", label: "Sync bookmark", hint: "Nothing to install. Click it on LeetCode to import" },
];

/** Bookmarklet link; href is set imperatively because React blocks javascript: URLs. */
function BookmarkletLink() {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    ref.current?.setAttribute("href", buildBookmarklet(window.location.origin));
  }, []);
  return (
    <a
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        toast.info("Drag this button to your bookmarks bar, then click it on leetcode.com.");
      }}
      className="inline-flex cursor-grab items-center gap-2 rounded-lg border border-dashed border-[var(--accent-primary)] px-3.5 py-2 text-sm font-medium text-[var(--accent-primary)] active:cursor-grabbing"
      title="Drag me to your bookmarks bar"
    >
      <Bookmark size={14} /> Sync from LeetCode
    </a>
  );
}

function InstallOptions({ extPath }: { extPath: string | null }) {
  const [tab, setTab] = useState<InstallTab>("extension");
  const linkCls = "text-[var(--accent-primary)] underline-offset-2 hover:underline";
  return (
    <Panel title="Install" description="Pick one. You can switch any time." flush>
      <div role="tablist" className="grid grid-cols-3 border-y border-[var(--border-subtle)]">
        {INSTALL_TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`relative px-4 py-3 text-left transition-colors cursor-pointer ${
              tab === t.id ? "bg-[var(--bg-hover)]" : "hover:bg-[var(--bg-hover)]"
            }`}
          >
            <div className={`text-sm ${tab === t.id ? "font-medium text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
              {t.label}
            </div>
            <div className="mt-0.5 hidden text-xs text-[var(--text-muted)] sm:block">{t.hint}</div>
            {tab === t.id && <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-[var(--accent-primary)]" />}
          </button>
        ))}
      </div>

      {tab === "extension" && (
        <ol className="divide-y divide-[var(--border-subtle)]">
          <Step n={1} title="Download and unzip">
            <a href="/dsa-tracker-extension.zip" download className={`text-[13px] ${linkCls}`}>
              dsa-tracker-extension.zip
            </a>
            <p className="text-[13px] text-[var(--text-secondary)]">
              Working in this repo? Run <code className="font-mono">npm run extension</code> instead and skip the download.
            </p>
            {extPath && <CopyField value={extPath} label="extension folder" />}
          </Step>
          <Step n={2} title="Load it">
            <p className="text-[13px] text-[var(--text-secondary)]">
              Open <code className="font-mono">chrome://extensions</code> (Arc: <code className="font-mono">arc://extensions</code>),
              turn on Developer mode in the top right, click <strong>Load unpacked</strong> and pick the unzipped folder.
            </p>
          </Step>
          <Step n={3} title="Sign in to leetcode.com in the same browser">
            <p className="text-[13px] text-[var(--text-secondary)]">Come back here and it pairs on its own.</p>
          </Step>
        </ol>
      )}

      {tab === "userscript" && (
        <ol className="divide-y divide-[var(--border-subtle)]">
          <Step n={1} title="Install Tampermonkey">
            <p className="text-[13px] text-[var(--text-secondary)]">
              A free, widely used userscript manager from your browser&apos;s store:{" "}
              <a href="https://www.tampermonkey.net/" target="_blank" rel="noopener noreferrer" className={linkCls}>
                tampermonkey.net
              </a>
              . In Chrome, also allow userscripts on its extension details page.
            </p>
          </Step>
          <Step n={2} title="Install the script">
            <a href="/dsa-tracker.user.js" className={`text-[13px] ${linkCls}`}>
              dsa-tracker.user.js
            </a>
            <p className="text-[13px] text-[var(--text-secondary)]">Tampermonkey opens an install screen. Click Install.</p>
          </Step>
          <Step n={3} title="Reload this page">
            <p className="text-[13px] text-[var(--text-secondary)]">
              It pairs automatically. Accepted solves on LeetCode then sync on their own. Use the Sync bookmark for your past history.
            </p>
          </Step>
        </ol>
      )}

      {tab === "bookmark" && (
        <ol className="divide-y divide-[var(--border-subtle)]">
          <Step n={1} title="Drag this to your bookmarks bar">
            <BookmarkletLink />
            <p className="text-[13px] text-[var(--text-secondary)]">
              Bookmarks bar hidden? Press <kbd className="rounded border border-[var(--border-subtle)] px-1 font-mono text-[11px]">⌘⇧B</kbd>{" "}
              (Ctrl+Shift+B on Windows).
            </p>
          </Step>
          <Step n={2} title="Click it on leetcode.com whenever you want to sync">
            <p className="text-[13px] text-[var(--text-secondary)]">
              A small window opens, reads your solved problems from your own LeetCode session, and saves them here. Allow
              pop-ups for leetcode.com if asked.
            </p>
          </Step>
        </ol>
      )}
    </Panel>
  );
}

export default function ExtensionPage() {
  const [extPath, setExtPath] = useState<string | null>(null);
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [username, setUsername] = useState("");
  const [savedUsername, setSavedUsername] = useState<string | null>(null);

  const loadDevices = useCallback(async () => {
    try {
      const data = await dsaApi.getExtensionDevices();
      setDevices(data?.devices ?? []);
    } catch {
      // list is optional
    }
  }, []);

  useEffect(() => {
    fetch("/api/dev/extension-path")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setExtPath(d?.path ?? null))
      .catch(() => setExtPath(null));
    loadDevices();
    dsaApi
      .getUserSettings()
      .then((s) => {
        if (s?.leetcodeUsername) {
          setUsername(s.leetcodeUsername);
          setSavedUsername(s.leetcodeUsername);
        }
      })
      .catch(() => {});
  }, [loadDevices]);

  const createToken = async () => {
    setCreating(true);
    try {
      const res = await dsaApi.createExtensionDevice("Pasted into extension popup");
      setNewToken(res.token);
      await loadDevices();
    } catch {
      toast.error("Couldn't create a token");
    } finally {
      setCreating(false);
    }
  };

  const revoke = async (id: string) => {
    try {
      await dsaApi.revokeExtensionDevice(id);
      toast.success("Device revoked. It will need to pair again.");
      await loadDevices();
    } catch {
      toast.error("Couldn't revoke that device");
    }
  };

  const saveUsername = async () => {
    try {
      await dsaApi.updateLeetcodeUsername(username.trim());
      setSavedUsername(username.trim().toLowerCase());
      toast.success("Username saved");
    } catch {
      toast.error("That doesn't look like a LeetCode username");
    }
  };

  const active = devices.filter((d) => !d.revokedAt);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 pb-12">
      <header>
        <h1 className="page-title text-3xl leading-tight text-[var(--text-primary)]">LeetCode sync</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-[var(--text-secondary)]">
          The browser extension records every accepted LeetCode submission here, imports your history, and lets the
          editor submit to LeetCode&apos;s judge. It never reads your LeetCode password or cookie.
        </p>
      </header>

      <ExtensionLiveStatus />

      <InstallOptions extPath={extPath} />

      <Panel
        title="Paired browsers"
        description="Each browser gets its own revocable token. Revoke one you no longer use."
        action={
          <button
            onClick={createToken}
            disabled={creating}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50 cursor-pointer"
          >
            <KeyRound size={13} /> Pair manually
          </button>
        }
        flush
      >
        {newToken && (
          <div className="space-y-2 border-t border-[var(--border-subtle)] bg-[var(--bg-card-secondary)] px-5 py-4">
            <p className="text-[13px] text-[var(--text-secondary)]">
              Paste this into the extension popup. It&apos;s shown once.
            </p>
            <CopyField value={newToken} label="pairing token" />
          </div>
        )}
        <ul className="divide-y divide-[var(--border-subtle)] border-t border-[var(--border-subtle)]">
          {active.length === 0 && (
            <li className="px-5 py-4 text-sm text-[var(--text-muted)]">No paired browsers yet.</li>
          )}
          {active.map((d) => (
            <li key={d.id} className="flex items-center gap-3 px-5 py-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-[var(--text-primary)]">{d.name}</div>
                <div className="text-xs text-[var(--text-muted)]">
                  <span className="font-mono">{d.tokenPrefix}…</span> · last used {relative(d.lastUsedAt)} · paired{" "}
                  {relative(d.createdAt)}
                </div>
              </div>
              <button
                onClick={() => revoke(d.id)}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-rose-500 cursor-pointer"
              >
                <Trash2 size={13} /> Revoke
              </button>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        title="Without the extension"
        description="Your public LeetCode profile lists your last ~20 accepted problems. Good enough on a phone."
      >
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            saveUsername();
          }}
        >
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="LeetCode username"
            className="min-w-0 flex-1 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)]"
          />
          <button
            type="submit"
            disabled={!username.trim() || username.trim().toLowerCase() === savedUsername}
            className="rounded-lg border border-[var(--border-medium)] px-3.5 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] disabled:opacity-50 cursor-pointer"
          >
            Save
          </button>
        </form>
      </Panel>
    </div>
  );
}
