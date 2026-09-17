/**
 * Haptic feedback manager for Android smartphones using navigator.vibrate
 */
class HapticsManager {
  private isVibrating: boolean = false;
  private intervalId: number | null = null;
  private isEnabled: boolean = true;

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stopContinuous();
    }
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Triggers a single haptic tick
   */
  public triggerSingle(durationMs: number = 50) {
    if (!this.isEnabled || !this.isSupported()) return;
    try {
      navigator.vibrate(durationMs);
    } catch {
      // Ignore vibration errors
    }
  }

  /**
   * Starts continuous pulsing haptic vibration while metal is detected
   */
  public startContinuous() {
    if (this.isVibrating || !this.isEnabled || !this.isSupported()) return;
    this.isVibrating = true;

    const vibratePulse = () => {
      if (!this.isVibrating) return;
      try {
        // Continuous rhythmic pulse pattern: 120ms vibrate, 60ms pause
        navigator.vibrate([120, 60]);
      } catch {
        // ignore
      }
    };

    vibratePulse();
    this.intervalId = window.setInterval(vibratePulse, 180);
  }

  /**
   * Stops continuous haptic vibration
   */
  public stopContinuous() {
    this.isVibrating = false;
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.isSupported()) {
      try {
        navigator.vibrate(0);
      } catch {
        // ignore
      }
    }
  }

  public getIsVibrating(): boolean {
    return this.isVibrating;
  }
}

export const hapticsManager = new HapticsManager();
