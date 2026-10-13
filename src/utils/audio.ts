/**
 * Web Audio API synthesizer for disaster emergency sirens, EAS alert tones, and rescue whistles.
 * Runs 100% locally and offline without external asset dependencies.
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private sirenOscillator: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private isSirenActive = false;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Play emergency disaster alert chime (Dual Tone EAS broadcast tone)
   */
  public playAlertChime(onEnd?: () => void) {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Tone 1: 853Hz, Tone 2: 960Hz (Standard EAS / National Warning Frequencies)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(853, now);
      osc2.frequency.setValueAtTime(960, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
      gain.gain.setValueAtTime(0.3, now + 1.2);
      gain.gain.linearRampToValueAtTime(0.001, now + 1.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);

      osc1.stop(now + 1.5);
      osc2.stop(now + 1.5);

      if (onEnd) {
        setTimeout(onEnd, 1500);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Start continuous evacuation siren (wailing siren)
   */
  public startSiren(volume = 0.4) {
    try {
      this.stopSiren();
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      this.sirenOscillator = this.ctx.createOscillator();
      this.sirenGain = this.ctx.createGain();
      this.lfo = this.ctx.createOscillator(); // Low frequency oscillator for pitch modulation
      const lfoGain = this.ctx.createGain();

      // Carrier frequency 600Hz ~ 1000Hz sweep
      this.sirenOscillator.type = 'sawtooth';
      this.sirenOscillator.frequency.setValueAtTime(750, now);

      this.lfo.type = 'triangle';
      this.lfo.frequency.setValueAtTime(0.4, now); // 2.5 seconds per wail cycle
      lfoGain.gain.setValueAtTime(250, now); // swing +- 250Hz

      this.lfo.connect(lfoGain);
      lfoGain.connect(this.sirenOscillator.frequency);

      this.sirenGain.gain.setValueAtTime(0, now);
      this.sirenGain.gain.linearRampToValueAtTime(volume, now + 0.3);

      this.sirenOscillator.connect(this.sirenGain);
      this.sirenGain.connect(this.ctx.destination);

      this.lfo.start(now);
      this.sirenOscillator.start(now);
      this.isSirenActive = true;
    } catch {
      this.isSirenActive = false;
    }
  }

  /**
   * Stop the siren
   */
  public stopSiren() {
    if (this.sirenGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.sirenGain.gain.linearRampToValueAtTime(0.001, now + 0.1);
        setTimeout(() => {
          try {
            this.sirenOscillator?.stop();
            this.lfo?.stop();
            this.sirenOscillator?.disconnect();
            this.lfo?.disconnect();
            this.sirenGain?.disconnect();
          } catch {
            // Already disconnected
          }
          this.sirenOscillator = null;
          this.lfo = null;
          this.sirenGain = null;
        }, 120);
      } catch {
        // cleanup
      }
    }
    this.isSirenActive = false;
  }

  public getIsSirenPlaying(): boolean {
    return this.isSirenActive;
  }

  /**
   * High-pitch emergency rescue whistle (2500Hz pulses for trapped survivors)
   */
  public playWhistle() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2800, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.5, now + 0.03);
      gain.gain.setValueAtTime(0.5, now + 0.4);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.46);
    } catch {
      // AudioContext error handling
    }
  }
}

export const soundSynth = new SoundSynthesizer();
