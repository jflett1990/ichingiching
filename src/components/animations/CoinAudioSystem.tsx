import React, { useEffect, useRef, useCallback } from 'react';

interface CoinAudioSystemProps {
  isActive: boolean;
  volume?: number;
  muted?: boolean;
}

class AudioSynthesizer {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    this.initializeAudio();
  }

  private initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
    } catch (error) {
      console.warn('Audio not supported in this browser');
    }
  }

  private createCoinFlipSound() {
    if (!this.audioContext || !this.masterGain) return;

    const currentTime = this.audioContext.currentTime;
    
    // Create multiple oscillators for richer sound
    const oscillators = [];
    const gains = [];

    // Main metallic ring
    const mainOsc = this.audioContext.createOscillator();
    const mainGain = this.audioContext.createGain();
    
    mainOsc.frequency.setValueAtTime(800, currentTime);
    mainOsc.frequency.exponentialRampToValueAtTime(300, currentTime + 0.1);
    mainOsc.frequency.exponentialRampToValueAtTime(150, currentTime + 0.3);
    
    mainGain.gain.setValueAtTime(0.3, currentTime);
    mainGain.gain.exponentialRampToValueAtTime(0.1, currentTime + 0.1);
    mainGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);
    
    mainOsc.connect(mainGain);
    mainGain.connect(this.masterGain);
    
    oscillators.push(mainOsc);
    gains.push(mainGain);

    // Harmonic overtones
    const harmonicFreqs = [1200, 1600, 2000];
    harmonicFreqs.forEach((freq, index) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      
      osc.frequency.setValueAtTime(freq, currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, currentTime + 0.2);
      
      gain.gain.setValueAtTime(0.1 * (1 - index * 0.3), currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.2);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      oscillators.push(osc);
      gains.push(gain);
    });

    // Start all oscillators
    oscillators.forEach(osc => {
      osc.start(currentTime);
      osc.stop(currentTime + 0.5);
    });
  }

  private createCoinLandingSound() {
    if (!this.audioContext || !this.masterGain) return;

    const currentTime = this.audioContext.currentTime;
    
    // Create a brief impact sound
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    osc.frequency.setValueAtTime(200, currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, currentTime + 0.1);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.2, currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.1);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(currentTime);
    osc.stop(currentTime + 0.15);
  }

  public playFlipSound() {
    this.createCoinFlipSound();
  }

  public playLandingSound() {
    this.createCoinLandingSound();
  }

  public setVolume(volume: number) {
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(volume, this.audioContext!.currentTime);
    }
  }

  public setMuted(muted: boolean) {
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.audioContext!.currentTime);
    }
  }
}

const CoinAudioSystem: React.FC<CoinAudioSystemProps> = ({ 
  isActive, 
  volume = 0.5, 
  muted = false 
}) => {
  const synthRef = useRef<AudioSynthesizer | null>(null);
  const playedFlipRef = useRef(false);

  useEffect(() => {
    if (!synthRef.current) {
      synthRef.current = new AudioSynthesizer();
    }

    return () => {
      // Cleanup will be handled by the browser when the component unmounts
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.setVolume(volume);
    }
  }, [volume]);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.setMuted(muted);
    }
  }, [muted]);

  useEffect(() => {
    if (isActive && !playedFlipRef.current && synthRef.current) {
      synthRef.current.playFlipSound();
      playedFlipRef.current = true;
      
      // Play landing sound after a delay
      setTimeout(() => {
        if (synthRef.current) {
          synthRef.current.playLandingSound();
        }
      }, 1500);
    }
    
    if (!isActive) {
      playedFlipRef.current = false;
    }
  }, [isActive]);

  return null; // This component doesn't render anything visual
};

// Hook for using the audio system
export const useCoinAudio = () => {
  const synthRef = useRef<AudioSynthesizer | null>(null);

  useEffect(() => {
    if (!synthRef.current) {
      synthRef.current = new AudioSynthesizer();
    }
  }, []);

  const playFlipSound = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.playFlipSound();
    }
  }, []);

  const playLandingSound = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.playLandingSound();
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (synthRef.current) {
      synthRef.current.setVolume(volume);
    }
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    if (synthRef.current) {
      synthRef.current.setMuted(muted);
    }
  }, []);

  return {
    playFlipSound,
    playLandingSound,
    setVolume,
    setMuted,
  };
};

export default CoinAudioSystem;