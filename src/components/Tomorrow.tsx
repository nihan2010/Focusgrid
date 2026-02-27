import React from 'react';
import { useStore } from '../stores/useStore';
import { Timeline } from './Timeline';
import { Grid, FileJson, CopyPlus } from 'lucide-react';

export const Tomorrow: React.FC<{ setActiveTab?: (t: string) => void }> = ({ setActiveTab }) => {
    const { tomorrow } = useStore();

    if (!tomorrow) return null;

    return (
        <div className="flex flex-col flex-1 min-h-0 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-end pb-4 border-b border-white/10">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Tomorrow</h2>
                    <p className="text-gray-400">Prepare your battlefield in advance.</p>
                </div>
            </header>

            <div className="glass-panel p-6 flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Plan your session</h3>
                        <p className="text-sm text-gray-400">Set up time blocks now so you wake up with clear objectives.</p>
                    </div>
                    <button
                        onClick={() => setActiveTab?.('add-block:tomorrow')}
                        className="text-sm border border-white/20 text-white font-medium px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        + Add Block
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 pr-2">
                    {(!tomorrow.blocks || tomorrow.blocks.length === 0) ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 shadow-lg">
                                <Grid className="w-8 h-8 text-white/40" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">Tomorrow is empty.</h3>
                            <p className="text-gray-400 max-w-[260px] mx-auto mb-8">Set up time blocks now so you wake up with clear objectives.</p>

                            <div className="flex flex-col w-full max-w-[240px] gap-3">
                                <button
                                    onClick={() => setActiveTab?.('add-block:tomorrow')}
                                    className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/10"
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
                        <Timeline isToday={false} />
                    )}
                </div>
            </div>
        </div>
    );
};
