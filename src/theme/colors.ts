/**
 * iPod Classic color palette.
 *
 * Silver/aluminum variant — the iconic brushed-metal look.
 * No garish colors; everything is metal, glass, and LCD backlight.
 */

export const Colors = {
  // ── Bezel / body ──────────────────────────────────────
  bezel: {
    /** Primary brushed aluminum */
    surface: '#C8CBCE',
    /** Slightly darker edge for depth (gradient bottom) */
    surfaceDark: '#A8ABB0',
    /** Highlight streak for subtle specular feel */
    highlight: '#E2E4E6',
  },

  // ── LCD Display ───────────────────────────────────────
  display: {
    /** Classic iPod LCD background — the warm white-blue backlight */
    background: '#D4DFE8',
    /** LCD text / icon color */
    text: '#1A1A2E',
    /** Selected / highlighted row */
    highlight: '#3478F6',
    /** Highlight text */
    highlightText: '#FFFFFF',
    /** Subtle LCD pixel grid overlay tint */
    gridTint: 'rgba(0, 0, 0, 0.03)',
    /** Progress bar / scrubber fill */
    accent: '#3478F6',
    /** Battery / status icons */
    statusIcon: '#2D2D3A',
    /** Display bezel (the dark surround of the screen) */
    bezel: '#333333',
    /** Inner shadow of the display inset */
    innerShadow: 'rgba(0, 0, 0, 0.25)',
  },

  // ── Click Wheel ───────────────────────────────────────
  wheel: {
    /** Wheel outer ring surface — slightly lighter than bezel */
    surface: '#E0E2E5',
    /** Center select button — lighter still, slight pearl sheen */
    centerButton: '#ECEEF0',
    /** Pressed state for center button */
    centerButtonPressed: '#D0D2D5',
    /** Button label text (MENU, ▶❚❚, etc.) */
    labelText: '#6B6E73',
    /** Active/pressed button zone highlight */
    activeZone: 'rgba(52, 120, 246, 0.12)',
    /** Wheel border / separation line */
    border: '#B8BBBD',
  },

  // ── Status Bar ────────────────────────────────────────
  statusBar: {
    /** Match bezel so it disappears */
    background: '#C8CBCE',
    text: '#555555',
  },
} as const;

export type ColorTheme = typeof Colors;
