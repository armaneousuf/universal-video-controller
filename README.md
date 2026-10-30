# Universal Video Controller

A draggable floating video controller that works on any page with a `<video>` element.

Playback speed, precise scrubbing, audio boost, video filters, ad skipping and feed
auto-advance — one small glassmorphic bar, injected into every site.

---

## What it is

Universal Video Controller (UVC) is a Chrome extension using Manifest V3. It injects a
small control bar into any page that contains a video. It does not care which site you
are on — YouTube, X/Twitter, Instagram, Facebook, TikTok, a course platform, a
self-hosted player — if there is a `<video>` on the page, the controller appears.

The bar is draggable, remembers where you left it, and can collapse into a tiny circle
when you want it out of the way.

---

## Features

### Playback

- **Live time readout** — `current / total`, in the format you choose.
- **Scrub interval** — the jump-back / jump-forward buttons and the arrow keys move by
  2s, 5s, 10s, 30s or 60s.
- **Speed cycling** — click the speed pill to cycle `1x → 1.25x → 1.5x → 2x → 3x → 4x → 0.5x`, or
  pick an exact speed in the settings panel.
- **Keep speed across videos** — pin a playback rate and every new video inherits it
  (useful for lecture sites that reset speed on every reload).

### Audio and video effects

- **Audio booster** — up to 400% volume using a Web Audio `GainNode`.
- **Brightness / contrast** — 50% to 200%.
- **Grayscale** — 0% to 100%.
- **Invert colors** — instant dark-mode-ish viewing.

All filters are non-destructive CSS on the video element and reset instantly.

### Automation

- **Auto-skip ads** — detects "Sponsored" / "Ad" / "Promoted" markers next to the
  playing video in short-form feeds and advances past them.
- **Auto-scroll feeds** — when a video ends or loops, moves to the next one. Handles
  platform arrow buttons, scrollable containers, Instagram touch swipes, and a plain
  ArrowDown fallback.

### Quality of life

- **Picture-in-Picture** — pop the video out with one click.
- **Collapsible** — shrink the bar into a 24px circle.
- **Draggable and persistent** — position, settings and collapse state are saved in
  `chrome.storage.local` and restored on every page.
- **Always show controller** — keep the bar visible even when nothing is playing.
- **Works in YouTube embeds** — runs inside `/embed/` frames, but ignores unrelated ad
  and Instagram embed iframes.
- **Keyboard scrubbing** — `←` / `→` seek by the configured interval. Ignored while
  typing in an input, textarea or contenteditable field.

---

## Installation (unpacked)

1. Clone or download this repository.
2. Open `chrome://extensions` in Chrome or any Chromium browser.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the repository folder — the one containing
   `manifest.json`.
5. Open any page with a video. The controller appears at the top left and can be
   dragged anywhere.

---

## Using the controller

| Element       | Action                                    |
| ------------- | ----------------------------------------- |
| `«` / `»`     | Jump back / forward by the scrub interval |
| `0:42 / 5:00` | Live current / total time                 |
| `1x`          | Cycle playback speeds                     |
| gear icon     | Open the settings panel                   |
| collapse icon | Collapse / expand the bar                 |
| Drag the bar  | Move it — the position is remembered      |

### Settings panel

| Section                | Setting                  | Options                    |
| ---------------------- | ------------------------ | -------------------------- |
| Playback & Controls    | Playback Speed           | 0.5x, 1x, 1.25x, 1.5x, 2x, 3x, 4x |
|                        | Keep Speed Across Videos | on / off                   |
|                        | Scrub Interval           | 2s, 5s, 10s, 30s, 60s      |
|                        | Time Display             | Auto, H:M:S, Minutes       |
|                        | Screencast Window        | toggle picture-in-picture  |
| Automation & Scrolling | Auto-Skip Ads            | on / off                   |
|                        | Auto-Scroll Video Feeds  | on / off                   |
| Audio & Video FX       | Audio Booster            | 100% – 400%                |
|                        | Brightness               | 50% – 200%                 |
|                        | Contrast                 | 50% – 200%                 |
|                        | Grayscale                | 0% – 100%                  |
|                        | Invert Image Colors      | on / off                   |
|                        | Always Show Controller   | on / off                   |
| Bottom                 | Reset to Defaults        | restores everything        |

The panel's scrollbar is hidden; a pulsing chevron along the bottom edge indicates
that more settings are available below.

**Time display modes**

- **Auto** — `m:ss` until the video passes one hour, then `h:mm:ss`.
- **H:M:S** — always `h:mm:ss`.
- **Minutes** — total minutes instead of hours (`125:03`).

---

## Repository layout

```
.
├── manifest.json              # MV3 manifest: one content script, all URLs, all frames
├── content.js                 # The full extension (UI, settings, engines, ad skipper)
├── icons/                     # 16 / 48 / 128 px icons
├── lightweightVersion/
│   └── v2Content.js           # Minimal early prototype (not loaded by the manifest)
├── .vscode/settings.json
└── README.md
```

`lightweightVersion/v2Content.js` is kept for reference — it is the stripped-down
original with scrubbing, speed, a timer and dragging. It is **not** referenced by
`manifest.json` and is not part of the installed extension.

---

## How it works

`content.js` is a single IIFE with numbered sections:

| #   | Section               | Responsibility                                                                          |
| --- | --------------------- | --------------------------------------------------------------------------------------- |
| 0   | Iframe guard          | Runs at top level, or inside a YouTube `/embed/` frame                                  |
| 1   | Injected CSS          | Glassmorphic bar, settings panel, switches, segment buttons                             |
| 2   | Default settings      | Every persisted preference and its default                                              |
| 3   | DOM construction      | Builds the bar and panel with inline SVG icons                                          |
| 4   | Persistence           | `chrome.storage.local` reads and writes                                                 |
| 5   | Engines               | Active-video detection, CSS filters, Web Audio boost, PiP, feed scroll, time formatting |
| 6–8 | Event wiring          | Buttons, speed cycling, dragging, every settings control                                |
| 9   | Polling loop (300 ms) | Timer updates, filters, audio boost, speed lock, auto-scroll trigger, auto-hide         |
| 10  | Keyboard              | `←` / `→` scrubbing                                                                     |
| 11  | Ad detection (500 ms) | Finds "Sponsored" markers near the playing video and advances                           |

### Notable implementation details

- **Finding the video**: the controller uses the first `<video>` that is playing or
  seeking with `readyState > 0`, so background and preload videos are ignored.
- **Audio boost** keeps a per-video `WeakMap` of `AudioContext`s. If a CORS-restricted
  track would be silenced by the Web Audio graph, the error is caught once and the
  original audio path is left untouched.
- **Ad skipping is scoped**: a "Sponsored" label only counts if it sits near the playing
  video, so sidebar or footer ads do not trigger a scroll.
- **Feed advance** degrades gracefully: platform "next" buttons, then a scrollable
  ancestor, then an Instagram touch swipe simulation, then ArrowDown plus window scroll.
- **Isolation**: every event on the bar and panel calls `stopPropagation()`, so host
  sites with global click and keyboard handlers do not react.
- **No text selection** inside the bar, so dragging never highlights page text.

---

## Permissions

| Permission                  | Why                                                |
| --------------------------- | -------------------------------------------------- |
| `storage`                   | Save settings, position and collapse state locally |
| `<all_urls>` content script | The controller must find videos on any site        |

There is no background service worker, no network requests and no telemetry. Settings
never leave your machine.

---

## Known limitations

- Only the top-level document and YouTube embeds are handled. Videos inside other
  cross-origin iframes are not visible to the extension.
- Auto-skip and auto-scroll are heuristics tuned for YouTube Shorts, TikTok, Instagram
  Reels and Facebook feeds. Other sites may need selector tweaks.
- Audio boost cannot work on tracks that fail the CORS check for Web Audio. The
  extension leaves the audio untouched instead of breaking it.
- Filters are applied by the 300 ms polling loop, so a site that continuously rewrites
  the element's `style` attribute may fight the extension.

---

## Development

There is no build step. `content.js` is exactly what Chrome loads.

1. Edit `content.js`.
2. Reload the extension in `chrome://extensions` (the refresh button).
3. Refresh the tab you are testing on.

Useful places to start:

- `defaultSettings` (section 2) — add a new preference here first.
- The settings panel markup in section 3 — segment buttons use `data-val` and are wired
  automatically by `setupSegmentListener`.
- The 300 ms loop in section 9 — the single place where per-video state is applied.
