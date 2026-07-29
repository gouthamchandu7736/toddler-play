/**
 * Central audio for the whole app: sound effects + speech.
 *
 * Two hard rules from PLAN.md:
 *  - Nothing makes a sound before unlock() runs on a real user gesture.
 *    Mobile browsers block autoplay, and a blocked play() that throws is a
 *    dead tap from the child's point of view.
 *  - Every entry point is wrapped so a missing API or a rejected promise can
 *    never surface as an uncaught error. Silence is an acceptable failure;
 *    a crashed screen is not.
 *
 * Sound effects are SYNTHESISED with Web Audio rather than loaded from files.
 * That means no assets to download, no licences to track, nothing to miss from
 * the offline precache, and a few hundred bytes instead of a few hundred KB.
 * Real recordings can be swapped in later behind the same playSfx() call.
 */

let ctx = null;
let masterGain = null;
let unlocked = false;
let muted = false;

/** Chosen once, then reused so the voice doesn't change between words. */
let preferredVoice = null;
let voicesReady = false;

const hasSpeech = typeof window !== "undefined" && "speechSynthesis" in window;

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

function getCtx() {
  if (ctx) return ctx;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.5; // toddler ears; never full scale
    masterGain.connect(ctx.destination);
  } catch {
    ctx = null;
  }
  return ctx;
}

/**
 * Call from the first real user gesture (the splash tap).
 * Resumes the audio context and warms up speech synthesis, which on iOS only
 * becomes usable after a gesture-initiated utterance.
 */
export function unlock() {
  const c = getCtx();
  if (c && c.state === "suspended") {
    c.resume().catch(() => {});
  }

  // A silent blip inside the gesture is what actually flips iOS from
  // "suspended" to "running" on some versions.
  if (c) {
    try {
      const osc = c.createOscillator();
      const g = c.createGain();
      g.gain.value = 0;
      osc.connect(g).connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + 0.01);
    } catch {
      /* ignore */
    }
  }

  if (hasSpeech) {
    try {
      // Empty utterance primes the engine without saying anything.
      window.speechSynthesis.cancel();
      const warm = new SpeechSynthesisUtterance(" ");
      warm.volume = 0;
      window.speechSynthesis.speak(warm);
    } catch {
      /* ignore */
    }
    loadVoices();
  }

  unlocked = true;
}

export function isUnlocked() {
  return unlocked;
}

export function setMuted(next) {
  muted = Boolean(next);
  if (muted) stopSpeech();
}

export function isMuted() {
  return muted;
}

// ---------------------------------------------------------------------------
// Sound effects
// ---------------------------------------------------------------------------

/**
 * One synthesised note. All the SFX below are built from these.
 * `when` is an offset in seconds so a chime can schedule its own arpeggio.
 */
function tone({
  freq = 440,
  duration = 0.18,
  type = "sine",
  gain = 0.35,
  when = 0,
  glideTo = null,
}) {
  const c = getCtx();
  if (!c || muted || !unlocked) return;

  try {
    const t0 = c.currentTime + when;
    const osc = c.createOscillator();
    const env = c.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (glideTo) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(glideTo, 1),
        t0 + duration,
      );
    }

    // Fast attack, smooth exponential decay — a click-free "pop" shape.
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    osc.connect(env).connect(masterGain);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  } catch {
    /* a failed sound must never break a tap */
  }
}

/** Musical scale used for pads and celebrations (C major pentatonic). */
export const NOTES = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  G4: 392.0,
  A4: 440.0,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  G5: 783.99,
  C6: 1046.5,
};

const SFX = {
  /** Short bright blip — the universal "you touched it" confirmation. */
  pop: () => {
    tone({ freq: 700, glideTo: 320, duration: 0.13, type: "sine", gain: 0.4 });
  },

  /** Rising three-note arpeggio — success, praise, correct answer. */
  chime: () => {
    tone({ freq: NOTES.C5, duration: 0.16, gain: 0.3, when: 0 });
    tone({ freq: NOTES.E5, duration: 0.16, gain: 0.3, when: 0.1 });
    tone({ freq: NOTES.G5, duration: 0.3, gain: 0.3, when: 0.2 });
  },

  /** Longer sparkle for a bigger celebration. */
  celebrate: () => {
    [NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6].forEach((f, i) => {
      tone({ freq: f, duration: 0.22, gain: 0.28, when: i * 0.08 });
    });
    tone({ freq: NOTES.G5, duration: 0.45, gain: 0.2, when: 0.34 });
  },

  /**
   * Soft neutral tap. Used when a child taps a NON-match.
   * Deliberately warm and quiet — this is not an error buzzer. PLAN.md
   * Section 2 rule 3: a wrong tap is never punished, only unrewarded.
   */
  soft: () => {
    tone({ freq: 300, duration: 0.1, type: "triangle", gain: 0.14 });
  },

  /** Airy whoosh for screen transitions. */
  woosh: () => {
    tone({
      freq: 200,
      glideTo: 620,
      duration: 0.22,
      type: "triangle",
      gain: 0.18,
    });
  },
};

/** Play a named sound effect. Unknown names are ignored, never thrown. */
export function playSfx(name) {
  const fn = SFX[name];
  if (!fn) return;
  try {
    fn();
  } catch {
    /* ignore */
  }
}

/** A single pitched note — used by the Copy-the-Tune pads. */
export function playNote(freq, duration = 0.45) {
  tone({ freq, duration, type: "sine", gain: 0.32 });
}

// ---------------------------------------------------------------------------
// Percussion
// ---------------------------------------------------------------------------

/**
 * A burst of filtered white noise — the basis of every unpitched drum.
 * Generated per hit rather than cached: the buffers are a few thousand samples
 * and a fresh one each time keeps repeated hits from sounding identical.
 */
function noise({ duration = 0.2, gain = 0.3, filter = "lowpass", freq = 1200 }) {
  const c = getCtx();
  if (!c || muted || !unlocked) return;

  try {
    const t0 = c.currentTime;
    const frames = Math.max(1, Math.floor(c.sampleRate * duration));
    const buffer = c.createBuffer(1, frames, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i += 1) {
      // Decay the noise as it is written so the tail is already shaped.
      data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    }

    const src = c.createBufferSource();
    src.buffer = buffer;

    const biquad = c.createBiquadFilter();
    biquad.type = filter;
    biquad.frequency.value = freq;

    const env = c.createGain();
    env.gain.setValueAtTime(gain, t0);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

    src.connect(biquad).connect(env).connect(masterGain);
    src.start(t0);
    src.stop(t0 + duration + 0.02);
  } catch {
    /* a failed sound must never break a tap */
  }
}

const DRUMS = {
  /** Low sine swept downward — the classic kick. */
  kick: () => tone({ freq: 150, glideTo: 45, duration: 0.34, type: "sine", gain: 0.55 }),
  /** Noise burst plus a body tone. */
  snare: () => {
    noise({ duration: 0.2, gain: 0.3, filter: "highpass", freq: 900 });
    tone({ freq: 190, duration: 0.14, type: "triangle", gain: 0.22 });
  },
  /** Short, bright, high-passed. */
  hat: () => noise({ duration: 0.07, gain: 0.22, filter: "highpass", freq: 7000 }),
  /** Long shimmering wash. */
  cymbal: () => noise({ duration: 0.9, gain: 0.18, filter: "highpass", freq: 5000 }),
  /** Pitched drums, so the kit can play a little melody too. */
  tomLow: () => tone({ freq: 210, glideTo: 110, duration: 0.3, type: "sine", gain: 0.42 }),
  tomHigh: () => tone({ freq: 320, glideTo: 170, duration: 0.26, type: "sine", gain: 0.4 }),
  /** Wooden click. */
  block: () => tone({ freq: 900, glideTo: 700, duration: 0.09, type: "square", gain: 0.16 }),
  /** Shaker. */
  shaker: () => noise({ duration: 0.12, gain: 0.16, filter: "bandpass", freq: 5200 }),
};

/** Play a named drum. Unknown names are ignored, never thrown. */
export function playDrum(name) {
  const fn = DRUMS[name];
  if (!fn) return;
  try {
    fn();
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Speech
// ---------------------------------------------------------------------------

/**
 * iOS (and Chrome on first load) populate getVoices() asynchronously, so a
 * synchronous read right after startup returns an empty list. Read now, and
 * again on the voiceschanged event.
 */
function loadVoices() {
  if (!hasSpeech) return;
  try {
    const list = window.speechSynthesis.getVoices();
    if (!list || list.length === 0) return;

    const isEnglish = (v) => v.lang && v.lang.toLowerCase().startsWith("en");
    const named = (needle) =>
      list.find(
        (v) => isEnglish(v) && v.name && v.name.toLowerCase().includes(needle),
      );

    // Prefer a warm English voice; degrade to any English, then to anything.
    preferredVoice =
      named("samantha") ||
      named("karen") ||
      named("google uk english female") ||
      named("female") ||
      list.find(isEnglish) ||
      list[0] ||
      null;

    voicesReady = true;
  } catch {
    /* ignore */
  }
}

if (hasSpeech) {
  loadVoices();
  try {
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
  } catch {
    // Older Safari exposes only the onvoiceschanged property.
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

/**
 * Say something out loud.
 *
 * Cancels any in-progress utterance first: a toddler taps far faster than
 * speech plays, and queued words pile into an unintelligible backlog that
 * keeps talking long after they've moved on.
 */
export function speak(text, { rate = 0.9, pitch = 1.15 } = {}) {
  if (!hasSpeech || muted || !unlocked || !text) return;

  try {
    window.speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(String(text));
    u.rate = rate; // a little slow — easier for small ears
    u.pitch = pitch; // a little high — friendlier
    u.volume = 1;

    if (!voicesReady) loadVoices();
    if (preferredVoice) u.voice = preferredVoice;
    u.lang = (preferredVoice && preferredVoice.lang) || "en-US";

    // Swallow engine errors (interrupted, not-allowed, synthesis-failed).
    u.onerror = () => {};

    window.speechSynthesis.speak(u);
  } catch {
    /* speech is a bonus, never a requirement */
  }
}

/** Stop talking immediately — used when leaving a screen. */
export function stopSpeech() {
  if (!hasSpeech) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Haptics
// ---------------------------------------------------------------------------

/** Short buzz where supported. Silently absent on iOS Safari. */
export function vibrate(ms = 30) {
  try {
    if (navigator.vibrate) navigator.vibrate(ms);
  } catch {
    /* ignore */
  }
}

export default {
  unlock,
  isUnlocked,
  playSfx,
  playNote,
  playDrum,
  speak,
  stopSpeech,
  vibrate,
  setMuted,
  isMuted,
  NOTES,
};
