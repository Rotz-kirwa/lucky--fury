const SOUND_STORAGE_KEY = "luckyjet-sound-enabled";

type SoundCue = "toggle" | "round-start" | "crash";

type BrowserAudioContext = typeof AudioContext;

let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioContextClass =
    window.AudioContext ||
    (window as Window & typeof globalThis & { webkitAudioContext?: BrowserAudioContext }).webkitAudioContext;

  if (!AudioContextClass) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  return audioContext;
};

export const getSoundEnabled = () => {
  if (typeof window === "undefined") {
    return true;
  }

  const storedValue = window.localStorage.getItem(SOUND_STORAGE_KEY);
  return storedValue === null ? true : storedValue === "true";
};

export const persistSoundEnabled = (enabled: boolean) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SOUND_STORAGE_KEY, String(enabled));
  }
};

export const primeSound = async () => {
  const context = getAudioContext();

  if (!context) {
    return false;
  }

  if (context.state === "suspended") {
    await context.resume();
  }

  return context.state === "running";
};

const playTone = ({
  attack = 0.01,
  delay = 0,
  duration,
  frequency,
  release = 0.08,
  type = "sine",
  volume = 0.04,
}: {
  attack?: number;
  delay?: number;
  duration: number;
  frequency: number;
  release?: number;
  type?: OscillatorType;
  volume?: number;
}) => {
  const context = getAudioContext();

  if (!context || !getSoundEnabled() || context.state !== "running") {
    return;
  }

  const startAt = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);

  gainNode.gain.setValueAtTime(0.0001, startAt);
  gainNode.gain.exponentialRampToValueAtTime(volume, startAt + attack);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + duration + release);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + release + 0.02);
};

export const playSoundCue = (cue: SoundCue) => {
  switch (cue) {
    case "toggle":
      playTone({ frequency: 740, duration: 0.07, type: "triangle", volume: 0.065 });
      playTone({ frequency: 980, duration: 0.09, delay: 0.06, type: "triangle", volume: 0.055 });
      break;
    case "round-start":
      playTone({ frequency: 420, duration: 0.1, type: "square", volume: 0.055 });
      playTone({ frequency: 620, duration: 0.14, delay: 0.08, type: "triangle", volume: 0.05 });
      break;
    case "crash":
      playTone({ frequency: 220, duration: 0.16, type: "sawtooth", volume: 0.08 });
      playTone({ frequency: 164, duration: 0.22, delay: 0.08, type: "sawtooth", volume: 0.065 });
      break;
  }
};
