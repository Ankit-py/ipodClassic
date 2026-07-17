import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors} from '../theme/colors';
import {State} from 'react-native-track-player';
import {MenuItem} from '../config/menus';

interface NowPlayingProps {
  track: MenuItem | null;
  playbackState: State | undefined;
  progress: {position: number; duration: number};
}

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' + s : s}`;
};

export const NowPlaying: React.FC<NowPlayingProps> = ({
  track,
  playbackState,
  progress,
}) => {
  const percent = progress.duration > 0 ? (progress.position / progress.duration) * 100 : 0;
  const isPlaying = playbackState === State.Playing;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.trackIndex}>Now Playing</Text>
        <Text style={styles.playIcon}>{isPlaying ? '▶' : '⏸'}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.artPlaceholder}>
          <Text style={styles.artText}>♪</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {track?.label || 'Not Playing'}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            Unknown Artist
          </Text>
          <Text style={styles.album} numberOfLines={1}>
            Unknown Album
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, {width: `${percent}%`}]} />
          <View style={[styles.progressKnob, {left: `${percent}%`}]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(progress.position)}</Text>
          <Text style={styles.timeText}>-{formatTime(progress.duration - progress.position)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: Colors.display.background,
    justifyContent: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    marginBottom: 20,
  },
  trackIndex: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.display.text,
  },
  playIcon: {
    fontSize: 12,
    color: Colors.display.text,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 5,
  },
  artPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  artText: {
    fontSize: 40,
    color: '#999',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.display.text,
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
    color: Colors.display.text,
    marginBottom: 2,
  },
  album: {
    fontSize: 14,
    color: Colors.display.text,
  },
  progressContainer: {
    marginTop: 40,
    paddingHorizontal: 5,
  },
  progressBar: {
    height: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#999',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#666',
  },
  progressKnob: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    marginLeft: -2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.display.text,
  },
});
