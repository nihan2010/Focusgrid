import React, { useState } from 'react';
import { useStore } from '../stores/useStore';
import { WeeklyChart } from './WeeklyChart';
import { FocusTree } from './FocusTree';
import { format, parseISO } from 'date-fns';
import { X, ChevronRight, Clock, Target, TreePine } from 'lucide-react';
import type { DayRecord } from '../types';
import { TREE_STAGE_LABELS } from '../lib/treeEngine';

const STAGE_COLORS: Record<string, string> = {
    seed: 'text-gray-400 bg-gray-400/10 border-gray-500/20',
    sprout: 'text-lime-400 bg-lime-400/10 border-lime-500/20',
    young: 'text-green-400 bg-green-400/10 border-green-500/20',
    strong: 'text-accent-500 bg-accent-500/10 border-accent-500/20',
    full: 'text-emerald-300 bg-emerald-300/10 border-emerald-400/20',
};

function DayDetailModal({ record, onClose }: { record: DayRecord; onClose: () => void }) {
    const label = format(parseISO(record.date), 'EEEE, MMMM d yyyy');
    return (
        <div className="fixed inset-0 z-50 bg-charcoal-950/90 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="glass-panel max-w-2xl w-full p-8 relative max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-300">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition-colors">
                    <X size={20} />
                </button>

                <h3 className="text-2xl font-bold text-white mb-1">{label}</h3>
                <p className="text-gray-400 text-sm mb-6 uppercase tracking-widest">Daily Report</p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Completion</p>
                        <p className="text-2xl font-bold text-accent-500">{Math.round(record.completionPercentage)}%</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Focus Time</p>
                        <p className="text-2xl font-bold text-white">{Math.round(record.totalStudyMinutes / 60 * 10) / 10}h</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Pomodoros</p>
                        <p className="text-2xl font-bold text-white">{record.completedPomodoros}<span className="text-gray-500 text-base">/{record.totalPomodoros}</span></p>
                    </div>
                </div>

                <div className="w-32 h-32 mx-auto mb-6">
                    <FocusTree progress={record.completionPercentage} isDamaged={record.skippedSessions > 0} />
                </div>

                {record.blocks.length > 0 && (
                    <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Blocks</h4>
                        <div className="space-y-2">
                            {record.blocks.map(block => (
                                <div key={block.id} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3">
                                    <span className="text-gray-200">{block.title}</span>
                                    <span className={`text-xs px-2 py-1 rounded border font-semibold ${block.completed ? 'text-accent-500 bg-accent-500/10 border-accent-500/20' : 'text-gray-500 bg-white/5 border-white/10'}`}>
                                        {block.completed ? 'Done' : 'Incomplete'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(record.reflection.worked || record.reflection.failed) && (
                    <div className="mt-6 bg-white/5 rounded-xl p-4 space-y-3">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Reflection</h4>
                        {record.reflection.worked && <p className="text-gray-300 text-sm">✅ {record.reflection.worked}</p>}
                        {record.reflection.failed && <p className="text-gray-300 text-sm">❌ {record.reflection.failed}</p>}
                        {record.reflection.improvement && <p className="text-gray-300 text-sm">💡 {record.reflection.improvement}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}

export const Archive: React.FC = () => {
    const { archivedRecords, streak } = useStore();
    const [selectedRecord, setSelectedRecord] = useState<DayRecord | null>(null);

    const totalHours = archivedRecords.reduce((sum, r) => sum + r.totalStudyMinutes, 0) / 60;
    const bestDay = archivedRecords.reduce<DayRecord | null>((best, r) =>
        !best || r.totalStudyMinutes > best.totalStudyMinutes ? r : best, null);

    return (
        <div className="flex flex-col flex-1 min-h-0 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {selectedRecord && (
                <DayDetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
            )}

            <header className="pb-4 border-b border-white/10 shrink-0">
                <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Archive</h2>
                <p className="text-gray-400">Your historical execution record.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0">
                <div className="lg:col-span-2 glass-panel p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Weekly Overview</h3>
                    <div className="h-64">
                        <WeeklyChart records={archivedRecords} />
                    </div>
                </div>

                <div className="glass-panel p-6 flex flex-col justify-center gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-xl text-center">
                            <p className="text-gray-400 text-xs tracking-widest uppercase mb-1">Total Hrs</p>
                            <p className="text-3xl font-bold text-white">{totalHours.toFixed(1)}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl text-center">
                            <p className="text-gray-400 text-xs tracking-widest uppercase mb-1">Streak</p>
                            <p className="text-3xl font-bold text-accent-500">{streak}</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl text-center col-span-2 border border-accent-500/20">
                            <p className="text-gray-400 text-xs tracking-widest uppercase mb-1">Best Day</p>
                            {bestDay ? (
                                <p className="text-lg font-bold text-white">
                                    {format(parseISO(bestDay.date), 'EEE, MMM d')}
                                    <span className="text-accent-500 text-sm ml-2">{(bestDay.totalStudyMinutes / 60).toFixed(1)}h</span>
                                </p>
                            ) : (
                                <p className="text-lg font-bold text-gray-500">—</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2 border-dashed flex items-center gap-2">
                    Historical Records
                    <span className="text-sm font-normal text-gray-500">({archivedRecords.length} days)</span>
                </h3>

                {archivedRecords.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-white/10 rounded-2xl text-center">
                        <TreePine size={48} className="text-gray-700 mb-4" />
                        <p className="text-gray-400 font-medium mb-2">No historical data yet.</p>
                        <p className="text-gray-600 text-sm max-w-xs">Complete your first day and the archive will update automatically at midnight.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pb-8">
                        {archivedRecords.map(record => {
                            const stageColor = STAGE_COLORS[record.treeStage] || STAGE_COLORS.seed;
                            const dateLabel = format(parseISO(record.date), 'MMM d');
                            const weekdayLabel = format(parseISO(record.date), 'EEE');
                            const hours = (record.totalStudyMinutes / 60).toFixed(1);
                            return (
                                <button
                                    key={record.date}
                                    onClick={() => setSelectedRecord(record)}
                                    className="glass-card p-4 flex flex-col gap-3 text-left hover:border-accent-500/30 hover:bg-white/5 transition-all group cursor-pointer"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-widest">{weekdayLabel}</p>
                                            <p className="text-sm font-bold text-white">{dateLabel}</p>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-600 group-hover:text-accent-500 transition-colors mt-1" />
                                    </div>

                                    <div className="w-full h-12 relative">
                                        <FocusTree progress={record.completionPercentage} isDamaged={record.skippedSessions > 0} />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500 flex items-center gap-1"><Target size={10} />Completion</span>
                                            <span className="text-xs font-bold text-white">{Math.round(record.completionPercentage)}%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={10} />Focus</span>
                                            <span className="text-xs font-bold text-white">{hours}h</span>
                                        </div>
                                    </div>

                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border text-center ${stageColor}`}>
                                        {TREE_STAGE_LABELS[record.treeStage]}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
