import type { AlarmConfig } from '../types';

class AudioManager {
    private ctx: AudioContext | null = null;
    private customAudioCache: Map<string, AudioBuffer> = new Map();

    private getContext(): AudioContext {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return this.ctx;
    }

    // Request implicit activation (must be called on user interaction like a button click)
    public async init() {
        const ctx = this.getContext();
        if (ctx.state === 'suspended') {
            await ctx.resume();
        }
    }

    public get isReady(): boolean {
        return this.ctx !== null && this.ctx.state === 'running';
    }

    public async preloadCustomSound(id: string, base64Data: string) {
        const ctx = this.getContext();
        try {
            const arrayBuffer = this.base64ToArrayBuffer(base64Data);
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
            this.customAudioCache.set(id, audioBuffer);
        } catch (e) {
            console.error('Failed to decode custom sound', e);
        }
    }

    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const bString = window.atob(base64.split(',')[1] || base64);
        const len = bString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = bString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    // Vibration fallback
    private vibrate(pattern: number[]) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    public async playAlarm(config: AlarmConfig, globalVolume: number, vibrationEnabled: boolean) {
        if (!config.enabled) return;

        await this.init(); // ensure context is running

        if (vibrationEnabled) {
            this.vibrate([200, 100, 200, 100, 500]);
        }

        if (config.soundType === 'custom' && config.customSoundData) {
            // Play custom
            await this.playCustomBuffer(config.customSoundData, globalVolume);
        } else {
            // Play synthetic
            this.playSyntheticTone(config.syntheticTone, globalVolume);
        }
    }

    private async playCustomBuffer(base64Data: string, volume: number) {
        const ctx = this.getContext();
        // Use a quick hash/id for cache. For simplicity, we just decode on fly if not cached.
        const arr = this.base64ToArrayBuffer(base64Data);
        const buffer = await ctx.decodeAudioData(arr);

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const gainNode = ctx.createGain();
        gainNode.gain.value = volume;

        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start(0);
    }

    private playSyntheticTone(tone: string, volume: number) {
        const ctx = this.getContext();
        const t = ctx.currentTime;

        const playOsc = (freq: number, type: OscillatorType, startTime: number, duration: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, startTime);

            osc.connect(gain);
            gain.connect(ctx.destination);

            // Envelope
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(volume, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

            osc.start(startTime);
            osc.stop(startTime + duration);
        };

        switch (tone) {
            case 'urgent':
                // Fast repeating high pitched
                for (let i = 0; i < 6; i++) {
                    playOsc(900, 'square', t + (i * 0.15), 0.1);
                }
                break;
            case 'chime':
                // Soft ascending chord
                playOsc(523.25, 'sine', t, 1);   // C5
                playOsc(659.25, 'sine', t + 0.1, 1); // E5
                playOsc(783.99, 'sine', t + 0.2, 1); // G5
                break;
            case 'gong':
                playOsc(200, 'triangle', t, 2.5);
                playOsc(203, 'sine', t, 2.5); // slight detuning
                break;
            case 'digital':
                playOsc(600, 'square', t, 0.2);
                playOsc(800, 'square', t + 0.2, 0.2);
                playOsc(600, 'square', t + 0.4, 0.4);
                break;
            case 'classic':
            default:
                playOsc(800, 'square', t, 0.1);
                playOsc(800, 'square', t + 0.2, 0.1);
                playOsc(800, 'square', t + 0.4, 0.5);
                break;
        }
    }
}

export const audioManager = new AudioManager();
