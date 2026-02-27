import React, { useState } from 'react';
import { useStore } from '../stores/useStore';
import { FocusTree } from './FocusTree';
import { BlockItem } from './BlockItem';
import { Grid, FileJson, CopyPlus } from 'lucide-react';

export const Today: React.FC<{ setActiveTab?: (t: string) => void }> = ({ setActiveTab }) => {
    const { today, marathonState } = useStore();
    const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);

    if (!today || !today.blocks) {
        return (
            <div className="h-full flex items-center justify-center flex-col gap-4 text-gray-500 animate-pulse">
                <div className="w-8 h-8 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                <p className="tracking-widest capitalize text-xs">Waiting for schedule data...</p>
            </div>
        );
    }

    const safeBlocks = today.blocks || [];
    const isMarathon = safeBlocks.some(b => b.isMarathonBlock);
    const currentIndex = marathonState ? safeBlocks.findIndex(b => b.id === marathonState.blockId) : -1;
    const currentBlock = currentIndex >= 0 ? safeBlocks[currentIndex] : null;

    // Use the store-computed completionPercentage (auto-updates on every pomodoro)
    const treeProgress = today.completionPercentage;
    const isDamaged = (today.skippedSessions || 0) > 0;

    const minutes = marathonState ? Math.floor(marathonState.timeLeftMs / 60000) : 0;
    const seconds = marathonState ? Math.floor((marathonState.timeLeftMs % 60000) / 1000) : 0;

    return (
        <div className="flex flex-col flex-1 min-h-0 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 pb-4 border-b border-white/10 shrink-0">
                <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1">{isMarathon ? 'Marathon Mode' : 'Today'}</h2>
                    <p className="text-sm text-gray-400">Execution is the only metric.</p>
                </div>
                <div className="flex flex-col md:text-right">
                    <p className="text-3xl md:text-4xl font-black text-accent-500">
                        {today.completedPomodoros} <span className="text-xl text-gray-500">/ {isMarathon ? '14' : '∞'}</span>
                    </p>
                    <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-widest mt-0.5">Pomodoros</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 pb-8">
                {/* Timeline block */}
                <div className="lg:col-span-2 glass-panel p-4 md:p-6 flex flex-col min-h-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
                        <h3 className="text-lg font-semibold text-white">Execution Timeline</h3>
                        <button
                            className="w-full sm:w-auto text-sm bg-accent-500 text-charcoal-950 font-bold px-6 h-12 rounded-xl hover:bg-accent-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-accent-500/20 active:scale-95 transition-transform"
                            onClick={() => setActiveTab?.('add-block:today')}
                        >
                            <Grid size={18} />
                            Add Block
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-4">
                        <div className="space-y-4 h-full">
                            {safeBlocks.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 shadow-lg">
                                        <Grid className="w-8 h-8 text-white/40" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Your day is empty.</h3>
                                    <p className="text-gray-400 max-w-[260px] mx-auto mb-8">Build your execution plan.</p>

                                    <div className="flex flex-col w-full max-w-[240px] gap-3">
                                        <button
                                            onClick={() => setActiveTab?.('add-block:today')}
                                            className="w-full py-3 bg-accent-500 hover:bg-accent-400 text-charcoal-950 font-bold rounded-xl transition-all shadow-lg shadow-accent-500/10"
                                        >
                                            Add Block
                                        </button>
                                        <button
                                            onClick={() => setActiveTab?.('settings')}
                                            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                                        >
                                            <FileJson size={16} /> Import JSON
                                        </button>
                                        <button
                                            onClick={() => setActiveTab?.('settings')}
                                            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                                        >
                                            <CopyPlus size={16} /> Apply Template
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                safeBlocks.map((block) => (
                                    <BlockItem
                                        key={block.id}
                                        block={block}
                                        isToday={true}
                                        isExpanded={expandedBlockId === block.id}
                                        onToggleExpand={() => setExpandedBlockId(prev => prev === block.id ? null : block.id)}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Focus Tree & Stats block */}
                <div className="flex flex-col gap-6">
                    {/* Marathon Dashboard Widget */}
                    {isMarathon && (
                        <div className="glass-panel p-6 border border-accent-500/20 bg-accent-500/5">
                            <h3 className="text-sm font-bold text-accent-500 uppercase tracking-widest mb-4">Live Dashboard</h3>

                            <div className="mb-4">
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Current Session</p>
                                <p className="text-white font-medium truncate">
                                    {currentBlock ? `Now: ${marathonState?.sessionName} — ${currentBlock.title} ` : 'Waiting...'}
                                </p>
                            </div>

                            <div className="mb-6">
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Next Session</p>
                                <p className="text-gray-300 text-sm truncate">
                                    {marathonState ? `Next: ${marathonState.nextSessionName} ` : 'None'}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Phase Timer</p>
                                    <div className="text-2xl font-bold text-white tabular-nums tracking-tighter">
                                        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                                    </div>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-accent-500 transition-all duration-1000 ease-linear"
                                        style={{ width: `${marathonState?.progressPercent || 0}% ` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="glass-panel p-6 flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden group">
                        <div className={`absolute inset-0 bg-gradient-to-t ${isDamaged ? 'from-red-500/10' : 'from-accent-500/10'} to-transparent pointer-events-none`} />
                        <div className="w-40 h-40 relative z-10 transition-transform duration-700 group-hover:scale-105">
                            <FocusTree progress={treeProgress} isDamaged={isDamaged} showLabel />
                        </div>
                    </div>

                    <div className="glass-panel p-6">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-4">Daily Stats</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Total Focus</span>
                                <span className="font-bold text-white">{today.totalStudyMinutes}m</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Pomodoros</span>
                                <span className="font-bold text-white">
                                    {today.completedPomodoros}
                                    <span className="text-gray-500">/{today.totalPomodoros || '?'}</span>
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300">Skipped</span>
                                <span className="font-bold text-red-400">{today.skippedSessions}</span>
                            </div>
                        </div>

                        {/* Overall Completion Bar */}
                        <div className="mt-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold uppercase text-gray-500">Day Progress</span>
                                <span className="text-xs font-bold text-white">{treeProgress}%</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ease-out ${isDamaged ? 'bg-red-500' : 'bg-accent-500'}`}
                                    style={{ width: `${treeProgress}%` }}
                                />
                            </div>
                        </div>

                        {/* DEBUG PANEL — remove after validation */}
                        <div className="mt-4 p-3 bg-black/30 rounded-lg border border-white/5 font-mono text-[10px] space-y-1 text-gray-500">
                            <p>Completed: <span className="text-accent-500">{today.completedPomodoros}</span></p>
                            <p>Total: <span className="text-accent-500">{today.totalPomodoros}</span></p>
                            <p>Progress: <span className="text-accent-500">{treeProgress}%</span></p>
                            <p>Stage: <span className="text-accent-500">{today.treeStage}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
