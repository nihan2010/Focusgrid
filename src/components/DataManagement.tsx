import React, { useRef, useState } from 'react';
import { Upload, Download, Code, AlertTriangle, Check, Copy } from 'lucide-react';
import { useStore } from '../stores/useStore';
import { parseDayRecordConfig } from '../lib/schema';
import type { Block } from '../types';

export const DataManagement: React.FC = () => {
    const { today, updateToday, updateTomorrow, archivedRecords } = useStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [pasteMode, setPasteMode] = useState(false);
    const [jsonInput, setJsonInput] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    // Export options
    const [exportClean, setExportClean] = useState(false);

    // File Preview options
    const [pendingImport, setPendingImport] = useState<Block[] | null>(null);

    const handleExport = () => {
        if (!today) return;

        const exportData = {
            schemaVersion: "1.0",
            date: today.date,
            meta: {
                mode: "marathon",
                hardMode: true
            },
            blocks: today.blocks.map(b => ({
                id: b.id,
                title: b.title,
                type: b.type.toLowerCase(),
                durationMinutes: b.durationMinutes,
                startTime: b.startTime,
                endTime: b.endTime,
                chapters: b.subjects,
                notes: b.notes,
                completed: exportClean ? false : b.completed,
                ...(b.isMarathonBlock && {
                    pomodoro: {
                        workDuration: b.workDuration,
                        breakDuration: b.breakDuration,
                        cycles: b.pomodorosCount
                    }
                })
            }))
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `focusgrid-${exportClean ? 'template' : today.date}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Log backup date
        useStore.getState().updateSettings({ lastBackupDate: new Date().toISOString() });
    };

    const processJson = async (blocks: Block[], target: 'today' | 'tomorrow') => {
        setErrorMsg(null);
        setSuccessMsg(null);

        const freshData = {
            blocks: blocks,
            totalPomodoros: blocks.reduce((sum, b) => sum + (b.isMarathonBlock ? (b.pomodorosCount ?? 1) : 0), 0),
            completedPomodoros: blocks.filter(b => b.completed).length,
        };

        try {
            if (target === 'today') {
                await updateToday(freshData);
            } else {
                await updateTomorrow(freshData);
            }
            setSuccessMsg(`Successfully imported ${blocks.length} blocks to ${target}!`);
            setJsonInput('');
            setPasteMode(false);
            setPendingImport(null);
        } catch (e: any) {
            setErrorMsg(e.message || "Failed to save imported data");
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setErrorMsg(null);
        setSuccessMsg(null);

        const reader = new FileReader();
        reader.onload = async (ev) => {
            if (ev.target?.result) {
                const result = parseDayRecordConfig(ev.target.result as string);
                if (!result.success) {
                    setErrorMsg(result.error);
                } else {
                    setPendingImport(result.blocks);
                }
            }
        };
        reader.readAsText(file);

        // Reset input so the same file can be uploaded consecutively
        e.target.value = '';
    };

    const handlePasteImport = (target: 'today' | 'tomorrow') => {
        const result = parseDayRecordConfig(jsonInput);
        if (!result.success) {
            setErrorMsg(result.error);
            return;
        }
        processJson(result.blocks, target);
    };

    const aiPromptTemplate = `I need you to generate a daily study schedule for me formatted strictly as a JSON object that matches the FocusGrid app schema.

Do not include any explanation or markdown formatting (like \`\`\`json). Just return the raw JSON.
The JSON must follow this exact schema:

{
  "date": "YYYY-MM-DD",
  "blocks": [
    {
      "title": "Block Title",
      "type": "study|break|misc", 
      "startTime": "HH:MM", 
      "endTime": "HH:MM",
      "subjects": ["Math", "Physics"], 
      "notes": ["Read chapter 5"], 
      "isMarathonBlock": true, 
      "workDuration": 50, 
      "breakDuration": 10,
      "pomodorosCount": 1 
    }
  ]
}

Please generate a marathon study schedule for [INSERT YOUR GOALS HERE].`;

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(aiPromptTemplate);
        setSuccessMsg("Copied AI prompt to clipboard!");
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">Data Management</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Export Card */}
                <div className="bg-white/5 p-5 rounded-xl border border-white/5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                                <Download size={20} />
                            </div>
                            <h4 className="text-white font-bold">Export Schedule</h4>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">Download today's timeline as a portable JSON file.</p>
                        <label className="flex items-center gap-2 text-sm text-gray-400 mb-4 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={exportClean}
                                onChange={(e) => setExportClean(e.target.checked)}
                                className="accent-blue-500"
                            />
                            Export Clean Template (strip completion status)
                        </label>
                    </div>
                    <button
                        onClick={handleExport}
                        className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                    >
                        Export JSON
                    </button>
                </div>

                {/* Import Card */}
                <div className="bg-white/5 p-5 rounded-xl border border-white/5 flex flex-col justify-between relative">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-accent-500/20 text-accent-500 rounded-lg">
                                <Upload size={20} />
                            </div>
                            <h4 className="text-white font-bold">Import JSON</h4>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">Overwrite your schedule from a local file.</p>
                    </div>

                    {!pendingImport ? (
                        <>
                            <input
                                type="file"
                                accept=".json"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-2 bg-accent-500 hover:bg-accent-600 text-charcoal-950 rounded-lg font-bold transition-colors"
                            >
                                Select File
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col gap-2 mt-2">
                            <p className="text-xs text-accent-500 font-bold mb-1">Preview: {pendingImport.length} blocks identified.</p>
                            <button
                                onClick={() => processJson(pendingImport, 'today')}
                                className="text-sm py-2 bg-accent-500 hover:bg-accent-600 text-charcoal-950 font-bold rounded-lg transition-colors"
                            >
                                Replace Today
                            </button>
                            <button
                                onClick={() => processJson(pendingImport, 'tomorrow')}
                                className="text-sm py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors"
                            >
                                Replace Tomorrow
                            </button>
                            <button
                                onClick={() => setPendingImport(null)}
                                className="text-xs text-gray-400 hover:text-white mt-1"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>

                {/* AI Paste Card */}
                <div className="col-span-full bg-white/5 p-5 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
                                <Code size={20} />
                            </div>
                            <div>
                                <h4 className="text-white font-bold">Quick AI Input</h4>
                                <p className="text-xs text-gray-400">Paste an AI-generated JSON blob directly.</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowPrompt(!showPrompt)}
                                className="px-4 py-2 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 rounded-lg text-sm font-bold transition-colors"
                            >
                                Get AI Prompt
                            </button>
                            <button
                                onClick={() => setPasteMode(!pasteMode)}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                {pasteMode ? 'Close' : 'Open Paste Window'}
                            </button>
                        </div>
                    </div>

                    {showPrompt && (
                        <div className="mb-4 animate-in fade-in slide-in-from-top-2 bg-black/40 border border-purple-500/30 rounded-lg p-4 relative">
                            <h5 className="text-sm font-bold text-white mb-2">Instructions for ChatGPT / Claude:</h5>
                            <p className="text-xs text-gray-400 mb-3">Copy this prompt, modify your goals at the bottom, and paste the AI's strictly JSON response below.</p>
                            <pre className="text-xs text-purple-300 bg-charcoal-900 p-3 rounded-lg overflow-x-auto border border-white/5 whitespace-pre-wrap font-mono">
                                {aiPromptTemplate}
                            </pre>
                            <button
                                onClick={handleCopyPrompt}
                                className="absolute top-4 right-4 p-2 bg-purple-500/20 hover:bg-purple-500/40 text-purple-400 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold"
                            >
                                <Copy size={14} /> Copy Prompt
                            </button>
                        </div>
                    )}

                    {pasteMode && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <textarea
                                value={jsonInput}
                                onChange={(e) => setJsonInput(e.target.value)}
                                placeholder='{\n  "date": "2026-03-01",\n  "blocks": [...]\n}'
                                className="w-full h-48 bg-charcoal-900 border border-white/10 rounded-lg p-3 text-sm text-gray-300 font-mono focus:outline-none focus:border-purple-500 transition-colors mb-3"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handlePasteImport('today')}
                                    className="flex-1 py-2 bg-accent-500 hover:bg-accent-600 text-charcoal-950 font-bold rounded-lg transition-colors"
                                >
                                    Overwrite Today
                                </button>
                                <button
                                    onClick={() => handlePasteImport('tomorrow')}
                                    className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors"
                                >
                                    Overwrite Tomorrow
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Restore Previous Day */}
                <div className="col-span-full bg-white/5 p-5 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                        <h4 className="text-white font-bold">Restore Previous Day</h4>
                        <p className="text-xs text-gray-400">Didn't finish yesterday? Load yesterday's blocks into today.</p>
                    </div>
                    <button
                        onClick={() => {
                            if (archivedRecords.length > 0) {
                                const yesterday = archivedRecords[0];
                                // We filter out completed items if they want a clean start, or just load everything.
                                // For simplicity, we load everything but reset completion.
                                const cleanBlocks = yesterday.blocks.map(b => ({ ...b, id: crypto.randomUUID(), completed: false }));
                                processJson(cleanBlocks, 'today');
                            } else {
                                setErrorMsg("No previous days found in archive.");
                            }
                        }}
                        disabled={archivedRecords.length === 0}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Load Yesterday's Blocks
                    </button>
                </div>

                {/* Templates Card */}
                <div className="col-span-full bg-white/5 p-5 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h4 className="text-white font-bold">Reusable Templates</h4>
                            <p className="text-xs text-gray-400">Save your current schedule as a blueprint, or apply an existing one.</p>
                        </div>
                        <button
                            onClick={() => {
                                if (!today || today.blocks.length === 0) return setErrorMsg("No blocks to save as template.");
                                const name = prompt("Enter a name for this template:");
                                if (name) {
                                    useStore.getState().saveAsTemplate(name, today.blocks);
                                    setSuccessMsg(`Template "${name}" saved!`);
                                }
                            }}
                            className="px-4 py-2 bg-accent-500/10 text-accent-500 hover:bg-accent-500/20 rounded-lg font-bold text-sm transition-colors"
                        >
                            Save Today as Template
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        {useStore.getState().templates.map(tmpl => (
                            <div key={tmpl.id} className="bg-charcoal-900 border border-white/10 p-3 rounded-lg flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h5 className="text-white font-bold text-sm">{tmpl.name}</h5>
                                        <p className="text-xs text-gray-400">{tmpl.blocks.length} blocks</p>
                                    </div>
                                    <button
                                        onClick={() => useStore.getState().removeTemplate(tmpl.id)}
                                        className="text-gray-500 hover:text-red-400 transition-colors"
                                    >
                                        &times;
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => processJson(tmpl.blocks, 'today')}
                                        className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-medium transition-colors"
                                    >
                                        Apply Today
                                    </button>
                                    <button
                                        onClick={() => processJson(tmpl.blocks, 'tomorrow')}
                                        className="flex-1 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded text-xs font-medium transition-colors"
                                    >
                                        Apply Tomorrow
                                    </button>
                                </div>
                            </div>
                        ))}
                        {useStore.getState().templates.length === 0 && (
                            <div className="col-span-full text-center py-6 text-sm text-gray-500 italic border border-dashed border-white/10 rounded-lg">
                                No templates saved yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {errorMsg && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg animate-in fade-in transition-all">
                    <AlertTriangle size={20} className="shrink-0" />
                    <p className="text-sm font-medium">{errorMsg}</p>
                </div>
            )}

            {successMsg && (
                <div className="flex items-center gap-3 p-4 bg-accent-500/10 border border-accent-500/20 text-accent-500 rounded-lg animate-in fade-in transition-all">
                    <Check size={20} className="shrink-0" />
                    <p className="text-sm font-medium">{successMsg}</p>
                </div>
            )}
        </div>
    );
};
