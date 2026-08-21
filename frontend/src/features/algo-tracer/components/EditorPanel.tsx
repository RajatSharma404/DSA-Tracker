import React, { useRef, useEffect, useState } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { Trash2, Zap, Code2, GripHorizontal } from "lucide-react";
import { SupportedLanguage, TraceStep } from "../types";
import { VariableInspector } from "./VariableInspector";

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

  const [inspectorHeight, setInspectorHeight] = useState(105);
  const [isDraggingInspector, setIsDraggingInspector] = useState(false);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  // Sync Monaco active line highlight with execution step
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
              className: "bg-cyan-500/20 border-l-4 border-cyan-400 font-bold",
              linesDecorationsClassName: "border-l-4 border-cyan-400",
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
      const clamped = Math.max(50, Math.min(260, newHeight));
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
      <div className="flex-1 min-h-0 w-full rounded-2xl bg-[#090910] border border-white/10 overflow-hidden shadow-2xl flex flex-col">
        {/* Top Toolbar (slim 36px) */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-400">
            <Code2 size={13} className="text-cyan-400" />
            <span>Editor</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onClear}
              title="Clear Code"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
            </button>

            <button
              onClick={onRunTrace}
              disabled={isTracing || !code.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-purple-500/20 cursor-pointer disabled:opacity-40"
            >
              <Zap size={13} />
              <span>{isTracing ? "Tracing..." : "Run & Trace"}</span>
            </button>
          </div>
        </div>

        {/* Monaco Container */}
        <div className="flex-1 min-h-0 w-full overflow-hidden bg-[#0c0c16]">
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
        <div className="h-1 w-16 rounded-full bg-white/10 group-hover:bg-purple-400 group-active:bg-purple-400 transition-colors flex items-center justify-center">
          <GripHorizontal size={10} className="text-gray-400 opacity-0 group-hover:opacity-100" />
        </div>
      </div>

      {/* Variable Inspector placed under the code editor with adjustable height */}
      <div
        style={{ height: `${inspectorHeight}px` }}
        className="shrink-0 flex flex-col min-h-0 overflow-hidden"
      >
        <VariableInspector
          step={currentStep}
          className="h-full"
        />
      </div>
    </div>
  );
}
