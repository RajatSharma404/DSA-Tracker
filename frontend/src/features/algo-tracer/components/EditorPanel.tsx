"use client";

import React, { useRef, useEffect, useState } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { Trash2, Zap, Code2, GripHorizontal } from "lucide-react";
import { SupportedLanguage, TraceStep } from "../types";
import { VariableInspector } from "./VariableInspector";
import { soundEffects } from "@/lib/soundEffects";

interface EditorPanelProps {
  code: string;
  setCode: (code: string) => void;
  language: SupportedLanguage;
  onRunTrace: () => void;
  onClear: () => void;
  isTracing: boolean;
  activeLine?: number;
  currentStep?: TraceStep;
}

export function EditorPanel({
  code,
  setCode,
  language,
  onRunTrace,
  onClear,
  isTracing,
  activeLine,
  currentStep,
}: EditorPanelProps) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorationsRef = useRef<string[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  const [inspectorHeight, setInspectorHeight] = useState(115);
  const [isDraggingInspector, setIsDraggingInspector] = useState(false);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  // Sync Monaco active line highlight and auto-scroll with execution step
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    if (!activeLine || activeLine <= 0) {
      decorationsRef.current = editorRef.current.deltaDecorations(
        decorationsRef.current,
        [],
      );
      return;
    }

    try {
      decorationsRef.current = editorRef.current.deltaDecorations(
        decorationsRef.current,
        [
          {
            range: new monacoRef.current.Range(activeLine, 1, activeLine, 1),
            options: {
              isWholeLine: true,
              className:
                "bg-[var(--accent-primary)]/20 border-l-4 border-[var(--accent-primary)] font-bold transition-all duration-150",
              linesDecorationsClassName:
                "border-l-4 border-[var(--accent-primary)] text-[var(--accent-primary)] font-bold",
            },
          },
        ],
      );
      editorRef.current.revealLineInCenterIfOutsideViewport(activeLine);
    } catch {
      // ignore
    }
  }, [activeLine]);

  // Drag handle listener for Variable Inspector resizing
  useEffect(() => {
    if (!isDraggingInspector) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!panelRef.current) return;
      const rect = panelRef.current.getBoundingClientRect();
      const newHeight = rect.bottom - e.clientY;
      const clamped = Math.max(50, Math.min(280, newHeight));
      setInspectorHeight(clamped);
    };

    const handleMouseUp = () => {
      setIsDraggingInspector(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingInspector]);

  return (
    <div
      ref={panelRef}
      className={`flex flex-col h-full min-h-0 w-full space-y-1.5 overflow-hidden ${
        isDraggingInspector ? "select-none" : ""
      }`}
    >
      {/* Editor Main Container */}
      <div className="flex-1 min-h-0 w-full rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] overflow-hidden shadow-2xl flex flex-col">
        {/* Top Toolbar (slim 36px) */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--text-secondary)]">
            <Code2 size={13} className="text-[var(--accent-primary)]" />
            <span>Editor</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                soundEffects.playClick();
                onClear();
              }}
              title="Clear Code"
              className="p-1.5 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-rose-400 transition-colors cursor-pointer border border-[var(--border-subtle)]"
            >
              <Trash2 size={13} />
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                onRunTrace();
              }}
              disabled={isTracing || !code.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--accent-primary)] text-black font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
            >
              <Zap size={13} />
              <span>{isTracing ? "Tracing..." : "Run & Trace"}</span>
            </button>
          </div>
        </div>

        {/* Monaco Container */}
        <div className="flex-1 min-h-0 w-full overflow-hidden bg-[var(--bg-primary)]">
          <Editor
            height="100%"
            theme="vs-dark"
            language={language === "javascript" ? "javascript" : language}
            value={code}
            onChange={(val) => setCode(val || "")}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              automaticLayout: true,
              fontSize: 14,
              fontFamily: '"Fira Code", "JetBrains Mono", monospace',
              fontLigatures: true,
              padding: { top: 10, bottom: 10 },
              scrollBeyondLastLine: false,
              roundedSelection: true,
              lineNumbersMinChars: 3,
              renderLineHighlight: "all",
            }}
          />
        </div>
      </div>

      {/* Vertical Drag Handle */}
      <div
        onMouseDown={() => setIsDraggingInspector(true)}
        role="separator"
        aria-orientation="horizontal"
        title="Drag up/down to resize Variable Inspector"
        className="h-2 w-full shrink-0 cursor-row-resize flex items-center justify-center group py-0.5"
      >
        <div className="h-1 w-16 rounded-full bg-[var(--border-subtle)] group-hover:bg-[var(--accent-primary)] group-active:bg-[var(--accent-primary)] transition-colors flex items-center justify-center">
          <GripHorizontal
            size={10}
            className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100"
          />
        </div>
      </div>

      {/* Variable Inspector placed under the code editor with adjustable height */}
      <div
        style={{ height: `${inspectorHeight}px` }}
        className="shrink-0 flex flex-col min-h-0 overflow-hidden"
      >
        <VariableInspector step={currentStep} className="h-full" />
      </div>
    </div>
  );
}
