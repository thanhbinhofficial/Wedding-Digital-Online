// Web Audio API romantic melody synthesizer & background audio controller

class WeddingAudioPlayer {
  private audioCtx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private intervalId: any = null;
  private audioEl: HTMLAudioElement | null = null;
  private onStateChange: ((playing: boolean) => void) | null = null;

  constructor() {
    // Lazy initialized on first user gesture
  }

  public setListener(cb: (playing: boolean) => void) {
    this.onStateChange = cb;
  }

  private initContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Canon in D inspired romantic chord progression frequencies (Hz)
  private playPianoNote(freq: number, duration: number, timeOffset: number) {
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime + timeOffset;

    const osc = ctx.createOscillator();
    const oscHarmonic = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Gentle soft sine & triangle blend for harp/piano feel
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    oscHarmonic.type = 'triangle';
    oscHarmonic.frequency.setValueAtTime(freq * 2, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + duration);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.08, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    oscHarmonic.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    oscHarmonic.start(now);
    osc.stop(now + duration + 0.1);
    oscHarmonic.stop(now + duration + 0.1);
  }

  private startSynthesizer() {
    this.initContext();
    if (!this.audioCtx) return;

    // Beautiful Canon in D sequence (D - A - Bm - F#m - G - D - G - A)
    const melody = [
      // Freq, duration in sec
      [293.66, 1.2], // D4
      [220.00, 1.2], // A3
      [246.94, 1.2], // B3
      [185.00, 1.2], // F#3
      [196.00, 1.2], // G3
      [146.83, 1.2], // D3
      [196.00, 1.2], // G3
      [220.00, 1.2], // A3
      // High harmonies
      [587.33, 0.6], [554.37, 0.6], [493.88, 0.6], [440.00, 0.6],
      [392.00, 0.6], [369.99, 0.6], [392.00, 0.6], [440.00, 0.6]
    ];

    let noteIdx = 0;
    const step = () => {
      if (!this.isPlaying) return;
      const [freq, dur] = melody[noteIdx];
      this.playPianoNote(freq, dur, 0);
      
      // Also gentle bass accompaniment
      if (noteIdx % 2 === 0) {
        this.playPianoNote(freq / 2, dur * 1.5, 0);
      }

      noteIdx = (noteIdx + 1) % melody.length;
    };

    step();
    this.intervalId = setInterval(step, 900);
  }

  public play(customUrl?: string) {
    if (this.isPlaying) return;

    if (customUrl && (customUrl.startsWith('http') || customUrl.startsWith('/uploads') || customUrl.startsWith('data:audio') || customUrl.startsWith('blob:'))) {
      try {
        if (!this.audioEl) {
          this.audioEl = new Audio(customUrl);
          this.audioEl.loop = true;
          this.audioEl.volume = 0.6;
        } else if (this.audioEl.src !== customUrl && !this.audioEl.src.endsWith(customUrl)) {
          this.audioEl.src = customUrl;
          this.audioEl.loop = true;
        }
        this.audioEl.play().catch((err) => {
          console.warn('Audio play error, fallback to synth:', err);
          this.startSynthesizer();
        });
        this.isPlaying = true;
        this.onStateChange?.(true);
        return;
      } catch (e) {
        console.warn('Audio tag failed, fallback to synth', e);
      }
    }

    this.isPlaying = true;
    this.startSynthesizer();
    this.onStateChange?.(true);
  }

  public pause() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.audioEl) {
      this.audioEl.pause();
    }
    this.onStateChange?.(false);
  }

  public toggle(customUrl?: string) {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play(customUrl);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const weddingAudio = new WeddingAudioPlayer();
