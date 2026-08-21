import React, { useRef, useEffect } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { Play, RotateCcw, Trash2, Code2, Sparkles, Zap, ChevronDown } from "lucide-react";
import { SupportedLanguage, AlgorithmType } from "../types";
import { STARTER_PRESETS } from "../data/starterCodes";
import { InputConfigSection } from "./InputConfigSection";

interface EditorPanelProps {
  code: string;
  setCode: (code: string) => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  onRunTrace: () => void;
  onClear: () => void;
  isTracing: boolean;
  activeLine?: number;
  arrayInput: number[];
  setArrayInput: (arr: number[]) => void;
  targetInput: number;
  setTargetInput: (t: number) => void;
  graphInput: string;
  setGraphInput: (g: string) => void;
  onSelectPreset: (presetId: AlgorithmType) => void;
  showGraphInput?: boolean;
}

export function EditorPanel({
  code,
  setCode,
  language,
  setLanguage,
  onRunTrace,
  onClear,
  isTracing,
  activeLine,
  arrayInput,
  setArrayInput,
  targetInput,
  setTargetInput,
  graphInput,
  setGraphInput,
  onSelectPreset,
  showGraphInput,
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
    <div className="flex flex-col h-full w-full space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-[#090910] border border-white/10 shadow-xl">
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/5 rounded-2xl p-1">
            {(
              [
                { id: "javascript", label: "JS" },
                { id: "python", label: "Python" },
                { id: "cpp", label: "C++" },
              ] as const
            ).map((lang) => (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  language === lang.id
                    ? "bg-cyan-500 text-black font-extrabold shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Preset Template Picker */}
          <select
            onChange={(e) => {
              if (e.target.value) {
                onSelectPreset(e.target.value as AlgorithmType);
              }
            }}
            defaultValue=""
            className="bg-[#12121e] border border-white/10 rounded-2xl px-3.5 py-1.5 text-xs font-mono font-bold text-gray-200 outline-none cursor-pointer"
          >
            <option value="" disabled>
              Load Preset Template...
            </option>
            {STARTER_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            title="Clear Editor"
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-rose-400 transition-colors cursor-pointer border border-white/5"
          >
            <Trash2 size={15} />
          </button>

          <button
            onClick={onRunTrace}
            disabled={isTracing || !code.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-500/20 cursor-pointer disabled:opacity-40"
          >
            <Zap size={14} />
            <span>{isTracing ? "Tracing..." : "Run & Trace"}</span>
          </button>
        </div>
      </div>

      {/* Monaco Code Editor */}
      <div className="rounded-3xl border border-white/10 bg-[#0c0c16] overflow-hidden shadow-2xl h-80 sm:h-96 min-h-60">
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
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            roundedSelection: true,
            lineNumbersMinChars: 3,
            renderLineHighlight: "all",
          }}
        />
      </div>

      {/* Custom Input Configuration Section */}
      <InputConfigSection
        arrayInput={arrayInput}
        setArrayInput={setArrayInput}
        targetInput={targetInput}
        setTargetInput={setTargetInput}
        graphInput={graphInput}
        setGraphInput={setGraphInput}
        onRerun={onRunTrace}
        showGraphInput={showGraphInput}
      />
    </div>
  );
}
