// Sound effects utility for calm, pleasing interactions - only for completions and creations

const createSound = (frequency: number, duration: number, type: 'sine' | 'square' | 'sawtooth' = 'sine', volume: number = 0.08): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    // Very gentle, calming volume
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    // Silently fail if audio context is not available
  }
};

export const sounds = {
  // Calming success sound for creations (gentle ascending chime)
  success: () => {
    createSound(440, 0.3, 'sine', 0.06); // A4 - gentle start
    setTimeout(() => createSound(523.25, 0.3, 'sine', 0.06), 80); // C5
    setTimeout(() => createSound(659.25, 0.4, 'sine', 0.05), 160); // E5 - soft fade
  },
  
  // Calming completion sound (gentle descending then ascending)
  complete: () => {
    createSound(523.25, 0.25, 'sine', 0.06); // C5
    setTimeout(() => createSound(440, 0.25, 'sine', 0.06), 100); // A4
    setTimeout(() => createSound(523.25, 0.35, 'sine', 0.05), 200); // C5 - gentle resolution
  },
};

