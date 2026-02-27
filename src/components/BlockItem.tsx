import React from 'react';
import type { Block } from '../types';
import { Play, Pause, MoreVertical, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../stores/useStore';

interface BlockItemProps {
    block: Block;
    isToday: boolean;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

const colorMap = {
    study: 'border-accent-500 bg-accent-500/10 text-accent-500',
    break: 'border-blue-500 bg-blue-500/10 text-blue-500',
    fitness: 'border-orange-500 bg-orange-500/10 text-orange-500',
    prayer: 'border-purple-500 bg-purple-500/10 text-purple-500',
    custom: 'border-indigo-500 bg-indigo-500/10 text-indigo-500',
};

export const BlockItem: React.FC<BlockItemProps> = ({ block, isToday, isExpanded, onToggleExpand }) => {
    const { activeBlockId, startSession, stopSession, timerRunning, updateBlock, marathonState } = useStore();

    const isActive = activeBlockId === block.id;
    const isCompleted = block.completed;

    // For Marathon logic
    const isMarathonActive = marathonState?.isActive && marathonState.blockId === block.id;
    // Derive skipped state from today context (simple approximation: if block is past and incomplete, or if today has skips in general, warn).
    // For exact tracking we'd need per-pomodoro skip state, but we'll show warning based on today.skippedSessions if this was active.

    // Determine completed / active podomoro index
    // If the block is totally completed, all sub-items are completed.
    // If the block is currently active, items before `marathonState.pomodoroIndex` are completed.

    const isPomodoroCompleted = (index: number, phase: 'work' | 'break') => {
        if (isCompleted) return true;
        if (!isMarathonActive) return false;

        if (marathonState?.pomodoroIndex > index) return true;
        if (marathonState?.pomodoroIndex === index && phase === 'work' && marathonState.phase === 'break') return true;
        return false;
    };

    const isPomodoroActive = (index: number, phase: 'work' | 'break') => {
        if (!isMarathonActive) return false;
        return marathonState?.pomodoroIndex === index && marathonState.phase === phase;
    };

    const handleToggleSession = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isActive && timerRunning) {
            stopSession();
        } else {
            startSession(block.id);
        }
    };

    const markCompleted = (e: React.MouseEvent) => {
        e.stopPropagation();
        updateBlock(isToday ? 'today' : 'tomorrow', block.id, { completed: !isCompleted });
    };

    return (
        <div className="flex flex-col gap-1 w-full">
            <div
                onClick={() => block.mode === 'pomodoro' && block.pomodoroConfig ? onToggleExpand() : null}
                className={`glass-card p-4 flex items-center gap-4 relative overflow-hidden transition-all duration-300
                    ${isActive ? 'ring-2 ring-accent-500 bg-white/10 scale-[1.02]' : ''}
                    ${isCompleted ? 'opacity-50 grayscale pt-4' : ''}
                    ${block.mode === 'pomodoro' && block.pomodoroConfig ? 'cursor-pointer hover:bg-white/5' : ''}
                `}
            >
                {/* Type indicator strip */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${colorMap[block.type].split(' ')[0]} bg-current opacity-70`} />

                {/* Drag handle */}
                <div className="cursor-grab text-gray-600 hover:text-gray-300 px-1" onClick={e => e.stopPropagation()}>
                    <MoreVertical size={20} />
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${colorMap[block.type]}`}>
                            {block.type}
                        </span>
                        <span className="text-sm font-semibold text-gray-400">
                            {block.mode === 'pomodoro' && block.pomodoroConfig
                                ? `${block.pomodoroConfig.cycles} Pomodoros`
                                : block.mode === 'time-range' ? `${block.startTime} – ${block.endTime}`
                                    : `${block.durationMinutes}m`}
                        </span>
                    </div>
                    <h4 className={`text-base font-medium truncate ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-100'}`}>
                        {block.title}
                    </h4>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {block.mode === 'pomodoro' && block.pomodoroConfig && (
                        <div className="text-gray-500 transition-transform">
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                    )}

                    {isToday && !isCompleted && block.mode !== 'pomodoro' && block.type !== 'prayer' && (
                        <button
                            onClick={handleToggleSession}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95
                                ${isActive && timerRunning ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-accent-500/20 text-accent-500 border border-accent-500/30'}
                            `}
                        >
                            {isActive && timerRunning ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                        </button>
                    )}

                    <button
                        onClick={markCompleted}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border active:scale-95
                            ${isCompleted ? 'text-accent-500 bg-accent-500/20 border-accent-500/30' : 'text-gray-500 border-white/10 hover:text-gray-300 hover:bg-white/10'}
                        `}
                        title="Mark complete"
                    >
                        <CheckCircle2 size={20} />
                    </button>
                </div>
            </div>

            {/* Expandable Pomodoro List & Details */}
            {isExpanded && (
                <div className="flex flex-col gap-3 pl-10 pr-4 pt-4 pb-4 animate-in slide-in-from-top-2 fade-in duration-300">

                    {/* Chapters/Subjects & Notes */}
                    {((block.subjects && block.subjects.length > 0) || (block.notes && block.notes.length > 0)) ? (
                        <div className="mb-2 bg-white/5 rounded-lg p-3 border border-white/5">
                            {block.subjects && block.subjects.length > 0 && (
                                <div className="mb-3 last:mb-0">
                                    <h5 className="text-[10px] uppercase tracking-widest text-gray-400 mb-1.5 font-bold">Chapters / Topics</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {block.subjects.map(sub => (
                                            <span key={sub} className="text-xs bg-charcoal-900 border border-white/10 text-gray-300 px-2 py-1 rounded">
                                                {sub}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {block.notes && block.notes.length > 0 && (
                                <div className="last:mb-0">
                                    <h5 className="text-[10px] uppercase tracking-widest text-gray-400 mb-1.5 font-bold">Notes</h5>
                                    <ul className="text-xs text-gray-400 list-disc list-inside space-y-1">
                                        {block.notes.map((note, idx) => (
                                            <li key={idx}>{note}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : null}

                    {/* Pomodoros Validation Check */}
                    {(!block.pomodoroConfig || block.mode !== 'pomodoro') ? (
                        <div className="text-gray-500 text-sm italic py-2">
                            {block.mode === 'time-range' ? 'Fixed time range execution.' : 'No Pomodoros configured for this block.'}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1">
                            <h5 className="text-[10px] uppercase tracking-widest text-gray-400 mb-1 font-bold pl-2">Pomodoro Breakdown</h5>
                            {Array.from({ length: block.pomodoroConfig.cycles }).map((_, i) => {
                                const workActive = isPomodoroActive(i, 'work');
                                const breakActive = isPomodoroActive(i, 'break');
                                const workCompleted = isPomodoroCompleted(i, 'work');
                                const breakCompleted = isPomodoroCompleted(i, 'break');

                                return (
                                    <React.Fragment key={i}>
                                        {/* Work Session */}
                                        <div className={`flex items-center justify-between p-3 rounded-lg border-l-2 transition-colors ${workActive ? 'bg-accent-500/10 border-accent-500 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]' : 'bg-white/5 border-transparent'} ${workCompleted ? 'opacity-50' : ''}`}>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${workActive ? 'bg-accent-500 animate-pulse' : 'bg-gray-600'}`} />
                                                <span className={`text-sm font-medium ${workActive ? 'text-accent-500' : 'text-gray-300'}`}>
                                                    P{i + 1} — Work ({block.pomodoroConfig!.workDuration}m) {workActive ? ' - Running' : (workCompleted ? ' - Completed' : ' - Pending')}
                                                </span>
                                            </div>
                                            <div>
                                                {workCompleted && <CheckCircle2 size={16} className="text-accent-500" />}
                                            </div>
                                        </div>

                                        {/* Break Session (Skip after last pomodoro unless specified) */}
                                        {i < block.pomodoroConfig!.cycles - 1 && (
                                            <div className={`flex items-center justify-between p-3 rounded-lg border-l-2 transition-colors ${breakActive ? 'bg-blue-500/10 border-blue-500 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]' : 'bg-transparent border-transparent'} ${breakCompleted ? 'opacity-50' : ''}`}>
                                                <div className="flex items-center gap-3 pl-5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                                                    <span className={`text-sm ${breakActive ? 'text-blue-400 font-medium' : 'text-gray-500'}`}>
                                                        Break {i + 1} ({block.pomodoroConfig!.breakDuration}m) {breakActive ? ' - Running' : ''}
                                                    </span>
                                                </div>
                                                <div>
                                                    {breakCompleted && <CheckCircle2 size={16} className="text-blue-500 opacity-50" />}
                                                </div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
