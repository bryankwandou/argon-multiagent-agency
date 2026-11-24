const SOUND_FILES = {
  blip: '/audio/blip.wav',
  tick: '/audio/tick.wav',
  doubleTick: '/audio/double-tick.wav',
  chimeA: '/audio/chime-a.wav',
  chimeB: '/audio/chime-b.wav'
};

class AgencyAudioEngine {
  constructor() {
    this.muted = false;
    this.cache = new Map();
  }

  setMuted(value) {
    this.muted = Boolean(value);
  }

  play(key) {
    if (this.muted || typeof window === 'undefined') return;
    const src = SOUND_FILES[key];
    if (!src) return;
    try {
      let audio = this.cache.get(key);
      if (!audio) {
        audio = new Audio(src);
        audio.volume = 0.28;
        this.cache.set(key, audio);
      }
      audio.currentTime = 0;
      const promise = audio.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(() => {});
      }
    } catch {
      // Audio playback blocked before user gesture
    }
  }
}

export const audioEngine = new AgencyAudioEngine();

