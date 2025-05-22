// Sound utility for managing game sounds

// Sound URLs for different difficulty levels
const SOUND_URLS = {
  Easy: {
    cardSelect: 'https://assets.mixkit.co/sfx/preview/mixkit-quick-jump-arcade-game-239.mp3',
    cardDrag: 'https://assets.mixkit.co/sfx/preview/mixkit-plastic-bubble-click-1124.mp3',
    cardDrop: 'https://assets.mixkit.co/sfx/preview/mixkit-mouse-click-close-1113.mp3',
    invalidDrop: 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-back-2575.mp3'
  },
  Normal: {
    cardSelect: 'https://assets.mixkit.co/sfx/preview/mixkit-arcade-mechanical-bling-210.mp3',
    cardDrag: 'https://assets.mixkit.co/sfx/preview/mixkit-game-ball-tap-2073.mp3',
    cardDrop: 'https://assets.mixkit.co/sfx/preview/mixkit-positive-interface-beep-221.mp3',
    invalidDrop: 'https://assets.mixkit.co/sfx/preview/mixkit-video-game-retro-click-237.mp3'
  },
      cardFlip: { easy: 'https://assets.mixkit.co/sfx/preview/mixkit-plastic-bubble-click-1124.mp3', normal: 'https://assets.mixkit.co/sfx/preview/mixkit-game-flicks-1647.mp3' },
  Hard: {
    cardSelect: 'https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3',
    cardDrag: 'https://assets.mixkit.co/sfx/preview/mixkit-game-ball-tap-2073.mp3',
    cardDrop: 'https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3',
    invalidDrop: 'https://assets.mixkit.co/sfx/preview/mixkit-negative-guitar-tone-2324.mp3'
  }
};

// Victory sound - used across all difficulty levels
const VICTORY_SOUND_URL = 'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3';

class SoundManager {
  constructor() {
    this.sounds = {};
    this.muted = localStorage.getItem('soundMuted') === 'true';
    this.volume = parseFloat(localStorage.getItem('soundVolume') || '0.5');
    this.difficulty = 'Normal';
    this.loadedPromises = [];
    this.victorySound = null;
  }

  initialize(difficulty) {
    this.difficulty = difficulty;
    this.loadSounds();
  }

  loadSounds() {
    const soundsToLoad = SOUND_URLS[this.difficulty];
    
    // Load victory sound (common across all difficulties)
    this.victorySound = new Audio();
    this.victorySound.src = VICTORY_SOUND_URL;
    this.victorySound.volume = this.volume;
    this.sounds.victory = this.victorySound;
    
    for (const [name, url] of Object.entries(soundsToLoad)) {
      const audio = new Audio();
      audio.src = url;
      audio.volume = this.volume;
      
      this.sounds[name] = audio;
      
      // Create a promise that resolves when the sound is loaded
      const loadPromise = new Promise((resolve, reject) => {
  
        audio.oncanplaythrough = resolve;
        audio.onerror = reject;
      }).catch(err => console.warn(`Failed to load sound: ${name}`, err));
      
      this.loadedPromises.push(loadPromise);
    }
    
    return Promise.all(this.loadedPromises);
  }

  playVictory() {
    if (this.muted) return;
    
    if (this.victorySound) {
      const sound = this.victorySound.cloneNode();
      sound.volume = this.volume;
      sound.play().catch(err => console.warn(`Error playing victory sound`, err));
    }
  }
  
  play(soundName) {
    if (this.muted || !this.sounds[soundName]) return;
    
    // Clone and play to allow overlapping sounds
    const sound = this.sounds[soundName].cloneNode();
    sound.volume = this.volume;
    sound.play().catch(err => console.warn(`Error playing sound: ${soundName}`, err));
  }

  setVolume(volume) {
    this.volume = volume;
    localStorage.setItem('soundVolume', volume.toString());

    // Update volume for all sounds
    Object.values(this.sounds).forEach(sound => {
      sound.volume = volume;
    });
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('soundMuted', this.muted.toString());
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }
}

export const soundManager = new SoundManager();
export default soundManager;