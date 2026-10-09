/**
 * Just Focus — Content Script Injected Overlay
 *
 * Responsibilities:
 * - Injected at document_start on all pages.
 * - Detects if current website domain is in the active session's blocked list.
 * - Injects a full-screen, isolated Shadow DOM overlay displaying the "Stay focused" UI.
 * - DevTools Tamper Resistance:
 *   - Uses MutationObserver to detect DOM node removal or style manipulation.
 *   - Periodic watchdog heartbeat (every 400ms) to ensure overlay presence and visibility.
 *   - Auto-reinjects immediately if removed or hidden via DevTools.
 *   - Locks page scrolling while active.
 * - Real-time sync:
 *   - Listens to chrome.storage.onChanged to show/hide without page reloads.
 *   - Live countdown ticker.
 */

const STORAGE_KEY_ACTIVE = "just_focus_active_session";
const STORAGE_KEY_SITES = "just_focus_blocked_sites";
const HOST_ID = "__just_focus_overlay_host__";

const MOTIVATIONAL_QUOTES = [
  "Your attention determines what you achieve.",
  "Deep work produces rare and valuable results.",
  "Every temptation resisted strengthens your will.",
  "Focus is saying no to the hundred other good ideas.",
  "Discipline today creates freedom tomorrow.",
];

interface SessionData {
  id: string;
  duration_minutes: number;
  start_time: string;
  end_time: string;
  status: "active" | "completed" | "abandoned";
  blocked_site_ids: string[];
}

interface BlockedSiteData {
  id: string;
  domain: string;
  is_selected: boolean;
}

// ── State ────────────────────────────────────────────────────────────
let isBlocked = false;
let blockedDomainName = "";
let sessionEndTimeMs = 0;
let hostElement: HTMLElement | null = null;
let mutationObserver: MutationObserver | null = null;
let shadowObserver: MutationObserver | null = null;
let watchdogInterval: number | null = null;
let countdownInterval: number | null = null;
let isRebuilding = false;

// ── Helpers ──────────────────────────────────────────────────────────

function cleanHostname(hostname: string): string {
  let cleaned = hostname.trim().toLowerCase();
  if (cleaned.startsWith("www.")) {
    cleaned = cleaned.slice(4);
  }
  return cleaned;
}

function normalizeSiteDomain(raw: string): string {
  let domain = raw.trim().toLowerCase();
  if (domain.startsWith("http://")) domain = domain.slice(7);
  if (domain.startsWith("https://")) domain = domain.slice(8);
  domain = domain.split("/")[0].split("?")[0].split("#")[0];
  domain = domain.split(":")[0];
  if (domain.startsWith("www.")) domain = domain.slice(4);
  return domain.trim();
}

function formatCountdown(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return `${hours}:${mm}:${ss}`;
}

// ── Overlay Injection & DevTools Defense ─────────────────────────────

function createOverlayDom(domain: string, remainingSeconds: number): HTMLElement {
  const host = document.createElement("div");
  host.id = HOST_ID;
  host.setAttribute("data-just-focus-locked", "true");

  // Extreme high z-index and fixed coverage styles directly on host
  host.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 2147483647 !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    display: block !important;
    opacity: 1 !important;
    visibility: visible !important;
    pointer-events: auto !important;
    box-sizing: border-box !important;
  `;

  // Use Shadow DOM to completely isolate CSS from the host page
  const shadow = host.attachShadow({ mode: "open" });

  const quoteIndex = Math.abs(
    domain.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  ) % MOTIVATIONAL_QUOTES.length;
  const quote = MOTIVATIONAL_QUOTES[quoteIndex];

  const style = document.createElement("style");
  style.textContent = `
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    :host {
      all: initial;
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      z-index: 2147483647;
      display: block;
    }

    .jf-container {
      width: 100%;
      height: 100%;
      background-color: #fafafa;
      background-image:
        linear-gradient(to right, #e5e7eb 1px, transparent 1px),
        linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
      background-size: 32px 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      padding: 24px;
      user-select: none;
      position: relative;
    }

    .jf-watermark {
      position: absolute;
      top: 32px;
      left: 32px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .jf-watermark-icon {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background-color: #171717;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 12px;
    }

    .jf-watermark-text {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #a3a3a3;
    }

    .jf-card {
      max-width: 440px;
      width: 100%;
      background: rgba(255, 255, 255, 0.98);
      border: 1px solid #e5e5e5;
      border-radius: 20px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
      padding: 36px 32px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 20px;
      animation: jfFadeIn 0.25s ease-out;
    }

    @keyframes jfFadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .jf-icon-box {
      width: 76px;
      height: 76px;
      background: #ffffff;
      border-radius: 18px;
      border: 1px solid #e5e5e5;
      box-shadow: 0 2px 4px rgba(0,0,0,0.03);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #404040;
    }

    .jf-icon-svg {
      width: 40px;
      height: 40px;
      stroke-width: 1.5;
    }

    .jf-domain-tag {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #a3a3a3;
    }

    .jf-title {
      font-size: 32px;
      font-weight: 700;
      color: #0a0a0a;
      letter-spacing: -0.02em;
      line-height: 1.1;
      margin-top: 4px;
    }

    .jf-quote {
      font-size: 14px;
      color: #737373;
      line-height: 1.5;
      max-width: 320px;
    }

    .jf-countdown-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #f5f5f5;
      border: 1px solid #e5e5e5;
      color: #404040;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 600;
    }

    .jf-clock-icon {
      width: 14px;
      height: 14px;
      stroke: #737373;
    }

    .jf-btn-close {
      width: 100%;
      background: #171717;
      color: #ffffff;
      border: none;
      border-radius: 12px;
      padding: 14px 20px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      cursor: pointer;
      transition: background 0.15s ease, transform 0.1s ease;
      margin-top: 6px;
    }

    .jf-btn-close:hover {
      background: #262626;
    }

    .jf-btn-close:active {
      transform: scale(0.99);
    }
  `;

  const container = document.createElement("div");
  container.className = "jf-container";

  container.innerHTML = `
    <div class="jf-watermark">
      <div class="jf-watermark-icon">F</div>
      <div class="jf-watermark-text">Just Focus</div>
    </div>

    <div class="jf-card">
      <div class="jf-icon-box">
        <svg class="jf-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      </div>

      <div>
        <div class="jf-domain-tag">${domain.toUpperCase()}</div>
        <h1 class="jf-title">Stay focused.</h1>
      </div>

      <p class="jf-quote">&ldquo;${quote}&rdquo;</p>

      <div class="jf-countdown-pill">
        <svg class="jf-clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span id="jf-countdown-text">${formatCountdown(remainingSeconds)} remaining in focus session</span>
      </div>

      <button id="jf-btn-close-tab" class="jf-btn-close" type="button">CLOSE TAB</button>
    </div>
  `;

  // Attach button handler
  const btnClose = container.querySelector("#jf-btn-close-tab");
  if (btnClose) {
    btnClose.addEventListener("click", () => {
      // Ask background script to remove the current tab (100% reliable)
      try {
        chrome.runtime.sendMessage({ type: "CLOSE_CURRENT_TAB" });
      } catch {
        window.close();
      }
    });
  }

  shadow.appendChild(style);
  shadow.appendChild(container);

  return host;
}

function lockScroll(): void {
  try {
    document.documentElement.style.setProperty("overflow", "hidden", "important");
    if (document.body) {
      document.body.style.setProperty("overflow", "hidden", "important");
    }
  } catch {}
}

function unlockScroll(): void {
  try {
    document.documentElement.style.removeProperty("overflow");
    if (document.body) {
      document.body.style.removeProperty("overflow");
    }
  } catch {}
}

function isOverlayHealthy(el: HTMLElement | null): boolean {
  if (!el || !document.contains(el)) return false;

  // 1. Host element checks
  try {
    const hostStyle = window.getComputedStyle(el);
    if (
      hostStyle.display === "none" ||
      hostStyle.visibility === "hidden" ||
      parseFloat(hostStyle.opacity || "1") < 0.1 ||
      hostStyle.position !== "fixed" ||
      parseInt(hostStyle.zIndex || "0", 10) < 2147483640
    ) {
      return false;
    }
  } catch {
    return false;
  }

  // 2. Shadow root presence
  const sr = el.shadowRoot;
  if (!sr) return false;

  // 3. Shadow DOM style tag check
  const styleEl = sr.querySelector("style");
  if (!styleEl) return false;

  // 4. .jf-container presence and visibility check
  const container = sr.querySelector(".jf-container") as HTMLElement | null;
  if (!container) return false;

  try {
    const containerStyle = window.getComputedStyle(container);
    if (
      containerStyle.display === "none" ||
      containerStyle.visibility === "hidden" ||
      parseFloat(containerStyle.opacity || "1") < 0.1
    ) {
      return false;
    }
  } catch {
    return false;
  }

  // 5. Check critical inner contents (.jf-card and title)
  if (!sr.querySelector(".jf-card") || !sr.querySelector(".jf-title")) {
    return false;
  }

  return true;
}

function observeShadowRoot(sr: ShadowRoot | null): void {
  if (!sr || typeof MutationObserver === "undefined") return;

  if (shadowObserver) {
    shadowObserver.disconnect();
    shadowObserver = null;
  }

  shadowObserver = new MutationObserver(() => {
    if (!isBlocked || isRebuilding) return;

    const existing = document.getElementById(HOST_ID);
    if (!isOverlayHealthy(existing)) {
      console.log("[Just Focus] DevTools shadow DOM tampering detected. Reinjecting overlay...");
      reinjectOverlay();
    }
  });

  shadowObserver.observe(sr, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style", "class", "hidden"],
  });
}

function reinjectOverlay(): void {
  if (isRebuilding) return;
  isRebuilding = true;
  try {
    const existing = document.getElementById(HOST_ID);
    if (existing) {
      try {
        existing.remove();
      } catch {}
    }
    hostElement = null;
    attachOverlay();
  } finally {
    isRebuilding = false;
  }
}

function attachOverlay(): void {
  if (!isBlocked) return;

  const remaining = Math.max(0, Math.floor((sessionEndTimeMs - Date.now()) / 1000));
  if (remaining <= 0) {
    removeOverlay();
    return;
  }

  // Check if already in DOM and intact
  const existing = document.getElementById(HOST_ID);
  if (existing) {
    if (isOverlayHealthy(existing)) {
      lockScroll();
      // Keep overlay on top if other elements were appended
      const parent = existing.parentElement;
      if (parent && parent.lastElementChild !== existing) {
        try {
          parent.appendChild(existing);
        } catch {}
      }
      return;
    }
    // Existing was tampered with or corrupted! Remove it
    try {
      existing.remove();
    } catch {}
  }

  // Create new host
  hostElement = createOverlayDom(blockedDomainName, remaining);

  // Target parent: document.documentElement (works even before document.body is parsed)
  const targetParent = document.documentElement || document.body;
  if (targetParent) {
    targetParent.appendChild(hostElement);
    lockScroll();
  }

  // Observe shadow root mutations directly
  if (hostElement.shadowRoot) {
    observeShadowRoot(hostElement.shadowRoot);
  }
}

function updateCountdownText(): void {
  if (!hostElement || !hostElement.shadowRoot) return;
  const remaining = Math.max(0, Math.floor((sessionEndTimeMs - Date.now()) / 1000));
  if (remaining <= 0) {
    removeOverlay();
    return;
  }
  const label = hostElement.shadowRoot.getElementById("jf-countdown-text");
  if (label) {
    label.textContent = `${formatCountdown(remaining)} remaining in focus session`;
  }
}

function startWatchdog(): void {
  // 1. MutationObserver on document tree to catch host deletion or attribute manipulation
  if (!mutationObserver && typeof MutationObserver !== "undefined") {
    mutationObserver = new MutationObserver(() => {
      if (!isBlocked || isRebuilding) return;

      const existing = document.getElementById(HOST_ID);
      if (!isOverlayHealthy(existing)) {
        console.log("[Just Focus] DevTools DOM tampering detected. Reinjecting overlay...");
        reinjectOverlay();
      }
    });

    const root = document.documentElement;
    if (root) {
      mutationObserver.observe(root, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class", "hidden"],
      });
    }
  }

  // 2. Ensure shadow observer is active
  if (hostElement && hostElement.shadowRoot) {
    observeShadowRoot(hostElement.shadowRoot);
  }

  // 3. Heartbeat watchdog interval every 250ms to enforce presence and health
  if (!watchdogInterval) {
    watchdogInterval = window.setInterval(() => {
      if (!isBlocked || isRebuilding) return;
      const existing = document.getElementById(HOST_ID);
      if (!isOverlayHealthy(existing)) {
        console.log("[Just Focus] Watchdog heartbeat detected missing/corrupted overlay. Reinjecting...");
        reinjectOverlay();
      } else {
        lockScroll();
      }
    }, 250);
  }

  // 4. Countdown interval every 1 second
  if (!countdownInterval) {
    countdownInterval = window.setInterval(() => {
      if (!isBlocked) return;
      updateCountdownText();
    }, 1000);
  }
}

function stopWatchdog(): void {
  if (mutationObserver) {
    mutationObserver.disconnect();
    mutationObserver = null;
  }
  if (shadowObserver) {
    shadowObserver.disconnect();
    shadowObserver = null;
  }
  if (watchdogInterval) {
    clearInterval(watchdogInterval);
    watchdogInterval = null;
  }
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

function removeOverlay(): void {
  isBlocked = false;
  stopWatchdog();
  unlockScroll();

  const el = document.getElementById(HOST_ID);
  if (el) {
    try {
      el.remove();
    } catch {}
  }
  hostElement = null;
}


// ── Session & Domain Check ───────────────────────────────────────────

async function checkBlockingState(): Promise<void> {
  if (typeof chrome === "undefined" || !chrome.storage?.local) return;

  try {
    const data = await chrome.storage.local.get([STORAGE_KEY_ACTIVE, STORAGE_KEY_SITES]);
    const session = data[STORAGE_KEY_ACTIVE] as SessionData | undefined;
    const sites = (data[STORAGE_KEY_SITES] as BlockedSiteData[] | undefined) ?? [];

    if (!session || session.status !== "active") {
      if (isBlocked) {
        removeOverlay();
      }
      return;
    }

    const endMs = new Date(session.end_time).getTime();
    if (Date.now() >= endMs) {
      if (isBlocked) {
        removeOverlay();
      }
      return;
    }

    // Check if current hostname is blocked
    const currentHost = cleanHostname(window.location.hostname);
    if (!currentHost) return;

    let matched = false;
    let matchedName = currentHost;

    for (const site of sites) {
      const isSelected = session.blocked_site_ids.includes(site.id) || site.is_selected;
      if (!isSelected) continue;

      const cleanSite = normalizeSiteDomain(site.domain);
      if (currentHost === cleanSite || currentHost.endsWith("." + cleanSite)) {
        matched = true;
        matchedName = cleanSite;
        break;
      }
    }

    if (matched) {
      isBlocked = true;
      blockedDomainName = matchedName;
      sessionEndTimeMs = endMs;
      attachOverlay();
      startWatchdog();
    } else {
      if (isBlocked) {
        removeOverlay();
      }
    }
  } catch (err) {
    console.error("[Just Focus] Error in content script check:", err);
  }
}

// ── Listeners ────────────────────────────────────────────────────────

// Storage listener for instantaneous multi-tab sync
if (typeof chrome !== "undefined" && chrome.storage?.onChanged) {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local") {
      if (changes[STORAGE_KEY_ACTIVE] || changes[STORAGE_KEY_SITES]) {
        checkBlockingState();
      }
    }
  });
}

// Runtime message listener
if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "SESSION_STATE_CHANGED") {
      checkBlockingState();
    }
  });
}

// Initial evaluation
checkBlockingState();

// DOMContentLoaded / readystatechange check to re-bind root observer if needed
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    if (isBlocked) {
      attachOverlay();
      startWatchdog();
    }
  });
}
