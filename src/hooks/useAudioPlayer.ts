import {useEffect, useState} from 'react';
import TrackPlayer, {
  State,
  usePlaybackState,
  useProgress,
  Event,
  useTrackPlayerEvents,
  Capability,
} from 'react-native-track-player';
import {MenuItem} from '../config/menus';

export function useAudioPlayer() {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<MenuItem | null>(null);
  
  const playback = usePlaybackState();
  const progress = useProgress();

  useEffect(() => {
    let unmounted = false;
    async function setup() {
      try {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.updateOptions({
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.Stop,
          ],
          compactCapabilities: [Capability.Play, Capability.Pause],
        });
        if (!unmounted) {
          setIsPlayerReady(true);
        }
      } catch (e) {
        // Player might already be initialized
        if (!unmounted) {
          setIsPlayerReady(true);
        }
      }
    }
    setup();
    return () => { unmounted = true; };
  }, []);

  const playSong = async (song: MenuItem, playlist: MenuItem[]) => {
    if (!isPlayerReady) return;
    
    await TrackPlayer.reset();
    
    // Find index of the song
    const index = playlist.findIndex(item => item.id === song.id);
    const startIdx = index >= 0 ? index : 0;
    
    const tracks = playlist.map((item, i) => ({
      id: item.id,
      url: item.id,
      title: item.label,
      artist: 'Unknown Artist',
    }));
    
    await TrackPlayer.add(tracks);
    await TrackPlayer.skip(startIdx);
    await TrackPlayer.play();
    setCurrentTrack(song);
  };

  const togglePlayback = async () => {
    if (!isPlayerReady) return;
    if (playback.state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const nextTrack = async () => {
    if (!isPlayerReady) return;
    await TrackPlayer.skipToNext();
  };

  const prevTrack = async () => {
    if (!isPlayerReady) return;
    await TrackPlayer.skipToPrevious();
  };
  
  useTrackPlayerEvents([Event.PlaybackTrackChanged], async event => {
    if (event.type === Event.PlaybackTrackChanged && event.nextTrack !== null && event.nextTrack !== undefined) {
      const track = await TrackPlayer.getTrack(event.nextTrack);
      if (track) {
        setCurrentTrack({
          id: track.id || '',
          label: track.title || 'Unknown',
          hasChildren: false,
        });
      }
    }
  });

  return {
    isPlayerReady,
    currentTrack,
    playbackState: playback.state,
    progress,
    playSong,
    togglePlayback,
    nextTrack,
    prevTrack,
  };
}
