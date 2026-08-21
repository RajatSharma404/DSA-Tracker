import React, { useRef, useEffect } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { Trash2, Zap, Code2 } from "lucide-react";
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

  return (
    <div className="flex flex-col h-full min-h-0 w-full space-y-2 overflow-hidden">
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

        {/* Monaco Container (fills remaining height inside editor box) */}
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
              fontSize: 13,
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

      {/* Variable Inspector placed under the code editor */}
      <VariableInspector
        step={currentStep}
        className="h-24 sm:h-28 shrink-0"
      />
    </div>
  );
}
