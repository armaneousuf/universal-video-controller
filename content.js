// ==========================================
// 0. IFRAME GUARD — only run in top-level document
// ==========================================
(function () {
  if (window.self !== window.top) {
    // If it's an iframe, check if it's actually the YouTube embedded player
    const isYouTubeEmbed =
      window.location.hostname.includes("youtube.com") &&
      window.location.pathname.includes("/embed/");

    if (!isYouTubeEmbed) {
      // If it's a random ad or Instagram embed iframe, bail out quietly
      return;
    }
  }

  // ==========================================
  // 1. INJECT GLASSMORPHIC MINT CSS (PIXEL PERFECT & TIGHT)
  // ==========================================
  const style = document.createElement("style");
  style.textContent = `
  /* Main Container - Glassmorphic Aesthetic */
  .uvc-container {
    position: fixed;
    top: 12px;
    left: 12px;
    background-color: rgba(18, 18, 18, 0.85);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    color: #ffffff;
    padding: 2px 4px;
    border-radius: 12px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 11px;
    font-weight: 600;
    z-index: 2147483647;
    cursor: grab;
    display: none;
    align-items: center;
    gap: 3px;
    border: 1px solid rgba(9, 243, 107, 0.2);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    transition: border-color 0.2s, box-shadow 0.2s, border-radius 0.2s;
    transform-origin: top left;
    height: 24px;
    box-sizing: border-box;

    /* Stop text selection inside container */
    user-select: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
  }

  /* Ensure children also ignore selection events */
  .uvc-container * {
    user-select: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
  }

  .uvc-container:hover {
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
  }

  .uvc-container:active {
    cursor: grabbing;
  }

  /* Lock cursor state when settings panel is open */
  .uvc-container.settings-active {
    cursor: default !important;
  }

  /* Collapsed Circular State */
  .uvc-container.collapsed {
    width: 24px;
    height: 24px;
    padding: 0;
    border-radius: 50%;
    justify-content: center;
    gap: 0;
    background-color: #324f454a;
    border: 1.5px solid #21782d8a;
  }
  .uvc-container.collapsed .uvc-btn:not(.uvc-collapse-btn),
  .uvc-container.collapsed .uvc-text {
    display: none !important;
  }
  .uvc-collapse-btn {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;
  }

  /* Interactive Buttons */
  .uvc-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 0;
    border-radius: 50%;
    transition: background-color 0.15s, color 0.15s, transform 0.1s;
    color: rgba(255, 255, 255, 0.75);
    box-sizing: border-box;
  }
  .uvc-btn svg {
    stroke: currentColor;
    display: block;
  }
  .uvc-btn:hover {
    color: #ffffff;
    background-color: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
  }
  .uvc-btn:active {
    transform: scale(0.95);
  }

  /* Speed Selector Button */
  .uvc-speed-btn {
    font-size: 10px;
    font-weight: 700;
    width: auto;
    min-width: 26px;
    padding: 0 2px;
    border-radius: 4px;
    letter-spacing: -0.1px;
  }

  /* Time Display */
  .uvc-text {
    min-width: 66px;
    text-align: center;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.1px;
    color: rgba(255, 255, 255, 0.9);
    line-height: 20px;
    display: inline-block;
  }

  /* ==========================================
   * REDESIGNED PERFECTLY ALIGNED SETTINGS PANEL
   * ========================================== */
  .uvc-settings-panel {
    display: none;
    flex-direction: column;
    position: fixed;
    width: 240px;
    background-color: rgba(18, 18, 18, 0.94);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 10px;
    padding: 10px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
    z-index: 2147483647;
    max-height: 360px;
    overflow-y: auto;
    gap: 7px;
    font-weight: normal;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    box-sizing: border-box;
  }

  .uvc-settings-panel.show {
    display: flex;
  }

  /* Custom Panel Scrollbar */
  .uvc-settings-panel::-webkit-scrollbar {
    width: 3px;
  }
  .uvc-settings-panel::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.12);
    border-radius: 3px;
  }

  .uvc-section-title {
    font-size: 9px;
    letter-spacing: 0.8px;
    color: #34d399; /* Mint Green Accent */
    margin: 4px 0 2px 0;
    font-weight: 700;
    opacity: 0.85;
    text-transform: uppercase;
    border-bottom: 1px solid rgba(52, 211, 153, 0.15);
    padding-bottom: 2px;
  }

  .uvc-control-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.85);
    padding: 1px 0;
    min-height: 20px;
  }

  .uvc-control-row label {
    cursor: pointer;
    line-height: 1.2;
  }

  /* Multi-Choice Clickable Segment Selectors */
  .uvc-control-group {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 1px 0;
  }
  .uvc-control-label {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.45);
    font-weight: 500;
  }
  .uvc-segment-container {
    display: flex;
    gap: 2px;
    width: 100%;
    background: rgba(255, 255, 255, 0.02);
    padding: 2px;
    border-radius: 5px;
    border: 1px solid rgba(255, 255, 255, 0.04);
    box-sizing: border-box;
  }
  .uvc-segment-btn {
    flex: 1;
    background: transparent;
    border: none;
    border-radius: 3px;
    color: rgba(255, 255, 255, 0.55);
    padding: 3px 0;
    font-size: 9px;
    font-weight: 600;
    text-align: center;
    cursor: pointer;
    transition: all 0.12s ease;
  }
  .uvc-segment-btn:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.04);
  }
  .uvc-segment-btn.active {
    background: rgba(52, 211, 153, 0.14);
    color: #34d399;
    font-weight: 700;
  }

  /* Modern Pill Toggle Switch */
  .uvc-switch {
    position: relative;
    display: inline-block;
    width: 28px;
    height: 15px;
    flex-shrink: 0;
  }
  .uvc-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  .uvc-slider-switch {
    position: absolute;
    cursor: pointer;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(255, 255, 255, 0.08);
    transition: .15s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 10px;
  }
  .uvc-slider-switch:before {
    position: absolute;
    content: "";
    height: 9px;
    width: 9px;
    left: 3px;
    bottom: 3px;
    background-color: rgba(255, 255, 255, 0.85);
    transition: .15s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 50%;
  }
  input:checked + .uvc-slider-switch {
    background-color: #34d399;
  }
  input:checked + .uvc-slider-switch:before {
    transform: translateX(13px);
    background-color: #ffffff;
  }

  /* Minimalist Action Buttons */
  .uvc-btn-pip {
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.8) !important;
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 5px;
    padding: 3px 6px;
    font-size: 10px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    transition: all 0.15s ease;
    height: 18px;
    box-sizing: border-box;
  }
  .uvc-btn-pip:hover {
    background: rgba(52, 211, 153, 0.12);
    border-color: rgba(52, 211, 153, 0.2);
    color: #34d399 !important;
  }
  .uvc-btn-pip:active {
    transform: scale(0.97);
  }
  .uvc-warning-text {
    font-size: 8px;
    color: rgba(255, 255, 255, 0.3);
    line-height: 1.2;
    margin-top: 1px;
    padding: 0 1px;
  }

  /* Reset Defaults Button */
  .uvc-btn-reset {
    background: transparent;
    color: rgba(255, 255, 255, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 5px;
    padding: 5px 10px;
    font-size: 10px;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    text-align: center;
    transition: all 0.15s ease;
    margin-top: 3px;
    box-sizing: border-box;
  }
  .uvc-btn-reset:hover {
    background: rgba(239, 68, 68, 0.08);
    border-color: rgba(239, 68, 68, 0.18);
    color: #ef4444;
  }
  .uvc-btn-reset:active {
    transform: scale(0.98);
  }
  `;
  document.head.appendChild(style);

  // ==========================================
  // 2. MASTER CONFIGURATION DEFAULT BOUNDS
  // ==========================================
  const defaultSettings = {
    skipInterval: 5,
    speedLock: false,
    lockedSpeed: 1.0,
    audioBoost: 1.0,
    videoBrightness: 100,
    videoContrast: 100,
    videoGrayscale: 0,
    videoInvert: false,
    adSkipperEnabled: true,
    autoScrollEnabled: false,
    stayVisible: false,
    isCollapsed: false,
  };

  let uvcSettings = { ...defaultSettings };
  const audioCtxs = new WeakMap();

  // ==========================================
  // 3. CREATE THE DOM ELEMENTS
  // ==========================================
  const timeBox = document.createElement("div");
  timeBox.className = "uvc-container";

  const backBtn = document.createElement("button");
  backBtn.className = "uvc-btn";
  backBtn.title = "Jump Backwards";
  backBtn.innerHTML = `
 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
 <polygon points="11 19 2 12 11 5 11 19"></polygon>
 <polygon points="22 19 13 12 22 5 22 19"></polygon>
 </svg>
 `;

  const timeText = document.createElement("span");
  timeText.className = "uvc-text";
  timeText.innerText = "0:00 - 0:00";

  const forwardBtn = document.createElement("button");
  forwardBtn.className = "uvc-btn";
  forwardBtn.title = "Jump Forwards";
  forwardBtn.innerHTML = `
 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
 <polygon points="13 19 22 12 13 5 13 19"></polygon>
 <polygon points="2 19 11 12 2 5 2 19"></polygon>
 </svg>
 `;

  const speedBtn = document.createElement("button");
  speedBtn.className = "uvc-btn uvc-speed-btn";
  speedBtn.title = "Cycle Velocities";
  speedBtn.innerText = "1x";

  const settingsBtn = document.createElement("button");
  settingsBtn.className = "uvc-btn";
  settingsBtn.title = "Controller Preferences";
  settingsBtn.innerHTML = `
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
 <circle cx="12" cy="12" r="3"></circle>
 <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
 </svg>
 `;

  const collapseBtn = document.createElement("button");
  collapseBtn.className = "uvc-btn uvc-collapse-btn";

  const iconCollapse = `
 <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 32 32"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="m23 26l-7-7l-7 7M9 6l7 7l7-7"/></svg>
 `;

  const iconExpand = `
 <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="16" stroke-width="2" d="M19 12V9c0-1.886 0-2.828-.586-3.414S16.886 5 15 5h-3m-7 7v3c0 1.886 0 2.828.586 3.414S7.114 19 9 19h3"/></svg>
 `;

  const settingsPanel = document.createElement("div");
  settingsPanel.className = "uvc-settings-panel";
  settingsPanel.innerHTML = `
 <div class="uvc-section-title">playback & controls</div>

 <div class="uvc-control-group">
 <div class="uvc-control-label">Playback Speed</div>
 <div class="uvc-segment-container" id="uvc-seg-speed">
 <button class="uvc-segment-btn" data-val="0.5">0.5x</button>
 <button class="uvc-segment-btn" data-val="1">1x</button>
 <button class="uvc-segment-btn" data-val="1.5">1.5x</button>
 <button class="uvc-segment-btn" data-val="2">2x</button>
 <button class="uvc-segment-btn" data-val="3">3x</button>
 <button class="uvc-segment-btn" data-val="4">4x</button>
 </div>
 </div>

 <div class="uvc-control-row">
 <label for="uvc-toggle-speedlock">Keep Speed Across Videos</label>
 <label class="uvc-switch">
 <input type="checkbox" id="uvc-toggle-speedlock">
 <span class="uvc-slider-switch"></span>
 </label>
 </div>

 <div class="uvc-control-group">
 <div class="uvc-control-label">Scrub Interval</div>
 <div class="uvc-segment-container" id="uvc-seg-skip">
 <button class="uvc-segment-btn" data-val="2">2s</button>
 <button class="uvc-segment-btn" data-val="5">5s</button>
 <button class="uvc-segment-btn" data-val="10">10s</button>
 <button class="uvc-segment-btn" data-val="30">30s</button>
 <button class="uvc-segment-btn" data-val="60">60s</button>
 </div>
 </div>

 <div class="uvc-control-row">
 <label>Screencast Window</label>
 <button class="uvc-btn-pip" id="uvc-btn-pip-trigger">
 <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:2px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M13 13h7v7h-7z"></path></svg>
 PiP
 </button>
 </div>

 <div class="uvc-section-title">automation & scrolling</div>

 <div class="uvc-control-row">
 <label for="uvc-toggle-adskip">Auto-Skip Ads</label>
 <label class="uvc-switch">
 <input type="checkbox" id="uvc-toggle-adskip">
 <span class="uvc-slider-switch"></span>
 </label>
 </div>

 <div class="uvc-control-row">
 <label for="uvc-toggle-autoscroll">Auto-Scroll Video Feeds</label>
 <label class="uvc-switch">
 <input type="checkbox" id="uvc-toggle-autoscroll">
 <span class="uvc-slider-switch"></span>
 </label>
 </div>

 <div class="uvc-section-title">audio & video fx</div>

 <div class="uvc-control-group">
 <div class="uvc-control-label">Audio Booster</div>
 <div class="uvc-segment-container" id="uvc-seg-boost">
 <button class="uvc-segment-btn" data-val="1">100%</button>
 <button class="uvc-segment-btn" data-val="1.5">150%</button>
 <button class="uvc-segment-btn" data-val="2">200%</button>
 <button class="uvc-segment-btn" data-val="3">300%</button>
 <button class="uvc-segment-btn" data-val="4">400%</button>
 </div>
 <span class="uvc-warning-text">⚠️ Restrictive domains may silence cross-origin tracks.</span>
 </div>

 <div class="uvc-control-group">
 <div class="uvc-control-label">Brightness</div>
 <div class="uvc-segment-container" id="uvc-seg-bright">
 <button class="uvc-segment-btn" data-val="50">50%</button>
 <button class="uvc-segment-btn" data-val="100">100%</button>
 <button class="uvc-segment-btn" data-val="150">150%</button>
 <button class="uvc-segment-btn" data-val="200">200%</button>
 </div>
 </div>

 <div class="uvc-control-group">
 <div class="uvc-control-label">Contrast</div>
 <div class="uvc-segment-container" id="uvc-seg-contrast">
 <button class="uvc-segment-btn" data-val="50">50%</button>
 <button class="uvc-segment-btn" data-val="100">100%</button>
 <button class="uvc-segment-btn" data-val="150">150%</button>
 <button class="uvc-segment-btn" data-val="200">200%</button>
 </div>
 </div>

 <div class="uvc-control-group">
 <div class="uvc-control-label">Grayscale</div>
 <div class="uvc-segment-container" id="uvc-seg-grayscale">
 <button class="uvc-segment-btn" data-val="0">0%</button>
 <button class="uvc-segment-btn" data-val="25">25%</button>
 <button class="uvc-segment-btn" data-val="50">50%</button>
 <button class="uvc-segment-btn" data-val="100">100%</button>
 </div>
 </div>

 <div class="uvc-control-row">
 <label for="uvc-toggle-invert">Invert Image Colors</label>
 <label class="uvc-switch">
 <input type="checkbox" id="uvc-toggle-invert">
 <span class="uvc-slider-switch"></span>
 </label>
 </div>

 <div class="uvc-control-row">
 <label for="uvc-toggle-visible">Always Show Controller</label>
 <label class="uvc-switch">
 <input type="checkbox" id="uvc-toggle-visible">
 <span class="uvc-slider-switch"></span>
 </label>
 </div>

 <button class="uvc-btn-reset" id="uvc-btn-reset">Reset to Defaults</button>
 `;

  // Assemble floating elements
  timeBox.appendChild(backBtn);
  timeBox.appendChild(timeText);
  timeBox.appendChild(forwardBtn);
  timeBox.appendChild(speedBtn);
  timeBox.appendChild(settingsBtn);
  timeBox.appendChild(collapseBtn);
  document.body.appendChild(timeBox);
  document.body.appendChild(settingsPanel);

  // ==========================================
  // 4. PRESERVATION LOGIC (CHROME STORAGE)
  // ==========================================
  function saveSettings() {
    chrome.storage.local.set({ uvcSettings });
  }

  function selectSegmentActive(containerId, value) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const buttons = container.querySelectorAll(".uvc-segment-btn");
    buttons.forEach((btn) => {
      if (parseFloat(btn.getAttribute("data-val")) === parseFloat(value)) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  function applyCollapseState() {
    if (uvcSettings.isCollapsed) {
      timeBox.classList.add("collapsed");
      collapseBtn.innerHTML = iconExpand;
      collapseBtn.title = "Expand Controller";
      if (settingsPanel.classList.contains("show")) {
        settingsPanel.classList.remove("show");
        timeBox.classList.remove("settings-active");
      }
    } else {
      timeBox.classList.remove("collapsed");
      collapseBtn.innerHTML = iconCollapse;
      collapseBtn.title = "Collapse Controller";
    }
  }

  function loadSettings() {
    chrome.storage.local.get(["uvcSettings"], (result) => {
      if (result.uvcSettings) {
        uvcSettings = { ...uvcSettings, ...result.uvcSettings };
      }

      selectSegmentActive("uvc-seg-speed", uvcSettings.lockedSpeed);
      speedBtn.innerText = `${uvcSettings.lockedSpeed}x`;

      selectSegmentActive("uvc-seg-skip", uvcSettings.skipInterval);
      selectSegmentActive("uvc-seg-boost", uvcSettings.audioBoost);
      selectSegmentActive("uvc-seg-bright", uvcSettings.videoBrightness);
      selectSegmentActive("uvc-seg-contrast", uvcSettings.videoContrast);
      selectSegmentActive("uvc-seg-grayscale", uvcSettings.videoGrayscale);

      document.getElementById("uvc-toggle-speedlock").checked = uvcSettings.speedLock;
      document.getElementById("uvc-toggle-adskip").checked = uvcSettings.adSkipperEnabled;
      document.getElementById("uvc-toggle-autoscroll").checked = uvcSettings.autoScrollEnabled;
      document.getElementById("uvc-toggle-invert").checked = uvcSettings.videoInvert;
      document.getElementById("uvc-toggle-visible").checked = uvcSettings.stayVisible;

      applyCollapseState();
    });
  }

  loadSettings();

  // ==========================================
  // 5. VIDEO ENHANCEMENT & SCROLL ENGINES
  // ==========================================
  function getActiveVideo() {
    const videos = Array.from(document.querySelectorAll("video"));
    return videos.find(
      (vid) => (!vid.paused || vid.seeking) && vid.readyState > 0,
    );
  }

  function findScrollableAncestor(el) {
    let node = el.parentElement;
    while (node && node !== document.body) {
      const style = window.getComputedStyle(node);
      const overflow = style.overflowY;
      if (
        (overflow === "scroll" || overflow === "auto") &&
        node.scrollHeight > node.clientHeight
      ) {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  }

  function applyVideoFilters(vid) {
    if (!vid) return;
    vid.style.filter = `
   brightness(${uvcSettings.videoBrightness}%)
   contrast(${uvcSettings.videoContrast}%)
   invert(${uvcSettings.videoInvert ? 1 : 0})
   grayscale(${uvcSettings.videoGrayscale}%)
   `;
  }

  function applyAudioBoost(vid, multiplier) {
    if (multiplier === 1.0 && !audioCtxs.has(vid)) return;

    try {
      let data = audioCtxs.get(vid);
      if (!data) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        const source = ctx.createMediaElementSource(vid);
        const gainNode = ctx.createGain();

        source.connect(gainNode);
        gainNode.connect(ctx.destination);

        data = { ctx, gainNode, source };
        audioCtxs.set(vid, data);
      }

      if (data.ctx.state === "suspended") {
        data.ctx.resume();
      }

      data.gainNode.gain.value = multiplier;
    } catch (err) {
      if (!vid.__uvc_audio_error) {
        console.warn("UVC Audio Booster configuration rejected:", err);
        vid.__uvc_audio_error = true;
      }
    }
  }

  function togglePiP() {
    const vid = getActiveVideo();
    if (!vid) return;

    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(console.error);
    } else {
      vid.requestPictureInPicture().catch(console.error);
    }
  }

  let scrollCooldown = false;
  function triggerFeedScroll() {
    if (scrollCooldown) return;
    scrollCooldown = true;

    setTimeout(() => {
      scrollCooldown = false;
    }, 3000);

    console.log("Universal Video Controller: Video ended or looped, auto-advancing...");

    const nextButtons = [
      document.querySelector('[aria-label="Next video"]'),
      document.querySelector('[data-e2e="arrow-right"]'),
      document.querySelector(".navigation-arrow.next"),
    ];
    for (let btn of nextButtons) {
      if (btn) {
        btn.click();
        return;
      }
    }

    const isInstagram = location.hostname.includes("instagram.com");
    const vid = getActiveVideo();
    if (vid) {
      const scrollTarget = findScrollableAncestor(vid);

      if (scrollTarget) {
        scrollTarget.scrollBy({
          top: scrollTarget.clientHeight,
          behavior: "smooth",
        });
        return;
      }

      if (isInstagram) {
        const rect = vid.getBoundingClientRect();
        const touchStartY = rect.top + rect.height * 0.7;
        const touchEndY = rect.top + rect.height * 0.1;
        const touchX = rect.left + rect.width / 2;

        const touchOpts = (y) => ({
          bubbles: true,
          cancelable: true,
          touches: [
            new Touch({ identifier: Date.now(), target: vid, clientX: touchX, clientY: y, radiusX: 2, radiusY: 2, rotationAngle: 0, force: 1 }),
          ],
          changedTouches: [
            new Touch({ identifier: Date.now(), target: vid, clientX: touchX, clientY: y, radiusX: 2, radiusY: 2, rotationAngle: 0, force: 1 }),
          ],
        });

        vid.dispatchEvent(new TouchEvent("touchstart", touchOpts(touchStartY)));
        setTimeout(() => {
          vid.dispatchEvent(new TouchEvent("touchmove", touchOpts(touchEndY)));
          setTimeout(() => {
            vid.dispatchEvent(new TouchEvent("touchend", touchOpts(touchEndY)));
          }, 80);
        }, 80);
        return;
      }
    }

    const arrowEvent = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      code: "ArrowDown",
      keyCode: 40,
      which: 40,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(arrowEvent);
    window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
  }

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  }

  // ==========================================
  // 6. CONTROL OPERATIONS (CLICK, VELOCITY CYCLE)
  // ==========================================
  backBtn.addEventListener("click", () => {
    const vid = getActiveVideo();
    if (vid) vid.currentTime = Math.max(0, vid.currentTime - uvcSettings.skipInterval);
  });

  forwardBtn.addEventListener("click", () => {
    const vid = getActiveVideo();
    if (vid) vid.currentTime = Math.min(vid.duration, vid.currentTime + uvcSettings.skipInterval);
  });

  const speeds = [1, 1.25, 1.5, 2, 0.5];
  let speedIndex = 0;
  speedBtn.addEventListener("click", () => {
    const vid = getActiveVideo();
    if (vid) {
      speedIndex = (speedIndex + 1) % speeds.length;
      const newSpeed = speeds[speedIndex];
      vid.playbackRate = newSpeed;

      uvcSettings.lockedSpeed = newSpeed;
      selectSegmentActive("uvc-seg-speed", newSpeed);
      speedBtn.innerText = `${newSpeed}x`;
      saveSettings();
    }
  });

  collapseBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    uvcSettings.isCollapsed = !uvcSettings.isCollapsed;
    applyCollapseState();
    saveSettings();
  });

  // ==========================================
  // 7. DRAG, DROP, AND LOCK ACTION TRIGGERS
  // ==========================================
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  chrome.storage.local.get(["uvc_position"], (result) => {
    if (result.uvc_position) {
      timeBox.style.left = result.uvc_position.left;
      timeBox.style.top = result.uvc_position.top;
    }
  });

  timeBox.addEventListener("mousedown", (e) => {
    if (settingsPanel.classList.contains("show")) return;
    if (e.target.closest("button")) return;
    if (e.target.closest(".uvc-settings-panel")) return;

    e.preventDefault();
    isDragging = true;
    const rect = timeBox.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const newLeft = Math.max(0, Math.min(window.innerWidth - timeBox.offsetWidth, e.clientX - offsetX));
    const newTop = Math.max(0, Math.min(window.innerHeight - timeBox.offsetHeight, e.clientY - offsetY));

    timeBox.style.left = `${newLeft}px`;
    timeBox.style.top = `${newTop}px`;
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      chrome.storage.local.set({
        uvc_position: { left: timeBox.style.left, top: timeBox.style.top },
      });
    }
  });

  settingsPanel.addEventListener("mousedown", (e) => e.stopPropagation());
  settingsPanel.addEventListener("mouseup", (e) => e.stopPropagation());
  settingsPanel.addEventListener("click", (e) => e.stopPropagation());
  settingsPanel.addEventListener("dblclick", (e) => e.stopPropagation());
  settingsPanel.addEventListener("keydown", (e) => e.stopPropagation());
  timeBox.addEventListener("click", (e) => e.stopPropagation());
  timeBox.addEventListener("dblclick", (e) => e.stopPropagation());

  // ==========================================
  // 8. SETTINGS PREFERENCE GROUP LISTENERS
  // ==========================================
  settingsBtn.addEventListener("click", () => {
    const isOpen = settingsPanel.classList.toggle("show");
    if (isOpen) {
      timeBox.classList.add("settings-active");
      const barRect = timeBox.getBoundingClientRect();
      const panelHeight = 330;
      const spaceBelow = window.innerHeight - barRect.bottom;
      const spaceAbove = barRect.top;
      if (spaceBelow >= panelHeight || spaceBelow >= spaceAbove) {
        settingsPanel.style.top = `${barRect.bottom + 5}px`;
      } else {
        settingsPanel.style.top = `${barRect.top - panelHeight - 5}px`;
      }
      settingsPanel.style.left = `${Math.min(barRect.left, window.innerWidth - 248)}px`;
    } else {
      timeBox.classList.remove("settings-active");
    }
  });

  function setupSegmentListener(containerId, settingsKey, onChangeCallback) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.addEventListener("click", (e) => {
      const btn = e.target.closest(".uvc-segment-btn");
      if (!btn) return;
      const val = parseFloat(btn.getAttribute("data-val"));
      uvcSettings[settingsKey] = val;
      selectSegmentActive(containerId, val);
      if (onChangeCallback) onChangeCallback(val);
      saveSettings();
    });
  }

  setupSegmentListener("uvc-seg-speed", "lockedSpeed", (val) => {
    speedBtn.innerText = `${val}x`;
    const vid = getActiveVideo();
    if (vid) vid.playbackRate = val;
  });

  setupSegmentListener("uvc-seg-skip", "skipInterval");
  setupSegmentListener("uvc-seg-boost", "audioBoost");

  setupSegmentListener("uvc-seg-bright", "videoBrightness", () => {
    const vid = getActiveVideo();
    if (vid) applyVideoFilters(vid);
  });

  setupSegmentListener("uvc-seg-contrast", "videoContrast", () => {
    const vid = getActiveVideo();
    if (vid) applyVideoFilters(vid);
  });

  setupSegmentListener("uvc-seg-grayscale", "videoGrayscale", () => {
    const vid = getActiveVideo();
    if (vid) applyVideoFilters(vid);
  });

  document.getElementById("uvc-toggle-speedlock").addEventListener("change", (e) => {
    uvcSettings.speedLock = e.target.checked;
    saveSettings();
  });

  document.getElementById("uvc-btn-pip-trigger").addEventListener("click", () => {
    togglePiP();
  });

  document.getElementById("uvc-toggle-adskip").addEventListener("change", (e) => {
    uvcSettings.adSkipperEnabled = e.target.checked;
    saveSettings();
  });

  document.getElementById("uvc-toggle-autoscroll").addEventListener("change", (e) => {
    uvcSettings.autoScrollEnabled = e.target.checked;
    saveSettings();
  });

  document.getElementById("uvc-toggle-invert").addEventListener("change", (e) => {
    uvcSettings.videoInvert = e.target.checked;
    saveSettings();
  });

  document.getElementById("uvc-toggle-visible").addEventListener("change", (e) => {
    uvcSettings.stayVisible = e.target.checked;
    saveSettings();
  });

  document.getElementById("uvc-btn-reset").addEventListener("click", () => {
    uvcSettings = { ...defaultSettings };
    const activeVideo = getActiveVideo();
    if (activeVideo) {
      applyVideoFilters(activeVideo);
      applyAudioBoost(activeVideo, 1.0);
      activeVideo.playbackRate = 1.0;
    }
    saveSettings();
    loadSettings();
  });

  // ==========================================
  // 9. RECURSIVE POLLING & LOOP END DETECTION
  // ==========================================
  let hideTimeout = null;
  let lastTime = 0;
  let lastVideo = null;

  setInterval(() => {
    const activeVideo = getActiveVideo();

    if (activeVideo || uvcSettings.stayVisible) {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }

      if (activeVideo) {
        const current = formatTime(activeVideo.currentTime);
        const total = formatTime(activeVideo.duration);
        timeText.innerText = `${current} / ${total}`;

        if (uvcSettings.autoScrollEnabled) {
          if (lastVideo !== activeVideo) {
            lastVideo = activeVideo;
            lastTime = activeVideo.currentTime;
          }

          const currTime = activeVideo.currentTime;
          const duration = activeVideo.duration;

          if (duration > 0) {
            const nearEnd = duration - currTime < 0.4;
            const justLooped = currTime < lastTime && duration - lastTime < 1.2;

            if (nearEnd || justLooped) {
              triggerFeedScroll();
            }
          }
          lastTime = currTime;
        } else {
          lastTime = 0;
          lastVideo = null;
        }

        if (!uvcSettings.speedLock && activeVideo.playbackRate !== speeds[speedIndex]) {
          const actualIndex = speeds.indexOf(activeVideo.playbackRate);
          speedIndex = actualIndex >= 0 ? actualIndex : 0;
          speedBtn.innerText = `${activeVideo.playbackRate}x`;
          selectSegmentActive("uvc-seg-speed", activeVideo.playbackRate);
        }

        if (uvcSettings.speedLock && activeVideo.playbackRate !== uvcSettings.lockedSpeed) {
          activeVideo.playbackRate = uvcSettings.lockedSpeed;
        }

        applyVideoFilters(activeVideo);
        applyAudioBoost(activeVideo, uvcSettings.audioBoost);
      } else {
        timeText.innerText = "No active video";
        lastTime = 0;
        lastVideo = null;
      }

      timeBox.style.display = "flex";
    } else {
      lastTime = 0;
      lastVideo = null;
      if (!hideTimeout && timeBox.style.display !== "none") {
        hideTimeout = setTimeout(() => {
          timeBox.style.display = "none";
          hideTimeout = null;
        }, 1000);
      }
    }
  }, 300);

  // ==========================================
  // 10. KEYBOARD EVENT SCRUBBING
  // ==========================================
  document.addEventListener("keydown", (event) => {
    const activeElement = document.activeElement;
    if (
      activeElement.tagName === "INPUT" ||
      activeElement.tagName === "TEXTAREA" ||
      activeElement.isContentEditable
    )
      return;

    const vid = getActiveVideo();
    if (!vid) return;

    if (event.key === "ArrowLeft") {
      vid.currentTime = Math.max(0, vid.currentTime - uvcSettings.skipInterval);
    }
    if (event.key === "ArrowRight") {
      vid.currentTime = Math.min(vid.duration, vid.currentTime + uvcSettings.skipInterval);
    }
  });

  // ==========================================
  // 11. FEED AD DETECTION LOGIC (FIXED)
  // ==========================================
  setInterval(() => {
    if (!uvcSettings.adSkipperEnabled) return;

    const activeVideo = getActiveVideo();
    // FIX: Completely ignore ad-skipping logic if no video is actively playing.
    // This stops it from automatically scrolling past Facebook text/image posts.
    if (!activeVideo) return;

    let isAdVisible = false;
    const vidRect = activeVideo.getBoundingClientRect();

    // Helper: Prevent skipping a genuine video just because a sidebar/footer ad exists.
    // Checks if the "Sponsored" label is spatially near the video player.
    const isAdRelatedToVideo = (adRect) => {
      const verticallyClose = Math.abs(adRect.top - vidRect.top) < (vidRect.height + 400);
      const horizontallyClose = Math.abs(adRect.left - vidRect.left) < (vidRect.width + 400);
      return verticallyClose && horizontallyClose;
    };

    const ariaElements = document.querySelectorAll(
      '[aria-label="Sponsored"], [aria-label="Ad"], [aria-label="Promoted"]',
    );
    for (let el of ariaElements) {
      const rect = el.getBoundingClientRect();
      if (rect.top >= 0 && rect.bottom <= window.innerHeight && rect.height > 0) {
        if (isAdRelatedToVideo(rect)) {
          isAdVisible = true;
          break;
        }
      }
    }

    if (!isAdVisible) {
      const textElements = document.querySelectorAll("span, div, a");
      for (let el of textElements) {
        if (el.childElementCount < 2 && el.innerText) {
          const cleanText = el.innerText
            .replace(/[\u200B-\u200D\uFEFF\s\n]/g, "")
            .toLowerCase();
          if (cleanText === "sponsored" || cleanText === "ad" || cleanText === "promoted") {
            const rect = el.getBoundingClientRect();
            if (rect.top >= 0 && rect.bottom <= window.innerHeight && rect.height > 0) {
              if (isAdRelatedToVideo(rect)) {
                isAdVisible = true;
                break;
              }
            }
          }
        }
      }
    }

    if (isAdVisible) {
      console.log("Universal Video Controller: Ad detected! Skipping...");

      const nextButtons = [
        document.querySelector('[aria-label="Next video"]'),
        document.querySelector('[data-e2e="arrow-right"]'),
      ];
      for (let btn of nextButtons) {
        if (btn) {
          btn.click();
          return;
        }
      }

      const arrowEvent = new KeyboardEvent("keydown", {
        key: "ArrowDown",
        code: "ArrowDown",
        keyCode: 40,
        which: 40,
        bubbles: true,
        cancelable: true,
      });

      document.dispatchEvent(arrowEvent);
      if (activeVideo) {
        activeVideo.dispatchEvent(arrowEvent);
      }

      window.scrollBy({ top: window.innerHeight, behavior: "smooth" });

      const scrollContainers = document.querySelectorAll(
        'div[style*="overflow-y: scroll"], div[style*="overflow-y: auto"], div[style*="overflow: auto"]',
      );
      scrollContainers.forEach((container) => {
        container.scrollBy({ top: window.innerHeight, behavior: "smooth" });
      });
    }
  }, 500);
})();