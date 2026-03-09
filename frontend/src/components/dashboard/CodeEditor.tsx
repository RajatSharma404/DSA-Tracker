import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Play, Loader2, Terminal, Keyboard } from "lucide-react";

interface CodeEditorProps {
  initialCode?: string;
  className?: string;
}

const LANGUAGES: {
  label: string;
  value: string;
  version: string;
  starter: string;
}[] = [
  {
    label: "JavaScript",
    value: "javascript",
    version: "18.15.0",
    starter:
      "// Write your code here\nfunction solve() {\n  \n}\n\nconsole.log(solve());",
  },
  {
    label: "Python",
    value: "python",
    version: "3.10.0",
    starter: "# Write your code here\ndef solve():\n    pass\n\nprint(solve())",
  },
  {
    label: "Java",
    value: "java",
    version: "15.0.2",
    starter:
      'public class Solution {\n    public static void main(String[] args) {\n        System.out.println("Hello!");\n    }\n}',
  },
  {
    label: "C++",
    value: "cpp",
    version: "10.2.0",
    starter:
      '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello!" << endl;\n    return 0;\n}',
  },
];

export function CodeEditor({ initialCode, className }: CodeEditorProps) {
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(initialCode ?? LANGUAGES[0].starter);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [vimMode, setVimMode] = useState(false);
  const [vimStatus, setVimStatus] = useState("");
  const editorRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vimRef = useRef<any>(null);
  const statusBarRef = useRef<HTMLDivElement>(null);

  // Reset code when language changes (only if using default starter)
  const handleLangChange = (lang: (typeof LANGUAGES)[0]) => {
    setSelectedLang(lang);
    if (!initialCode) setCode(lang.starter);
  };

  // Vim mode toggle
  useEffect(() => {
    if (!editorRef.current) return;
    if (vimMode) {
      import("monaco-vim").then((MonacoVim) => {
        vimRef.current = MonacoVim.initVimMode(
          editorRef.current,
          statusBarRef.current,
        );
      });
    } else {
      vimRef.current?.dispose();
      vimRef.current = null;
      setVimStatus("");
    }
    return () => {
      vimRef.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vimMode]);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput("▶ Running...");
    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: selectedLang.value,
          version: selectedLang.version,
          files: [{ content: code }],
        }),
      });

      const data = await response.json();
      const stdout = data.run?.stdout ?? "";
      const stderr = data.run?.stderr ?? "";

      if (stdout || stderr) {
        setOutput((stdout + stderr).trimEnd());
      } else {
        setOutput("Execution finished with no output.");
      }
    } catch {
      setOutput("Execution failed. Are you connected to the internet?");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div
      className={`flex w-full border border-white/10 rounded-[2rem] overflow-hidden bg-[#0a0a0a] text-white ${className ?? "h-[500px]"}`}
    >
      {/* Editor pane */}
      <div className="flex-1 flex flex-col border-r border-white/5 min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-white/5 border-b border-white/5 shrink-0">
          {/* Language picker */}
          <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.value}
                onClick={() => handleLangChange(lang)}
                className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${
                  selectedLang.value === lang.value
                    ? "bg-white text-black shadow"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Vim toggle */}
            <button
              onClick={() => setVimMode((v) => !v)}
              title="Toggle Vim Mode"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all ${
                vimMode
                  ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400"
                  : "border-white/10 text-gray-500 hover:text-white hover:border-white/20"
              }`}
            >
              <Keyboard size={13} />
              VIM
            </button>

            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex gap-2 items-center bg-white text-black px-5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-gray-200 disabled:opacity-50 transition-all shadow-lg"
            >
              {isRunning ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Play size={14} />
              )}
              Run
            </button>
          </div>
        </div>

        {/* Monaco */}
        <div className="flex-1 overflow-hidden">
          <Editor
            theme="vs-dark"
            language={selectedLang.value}
            value={code}
            onChange={(c) => setCode(c ?? "")}
            onMount={(editor) => {
              editorRef.current = editor;
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 15,
              fontFamily: '"Fira Code", "JetBrains Mono", monospace',
              fontLigatures: true,
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              roundedSelection: true,
              lineNumbersMinChars: 3,
              renderLineHighlight: "gutter",
            }}
          />
        </div>

        {/* Vim status bar */}
        {vimMode && (
          <div
            ref={statusBarRef}
            className="px-4 py-1 bg-yellow-500/10 border-t border-yellow-500/20 text-yellow-400 text-xs font-mono min-h-[26px]"
          />
        )}
      </div>

      {/* Output pane */}
      <div className="w-[32%] flex flex-col bg-[#050505] shrink-0">
        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2 shrink-0">
          <Terminal size={13} className="text-[#4ade80]" />
          <span className="text-[11px] font-black tracking-widest text-[#4ade80] uppercase">
            Console
          </span>
          <span className="ml-auto w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
        </div>
        <pre className="p-5 text-sm font-mono text-gray-300 flex-1 overflow-auto whitespace-pre-wrap leading-relaxed">
          {output || (
            <span className="text-gray-600 italic">
              Output will appear here...
            </span>
          )}
        </pre>
      </div>
    </div>
  );
}
