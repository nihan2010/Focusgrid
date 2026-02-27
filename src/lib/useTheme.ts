type Theme = 'dark' | 'light' | 'system';

const STORAGE_KEY = 'fg-theme';

function applyTheme(theme: Theme) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
    document.documentElement.classList.toggle('dark', isDark);
}

export function getStoredTheme(): Theme {
    return (localStorage.getItem(STORAGE_KEY) as Theme) || 'system';
}

export function setTheme(theme: Theme) {
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
    // Dispatch a custom event so any listener can react
    window.dispatchEvent(new CustomEvent('fg-theme-change', { detail: theme }));
}

import { useState, useEffect } from 'react';

export function useTheme() {
    const [theme, setThemeState] = useState<Theme>(getStoredTheme);
    const [resolved, setResolved] = useState<'dark' | 'light'>(() => {
        const t = getStoredTheme();
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return t === 'dark' || (t === 'system' && prefersDark) ? 'dark' : 'light';
    });

    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');

        const updateResolved = () => {
            const isDark = theme === 'dark' || (theme === 'system' && mq.matches);
            setResolved(isDark ? 'dark' : 'light');
        };

        updateResolved();
        mq.addEventListener('change', updateResolved);

        const onCustomChange = (e: Event) => {
            const newTheme = (e as CustomEvent<Theme>).detail;
            setThemeState(newTheme);
        };
        window.addEventListener('fg-theme-change', onCustomChange);

        return () => {
            mq.removeEventListener('change', updateResolved);
            window.removeEventListener('fg-theme-change', onCustomChange);
        };
    }, [theme]);

    const changeTheme = (t: Theme) => {
        setThemeState(t);
        setTheme(t);
    };

    return { theme, resolved, setTheme: changeTheme };
}
