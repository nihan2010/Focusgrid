import React, { useState, useRef, useEffect } from 'react';
import { Maximize2, X, Pause } from 'lucide-react';
import type { Block } from '../types';
import type { MarathonState } from '../lib/marathonEngine';
import { useStore } from '../stores/useStore';

interface MiniPlayerProps {
    activeBlock: Block;
    isMarathonActive: boolean;
    marathonState: MarathonState | null;
    minutes: number;
    seconds: number;
    progressPercent: number;
    treeProgress: number;
    onExpand: () => void;
    onStop: () => void;
}

const DesktopMiniPlayer: React.FC<MiniPlayerProps & { pos: { x: number, y: number }, isDragging: boolean, handlePointerDown: any, handlePointerMove: any, handlePointerUp: any, playerRef: any, isAlarming: boolean, phaseLabel: string, isBreak: boolean }> = ({
    activeBlock,
    minutes,
    seconds,
    progressPercent,
    onExpand,
    onStop,
    pos,
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    playerRef,
    isAlarming,
    phaseLabel,
    isBreak
}) => (
    <div
        ref={playerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
            transform: `translate(${pos.x}px, ${pos.y}px)`,
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none'
        }}
        className={`fixed top-0 left-0 z-[100] w-72 hidden lg:flex glass-panel border border-white/10 shadow-2xl flex-col overflow-hidden transition-[border-color,box-shadow,transform]
            ${isDragging ? 'rotate-1 scale-105 shadow-accent-500/20' : 'duration-300'}
            ${isAlarming ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse' : ''}
        `}
    >
        <div className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/5">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest truncate flex-1 pr-2">
                {activeBlock.title}
            </span>
            <div className="flex items-center gap-1">
                <button onClick={onExpand} className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors">
                    <Maximize2 size={14} />
                </button>
                <button onClick={onStop} className="text-gray-400 hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-colors">
                    <X size={16} />
                </button>
            </div>
        </div>
        <div className={`p-4 flex items-center justify-between relative overflow-hidden ${isBreak ? 'bg-blue-900/10' : 'bg-accent-900/5'}`}>
            <div className="flex flex-col relative z-10">
                <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isBreak ? 'text-blue-400' : 'text-accent-500'}`}>
                    {phaseLabel}
                </span>
                <div className="text-4xl font-black text-white tabular-nums tracking-tighter leading-none">
                    {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </div>
            </div>
            <button
                onClick={onStop}
                className={`z-10 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border ${isBreak ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-accent-500/20 border-accent-500/50 text-accent-500'}`}
            >
                <Pause size={18} fill="currentColor" />
            </button>
        </div>
        <div className="h-1 bg-white/5 w-full">
            <div className={`h-full transition-all duration-1000 ease-linear ${isBreak ? 'bg-blue-500' : 'bg-accent-500'}`} style={{ width: `${progressPercent}%` }} />
        </div>
    </div>
);

const MobileMiniPlayer: React.FC<MiniPlayerProps & { isAlarming: boolean, phaseLabel: string, isBreak: boolean }> = ({
    activeBlock,
    minutes,
    seconds,
    progressPercent,
    onExpand,
    onStop,
    isAlarming,
    phaseLabel,
    isBreak
}) => (
    <div className={`fixed bottom-[90px] inset-x-4 z-[50] lg:hidden glass-panel border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-500
        ${isAlarming ? 'border-red-500 animate-pulse' : ''}
    `}>
        <div className={`p-4 flex items-center justify-between relative overflow-hidden ${isBreak ? 'bg-blue-900/10' : 'bg-accent-900/5'}`}>
            <div className="flex flex-col relative z-10">
                <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isBreak ? 'text-blue-400' : 'text-accent-500'}`}>
                        {phaseLabel}
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold truncate max-w-[120px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                        {activeBlock.title}
                    </span>
                </div>
                <div className="text-3xl font-black text-white tabular-nums tracking-tighter leading-none">
                    {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </div>
            </div>
            <div className="flex items-center gap-3 relative z-10">
                <button
                    onClick={onExpand}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-gray-400 active:scale-95"
                >
                    <Maximize2 size={18} />
                </button>
                <button
                    onClick={onStop}
                    className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border shadow-lg active:scale-95 ${isBreak ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-accent-500/20 border-accent-500/50 text-accent-500'}`}
                >
                    <Pause size={20} fill="currentColor" />
                </button>
            </div>
        </div>
        <div className="h-1 bg-white/5 w-full">
            <div className={`h-full transition-all duration-1000 ease-linear ${isBreak ? 'bg-blue-500' : 'bg-accent-500'}`} style={{ width: `${progressPercent}%` }} />
        </div>
    </div>
);

export const MiniPlayer: React.FC<MiniPlayerProps> = (props) => {
    const { activeAlarmInfo } = useStore();
    const isAlarming = !!activeAlarmInfo;

    const [pos, setPos] = useState(() => {
        const saved = localStorage.getItem('miniPlayerPos');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { }
        }
        return { x: 40, y: 40 }; // Safer default
    });

    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const elementStartPos = useRef({ x: 0, y: 0 });
    const playerRef = useRef<HTMLDivElement>(null);

    // Initial boundary check in case window resized
    useEffect(() => {
        if (!playerRef.current) return;
        const width = playerRef.current.offsetWidth;
        const height = playerRef.current.offsetHeight;

        let newX = pos.x;
        let newY = pos.y;

        if (newX + width > window.innerWidth) newX = window.innerWidth - width - 20;
        if (newY + height > window.innerHeight) newY = window.innerHeight - height - 20;
        if (newX < 0) newX = 20;
        if (newY < 0) newY = 20;

        if (newX !== pos.x || newY !== pos.y) {
            setPos({ x: newX, y: newY });
        }
    }, []);

    const handlePointerDown = (e: React.PointerEvent) => {
        if ((e.target as HTMLElement).closest('button')) return;
        setIsDragging(true);
        dragStartPos.current = { x: e.clientX, y: e.clientY };
        elementStartPos.current = { ...pos };
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !playerRef.current) return;

        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;

        let newX = elementStartPos.current.x + dx;
        let newY = elementStartPos.current.y + dy;

        const width = playerRef.current.offsetWidth;
        const height = playerRef.current.offsetHeight;

        // Window bounds
        newX = Math.max(0, Math.min(newX, window.innerWidth - width));
        newY = Math.max(0, Math.min(newY, window.innerHeight - height));

        setPos({ x: newX, y: newY });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!isDragging) return;
        setIsDragging(false);
        localStorage.setItem('miniPlayerPos', JSON.stringify(pos));
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    const isBreak = props.isMarathonActive ? props.marathonState?.phase === 'break' : props.activeBlock.type === 'break';
    const phaseLabel = props.isMarathonActive
        ? (isBreak ? 'Break' : `Pomodoro ${props.marathonState?.pomodoroIndex ? props.marathonState.pomodoroIndex + 1 : 1}`)
        : props.activeBlock.type;

    return (
        <>
            <DesktopMiniPlayer
                {...props}
                pos={pos}
                isDragging={isDragging}
                handlePointerDown={handlePointerDown}
                handlePointerMove={handlePointerMove}
                handlePointerUp={handlePointerUp}
                playerRef={playerRef}
                isAlarming={isAlarming}
                phaseLabel={phaseLabel}
                isBreak={isBreak}
            />
            <MobileMiniPlayer
                {...props}
                isAlarming={isAlarming}
                phaseLabel={phaseLabel}
                isBreak={isBreak}
            />
        </>
    );
};
