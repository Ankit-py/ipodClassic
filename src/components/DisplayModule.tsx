/**
 * DisplayModule — the elastic-height "screen" of the iPod.
 *
 * This absorbs all extra vertical space on taller devices.
 * A taller display just reads as "upgraded screen" — not stretched.
 *
 * Phase 1: renders a static iPod-style menu list and now-playing placeholder.
 * Phase 3 will add the full navigable screen stack.
 */

import React from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {Colors} from '../theme/colors';
import { MenuItem } from '../config/menus';
import { State } from 'react-native-track-player';
import { NowPlaying } from './NowPlaying';

interface DisplayModuleProps {
  width: number;
  height: number;
  sideMargin: number;
  /** Index of the currently highlighted menu item (from wheel scroll) */
  selectedIndex: number;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  menuItems?: MenuItem[];
  isNowPlayingScreen?: boolean;
  nowPlayingTrack?: MenuItem | null;
  playbackState?: State | undefined;
  progress?: {position: number; duration: number};
}

export const DisplayModule: React.FC<DisplayModuleProps> = ({
  width,
  height,
  sideMargin,
  selectedIndex,
  title = 'iPod',
  showBack = false,
  onBack,
  menuItems = [],
  isNowPlayingScreen = false,
  nowPlayingTrack = null,
  playbackState,
  progress = {position: 0, duration: 0},
}) => {
  const displayWidth = width - sideMargin * 2;

  const renderMenuItem = ({
    item,
    index,
  }: {
    item: MenuItem;
    index: number;
  }) => {
    const isSelected = index === selectedIndex;
    return (
      <View
        style={[
          styles.menuItem,
          isSelected && styles.menuItemSelected,
        ]}>
        <Text
          style={[
            styles.menuLabel,
            isSelected && styles.menuLabelSelected,
          ]}>
          {item.label}
        </Text>
        {item.hasChildren && (
          <Text
            style={[
              styles.menuChevron,
              isSelected && styles.menuChevronSelected,
            ]}>
            ▸
          </Text>
        )}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.outerBezel,
        {
          width: displayWidth,
          height: height,
          marginHorizontal: sideMargin,
          borderRadius: 4,
        },
      ]}>
      <View style={styles.innerScreen}>
        {/* Title bar inside the LCD */}
        <View style={styles.lcdTitleBar}>
          <View style={styles.leftSection}>
            {showBack && (
              <Text style={styles.playIcon}>▶</Text>
            )}
          </View>
          <View style={styles.centerSection}>
            <Text style={styles.lcdTitle}>{title}</Text>
          </View>
          <View style={styles.rightSection}>
            <View style={styles.batteryOuter}>
              <View style={[styles.batteryFill, {width: '80%'}]} />
            </View>
            <View style={styles.batteryTip} />
          </View>
        </View>

        {/* Content */}
        {isNowPlayingScreen ? (
          <NowPlaying
            track={nowPlayingTrack}
            playbackState={playbackState}
            progress={progress}
          />
        ) : (
          <FlatList
            data={menuItems}
            renderItem={renderMenuItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            style={styles.menuList}
          />
        )}

        {/* LCD pixel grid overlay for authenticity */}
        <View style={styles.lcdOverlay} pointerEvents="none" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerBezel: {
    backgroundColor: Colors.display.bezel,
    padding: 3,
    overflow: 'hidden',
  },
  innerScreen: {
    flex: 1,
    backgroundColor: Colors.display.background,
    borderRadius: 2,
    overflow: 'hidden',
  },
  lcdTitleBar: {
    backgroundColor: Colors.display.highlight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  playIcon: {
    fontSize: 12,
    color: Colors.display.highlightText,
  },
  lcdTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.display.highlightText,
    textAlign: 'center',
  },
  // Battery indicator
  batteryOuter: {
    width: 22,
    height: 10,
    borderWidth: 1,
    borderColor: Colors.display.highlightText,
    borderRadius: 2,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  batteryFill: {
    height: '100%',
    backgroundColor: '#4CD964',
    borderRadius: 1,
  },
  batteryTip: {
    width: 2,
    height: 5,
    backgroundColor: Colors.display.highlightText,
    borderTopRightRadius: 1,
    borderBottomRightRadius: 1,
    marginLeft: 1,
  },
  menuList: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  menuItemSelected: {
    backgroundColor: Colors.display.highlight,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.display.text,
  },
  menuLabelSelected: {
    color: Colors.display.highlightText,
  },
  menuChevron: {
    fontSize: 14,
    color: Colors.display.text,
    opacity: 0.4,
  },
  menuChevronSelected: {
    color: Colors.display.highlightText,
    opacity: 0.8,
  },
  lcdOverlay: {
    ...StyleSheet.absoluteFill,
    // Subtle scanline effect — CSS-like pattern
    backgroundColor: Colors.display.gridTint,
  },
});
