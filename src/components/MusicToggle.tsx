import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useBackgroundMusic } from '../contexts/BackgroundMusicContext';

export function MusicToggle() {
  const { isMuted, toggleMute, hasAudioAvailable } = useBackgroundMusic();

  if (!hasAudioAvailable) return null;

  return (
    <button
      onClick={toggleMute}
      aria-label={isMuted ? 'Unmute background music' : 'Mute background music'}
      className={`relative rounded-full p-2 transition-all duration-300 hover:bg-white/10 ${
        isMuted ? 'text-muted animate-pulse' : 'text-text-primary'
      }`}
    >
      {isMuted ? (
        <VolumeX className="w-4 h-4" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
    </button>
  );
}
