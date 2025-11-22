// Background music utility for landing and onboarding

let audioInstance: HTMLAudioElement | null = null;
let isPlaying = false;

export const initBackgroundMusic = (): HTMLAudioElement | null => {
  if (typeof window === 'undefined') return null;
  
  // Create audio instance if it doesn't exist
  if (!audioInstance) {
    audioInstance = new Audio('/bg.mp3');
    audioInstance.loop = true;
    audioInstance.volume = 0.3; // Set volume to 30% for background music
    
    // Handle errors
    audioInstance.addEventListener('error', (e) => {
      console.error('Error loading background music:', e);
    });
  }
  
  return audioInstance;
};

export const playBackgroundMusic = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  const audio = initBackgroundMusic();
  if (!audio) return;
  
  try {
    if (!isPlaying) {
      await audio.play();
      isPlaying = true;
    }
  } catch (error) {
    // Auto-play was prevented, user interaction required
    console.log('Auto-play prevented, waiting for user interaction');
    // Try to play on next user interaction
    const playOnInteraction = async () => {
      try {
        await audio.play();
        isPlaying = true;
        document.removeEventListener('click', playOnInteraction);
        document.removeEventListener('touchstart', playOnInteraction);
      } catch (e) {
        console.error('Error playing background music:', e);
      }
    };
    document.addEventListener('click', playOnInteraction, { once: true });
    document.addEventListener('touchstart', playOnInteraction, { once: true });
  }
};

export const stopBackgroundMusic = (): void => {
  if (audioInstance && isPlaying) {
    audioInstance.pause();
    audioInstance.currentTime = 0;
    isPlaying = false;
  }
};

export const pauseBackgroundMusic = (): void => {
  if (audioInstance && isPlaying) {
    audioInstance.pause();
    isPlaying = false;
  }
};

export const resumeBackgroundMusic = async (): Promise<void> => {
  if (audioInstance && !isPlaying) {
    try {
      await audioInstance.play();
      isPlaying = true;
    } catch (error) {
      console.error('Error resuming background music:', error);
    }
  }
};

