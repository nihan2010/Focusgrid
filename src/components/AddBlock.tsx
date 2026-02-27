import React, { useState } from 'react';
import { Check, X, Info } from 'lucide-react';
import { useStore } from '../stores/useStore';
import type { Block } from '../types';

interface AddBlockProps {
    targetDay: string;
    onCancel: () => void;
}

export const AddBlock: React.FC<AddBlockProps> = ({ targetDay, onCancel }) => {
    const { addBlock } = useStore();

    // Core Block Settings
    const [title, setTitle] = useState('');
    const [type, setType] = useState<Block['type']>('Study');
    const [durationMinutes, setDurationMinutes] = useState(50);

    // Pomodoro settings (Only for Study / Marathon blocks)
    const [isMarathonBlock, setIsMarathonBlock] = useState(type === 'Study');
    const [pomodorosCount, setPomodorosCount] = useState(1);
    const [workDuration, setWorkDuration] = useState(50);
    const [breakDuration, setBreakDuration] = useState(10);

    // Subjects & Notes
    const [subjects, setSubjects] = useState<string[]>([]);
    const [subjectInput, setSubjectInput] = useState('');

    const [notes, setNotes] = useState<string[]>([]);
    const [noteInput, setNoteInput] = useState('');

    const calculateTotalDuration = () => {
        if (isMarathonBlock) {
            const totalWork = pomodorosCount * workDuration;
            const totalBreak = Math.max(0, (pomodorosCount - 1) * breakDuration);
            return totalWork + totalBreak;
        }
        return durationMinutes;
    };

    const handleSave = async () => {
        if (!title.trim()) return;

        const finalDuration = calculateTotalDuration();
        if (finalDuration <= 0) return;

        const newBlock: Block = {
            id: crypto.randomUUID(),
            title: title.trim(),
            type,
            durationMinutes: finalDuration,
            completed: false,
            ...(isMarathonBlock && {
                isMarathonBlock: true,
                pomodorosCount,
                workDuration,
                breakDuration
            }),
            ...(subjects.length > 0 && { subjects }),
            ...(notes.length > 0 && { notes })
        };

        // Note: activeTab target in App.tsx passes string like 'add-block:today' -> targetDay='today'
        const validTarget = targetDay === 'tomorrow' ? 'tomorrow' : 'today';
        await addBlock(validTarget, newBlock);

        // Go back
        onCancel();
    };

    const addSubject = () => {
        if (subjectInput.trim() && !subjects.includes(subjectInput.trim())) {
            setSubjects([...subjects, subjectInput.trim()]);
            setSubjectInput('');
        }
    };

    const addNote = () => {
        if (noteInput.trim()) {
            setNotes([...notes, noteInput.trim()]);
            setNoteInput('');
        }
    };

    // Auto-update default Marathon status
    React.useEffect(() => {
        if (type === 'Study') setIsMarathonBlock(true);
        else setIsMarathonBlock(false);
    }, [type]);


    return (
        <div className="flex flex-col gap-8 pb-12 animate-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">

            <header className="flex justify-between items-end pb-4 border-b border-white/10 shrink-0">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Create New Block</h2>
                    <p className="text-gray-400">Scheduling for <span className="text-white font-medium capitalize">{targetDay}</span></p>
                </div>
            </header>

            <div className="flex flex-col gap-6">

                {/* 1. Core Configuration */}
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Core Settings</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-full">
                            <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-widest">Title</label>
                            <input
                                autoFocus
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="E.g., Deep Focus on Algorithms"
                                className="w-full bg-charcoal-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-widest">Type</label>
                            <select
                                value={type}
                                onChange={e => setType(e.target.value as Block['type'])}
                                className="w-full bg-charcoal-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent-500 transition-colors"
                            >
                                <option value="Study">Study (Focus Work)</option>
                                <option value="Break">Break</option>
                                <option value="Fitness">Fitness</option>
                                <option value="Prayer">Prayer</option>
                                <option value="Review">Review</option>
                            </select>
                        </div>

                        {!isMarathonBlock && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-widest">Duration (Minutes)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={durationMinutes}
                                    onChange={e => setDurationMinutes(parseInt(e.target.value) || 0)}
                                    className="w-full bg-charcoal-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent-500 transition-colors"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Pomodoro / Marathon Configuration */}
                {isMarathonBlock && (
                    <div className="glass-panel p-6 border border-accent-500/10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-accent-500">Pomodoro Breakdown</h3>
                            <span className="text-xs bg-accent-500/20 text-accent-500 px-2 py-1 rounded font-bold">{calculateTotalDuration()} mins total</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-widest">Sessions</label>
                                <input
                                    type="number"
                                    min="1" max="20"
                                    value={pomodorosCount}
                                    onChange={e => setPomodorosCount(parseInt(e.target.value) || 1)}
                                    className="w-full bg-charcoal-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-widest">Work (mins)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={workDuration}
                                    onChange={e => setWorkDuration(parseInt(e.target.value) || 1)}
                                    className="w-full bg-charcoal-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-widest">Break (mins)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={breakDuration}
                                    onChange={e => setBreakDuration(parseInt(e.target.value) || 0)}
                                    className="w-full bg-charcoal-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Pomodoro Preview Array */}
                        <div className="bg-charcoal-900/50 rounded-lg p-4 border border-white/5 max-h-48 overflow-y-auto">
                            <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                                <Info size={12} /> Live Preview
                            </h4>
                            <div className="flex flex-col gap-2">
                                {Array.from({ length: Math.min(pomodorosCount, 50) }).map((_, i) => (
                                    <React.Fragment key={i}>
                                        <div className="flex items-center text-sm gap-4 py-1">
                                            <span className="text-accent-500 font-bold w-12">P{i + 1}</span>
                                            <span className="text-white flex-1">Focus Work</span>
                                            <span className="text-gray-400">{workDuration}m</span>
                                        </div>
                                        {i < pomodorosCount - 1 && (
                                            <div className="flex items-center text-sm gap-4 py-1">
                                                <span className="text-blue-500 font-bold w-12">Break</span>
                                                <span className="text-gray-400 flex-1">Short Break</span>
                                                <span className="text-gray-500">{breakDuration}m</span>
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Metadata */}
                <div className="glass-panel p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Metadata & Topics</h3>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-widest">Chapters / Topics</label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={subjectInput}
                                onChange={e => setSubjectInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubject())}
                                placeholder="E.g., Calculus Ch. 4"
                                className="flex-1 bg-charcoal-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent-500 transition-colors"
                            />
                            <button onClick={addSubject} className="bg-white/10 text-white px-4 rounded-lg hover:bg-white/20 transition-colors">
                                Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {subjects.map(sub => (
                                <span key={sub} className="flex items-center gap-2 bg-charcoal-900 border border-white/10 text-gray-300 px-3 py-1.5 rounded-lg text-sm">
                                    {sub}
                                    <button onClick={() => setSubjects(subjects.filter(s => s !== sub))} className="text-gray-500 hover:text-red-400">
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-widest">Strategy Notes</label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={noteInput}
                                onChange={e => setNoteInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addNote())}
                                placeholder="Add a bullet point..."
                                className="flex-1 bg-charcoal-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent-500 transition-colors"
                            />
                            <button onClick={addNote} className="bg-white/10 text-white px-4 rounded-lg hover:bg-white/20 transition-colors">
                                Add
                            </button>
                        </div>
                        <div className="flex flex-col gap-2">
                            {notes.map((note, idx) => (
                                <div key={idx} className="flex items-start gap-3 bg-charcoal-900/50 border border-white/5 text-gray-300 p-3 rounded-lg text-sm">
                                    <span className="text-accent-500 mt-1">•</span>
                                    <span className="flex-1">{note}</span>
                                    <button onClick={() => setNotes(notes.filter((_, i) => i !== idx))} className="text-gray-500 hover:text-red-400 shrink-0">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* 4. Actions */}
                <div className="flex justify-end gap-4 mt-4">
                    <button
                        onClick={onCancel}
                        className="px-6 py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!title.trim() || calculateTotalDuration() <= 0}
                        className="flex items-center gap-2 px-8 py-3 bg-accent-500 text-charcoal-950 font-bold rounded-xl hover:bg-accent-600 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Check size={20} />
                        Save Block
                    </button>
                </div>

            </div>
        </div>
    );
};
