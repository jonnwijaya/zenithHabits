import * as Tone from 'tone';

let synth: Tone.PolySynth | null = null;
let loop: Tone.Loop | null = null;
let isPlaying = false;

const notes = ["C4", "E4", "G4", "A4", "C5", "E5", "G3", "A3"];

function getRandomNote(): string {
  return notes[Math.floor(Math.random() * notes.length)];
}

export async function playAmbientMusic() {
  if (isPlaying || typeof window === 'undefined') return;

  await Tone.start(); // Required for browsers that block audio context until user interaction

  if (!synth) {
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'fatsawtooth' },
      envelope: { attack: 2, decay: 1, sustain: 0.8, release: 2 },
      volume: -20, // Lower volume for ambient effect
    }).toDestination();
    
    // Add some reverb for a more ambient feel
    const reverb = new Tone.Reverb({
      decay: 4,
      wet: 0.6
    }).toDestination();
    synth.connect(reverb);
  }

  if (loop) {
    loop.stop();
    loop.dispose();
  }

  loop = new Tone.Loop((time) => {
    const note1 = getRandomNote();
    const note2 = getRandomNote();
    synth?.triggerAttackRelease(note1, "4n", time);
    synth?.triggerAttackRelease(note2, "2n", time + Tone.Time("8n").toSeconds());
    // Add a third, longer note occasionally for variation
    if (Math.random() < 0.3) {
      const note3 = getRandomNote();
      synth?.triggerAttackRelease(note3, "1m", time + Tone.Time("4n").toSeconds());
    }
  }, "2m").start(0); // Slower loop for more ambient feel

  Tone.Transport.start();
  isPlaying = true;
}

export function stopAmbientMusic() {
  if (!isPlaying || typeof window === 'undefined') return;
  
  Tone.Transport.stop();
  if (loop) {
    loop.stop();
  }
  // Gently release any sounding notes
  if (synth) {
     // synth.releaseAll(); // This might be too abrupt
  }
  isPlaying = false;
}

export function toggleAmbientMusic(): boolean {
  if (isPlaying) {
    stopAmbientMusic();
    return false;
  } else {
    playAmbientMusic();
    return true;
  }
}

export function getIsPlaying(): boolean {
  return isPlaying;
}
