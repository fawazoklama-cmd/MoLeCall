import { GameSettings } from '../types/game';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxVol = 0.65;
  private musicVol = 0.35;
  private muted = false;
  private bgmTimer: number | null = null;
  private bgmStep = 0;

  private ensureContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public syncSettings(settings: GameSettings) {
    this.sfxVol = settings.soundVolume;
    this.musicVol = settings.musicVolume;
    this.muted = settings.muted;
    if (this.muted || this.musicVol <= 0.01) {
      this.stopMusic();
    }
  }

  private tone(freq: number, duration: number, type: OscillatorType, gainAmt: number, slideTo?: number) {
    const ctx = this.ensureContext();
    if (!ctx || this.sfxVol <= 0.01) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (slideTo) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), now + duration);
      }
      const vol = Math.max(0.001, gainAmt * this.sfxVol);
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Ignore audio block errors before user gesture
    }
  }

  public playClick() {
    this.tone(540 + (Math.random() - 0.5) * 40, 0.06, 'sine', 0.12, 720);
  }

  public playBasicAttack() {
    const pitchJitter = 1 + (Math.random() - 0.5) * 0.14;
    this.tone(360 * pitchJitter, 0.09, 'triangle', 0.15, 190);
  }

  public playSkill(slot: 'Q' | 'E' | 'R') {
    if (slot === 'Q') {
      this.tone(520, 0.16, 'sine', 0.18, 840);
    } else if (slot === 'E') {
      this.tone(420, 0.22, 'triangle', 0.2, 660);
    } else {
      this.tone(280, 0.34, 'sawtooth', 0.16, 740);
      setTimeout(() => this.tone(560, 0.28, 'sine', 0.16, 880), 80);
    }
  }

  public playHit(heavy = false) {
    const pitchJitter = 1 + (Math.random() - 0.5) * 0.12;
    this.tone(heavy ? 150 * pitchJitter : 230 * pitchJitter, heavy ? 0.14 : 0.08, 'triangle', heavy ? 0.22 : 0.11, 75);
  }

  public playKill() {
    this.tone(523.25, 0.12, 'triangle', 0.2);
    setTimeout(() => this.tone(659.25, 0.14, 'triangle', 0.2), 90);
    setTimeout(() => this.tone(783.99, 0.22, 'sine', 0.22), 180);
  }

  public playRecall() {
    this.tone(440, 0.25, 'sine', 0.15, 880);
  }

  public playVictory() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      setTimeout(() => this.tone(n, 0.3, 'triangle', 0.2), idx * 130);
    });
  }

  public playDefeat() {
    const notes = [392.0, 349.23, 311.13, 261.63];
    notes.forEach((n, idx) => {
      setTimeout(() => this.tone(n, 0.32, 'sine', 0.18), idx * 160);
    });
  }

  public startMusic() {
    if (this.bgmTimer !== null || this.muted || this.musicVol <= 0.01) return;
    const progression = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0], // Am7
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [196.0, 246.94, 293.66, 392.0], // G6
    ];
    this.bgmTimer = window.setInterval(() => {
      if (this.muted || this.musicVol <= 0.01) return;
      const ctx = this.ensureContext();
      if (!ctx) return;
      const chord = progression[this.bgmStep % progression.length];
      const note = chord[this.bgmStep % chord.length];
      this.bgmStep += 1;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, now);
        const vol = 0.045 * this.musicVol;
        gain.gain.setValueAtTime(0.0005, now);
        gain.gain.linearRampToValueAtTime(vol, now + 0.18);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + 1.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.2);
      } catch {
        // Ignore
      }
    }, 850);
  }

  public stopMusic() {
    if (this.bgmTimer !== null) {
      window.clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const soundEngine = new SoundEngine();
