/**
 * IPodShell — full-screen root component.
 *
 * Owns the layout math from §1 of the dev plan.
 * Renders MenuBar, DisplayModule, and ClickWheel with computed dimensions.
 * The phone screen itself IS the device — edge to edge, no ambient stage.
 */

import React, {useCallback, useState} from 'react';
import {View, StyleSheet, StatusBar, Platform} from 'react-native';
import {Colors} from '../theme/colors';
import {useIPodLayout} from '../theme/layout';
import {DisplayModule} from './DisplayModule';
import {ClickWheel} from './ClickWheel';
import {ScrollDirection} from '../hooks/useWheelGesture';
import {useSyncFolder} from '../hooks/useSyncFolder';
import {useAudioPlayer} from '../hooks/useAudioPlayer';
import {MENUS} from '../config/menus';

type NavState = {
  title: string;
  menuId: string;
  selectedIndex: number;
};

export const IPodShell: React.FC = () => {
  const layout = useIPodLayout();
  const [navStack, setNavStack] = useState<NavState[]>([
    {title: 'iPod', menuId: 'iPod', selectedIndex: 0},
  ]);

  const {syncedFiles, selectFolder} = useSyncFolder();
  const audioPlayer = useAudioPlayer();

  // Helper to dynamically get items based on the menuId
  const getMenuItems = useCallback((menuId: string) => {
    if (menuId === 'Songs') return syncedFiles.audio.length > 0 ? syncedFiles.audio : MENUS['ComingSoon'];
    if (menuId === 'Photos') return syncedFiles.photo.length > 0 ? syncedFiles.photo : MENUS['ComingSoon'];
    if (menuId === 'Videos') return syncedFiles.video.length > 0 ? syncedFiles.video : MENUS['ComingSoon'];
    return MENUS[menuId] || MENUS['ComingSoon'];
  }, [syncedFiles]);

  const currentNav = navStack[navStack.length - 1];
  const currentMenuItems = getMenuItems(currentNav.menuId);

  // ── Wheel scroll → menu navigation ──
  const handleScroll = useCallback(
    (direction: ScrollDirection) => {
      setNavStack(prev => {
        const stack = [...prev];
        const top = {...stack[stack.length - 1]};
        const items = getMenuItems(top.menuId);

        if (direction === 'clockwise') {
          top.selectedIndex = Math.min(top.selectedIndex + 1, items.length - 1);
        } else if (direction === 'counterclockwise') {
          top.selectedIndex = Math.max(top.selectedIndex - 1, 0);
        }

        stack[stack.length - 1] = top;
        return stack;
      });
    },
    [],
  );

  // ── Button presses ──
  const handleButtonPress = useCallback(
    (button: 'menu' | 'prev' | 'next' | 'playpause' | 'center') => {
      setNavStack(prev => {
        const stack = [...prev];
        const top = stack[stack.length - 1];
        const items = getMenuItems(top.menuId);

        switch (button) {
          case 'menu':
            if (stack.length > 1) {
              stack.pop();
            }
            break;
          case 'center':
            const selectedItem = items[top.selectedIndex];
            if (selectedItem) {
              if (selectedItem.id === 'sync_folder') {
                selectFolder();
              } else if (selectedItem.hasChildren) {
                // If it's a dynamic media menu, we map the label directly to a known id
                const nextMenuId = MENUS[selectedItem.label] || ['Songs', 'Photos', 'Videos'].includes(selectedItem.label) 
                  ? selectedItem.label 
                  : 'ComingSoon';
                stack.push({
                  title: selectedItem.label,
                  menuId: nextMenuId,
                  selectedIndex: 0,
                });
              } else {
                // It's a playable item
                audioPlayer.playSong(selectedItem, items);
                stack.push({
                  title: 'Now Playing',
                  menuId: 'NowPlaying',
                  selectedIndex: 0,
                });
              }
            }
            break;
          case 'playpause':
            audioPlayer.togglePlayback();
            break;
          case 'prev':
            audioPlayer.prevTrack();
            break;
          case 'next':
            audioPlayer.nextTrack();
            break;
        }
        return stack;
      });
    },
    [],
  );

  return (
    <View style={styles.root}>
      {/* Status bar: translucent, colored to match bezel → disappears visually */}
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* Brushed aluminum bezel fills the entire screen */}
      <View style={styles.bezelFill}>
        {/* Subtle vertical gradient for brushed-metal feel */}
        <View style={styles.bezelGradientTop} />
        <View style={styles.bezelGradientBottom} />
      </View>

      {/* ── Top Bezel Spacer ── */}
      <View style={{height: layout.safeAreaTop + layout.topBarHeight}} />

      {/* ── Display Module (elastic height) ── */}
      <DisplayModule
        width={layout.screenWidth}
        height={layout.displayHeight}
        sideMargin={layout.sideMargin}
        selectedIndex={currentNav.selectedIndex}
        menuItems={currentMenuItems}
        title={currentNav.title}
        showBack={navStack.length > 1}
        isNowPlayingScreen={currentNav.menuId === 'NowPlaying'}
        nowPlayingTrack={audioPlayer.currentTrack}
        playbackState={audioPlayer.playbackState}
        progress={audioPlayer.progress}
      />

      {/* ── Spacer to push wheel down slightly ── */}
      <View style={styles.wheelSpacer} />

      {/* ── Click Wheel (fixed diameter) ── */}
      <ClickWheel
        diameter={layout.wheelDiameter}
        centerX={layout.wheelCenterX}
        centerY={layout.wheelDiameter / 2}
        onScroll={handleScroll}
        onButtonPress={handleButtonPress}
      />

      {/* ── Bottom safe area padding ── */}
      <View style={{height: layout.bottomPadding}} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bezel.surface,
  },
  // Brushed metal visual layers
  bezelFill: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  bezelGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: Colors.bezel.highlight,
    opacity: 0.3,
  },
  bezelGradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: Colors.bezel.surfaceDark,
    opacity: 0.3,
  },
  wheelSpacer: {
    height: 8,
  },
});
