import React from 'react';

import { getTreeStage, TREE_STAGE_LABELS } from '../lib/treeEngine';

interface FocusTreeProps {
    progress: number; // 0 to 100
    isDamaged?: boolean;
    showLabel?: boolean;
}

export const FocusTree: React.FC<FocusTreeProps> = ({ progress, isDamaged = false, showLabel = false }) => {
    const stage = getTreeStage(progress);
    const stageLabel = TREE_STAGE_LABELS[stage];
    // Map progress to growth stage
    const scale = 0.5 + Math.min(progress / 100, 1) * 0.5;
    const opacity = 0.3 + Math.min(progress / 100, 1) * 0.7;

    const leafColor1 = isDamaged ? '#f87171' : 'var(--color-accent-500)';
    const leafColor2 = isDamaged ? '#dc2626' : 'var(--color-accent-600)';
    const leafColor3 = isDamaged ? '#b91c1c' : '#10b981';

    // We can also make the trunk look damaged
    const trunkColor = isDamaged ? '#7f1d1d' : '#4b5563';

    return (
        <div className="w-full h-full relative flex flex-col items-center justify-end">
            <div className="flex-1 w-full relative flex items-end justify-center">
                {/* Base/Pot */}
                <div className="w-16 h-4 bg-charcoal-800 rounded-t-lg absolute bottom-0 z-20" />

                {/* SVG Canvas */}
                <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full absolute bottom-4 px-4 overflow-visible origin-bottom transition-all duration-1000 ease-out"
                    style={{ transform: `scale(${scale})`, opacity }}
                >
                    <path d="M 50 100 Q 50 70 50 40" stroke={trunkColor} strokeWidth="6" strokeLinecap="round" fill="none" />
                    {progress > 20 && <path d="M 50 70 Q 30 60 25 45" stroke={trunkColor} strokeWidth="4" strokeLinecap="round" fill="none" className="animate-in fade-in zoom-in duration-1000 origin-bottom" />}
                    {progress > 40 && <path d="M 50 60 Q 75 50 80 35" stroke={trunkColor} strokeWidth="3" strokeLinecap="round" fill="none" className="animate-in fade-in zoom-in duration-1000 origin-bottom" />}
                    {progress > 30 && <circle cx="25" cy="45" r="8" fill={leafColor1} className={`animate-in fade-in zoom-in duration-1000 origin-center ${isDamaged ? '' : 'drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} />}
                    {progress > 50 && <circle cx="80" cy="35" r="10" fill={leafColor2} className={`animate-in fade-in zoom-in duration-1000 origin-center ${isDamaged ? '' : 'drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} />}
                    {progress > 70 && <circle cx="40" cy="35" r="14" fill={leafColor1} className={`animate-in fade-in zoom-in duration-1000 origin-center ${isDamaged ? '' : 'drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]'}`} />}
                    {progress > 85 && <circle cx="60" cy="30" r="15" fill={leafColor2} className={`animate-in fade-in zoom-in duration-1000 origin-center ${isDamaged ? '' : 'drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]'}`} />}
                    {progress >= 99 && <circle cx="50" cy="20" r="18" fill={leafColor3} className={`animate-in fade-in zoom-in duration-1000 origin-center ${isDamaged ? '' : 'drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]'}`} />}
                </svg>
            </div>

            {showLabel && (
                <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 text-center ${isDamaged ? 'text-red-400' : 'text-accent-500'}`}>
                    {stageLabel}
                </p>
            )}
        </div>
    );
};
