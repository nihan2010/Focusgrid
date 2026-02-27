/**
 * FocusGrid Notification Manager
 *
 * Handles browser/PWA system notifications.
 * Routes through the Service Worker when available (works in background tabs),
 * falls back to the Notification API directly for older environments.
 *
 * Browser limitation: notifications do NOT fire if the browser is fully closed.
 * Tab minimized / window unfocused = works fine.
 */

const NOTIF_ASKED_KEY = 'notifAsked';
const NOTIF_PERMISSION_KEY = 'notifPermission';

export type NotifEventType =
    | 'pomodoroStart'
    | 'pomodoroEnd'
    | 'breakStart'
    | 'breakEnd'
    | 'blockEnd'
    | 'dayComplete';



class NotificationManager {
    private swRegistration: ServiceWorkerRegistration | null = null;
    private hardModeInterval: ReturnType<typeof setInterval> | null = null;

    /** Called once on app boot — registers the SW */
    async registerServiceWorker(): Promise<void> {
        if (!('serviceWorker' in navigator)) return;
        try {
            this.swRegistration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
            // Wait for the SW to be active
            await navigator.serviceWorker.ready;
            this.swRegistration = await navigator.serviceWorker.ready.then(r => r) as ServiceWorkerRegistration;
        } catch (err) {
            console.warn('[FocusGrid] SW registration failed:', err);
        }
    }

    /** Returns true if the user has already been asked */
    hasBeenAsked(): boolean {
        return localStorage.getItem(NOTIF_ASKED_KEY) === 'true';
    }

    /** Returns true if permission was granted */
    isGranted(): boolean {
        return (
            localStorage.getItem(NOTIF_PERMISSION_KEY) === 'granted' &&
            Notification.permission === 'granted'
        );
    }

    /** Mark that we've asked — so we never ask again */
    markAsked(): void {
        localStorage.setItem(NOTIF_ASKED_KEY, 'true');
    }

    /** Request OS permission (requires user gesture) */
    async requestPermission(): Promise<boolean> {
        this.markAsked();
        if (!('Notification' in window)) return false;
        const perm = await Notification.requestPermission();
        const granted = perm === 'granted';
        if (granted) {
            localStorage.setItem(NOTIF_PERMISSION_KEY, 'granted');
        }
        return granted;
    }

    /** Send a notification — via SW (background-safe) or direct fallback */
    async send(title: string, options: any): Promise<void> {
        if (!this.isGranted()) return;

        const finalOptions = {
            ...options,
            icon: options.icon || '/logo.png',
            badge: options.badge || '/logo.png',
            vibrate: options.vibrate ?? [200, 100, 200],
            requireInteraction: options.requireInteraction ?? false,
            tag: options.tag ?? 'focusgrid',
            renotify: true,
        };

        // Prefer service worker (background-safe)
        const sw = this.swRegistration?.active ?? (await navigator.serviceWorker?.ready?.then(r => r.active) ?? null);
        if (sw) {
            sw.postMessage({
                type: 'SHOW_NOTIFICATION',
                title,
                options: finalOptions
            });
        } else if ('Notification' in window && Notification.permission === 'granted') {
            // Fallback for browsers without SW support
            new Notification(title, finalOptions);
        }
    }

    /** Convenience factories for each event type */
    async notifyPomodoroStart(blockName: string, label: string, durationMin: number): Promise<void> {
        await this.send('FocusGrid \u2014 Work Session Started', {
            body: `${blockName} \u2022 ${label} (${durationMin}m)`,
            tag: 'fg-session-start',
        });
    }

    async notifyPomodoroEnd(blockName: string, label: string): Promise<void> {
        await this.send('Work Session Complete \u2714', {
            body: `${blockName} \u2022 ${label} \u2014 Time for a break.`,
            tag: 'fg-session-end',
        });
    }

    async notifyBreakStart(durationMin: number): Promise<void> {
        await this.send('Break Time.', {
            body: `Rest for ${durationMin} minutes. You earned it.`,
            tag: 'fg-break-start',
        });
    }

    async notifyBreakEnd(): Promise<void> {
        await this.send('Break Over \u2014 Get Back to Work.', {
            body: 'Your break has ended. Time to execute.',
            tag: 'fg-break-end',
            requireInteraction: false,
        });
    }

    async notifyDayComplete(): Promise<void> {
        await this.send('\ud83c\udf33 Day Complete!', {
            body: 'Outstanding commitment. Your tree has grown.',
            tag: 'fg-day-complete',
            requireInteraction: false,
        });
    }

    /** Hard Mode: repeat notification every 15s until stopped */
    startHardModeAlert(blockName: string, label: string): void {
        this.stopHardModeAlert();
        const fire = () => this.send('\ud83d\udd14 FocusGrid \u2014 Session Waiting', {
            body: `${blockName} \u2022 ${label} \u2014 Tap to start your session.`,
            tag: 'fg-hardmode-alert',
            requireInteraction: true,
            vibrate: [300, 100, 300, 100, 600],
        });
        fire();
        this.hardModeInterval = setInterval(fire, 15_000);
    }

    stopHardModeAlert(): void {
        if (this.hardModeInterval) {
            clearInterval(this.hardModeInterval);
            this.hardModeInterval = null;
        }
    }
}

export const notificationManager = new NotificationManager();
