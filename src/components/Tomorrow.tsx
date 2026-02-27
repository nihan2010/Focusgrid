import React from 'react';
import { useStore } from '../stores/useStore';
import { Timeline } from './Timeline';

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
                    <Timeline isToday={false} />
                </div>
            </div>
        </div>
    );
};
