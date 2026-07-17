# iPod-skin music player — v1 development plan

## 0. What changed from the first draft

Original idea: render the iPod as a fixed-aspect-ratio object floating on a neutral background (letterbox style). Rejected — you want the **phone screen itself to be the device**, edge to edge, on any phone, no ambient stage. This is the right call for the illusion: the moment there's a background around it, the brain reads it as "an app showing a picture of an iPod." Full-bleed reads as "this device."

This means the actual hard problem isn't shadows or lighting — it's that **no phone has the iPod's aspect ratio**, and you're filling the whole screen, so you can't dodge the mismatch by shrinking the render. You have to make the iPod's own proportions adaptive without looking stretched. That's the core design problem this plan solves.

---

## 1. Core design principle: fixed parts vs. elastic parts

An iPod Classic body is roughly **1.7 : 1** (height:width). A phone screen is **2.15–2.3 : 1** or narrower on some Android devices. If you scale the whole graphic uniformly to fill the screen, the click wheel becomes an oval and the screen module gets warped — that's the "feels odd" you're trying to avoid.

The fix: **not everything scales the same way.**

| Zone | Behavior | Why |
|---|---|---|
| Click wheel | **Fixed diameter, always a perfect circle** | An oval wheel is the single fastest way to break the illusion. Thumb ergonomics also require a consistent physical size regardless of phone. |
| Menu label bar (above wheel) | Fixed height | It's a thin text row in the original; it never needed to scale. |
| Bottom safe-area padding | Fixed, small | Matches home-indicator/gesture-bar exclusion zones. |
| Side bezel margins | Fixed % of width (not height) | Keeps the metal edge feeling consistent across phone widths. |
| **Screen/display module** | **Elastic — absorbs 100% of the extra vertical space** | This is the trick. Modern phones are taller than the original iPod, not wider. So the screen just becomes a bigger, taller display than the 2004 original. That reads as "upgraded screen," not "stretched graphic," because nothing about a taller rectangular display looks wrong the way a stretched circle does. |

So the algorithm, given screen width `W` and height `H`:

```
wheelDiameter   = W * 0.70          // tune 0.66–0.74 in testing, must stay circular
topBarHeight    = 44                // fixed dp, "MENU" label row
bottomPadding   = safeAreaBottom + 16
sideMargin      = W * 0.045         // fixed % of width, both sides

availableHeight = H - wheelDiameter - topBarHeight - bottomPadding - safeAreaTop
screenModuleHeight = availableHeight   // 100% goes to the display, nothing else stretches
screenModuleWidth  = W - (sideMargin * 2)
```

Everything derives from `W`, not `H` — that's what keeps the wheel and bezels visually identical whether someone's on an iPhone SE or a 6.9" Android phablet. Only the display height changes per device, which is invisible to the eye because a taller screen just looks like more content.

**Corner radius**: don't hardcode a device-shaped corner. Read the phone's actual safe-area corner radius (via `react-native-safe-area-context` insets, or a native module for exact radius on iOS) and match the bezel's outer radius to it, so the metal edge appears continuous with the real hardware edge rather than a rectangle floating inside a rounded screen.

**Notch / Dynamic Island / punch-hole**: treat it as part of the top bezel, not something to avoid. A small sensor-hole sitting in a metal-colored top bar actually reads *more* like real iPod-era hardware (which had sensor cutouts), so lean into it rather than fighting it with black bars.

---

## 2. Full-bleed color/material rules

- Bezel color fills 100% of the screen edges — no visible OS chrome, ever. Status bar is set to overlay/translucent and colored to match the bezel so it disappears.
- No drop shadows, no ambient background, no "resting on a surface" treatment — you're not looking at a photo of a device, you're holding it.
- Material rendering still matters even without ambient lighting: a subtle static brushed-metal vertical gradient (aluminum) or glossy specular streak (black) on the bezel is fine — just don't animate it via gyroscope, since that implied a "photographed object in a scene," which we're now avoiding. Keep it static and subtle.

---

## 3. Component architecture

```
<IPodShell>                     // full-screen root, computes W/H, owns the layout math above
  <MenuBar />                   // fixed height, shows current screen title, back chevron
  <DisplayModule>                // elastic height — this is a navigable "screen" stack
    <NowPlayingView />
    <LibraryListView />
    <NowPlayingArtwork />
    ...
  </DisplayModule>
  <ClickWheel>                  // fixed diameter, always circular
    <WheelSurface />            // PanResponder / Gesture Handler, circular angle tracking
    <CenterButton />            // select/press
    <MenuLabel /><PrevIcon /><NextIcon /><PlayPauseIcon />
  </ClickWheel>
</IPodShell>
```

---

## 4. Tech stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | React Native (bare, not managed Expo) | Need native modules for folder access, background audio, haptics |
| Audio engine | `react-native-track-player` | Background playback, lock-screen controls, wraps ExoPlayer (Android) / AVFoundation (iOS) — both decode FLAC natively |
| File access — Android | Storage Access Framework via `react-native-document-picker` + persisted URI permissions | Required post scoped-storage (Android 11+) |
| File access — iOS | `UIDocumentPickerViewController` + persisted security-scoped bookmarks | No native "pick a folder" concept — user re-grants per picked folder, needs to be handled gracefully each session |
| Gestures | `react-native-gesture-handler` + `react-native-reanimated` | Circular drag-angle tracking for the wheel, spring physics for scroll momentum |
| Haptics | `react-native-haptic-feedback` | One tick per wheel detent |
| Metadata/art | `music-metadata` (or native tag parser) | ID3/FLAC tag + embedded art extraction |
| Safe area / corner radius | `react-native-safe-area-context` | Drives the elastic layout math in §1 |

---

## 5. Build phases

**Phase 1 — Layout engine (do this first, before any audio code)**
- Build `IPodShell` with the fixed/elastic math from §1, test on at least 4 simulated aspect ratios (iPhone SE 16:9-ish, standard 19.5:9, tall Android 20:9/21:9, and a squarer tablet ratio) to confirm the wheel never distorts and the bezel margins hold.
- This phase has no audio, no data — just get the shape right and stare at it on real devices before writing anything else.

**Phase 2 — Click wheel interaction**
- Circular `PanResponder` tracking: convert touch angle delta to scroll velocity, add momentum/deceleration matching the original's inertial feel (not linear).
- Haptic tick per detent, subtle toggleable click sound, press-depth animation on the four button zones.

**Phase 3 — Local playback**
- Folder picker (SAF / iOS document picker), persisted access.
- `react-native-track-player` integration — FLAC playback test early, on both platforms, with large files (FLAC edge cases are the most likely audio bug source).
- `DisplayModule` screens: library list, now playing, album art, scrolling text for long titles (marquee, like the original).

**Phase 4 — Polish**
- Cover Flow–style browsing (optional, high nostalgia value, high effort — decide after Phase 3 feedback).
- Playlists, search-via-wheel-scroll (like original's alphabet scrub).

**Phase 5 — Cloud storage tier (only after Phase 1–3 have real retained users)**
- Out of scope for v1. Flagged here only as a reminder: this phase adds real obligations (DMCA process, mandatory content-scanning pipeline before hosting arbitrary user video/images at scale). Don't start this until the local player has proven people actually use it daily.

---

## 6. Testing matrix (critical for the "feels right on any phone" goal)

Test the layout engine specifically on:
- A small-screen device (iPhone SE class, ~16:9)
- A standard modern phone (~19.5:9 — most iPhones)
- A tall Android flagship (~20:9 to 21:9)
- Tablet-ish aspect ratio, if you want to support it, or explicitly lock the app to phone-only

For each: confirm wheel stays circular, bezel margins look consistent, no OS chrome bleeds through, corner radius matches the physical device.

---

## 7. One standing flag, not a blocker

Full-bleed, edge-to-edge, exact click-wheel likeness pushes closer to Apple trade dress than the "inspired by" version — worth deciding deliberately (icon set, exact color values, sound design) how far to lean into exact replication vs. close homage before this gets any public visibility.
