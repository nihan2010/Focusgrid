import React from 'react';
import { ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => (
    <footer className="mt-auto pt-8 pb-4 px-8 border-t border-[var(--surface-border)]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-[11px] text-[var(--surface-muted)] font-medium tracking-wide">
            <span>Made from Kerala with <span className="text-red-400">❤</span></span>
            <span className="hidden sm:inline opacity-30">·</span>
            <span>© 2026 FocusGrid</span>
            <span className="hidden sm:inline opacity-30">·</span>
            <a
                href="https://nihannajeeb.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-accent-500 transition-colors duration-200 group"
            >
                nihannajeeb.in
                <ExternalLink size={10} className="opacity-0 group-hover:opacity-70 transition-opacity duration-200" />
            </a>
        </div>
    </footer>
);
