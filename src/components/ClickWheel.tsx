/**
 * ClickWheel — the iconic iPod click wheel.
 *
 * Fixed diameter, always a perfect circle.
 * Four button zones (Menu, Prev, Next, Play/Pause) + center select button.
 * Integrates useWheelGesture for circular scroll tracking.
 */

import React, {useCallback, useState} from 'react';
import {View, Text, StyleSheet, Platform} from 'react-native';
import {Colors} from '../theme/colors';
import {
  useWheelGesture,
  ScrollDirection,
} from '../hooks/useWheelGesture';
import * as Haptics from 'expo-haptics';
import {Ionicons} from '@expo/vector-icons';

interface ClickWheelProps {
  diameter: number;
  centerX: number;
  /** Relative Y position within the wheel container */
  centerY: number;
  onScroll: (direction: ScrollDirection) => void;
  onButtonPress: (
    button: 'menu' | 'prev' | 'next' | 'playpause' | 'center',
  ) => void;
}

/** Center button diameter as ratio of wheel diameter */
const CENTER_BUTTON_RATIO = 0.33;

export const ClickWheel: React.FC<ClickWheelProps> = ({
  diameter,
  centerX,
  centerY,
  onScroll,
  onButtonPress,
}) => {
  const radius = diameter / 2;
  const centerButtonDiameter = diameter * CENTER_BUTTON_RATIO;
  const centerButtonRadius = centerButtonDiameter / 2;

  const [activeButton, setActiveButton] = useState<string | null>(null);

  const handleTick = useCallback(
    (direction: ScrollDirection) => {
      onScroll(direction);
      // Haptic tick per detent — the iPod's tactile feedback
      Haptics.selectionAsync();
    },
    [onScroll],
  );

  const handleButtonPress = useCallback(
    (button: 'menu' | 'prev' | 'next' | 'playpause' | 'center') => {
      setActiveButton(button);
      onButtonPress(button);

      // Heavier haptic for button press vs. scroll tick
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Brief visual highlight
      setTimeout(() => setActiveButton(null), 150);
    },
    [onButtonPress],
  );

  const {handlers} = useWheelGesture(
    radius, // centerX relative to wheel view
    radius, // centerY relative to wheel view
    radius,
    {
      onTick: handleTick,
      onButtonPress: handleButtonPress,
    },
  );

  return (
    <View
      style={[
        styles.container,
        {
          width: diameter,
          height: diameter,
          borderRadius: radius,
        },
      ]}>
      {/* Wheel surface — captures all gestures */}
      <View
        style={[
          styles.wheelSurface,
          {
            width: diameter,
            height: diameter,
            borderRadius: radius,
          },
        ]}
        {...handlers}>
        {/* Button labels */}
        {/* MENU — top */}
        <View
          pointerEvents="none"
          style={[
            styles.buttonZone,
            styles.menuButton,
            activeButton === 'menu' && styles.buttonActive,
          ]}>
          <Text style={styles.buttonLabel}>MENU</Text>
        </View>

        {/* Prev — left */}
        <View
          pointerEvents="none"
          style={[
            styles.buttonZone,
            styles.prevButton,
            activeButton === 'prev' && styles.buttonActive,
          ]}>
          <Ionicons name="play-skip-back" size={18} color={Colors.wheel.labelText} />
        </View>

        {/* Next — right */}
        <View
          pointerEvents="none"
          style={[
            styles.buttonZone,
            styles.nextButton,
            activeButton === 'next' && styles.buttonActive,
          ]}>
          <Ionicons name="play-skip-forward" size={18} color={Colors.wheel.labelText} />
        </View>

        {/* Play/Pause — bottom */}
        <View
          pointerEvents="none"
          style={[
            styles.buttonZone,
            styles.playPauseButton,
            activeButton === 'playpause' && styles.buttonActive,
          ]}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="play" size={15} color={Colors.wheel.labelText} style={{marginRight: -1}} />
            <Ionicons name="pause" size={15} color={Colors.wheel.labelText} />
          </View>
        </View>

        {/* Center select button */}
        <View
          pointerEvents="none"
          style={[
            styles.centerButton,
            {
              width: centerButtonDiameter,
              height: centerButtonDiameter,
              borderRadius: centerButtonRadius,
              top: radius - centerButtonRadius,
              left: radius - centerButtonRadius,
            },
            activeButton === 'center' && styles.centerButtonActive,
          ]}
        />

        {/* Subtle inner ring line for visual depth */}
        <View
          style={[
            styles.innerRing,
            {
              width: centerButtonDiameter + 6,
              height: centerButtonDiameter + 6,
              borderRadius: (centerButtonDiameter + 6) / 2,
              top: radius - (centerButtonDiameter + 6) / 2,
              left: radius - (centerButtonDiameter + 6) / 2,
            },
          ]}
          pointerEvents="none"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    overflow: 'hidden',
  },
  wheelSurface: {
    backgroundColor: Colors.wheel.surface,
    justifyContent: 'center',
    alignItems: 'center',
    // Subtle gradient effect via border
    borderWidth: 1,
    borderColor: Colors.wheel.border,
  },
  // Button zones positioned at cardinal directions
  buttonZone: {
    position: 'absolute',
    width: 60,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  buttonActive: {
    backgroundColor: Colors.wheel.activeZone,
  },
  menuButton: {
    top: '6%',
    alignSelf: 'center',
    left: '50%',
    marginLeft: -30,
  },
  prevButton: {
    left: '4%',
    top: '50%',
    marginTop: -18,
  },
  nextButton: {
    right: '4%',
    top: '50%',
    marginTop: -18,
  },
  playPauseButton: {
    bottom: '6%',
    alignSelf: 'center',
    left: '50%',
    marginLeft: -30,
  },
  buttonLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.wheel.labelText,
    letterSpacing: 1.5,
  },
  buttonIcon: {
    fontSize: 16,
    color: Colors.wheel.labelText,
  },
  centerButton: {
    position: 'absolute',
    backgroundColor: Colors.wheel.centerButton,
    // Subtle pearl sheen via shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  centerButtonActive: {
    backgroundColor: Colors.wheel.centerButtonPressed,
  },
  innerRing: {
    position: 'absolute',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
});
