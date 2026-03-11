"use client";

/**
 * useOrderSound — plays a pleasant "ding" notification sound
 * using the Web Audio API (no external files needed).
 * Also requests browser notification permission on mount.
 */

let sharedCtx: AudioContext | null = null;

export async function playOrderSound() {
    if (typeof window === "undefined") return;

    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) {
            console.warn("AudioContext not supported in this browser");
            return;
        }

        if (!sharedCtx || sharedCtx.state === 'closed') {
            sharedCtx = new AudioContextClass();
        }
        const ctx = sharedCtx;

        if (ctx.state === "suspended") {
            await ctx.resume();
        }

        // Use more standard frequencies (C5, E5, G5)
        const playTone = (freq: number, startTime: number, duration: number, gain: number) => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, startTime);

            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

            osc.start(startTime);
            osc.stop(startTime + duration);
        };

        const now = ctx.currentTime;
        playTone(523.25, now, 0.5, 0.4);       // C5
        playTone(659.25, now + 0.12, 0.5, 0.3); // E5
        playTone(783.99, now + 0.24, 0.7, 0.3); // G5

        console.log("Order sound played successfully. State:", ctx.state);
    } catch (err) {
        console.error("Audio playback failed definitively:", err);
    }
}

export async function requestNotificationPermission() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
        await Notification.requestPermission();
    }
}

export function showBrowserNotification(title: string, body: string) {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    new Notification(title, {
        body,
        icon: "/admin-logo.png",
        badge: "/admin-logo.png",
        tag: "new-order",
        requireInteraction: true,
    });
}
