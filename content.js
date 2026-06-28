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
  // 1. INJECT GLASSMORPHIC MINT CSS
  // ==========================================
  const style = document.createElement("style");
  style.textContent = `
  /* Main Container - Glassmorphic Aesthetic */
  .uvc-container {
    position: fixed;
    top: 20px;
    left: 20px;
    background-color: rgba(18, 18, 18, 0.75);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    color: #ffffff;
    padding: 2px 6px;
    border-radius: 20px; 
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 12px;
    font-weight: 600;
    z-index: 2147483647;
    cursor: grab;
    display: none;
    align-items: center;
    gap: 4px;
    border: 1px solid rgba(9, 243, 107, 0.24);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    transition: border-color 0.2s, box-shadow 0.2s, border-radius 0.2s, padding 0.2s;
    transform-origin: top left;

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
    border-color: rgba(255, 255, 255, 0.25);
    box-shadow: 0 8px 36px rgba(0, 0, 0, 0.5);
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
    width: 40px;
    height: 40px;
    padding: 0;
    border-radius: 50%;
    justify-content: center;
    gap: 0;
    background-color: #324f454a;
    border: 2px solid #21782d8a;
  }
  .uvc-container.collapsed .uvc-btn:not(.uvc-collapse-btn),
  .uvc-container.collapsed .uvc-text {
    display: none !important;
  }
  .uvc-collapse-btn {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
  }

  /* Interactive Buttons */
  .uvc-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px;
    border-radius: 50%;
    transition: opacity 0.2s, transform 0.1s, background-color 0.2s, color 0.2s;
    color: rgba(255, 255, 255, 0.75);
  }
  .uvc-btn svg {
    stroke: currentColor;
  }
  .uvc-btn:hover {
    color: #ffffff;
    background-color: rgba(255, 255, 255, 0.1);
    transform: scale(1.08);
  }
  .uvc-btn:active {
    transform: scale(0.92);
  }

  /* Speed Selector Button */
  .uvc-speed-btn {
    font-size: 11px;
    font-weight: 700;
    min-width: 32px;
    letter-spacing: 0.3px;
  }

  /* Time Display */
  .uvc-text {
    min-width: 68px;
    text-align: center;
    font-variant-numeric: tabular-nums; 
    letter-spacing: 0.3px;
    color: rgba(255, 255, 255, 0.9);
  }

  /* ==========================================
     REDESIGNED MINIMALIST SETTINGS PANEL UI
     ========================================== */
  .uvc-settings-panel {
    display: none;
    flex-direction: column;
    position: fixed;
    width: 290px;
    background-color: rgba(20, 20, 20, 0.85);
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    z-index: 2147483647;
    max-height: 400px;
    overflow-y: auto;
    gap: 14px;
    font-weight: normal;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  
  .uvc-settings-panel.show {
    display: flex;
  }

  /* Custom Panel Scrollbar */
  .uvc-settings-panel::-webkit-scrollbar {
    width: 4px;
  }
  .uvc-settings-panel::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  .uvc-section-title {
    font-size: 11px;
    letter-spacing: 1.2px;
    color: #34d399; /* Mint Green Accent */
    margin-bottom: 2px;
    font-weight: 600;
    opacity: 0.9;
  }

  .uvc-control-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.85);
  }

  .uvc-control-row label {
    cursor: pointer;
  }

  /* Multi-Choice Clickable Segment Selectors */
  .uvc-control-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .uvc-control-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 500;
  }
  .uvc-segment-container {
    display: flex;
    gap: 4px;
    width: 100%;
    background: rgba(255, 255, 255, 0.03);
    padding: 3px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.04);
  }
  .uvc-segment-btn {
    flex: 1;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.6);
    padding: 6px 2px;
    font-size: 10px;
    font-weight: 600;
    text-align: center;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .uvc-segment-btn:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.05);
  }
  .uvc-segment-btn.active {
    background: rgba(52, 211, 153, 0.15);
    color: #34d399;
    font-weight: 700;
  }

  /* Modern Pill Toggle Switch */
  .uvc-switch {
    position: relative;
    display: inline-block;
    width: 34px;
    height: 18px;
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
    background-color: rgba(255, 255, 255, 0.1);
    transition: .2s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 20px;
  }
  .uvc-slider-switch:before {
    position: absolute;
    content: "";
    height: 12px;
    width: 12px;
    left: 3px;
    bottom: 3px;
    background-color: rgba(255, 255, 255, 0.9);
    transition: .2s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 50%;
  }
  input:checked + .uvc-slider-switch {
    background-color: #34d399; 
  }
  input:checked + .uvc-slider-switch:before {
    transform: translateX(16px);
    background-color: #ffffff;
  }

  /* Minimalist Action Buttons */
  .uvc-btn-pip {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.8) !important;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
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
    font-size: 9px;
    color: rgba(255, 255, 255, 0.35);
    line-height: 1.3;
    margin-top: 2px;
  }

  /* Reset Defaults Button */
  .uvc-btn-reset {
    background: transparent;
    color: rgba(255, 255, 255, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
    text-align: center;
    transition: all 0.2s ease;
    margin-top: 6px;
  }
  .uvc-btn-reset:hover {
    background: rgba(239, 68, 68, 0.08); 
    border-color: rgba(239, 68, 68, 0.2);
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
    isCollapsed: false, // <--- Track collapsed state natively
  };

  let uvcSettings = { ...defaultSettings };

  // WeakMap tracking loaded video audio nodes
  const audioCtxs = new WeakMap();

  // ==========================================
  // 3. CREATE THE DOM ELEMENTS
  // ==========================================
  const timeBox = document.createElement("div");
  timeBox.className = "uvc-container";

  // "Back" Button
  const backBtn = document.createElement("button");
  backBtn.className = "uvc-btn";
  backBtn.title = "Jump Backwards";
  backBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 19 2 12 11 5 11 19"></polygon>
        <polygon points="22 19 13 12 22 5 22 19"></polygon>
    </svg>
`;

  // Text Span (Timer)
  const timeText = document.createElement("span");
  timeText.className = "uvc-text";
  timeText.innerText = "0:00 - 0:00";

  // "Forward" Button
  const forwardBtn = document.createElement("button");
  forwardBtn.className = "uvc-btn";
  forwardBtn.title = "Jump Forwards";
  forwardBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="13 19 22 12 13 5 13 19"></polygon>
        <polygon points="2 19 11 12 2 5 2 19"></polygon>
    </svg>
`;

  // Playback Speed Toggle Button
  const speedBtn = document.createElement("button");
  speedBtn.className = "uvc-btn uvc-speed-btn";
  speedBtn.title = "Cycle Velocities";
  speedBtn.innerText = "1x";

  // Settings Toggle Button
  const settingsBtn = document.createElement("button");
  settingsBtn.className = "uvc-btn";
  settingsBtn.title = "Controller Preferences";
  settingsBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
`;

  // Space Saving Collapse/Expand Button
  const collapseBtn = document.createElement("button");
  collapseBtn.className = "uvc-btn uvc-collapse-btn";

  const iconCollapse = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32"><title xmlns="">collapse</title><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m23 26l-7-7l-7 7M9 6l7 7l7-7"/></svg>
`;

  const iconExpand = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><title xmlns="">expand</title><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="16" stroke-width="1.5" d="M19 12V9c0-1.886 0-2.828-.586-3.414S16.886 5 15 5h-3m-7 7v3c0 1.886 0 2.828.586 3.414S7.114 19 9 19h3"/></svg>
`;

  // Settings Slide Panel Content
  const settingsPanel = document.createElement("div");
  settingsPanel.className = "uvc-settings-panel";
  settingsPanel.innerHTML = `
  <!-- SECTION: CONTROL FLOW -->
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
    <span>Screencast Window</span>
    <button class="uvc-btn-pip" id="uvc-btn-pip-trigger">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M13 13h7v7h-7z"></path></svg>
      Pip View
    </button>
  </div>

  <!-- SECTION: AUTOMATION ENGINE -->
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

  <!-- SECTION: AUDIO / VIDEO MIXERS -->
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
    <span class="uvc-warning-text">⚠️ Note: May silence cross-origin tracks on restrictive domains.</span>
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

  <!-- SECTION: RESET COMPONENT -->
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
  document.body.appendChild(settingsPanel); // Fixed-position panel lives on body, not inside timeBox

  // ==========================================
  // 4. PRESERVATION LOGIC (CHROME STORAGE)
  // ==========================================
  function saveSettings() {
    chrome.storage.local.set({ uvcSettings });
  }

  // Mark target values inside active selection groups
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
      // Forcibly close settings panel if collapsed
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

      // Set multi-choice active highlights
      selectSegmentActive("uvc-seg-speed", uvcSettings.lockedSpeed);
      speedBtn.innerText = `${uvcSettings.lockedSpeed}x`;

      selectSegmentActive("uvc-seg-skip", uvcSettings.skipInterval);
      selectSegmentActive("uvc-seg-boost", uvcSettings.audioBoost);
      selectSegmentActive("uvc-seg-bright", uvcSettings.videoBrightness);
      selectSegmentActive("uvc-seg-contrast", uvcSettings.videoContrast);
      selectSegmentActive("uvc-seg-grayscale", uvcSettings.videoGrayscale);

      document.getElementById("uvc-toggle-speedlock").checked =
        uvcSettings.speedLock;
      document.getElementById("uvc-toggle-adskip").checked =
        uvcSettings.adSkipperEnabled;
      document.getElementById("uvc-toggle-autoscroll").checked =
        uvcSettings.autoScrollEnabled;
      document.getElementById("uvc-toggle-invert").checked =
        uvcSettings.videoInvert;
      document.getElementById("uvc-toggle-visible").checked =
        uvcSettings.stayVisible;

      applyCollapseState(); // Check sizing mode
    });
  }

  // Initial configuration load
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

  // Apply visual styles to active playback element
  function applyVideoFilters(vid) {
    if (!vid) return;
    vid.style.filter = `
    brightness(${uvcSettings.videoBrightness}%)
    contrast(${uvcSettings.videoContrast}%)
    invert(${uvcSettings.videoInvert ? 1 : 0})
    grayscale(${uvcSettings.videoGrayscale}%)
  `;
  }

  // Audio gain routing processing
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
        console.warn(
          "UVC Audio Booster configuration rejected (likely cross-origin CORS limitations):",
          err,
        );
        vid.__uvc_audio_error = true;
      }
    }
  }

  // Picture-In-Picture trigger execution
  function togglePiP() {
    const vid = getActiveVideo();
    if (!vid) return;

    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(console.error);
    } else {
      vid.requestPictureInPicture().catch(console.error);
    }
  }

  // Time-update assisted auto scroll execution with cooldown safety
  let scrollCooldown = false;
  function triggerFeedScroll() {
    if (scrollCooldown) return;
    scrollCooldown = true;

    // 3-second cooldown to avoid multi-trigger overlaps during swipe/load frames
    setTimeout(() => {
      scrollCooldown = false;
    }, 3000);

    console.log(
      "Universal Video Controller: Video ended or looped, auto-advancing...",
    );

    // ── Strategy 1: YouTube Shorts & TikTok — dedicated "Next" buttons ──
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

    // ── Strategy 2: Instagram Reels — find the Reels scroll container ──
    const isInstagram = location.hostname.includes("instagram.com");
    if (isInstagram) {
      const vid = getActiveVideo();
      if (vid) {
        // Walk up the DOM to find the nearest scrollable ancestor
        let scrollTarget = null;
        let node = vid.parentElement;
        while (node && node !== document.body) {
          const style = window.getComputedStyle(node);
          const overflow = style.overflowY;
          if (
            (overflow === "scroll" || overflow === "auto") &&
            node.scrollHeight > node.clientHeight
          ) {
            scrollTarget = node;
            break;
          }
          node = node.parentElement;
        }

        if (scrollTarget) {
          scrollTarget.scrollBy({
            top: scrollTarget.clientHeight,
            behavior: "smooth",
          });
          return;
        }

        // Fallback: simulate a touch swipe upward (Instagram's React handlers respond to this)
        const rect = vid.getBoundingClientRect();
        const touchStartY = rect.top + rect.height * 0.7;
        const touchEndY = rect.top + rect.height * 0.1;
        const touchX = rect.left + rect.width / 2;

        const touchOpts = (y) => ({
          bubbles: true,
          cancelable: true,
          touches: [
            new Touch({
              identifier: Date.now(),
              target: vid,
              clientX: touchX,
              clientY: y,
              radiusX: 2,
              radiusY: 2,
              rotationAngle: 0,
              force: 1,
            }),
          ],
          changedTouches: [
            new Touch({
              identifier: Date.now(),
              target: vid,
              clientX: touchX,
              clientY: y,
              radiusX: 2,
              radiusY: 2,
              rotationAngle: 0,
              force: 1,
            }),
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

    // ── Strategy 3: Generic — keyboard ArrowDown ──
    const arrowEvent = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      code: "ArrowDown",
      keyCode: 40,
      which: 40,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(arrowEvent);

    // ── Strategy 4: window scroll fallback ──
    window.scrollBy({ top: window.innerHeight, behavior: "smooth" });

    // ── Strategy 5: inline-style overflow containers ──
    const scrollContainers = document.querySelectorAll(
      'div[style*="overflow-y: scroll"], div[style*="overflow-y: auto"], div[style*="overflow: auto"]',
    );
    scrollContainers.forEach((container) => {
      container.scrollBy({ top: window.innerHeight, behavior: "smooth" });
    });
  }

  // Format seconds into digital layout
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
    if (vid)
      vid.currentTime = Math.max(0, vid.currentTime - uvcSettings.skipInterval);
  });

  forwardBtn.addEventListener("click", () => {
    const vid = getActiveVideo();
    if (vid)
      vid.currentTime = Math.min(
        vid.duration,
        vid.currentTime + uvcSettings.skipInterval,
      );
  });

  // Manual top-bar speed increments loop
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

  // Collapse toggler
  collapseBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // Stop parent click events (if any)
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

  // Retrieve layout positioning coordinates
  chrome.storage.local.get(["uvc_position"], (result) => {
    if (result.uvc_position) {
      timeBox.style.left = result.uvc_position.left;
      timeBox.style.top = result.uvc_position.top;
    }
  });

  timeBox.addEventListener("mousedown", (e) => {
    // Disable dragging behaviors completely while configuration dashboard is open
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

    const newLeft = Math.max(
      0,
      Math.min(window.innerWidth - timeBox.offsetWidth, e.clientX - offsetX),
    );
    const newTop = Math.max(
      0,
      Math.min(window.innerHeight - timeBox.offsetHeight, e.clientY - offsetY),
    );

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

  // Prevent overlay collision on preference panel interactives
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
      // Smart-position: anchor panel below or above the bar based on available space
      const barRect = timeBox.getBoundingClientRect();
      const panelHeight = 380;
      const spaceBelow = window.innerHeight - barRect.bottom;
      const spaceAbove = barRect.top;
      if (spaceBelow >= panelHeight || spaceBelow >= spaceAbove) {
        // Open downward
        settingsPanel.style.top = `${barRect.bottom + 8}px`;
      } else {
        // Open upward
        settingsPanel.style.top = `${barRect.top - panelHeight - 8}px`;
      }
      settingsPanel.style.left = `${Math.min(barRect.left, window.innerWidth - 298)}px`;
    } else {
      timeBox.classList.remove("settings-active");
    }
  });

  // Helper setting up segment button click listeners
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

  // Bind segment modules
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

  document
    .getElementById("uvc-toggle-speedlock")
    .addEventListener("change", (e) => {
      uvcSettings.speedLock = e.target.checked;
      saveSettings();
    });

  document
    .getElementById("uvc-btn-pip-trigger")
    .addEventListener("click", () => {
      togglePiP();
    });

  document
    .getElementById("uvc-toggle-adskip")
    .addEventListener("change", (e) => {
      uvcSettings.adSkipperEnabled = e.target.checked;
      saveSettings();
    });

  document
    .getElementById("uvc-toggle-autoscroll")
    .addEventListener("change", (e) => {
      uvcSettings.autoScrollEnabled = e.target.checked;
      saveSettings();
    });

  document
    .getElementById("uvc-toggle-invert")
    .addEventListener("change", (e) => {
      uvcSettings.videoInvert = e.target.checked;
      saveSettings();
    });

  document
    .getElementById("uvc-toggle-visible")
    .addEventListener("change", (e) => {
      uvcSettings.stayVisible = e.target.checked;
      saveSettings();
    });

  // RESTORE DEFAULT PREFERENCES OPERATION
  document.getElementById("uvc-btn-reset").addEventListener("click", () => {
    uvcSettings = { ...defaultSettings };

    // Revert active video alterations back to neutral limits
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

        // Loop-aware ended detection (Tracks playhead status)
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

        // Update UI speed indicators if altered natively by hosts (without locking)
        if (
          !uvcSettings.speedLock &&
          activeVideo.playbackRate !== speeds[speedIndex]
        ) {
          const actualIndex = speeds.indexOf(activeVideo.playbackRate);
          speedIndex = actualIndex >= 0 ? actualIndex : 0;
          speedBtn.innerText = `${activeVideo.playbackRate}x`;
          selectSegmentActive("uvc-seg-speed", activeVideo.playbackRate);
        }

        // Enforce lock speed bounds
        if (
          uvcSettings.speedLock &&
          activeVideo.playbackRate !== uvcSettings.lockedSpeed
        ) {
          activeVideo.playbackRate = uvcSettings.lockedSpeed;
        }

        // Apply configured effects
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
      vid.currentTime = Math.min(
        vid.duration,
        vid.currentTime + uvcSettings.skipInterval,
      );
    }
  });

  // ==========================================
  // 11. FEED AD DETECTION LOGIC
  // ==========================================
  setInterval(() => {
    const activeVideo = getActiveVideo();
    if (!activeVideo) return;

    let isAdVisible = false;

    // 1. CHECK ACCESSIBILITY TAGS
    const ariaElements = document.querySelectorAll(
      '[aria-label="Sponsored"], [aria-label="Ad"], [aria-label="Promoted"]',
    );
    for (let el of ariaElements) {
      const rect = el.getBoundingClientRect();
      if (
        rect.top >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.height > 0
      ) {
        isAdVisible = true;
        break;
      }
    }

    // 2. CHECK OBFUSCATED TEXT
    if (!isAdVisible) {
      const textElements = document.querySelectorAll("span, div, a");
      for (let el of textElements) {
        if (el.childElementCount < 2 && el.innerText) {
          const cleanText = el.innerText
            .replace(/[\u200B-\u200D\uFEFF\s\n]/g, "")
            .toLowerCase();
          if (
            cleanText === "sponsored" ||
            cleanText === "ad" ||
            cleanText === "promoted"
          ) {
            const rect = el.getBoundingClientRect();
            if (
              rect.top >= 0 &&
              rect.bottom <= window.innerHeight &&
              rect.height > 0
            ) {
              isAdVisible = true;
              break;
            }
          }
        }
      }
    }

    // 3. THE SKIP ACTION
    if (isAdVisible && uvcSettings.adSkipperEnabled) {
      console.log("Universal Video Controller: Ad detected! Skipping...");

      // METHOD A: TikTok / YT Shorts Next buttons
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

      // METHOD B: Simulate pressing the "Arrow Down" key (Perfect for IG Reels)
      const arrowEvent = new KeyboardEvent("keydown", {
        key: "ArrowDown",
        code: "ArrowDown",
        keyCode: 40,
        which: 40,
        bubbles: true,
        cancelable: true,
      });

      document.dispatchEvent(arrowEvent);
      activeVideo.dispatchEvent(arrowEvent);

      // METHOD C: Fallback smooth scroll (for standard scrolling feeds)
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
