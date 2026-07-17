/**
 * MenuBar — fixed 44dp height bar at top of the iPod.
 *
 * Shows current screen title and back chevron when navigable.
 * Styled as brushed aluminum matching the bezel.
 */

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Colors} from '../theme/colors';

interface MenuBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  batteryLevel?: number;
  width: number;
  height: number;
  safeAreaTop: number;
  sideMargin: number;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  title,
  showBack = false,
  onBack,
  batteryLevel = 80,
  width,
  height,
  safeAreaTop,
  sideMargin,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          width,
          height: height + safeAreaTop,
          paddingTop: safeAreaTop,
        },
      ]}>
      <View style={styles.content}>
        {/* Left: back arrow */}
        <View style={styles.leftSection}>
          {showBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backArrow}>◀</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Center: title */}
        <View style={styles.centerSection}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* Right: battery indicator */}
        <View style={styles.rightSection}>
          <View style={styles.batteryOuter}>
            <View
              style={[
                styles.batteryFill,
                {width: `${Math.min(batteryLevel, 100)}%` as any},
              ]}
            />
          </View>
          <View style={styles.batteryTip} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.display.bezel,
    zIndex: 10,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  leftSection: {
    width: 40,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    width: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  backButton: {
    padding: 4,
  },
  backArrow: {
    fontSize: 12,
    color: Colors.display.highlightText,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.display.highlightText,
    letterSpacing: 0.3,
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
});
