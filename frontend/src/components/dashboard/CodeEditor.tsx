import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Loader2 } from 'lucide-react';

interface CodeEditorProps {
  initialCode?: string;
}

export function CodeEditor({ initialCode = '// Write your code here \ntry {\n  console.log("Hello Output!");\n} catch (e) {\n  console.error(e);\n}' }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('Running...');
    try {
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: 'javascript',
          version: '18.15.0',
          files: [{ content: code }]
        })
      });

      const data = await response.json();
      const stdout = data.run?.stdout;
      const stderr = data.run?.stderr;
      
      if (stdout || stderr) {
         setOutput((stdout || '') + (stderr || ''));
      } else {
         setOutput('Execution finished with no output.');
      }
    } catch {
      setOutput('Execution failed. Are you connected to the internet?');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex w-full h-[500px] border border-white/10 rounded-[2rem] overflow-hidden bg-[#0a0a0a] text-white">
      <div className="flex-1 flex flex-col border-r border-white/5">
        <div className="flex justify-between px-6 py-4 bg-white/5 border-b border-white/5 items-center">
          <span className="text-xs font-black tracking-widest text-gray-500 uppercase">JavaScript Editor</span>
          <button 
             onClick={handleRun} 
             disabled={isRunning} 
             className="flex gap-2 items-center bg-white text-black px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-200 disabled:opacity-50 transition-all shadow-lg"
          >
            {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} Run Code
          </button>
        </div>
        <div className="flex-1 p-4">
          <Editor
            theme="vs-dark"
            language="javascript"
            value={code}
            onChange={(c) => setCode(c || '')}
            options={{ 
              minimap: { enabled: false }, 
              fontSize: 16,
              fontFamily: 'monospace',
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              roundedSelection: true,
            }}
          />
        </div>
      </div>
      <div className="w-[35%] flex flex-col bg-[#050505]">
        <div className="px-6 py-4 bg-white/2 border-b border-white/5">
          <span className="text-xs font-black tracking-widest text-[#4ade80] uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse"></span>
            Console Output
          </span>
        </div>
        <pre className="p-6 text-sm font-mono text-gray-300 flex-1 overflow-auto whitespace-pre-wrap leading-relaxed">{output}</pre>
      </div>
    </div>
  );
}
