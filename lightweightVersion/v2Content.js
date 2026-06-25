// ==========================================
// 1. INJECT MODERN POLISHED CSS
// ==========================================
const style = document.createElement("style");
style.textContent = `
  /* Main Container - Glassmorphic Aesthetic */
  .uvc-container {
    position: fixed;
    top: 20px;
    left: 20px;
    background-color: rgba(18, 18, 18, 0.75);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    color: #ffffff;
    padding: 6px 14px;
    border-radius: 20px; 
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 12px;
    font-weight: 600;
    z-index: 2147483647;
    cursor: grab;
    display: none;
    align-items: center;
    gap: 10px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
    transition: border-color 0.2s, box-shadow 0.2s;

    /* FIX: Stop all text selection inside the container */
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
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  }
  .uvc-container:active {
    cursor: grabbing;
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
`;
document.head.appendChild(style);

// ==========================================
// 2. CREATE THE DOM ELEMENTS
// ==========================================
const timeBox = document.createElement("div");
timeBox.className = "uvc-container";

// "Back 5s" Button
const backBtn = document.createElement("button");
backBtn.className = "uvc-btn";
backBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 19 2 12 11 5 11 19"></polygon>
        <polygon points="22 19 13 12 22 5 22 19"></polygon>
    </svg>
`;

// Text Span (Timer)
const timeText = document.createElement("span");
timeText.className = "uvc-text";
timeText.innerText = "0:00 / 0:00";

// "Forward 5s" Button
const forwardBtn = document.createElement("button");
forwardBtn.className = "uvc-btn";
forwardBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="13 19 22 12 13 5 13 19"></polygon>
        <polygon points="2 19 11 12 2 5 2 19"></polygon>
    </svg>
`;

// Playback Speed Button
const speedBtn = document.createElement("button");
speedBtn.className = "uvc-btn uvc-speed-btn";
speedBtn.innerText = "1x";

// Assemble the UI
timeBox.appendChild(backBtn);
timeBox.appendChild(timeText);
timeBox.appendChild(forwardBtn);
timeBox.appendChild(speedBtn); 
document.body.appendChild(timeBox);

// ==========================================
// 3. VIDEO LOGIC (Skip, Speed)
// ==========================================
function formatTime(seconds) {
  if (isNaN(seconds) || seconds === Infinity) return "0:00";
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? "0" : ""}${sec}`;
}

function getActiveVideo() {
  const videos = Array.from(document.querySelectorAll("video"));
  return videos.find((vid) => (!vid.paused || vid.seeking) && vid.readyState > 0);
}

// Skip logic
backBtn.addEventListener("click", () => {
    const vid = getActiveVideo();
    if (vid) vid.currentTime = Math.max(0, vid.currentTime - 5);
});
forwardBtn.addEventListener("click", () => {
    const vid = getActiveVideo();
    if (vid) vid.currentTime = Math.min(vid.duration, vid.currentTime + 5);
});

// Playback Speed logic
const speeds = [1, 1.25, 1.5, 2, 0.5];
let speedIndex = 0;
speedBtn.addEventListener("click", () => {
  const vid = getActiveVideo();
  if (vid) {
    speedIndex = (speedIndex + 1) % speeds.length;
    const newSpeed = speeds[speedIndex];
    vid.playbackRate = newSpeed;
    speedBtn.innerText = `${newSpeed}x`;
  }
});

timeBox.addEventListener("click", (e) => e.stopPropagation());
timeBox.addEventListener("dblclick", (e) => e.stopPropagation());

// ==========================================
// 4. DRAG & DROP LOGIC (WITH STORAGE & SELECT PREVENTION)
// ==========================================
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

// Load saved position on startup
chrome.storage.local.get(["uvc_position"], (result) => {
  if (result.uvc_position) {
    timeBox.style.left = result.uvc_position.left;
    timeBox.style.top = result.uvc_position.top;
  }
});

timeBox.addEventListener("mousedown", (e) => {
  if (e.target.closest("button")) return;
  
  // FIX: This stops the browser from highlighting text on mouse drag
  e.preventDefault(); 
  
  isDragging = true;
  const rect = timeBox.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  
  // Keep widget inside the viewport bounds
  const newLeft = Math.max(0, Math.min(window.innerWidth - timeBox.offsetWidth, e.clientX - offsetX));
  const newTop = Math.max(0, Math.min(window.innerHeight - timeBox.offsetHeight, e.clientY - offsetY));
  
  timeBox.style.left = `${newLeft}px`;
  timeBox.style.top = `${newTop}px`;
});

document.addEventListener("mouseup", () => {
  if (isDragging) {
    isDragging = false;
    
    // Save position when dropped
    chrome.storage.local.set({
      uvc_position: { left: timeBox.style.left, top: timeBox.style.top }
    });
  }
});

// ==========================================
// 5. CONSTANTLY UPDATE THE TIMESTAMP
// ==========================================
let hideTimeout = null; 

setInterval(() => {
  const activeVideo = getActiveVideo();

  if (activeVideo) {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
    const current = formatTime(activeVideo.currentTime);
    const total = formatTime(activeVideo.duration);
    timeText.innerText = `${current} / ${total}`;
    
    // Ensure speed button matches active video (in case site changes it)
    if (activeVideo.playbackRate !== speeds[speedIndex]) {
        const actualIndex = speeds.indexOf(activeVideo.playbackRate);
        speedIndex = actualIndex >= 0 ? actualIndex : 0;
        speedBtn.innerText = `${activeVideo.playbackRate}x`;
    }

    timeBox.style.display = "flex";
  } else {
    if (!hideTimeout && timeBox.style.display !== "none") {
      hideTimeout = setTimeout(() => {
        timeBox.style.display = "none";
        hideTimeout = null; 
      }, 1000); 
    }
  }
}, 300);

// ==========================================
// 6. KEYBOARD SCRUBBING
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

  if (event.key === "ArrowLeft") vid.currentTime = Math.max(0, vid.currentTime - 5);
  if (event.key === "ArrowRight") vid.currentTime = Math.min(vid.duration, vid.currentTime + 5);
});

// ==========================================
// 7. EXPERIMENTAL: AGGRESSIVE REEL AD SKIPPER
// ==========================================
setInterval(() => {
  const activeVideo = getActiveVideo();
  if (!activeVideo) return;

  let isAdVisible = false;

  // 1. CHECK ACCESSIBILITY TAGS
  const ariaElements = document.querySelectorAll('[aria-label="Sponsored"], [aria-label="Ad"], [aria-label="Promoted"]');
  for (let el of ariaElements) {
    const rect = el.getBoundingClientRect();
    if (rect.top >= 0 && rect.bottom <= window.innerHeight && rect.height > 0) {
      isAdVisible = true;
      break;
    }
  }

  // 2. CHECK OBFUSCATED TEXT
  if (!isAdVisible) {
    const textElements = document.querySelectorAll("span, div, a");
    for (let el of textElements) {
      if (el.childElementCount < 2 && el.innerText) {
        const cleanText = el.innerText.replace(/[\u200B-\u200D\uFEFF\s\n]/g, '').toLowerCase();
        if (cleanText === "sponsored" || cleanText === "ad" || cleanText === "promoted") {
          const rect = el.getBoundingClientRect();
          if (rect.top >= 0 && rect.bottom <= window.innerHeight && rect.height > 0) {
            isAdVisible = true;
            break;
          }
        }
      }
    }
  }

  // 3. THE SKIP ACTION
  if (isAdVisible) {
    console.log("Universal Video Controller: Ad detected! Skipping...");

    // METHOD A: TikTok / YT Shorts Next buttons
    const nextButtons = [
      document.querySelector('[aria-label="Next video"]'), 
      document.querySelector('[data-e2e="arrow-right"]')
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
        cancelable: true
    });
    
    document.dispatchEvent(arrowEvent);
    activeVideo.dispatchEvent(arrowEvent);

    // METHOD C: Fallback smooth scroll (for standard scrolling feeds)
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    
    const scrollContainers = document.querySelectorAll('div[style*="overflow-y: scroll"], div[style*="overflow-y: auto"], div[style*="overflow: auto"]');
    scrollContainers.forEach(container => {
      container.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    });
  }
}, 500);