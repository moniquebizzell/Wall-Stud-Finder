/**
 * Audio synthesizer for metal detector alert beeps using Web Audio API
 */
class SoundAlertManager {
  private ctx: AudioContext | null = null;
  private isAlerting: boolean = false;
  private timerId: number | null = null;
  private volume: number = 0.8;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopAlert();
    }
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Plays a single industrial alarm beep tone
   * @param frequency Tone frequency in Hz (defaults to 1050 Hz)
   * @param duration Duration in seconds
   */
  public playBeep(frequency: number = 1050, duration: number = 0.12) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Industrial alert tone with square/sawtooth harmonics or crisp sine
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(frequency, now);

      // Attack and rapid decay to sound like an authentic digital hardware buzzer / TONE_PROP_BEEP
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(this.volume * 0.4, now + 0.015);
      gain.gain.setValueAtTime(this.volume * 0.4, now + duration - 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.01);
    } catch {
      // Audio context might still be blocked by browser policy
    }
  }

  /**
   * Starts continuous alert beeping when metal is detected
   */
  public startAlert(rateHz: number = 5) {
    if (this.isAlerting || this.isMuted) return;
    this.isAlerting = true;
    this.initContext();

    // Play immediate first beep
    this.playBeep(1100, 0.1);

    const intervalMs = Math.max(100, Math.round(1000 / rateHz));
    this.timerId = window.setInterval(() => {
      if (!this.isAlerting || this.isMuted) {
        this.stopAlert();
        return;
      }
      this.playBeep(1100, 0.09);
    }, intervalMs);
  }

  /**
   * Stops the alert beeping
   */
  public stopAlert() {
    this.isAlerting = false;
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public getIsAlerting(): boolean {
    return this.isAlerting;
  }
}

export const soundManager = new SoundAlertManager();
