/**
 * One-time audio permission flag.
 * Once the user grants audio permission via any user gesture,
 * we persist it so we never need to show the permission banner again.
 */

const AUDIO_KEY = 'fg-audio-unlocked';

export function isAudioPermissionGranted(): boolean {
    return localStorage.getItem(AUDIO_KEY) === 'true';
}

export function markAudioPermissionGranted(): void {
    localStorage.setItem(AUDIO_KEY, 'true');
}
