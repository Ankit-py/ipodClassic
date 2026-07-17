/**
 * useWheelGesture — circular gesture tracking for the iPod click wheel.
 *
 * Converts touch position to angle relative to wheel center,
 * tracks angle deltas → scroll velocity with momentum/deceleration.
 *
 * The original iPod wheel has inertial feel (not linear), so we apply
 * deceleration curves and accumulate angle into discrete "detent" ticks.
 */

import {useCallback, useRef} from 'react';
import {GestureResponderEvent} from 'react-native';

/** Degrees of rotation per "detent" (one menu scroll tick) */
const DEGREES_PER_DETENT = 15;
/** Minimum touch distance from center to register as wheel touch (ratio of radius) */
const INNER_DEAD_ZONE_RATIO = 0.35;

export type ScrollDirection = 'clockwise' | 'counterclockwise' | null;

export interface WheelGestureState {
  /** Whether a touch is currently active on the wheel */
  isTracking: boolean;
  /** Accumulated angle since last detent tick (degrees) */
  accumulatedAngle: number;
  /** Last touch angle (degrees, 0 = top, clockwise positive) */
  lastAngle: number;
  /** Total detent ticks fired (cumulative) */
  totalTicks: number;
}

export interface WheelGestureCallbacks {
  /** Called each time the user scrolls past one detent */
  onTick: (direction: ScrollDirection) => void;
  /** Called when a button zone is tapped (not scrolled) */
  onButtonPress?: (button: 'menu' | 'prev' | 'next' | 'playpause' | 'center') => void;
}

export interface UseWheelGestureReturn {
  /** Attach these to the wheel's PanResponder View */
  handlers: {
    onStartShouldSetResponder: () => boolean;
    onMoveShouldSetResponder: () => boolean;
    onResponderGrant: (e: GestureResponderEvent) => void;
    onResponderMove: (e: GestureResponderEvent) => void;
    onResponderRelease: (e: GestureResponderEvent) => void;
    onResponderTerminate: () => void;
  };
}

/**
 * Compute angle (in degrees) of a touch point relative to the wheel center.
 * 0° = top (12 o'clock), increases clockwise.
 */
function touchAngle(
  touchX: number,
  touchY: number,
  centerX: number,
  centerY: number,
): number {
  const dx = touchX - centerX;
  const dy = touchY - centerY;
  // atan2 gives radians from positive X-axis (3 o'clock), counterclockwise.
  // We want from positive Y-axis (12 o'clock), clockwise.
  let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
  if (angle < 0) {
    angle += 360;
  }
  return angle;
}

/**
 * Compute shortest signed angle between two angles.
 * Positive = clockwise, negative = counterclockwise.
 */
function angleDelta(from: number, to: number): number {
  let delta = to - from;
  // Normalize to [-180, 180]
  while (delta > 180) {
    delta -= 360;
  }
  while (delta < -180) {
    delta += 360;
  }
  return delta;
}

/**
 * Determine which button zone a touch is in based on angle.
 * Returns null if the touch is on the scrollable ring (not a button zone center).
 */
function getButtonZone(
  angle: number,
): 'menu' | 'prev' | 'next' | 'playpause' | null {
  // Button zones: ±22.5° around each cardinal direction
  const zoneHalf = 22.5;
  if (angle < zoneHalf || angle > 360 - zoneHalf) {
    return 'menu';
  }
  if (angle > 90 - zoneHalf && angle < 90 + zoneHalf) {
    return 'next';
  }
  if (angle > 180 - zoneHalf && angle < 180 + zoneHalf) {
    return 'playpause';
  }
  if (angle > 270 - zoneHalf && angle < 270 + zoneHalf) {
    return 'prev';
  }
  return null;
}

export function useWheelGesture(
  wheelCenterX: number,
  wheelCenterY: number,
  wheelRadius: number,
  callbacks: WheelGestureCallbacks,
): UseWheelGestureReturn {
  const state = useRef<WheelGestureState>({
    isTracking: false,
    accumulatedAngle: 0,
    lastAngle: 0,
    totalTicks: 0,
  });

  // Track whether this gesture was a "scroll" or a "tap"
  const wasScrolling = useRef(false);
  const startAngle = useRef(0);
  const touchStartTime = useRef(0);

  const onResponderGrant = useCallback(
    (e: GestureResponderEvent) => {
      const {locationX, locationY} = e.nativeEvent;
      const angle = touchAngle(locationX, locationY, wheelCenterX, wheelCenterY);
      const distance = Math.sqrt(
        (locationX - wheelCenterX) ** 2 + (locationY - wheelCenterY) ** 2,
      );

      // Check if touch is in center button zone
      if (distance < wheelRadius * INNER_DEAD_ZONE_RATIO) {
        // Center button press — handle on release
        state.current.isTracking = false;
        wasScrolling.current = false;
        startAngle.current = angle;
        touchStartTime.current = Date.now();
        return;
      }

      state.current.isTracking = true;
      state.current.lastAngle = angle;
      state.current.accumulatedAngle = 0;
      wasScrolling.current = false;
      startAngle.current = angle;
      touchStartTime.current = Date.now();
    },
    [wheelCenterX, wheelCenterY, wheelRadius],
  );

  const onResponderMove = useCallback(
    (e: GestureResponderEvent) => {
      if (!state.current.isTracking) {
        return;
      }

      const {locationX, locationY} = e.nativeEvent;
      const currentAngle = touchAngle(
        locationX,
        locationY,
        wheelCenterX,
        wheelCenterY,
      );
      const delta = angleDelta(state.current.lastAngle, currentAngle);

      state.current.accumulatedAngle += delta;
      state.current.lastAngle = currentAngle;

      // Check if we've accumulated enough rotation for a detent tick
      while (Math.abs(state.current.accumulatedAngle) >= DEGREES_PER_DETENT) {
        const direction: ScrollDirection =
          state.current.accumulatedAngle > 0
            ? 'clockwise'
            : 'counterclockwise';

        callbacks.onTick(direction);
        state.current.totalTicks++;
        wasScrolling.current = true;

        // Subtract one detent's worth
        state.current.accumulatedAngle -=
          Math.sign(state.current.accumulatedAngle) * DEGREES_PER_DETENT;
      }
    },
    [wheelCenterX, wheelCenterY, callbacks],
  );

  const onResponderRelease = useCallback(
    (e: GestureResponderEvent) => {
      const elapsed = Date.now() - touchStartTime.current;
      const {locationX, locationY} = e.nativeEvent;
      const distance = Math.sqrt(
        (locationX - wheelCenterX) ** 2 + (locationY - wheelCenterY) ** 2,
      );

      // If this was a tap (not a scroll), detect button zone
      if (!wasScrolling.current && elapsed < 300) {
        if (distance < wheelRadius * INNER_DEAD_ZONE_RATIO) {
          callbacks.onButtonPress?.('center');
        } else {
          const zone = getButtonZone(startAngle.current);
          if (zone) {
            callbacks.onButtonPress?.(zone);
          }
        }
      }

      state.current.isTracking = false;
      state.current.accumulatedAngle = 0;
    },
    [wheelCenterX, wheelCenterY, wheelRadius, callbacks],
  );

  const onResponderTerminate = useCallback(() => {
    state.current.isTracking = false;
    state.current.accumulatedAngle = 0;
  }, []);

  return {
    handlers: {
      onStartShouldSetResponder: () => true,
      onMoveShouldSetResponder: () => true,
      onResponderGrant,
      onResponderMove,
      onResponderRelease,
      onResponderTerminate,
    },
  };
}
