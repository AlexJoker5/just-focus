# Just Focus 🎯

> **A commitment-oriented, open-source focus timer and distraction blocker for Google Chrome (Manifest V3).**  
> Inspired by the interaction density, in-page blocking, and psychological friction of **Monk Mind / Monk Mode**.

![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)
![Manifest V3](https://img.shields.io/badge/Chrome-Manifest%20V3-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)

---

## 💡 Overview

**Just Focus** is a free, local-first Chrome extension designed to help you enter and protect deep work states. It lets you select distracting websites and AI assistants, start a focus timer, and stay on track with powerful anti-relapse mechanics.

Unlike conventional blockers that aggressively redirect your tabs to internal extension URLs, **Just Focus** uses an **in-page injected overlay** (inspired by Monk Mind). The URL in your address bar remains untouched, while a full-screen, isolated Shadow DOM overlay keeps you focused with motivational quotes and live countdowns.

---

## ✨ Features

### 1. In-Page Overlay Blocking (Monk Mind Style)
- **Zero URL Redirection:** Stay on `facebook.com`, `youtube.com`, etc. without your browser address bar constantly flashing or redirecting to an internal extension URL.
- **Isolated Shadow DOM:** All overlay styling is isolated inside a closed Shadow DOM tree, completely immune to host-page CSS interference.
- **DevTools Anti-Tamper Defense:**
  - Dual `MutationObserver` instances watching both the document root and Shadow DOM tree.
  - Active 250ms watchdog heartbeat.
  - Automatically reinjects the overlay in `<5ms` if someone deletes `.jf-container` or tampers with element visibility in Chrome DevTools.
  - Locks background page scrolling (`overflow: hidden !important`).
- **One-Click Close:** Built-in **"CLOSE TAB"** button safely terminates the offending tab.

### 2. Comprehensive Apps & AI Tools Blocking
- **Categorized Presets:**
  - **AI Tools:** ChatGPT (`chatgpt.com`), Claude (`claude.ai`), Gemini (`gemini.google.com`), Manus AI (`manus.im`), Perplexity (`perplexity.ai`), DeepSeek (`deepseek.com`), Grok (`grok.com`), Microsoft Copilot (`copilot.microsoft.com`), Poe (`poe.com`).
  - **Social Media:** YouTube, X (Twitter), Instagram, Reddit, Facebook, TikTok, LinkedIn.
  - **Entertainment:** Netflix, Twitch, Spotify.
  - **Job Hunting:** Indeed, Glassdoor.
  - **Custom Websites:** Add any custom domain with real-time normalization and subdomain matching.
- **Brand Vector Icons:** Dedicated, high-contrast SVG vector icons for every supported platform.

### 3. Deep Work Timer & Session Control
- **Flexible Durations:** Quick presets (`15m`, `30m`, `45m`, `1h`, `2h`) plus a fine-grained slider (`5m` to `180m`).
- **Active Session Dial:** Minimalist circular countdown dial displaying live `HH:MM:SS` progress.
- **Extension Badge:** Real-time toolbar icon badge (`ON` or `LOCK`) indicating active focus states.

### 4. Psychological Friction & Anti-Relapse
- **Randomized Commitment Phrases:** Giving up prematurely requires accurately typing a randomly selected psychological friction phrase, such as:
  - *"I will try harder next time"*
  - *"I am choosing comfort over my goals"*
  - *"Discipline today creates freedom tomorrow"*
  - *"I am breaking my promise to stay focused"*
  - *"Every time I give up it gets easier to quit"*
- **Shuffle Option:** Ability to reroll a different phrase before committing.
- **Strict Mode:** Completely hides and disables the "Give Up" action for unbreakable focus sessions.

### 5. Focus Analytics & History
- Track **focus minutes today**, **completed session count**, and **active blocked count**.
- Visual **7-day activity bar chart** showing weekly consistency.
- Automatic session recording upon timer expiration.

### 6. 100% Privacy & Local-First
- **No account required.**
- **No telemetry, ads, or tracking.**
- 100% offline-first storage via `chrome.storage.local`.

---

## 🚀 Installation & Setup Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) (version 9 or higher)
- Google Chrome (or any Chromium browser like Brave, Edge, Arc)

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/just-focus.git
cd just-focus
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Build the Extension
```bash
npm run build
```
This generates the production bundle in the `dist/` folder.

### Step 4: Load into Chrome
1. Open Google Chrome and navigate to:
   ```text
   chrome://extensions
   ```
2. Enable **Developer mode** in the top-right corner.
3. Click the **Load unpacked** button in the top-left corner.
4. Select the **`dist`** directory inside the project folder.
5. The **Just Focus** extension icon will now appear in your browser toolbar! Pin it for quick access.

---

## 🛠️ Development

### Development Scripts
| Command | Description |
|---|---|
| `npm run build` | Compiles TypeScript and runs Vite production build into `dist/` |
| `npm test` | Runs the automated Node.js test suite |
| `npm run dev` | Runs the local Vite development server for rapid UI iteration |

### Project Structure
```text
just-focus/
├── public/                 # Static extension assets (manifest.json, icons)
├── src/
│   ├── app/
│   │   ├── api/            # Storage repository (localRepository.ts)
│   │   ├── const/          # Storage keys and constants
│   │   └── types/          # Database and entity models (Session, BlockedSite)
│   ├── components/
│   │   ├── layout/         # Header, Navbar, PopupLayout
│   │   └── ui/             # Atomic components (Button, Card, Modal, Toggle, etc.)
│   ├── entries/
│   │   ├── content/        # Content script injected overlay (main.ts)
│   │   └── popup/          # Extension popup application (PopupApp.tsx)
│   ├── features/
│   │   ├── apps/           # Apps & AI tools grid, defaultSites, AppIcon
│   │   ├── focus/          # Idle, Active dial, GiveUpModal, ConfirmModal
│   │   ├── stats/          # Focus metrics & 7-day bar chart
│   │   └── schedule/       # Recurring routine roadmap
│   ├── background/         # Service worker (alarms, badge, tab messaging)
│   └── utils/              # Domain normalization, formatting, UID generators
├── tests/                  # Automated unit test suite
├── docs/                   # Architecture specs and STATE.md ledger
└── vite.config.ts          # Multi-entrypoint Chrome Extension bundler config
```

---

## 🔒 Security & Anti-Tamper Architecture

```
User visits blocked website (e.g. facebook.com / chatgpt.com)
  │
  ├──► Content Script runs at document_start
  │      │
  │      ├──► Matches domain against active session blocked list
  │      │
  │      └──► Injects Isolated Shadow DOM Overlay (#__just_focus_overlay_host__)
  │             ├── Full-screen fixed positioning (z-index: 2147483647)
  │             ├── Graph-paper grid background & motivational quote
  │             └── Locks document scroll (overflow: hidden !important)
  │
  ├──► Tamper Detection Engine:
  │      ├── Document MutationObserver watches host node deletion/styles
  │      ├── Shadow DOM MutationObserver watches .jf-container deletion
  │      └── 250ms Heartbeat Watchdog checks computed styles & child health
  │
  └──► Tamper Detected?
         └── Instantly recreates and reinjects overlay in <5ms
```

---

## 🤝 Reference & Attribution

- **Inspiration:** Inspired by the UX density, in-page blocking, and commitment mechanics of **Monk Mind / Monk Mode**.
- **Philosophy:** Built on the principles of *Deep Work* (Cal Newport) — protecting cognitive focus by introducing deliberate friction against distraction.

---

## 📄 License

This project is open-source under the **[MIT License](LICENSE)**. Feel free to fork, customize, and contribute!
