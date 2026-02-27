import React from 'react';
import { useStore } from '../stores/useStore';
import { BlockItem } from './BlockItem';
import type { Block } from '../types';

interface TimelineProps {
    isToday: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({ isToday }) => {
    const { today, tomorrow, addBlock } = useStore();
    const [expandedBlockId, setExpandedBlockId] = React.useState<string | null>(null);

    const target = isToday ? 'today' : 'tomorrow';
    const record = isToday ? today : tomorrow;

    if (!record) return null;

    return (
        <div className="flex flex-col gap-3 h-full overflow-y-auto pr-2 pb-24">
            {record.blocks.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
                    <p className="text-gray-400 mb-4">No schedule set for {target}.</p>
                    <button
                        onClick={() => {
                            // Quick start default template
                            const defaultBlocks: Block[] = [
                                { id: crypto.randomUUID(), title: 'Deep Work Session', type: 'study', mode: 'pomodoro', pomodoroConfig: { cycles: 1, workDuration: 50, breakDuration: 10 }, durationMinutes: 50 },
                                { id: crypto.randomUUID(), title: 'Short Break', type: 'break', mode: 'time-range', durationMinutes: 10 },
                                { id: crypto.randomUUID(), title: 'Deep Work Session', type: 'study', mode: 'pomodoro', pomodoroConfig: { cycles: 1, workDuration: 50, breakDuration: 10 }, durationMinutes: 50 },
                            ];
                            defaultBlocks.forEach(b => addBlock(target, b));
                        }}
                        className="text-accent-500 hover:text-accent-400 font-medium"
                    >
                        Auto-fill Template
                    </button>
                </div>
            ) : (
                record.blocks.map((block) => (
                    <BlockItem
                        key={block.id}
                        block={block}
                        isToday={isToday}
                        isExpanded={expandedBlockId === block.id}
                        onToggleExpand={() => setExpandedBlockId(prev => prev === block.id ? null : block.id)}
                    />
                ))
            )}

            {/* Extra space at bottom so we can easily scroll past the last block */}
            <div className="h-4 pointer-events-none" />
        </div>
    );
};
