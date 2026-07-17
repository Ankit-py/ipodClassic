/**
 * iPod Classic adaptive layout engine.
 *
 * Implements the fixed-parts vs. elastic-parts algorithm from the dev plan §1.
 * Everything derives from screen width W (not height) — this keeps the wheel
 * and bezels visually identical across devices. Only the display height changes.
 */

import {useMemo} from 'react';
import {useWindowDimensions, Platform, StatusBar} from 'react-native';
import {useSafeAreaInsets, EdgeInsets} from 'react-native-safe-area-context';

export interface IPodLayout {
  /** Full screen width */
  screenWidth: number;
  /** Full screen height */
  screenHeight: number;

  // ── Fixed zones ──
  /** Click wheel diameter — always a perfect circle */
  wheelDiameter: number;
  /** Menu bar height (fixed dp) */
  topBarHeight: number;
  /** Bottom padding including safe area */
  bottomPadding: number;
  /** Side bezel margin (each side) */
  sideMargin: number;
  /** Top safe area inset */
  safeAreaTop: number;

  // ── Elastic zone ──
  /** Display module height — absorbs 100% of extra vertical space */
  displayHeight: number;
  /** Display module width (screen width minus side margins) */
  displayWidth: number;

  // ── Computed positions ──
  /** Y position of the display module (below safe area + top bar) */
  displayTop: number;
  /** Y position of the click wheel (below display) */
  wheelTop: number;
  /** Center X of the wheel */
  wheelCenterX: number;
  /** Center Y of the wheel (absolute from screen top) */
  wheelCenterY: number;

  /** Safe area insets from the device */
  insets: EdgeInsets;
}

/** Tuning constants — adjust in testing per the plan */
const WHEEL_DIAMETER_RATIO = 0.70; // tune 0.66–0.74
const TOP_BAR_HEIGHT = 16; // fixed top bezel margin (reduced since MenuBar is gone)
const BOTTOM_EXTRA_PADDING = 16;
const SIDE_MARGIN_RATIO = 0.045; // fixed % of width

/**
 * Core layout computation — pure function, no hooks.
 * Use this for testing or non-component contexts.
 */
export function computeIPodLayout(
  W: number,
  H: number,
  insets: EdgeInsets,
): IPodLayout {
  const wheelDiameter = W * WHEEL_DIAMETER_RATIO;
  const topBarHeight = TOP_BAR_HEIGHT;
  const bottomPadding = insets.bottom + BOTTOM_EXTRA_PADDING;
  const sideMargin = W * SIDE_MARGIN_RATIO;
  const safeAreaTop = insets.top;

  // The elastic zone: everything left over goes to the display
  const availableHeight =
    H - safeAreaTop - topBarHeight - wheelDiameter - bottomPadding;

  // Clamp to a reasonable minimum so the display never fully collapses
  const displayHeight = Math.max(availableHeight, 80);
  const displayWidth = W - sideMargin * 2;

  // Positions
  const displayTop = safeAreaTop + topBarHeight;
  const wheelTop = displayTop + displayHeight;
  const wheelCenterX = W / 2;
  const wheelCenterY = wheelTop + wheelDiameter / 2;

  return {
    screenWidth: W,
    screenHeight: H,
    wheelDiameter,
    topBarHeight,
    bottomPadding,
    sideMargin,
    safeAreaTop,
    displayHeight,
    displayWidth,
    displayTop,
    wheelTop,
    wheelCenterX,
    wheelCenterY,
    insets,
  };
}

/**
 * React hook — computes the iPod layout from current device dimensions.
 * Re-computes on rotation or window resize.
 */
export function useIPodLayout(): IPodLayout {
  const {width: W, height: H} = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return useMemo(() => computeIPodLayout(W, H, insets), [W, H, insets]);
}
