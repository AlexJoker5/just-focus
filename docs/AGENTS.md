# AGENTS.md — Just Focus Chrome Extension

## Purpose

This file is the authoritative project brief for agents working on the Just Focus Chrome extension. It is based on the shared product-planning conversation:

<https://chatgpt.com/share/6ac7636b-5834-83ec-88d9-28b98f01abea>

The product is a compact Chrome-extension focus timer inspired by the interaction model of Monk Mode, while using original branding, copy, visuals, and implementation.

## Product vision

> Make manual/custom website blocking free, simple, and commitment-oriented. Users should be able to start a focused session in seconds, see exactly what is blocked, and be reminded of their commitment when they try to visit a blocked site.

The primary experience is **Deep Work**. The initial product should not require an account or subscription for core manual blocking.

## Current product direction

- Compact Chrome-extension popup UI.
- Four persistent bottom tabs:
  1. **Focus** — timer, session start, strict-mode setting, and active-session state.
  2. **Apps** — icon-based website/app selection, not a plain checkbox list.
  3. **Stats** — lightweight completed-session history.
  4. **Schedule** — recurring sessions; may initially be a scaffold or later MVP phase.
- Deep Work opens by default.
- Default blocked sites should include a practical distraction set such as Facebook, Instagram, TikTok, X, Reddit, YouTube, and LinkedIn; keep the list configurable.
- Custom websites are a first-class feature and should remain free.
- The extension should use original visual identity rather than copying Monk Mode branding or assets.

## Core UX requirements

### Focus tab — idle state

- Display product name/brand and compact top-right status counters.
- Show a duration control with a readable time value.
- Support presets such as 15 minutes, 30 minutes, 45 minutes, 1 hour, and 2 hours, plus a custom duration option. The reference interaction uses a slider spanning roughly 5 minutes to 3 hours.
- Show the selected focus mode, defaulting to Deep Work.
- Show a prominent **Start Session** button.
- Show **Strict Mode** as an explicit pre-session setting, default OFF.

### Apps tab

- Organize blocked sites into categories where useful, for example:
  - Social Media: Instagram, TikTok, X, YouTube, Facebook, Reddit, LinkedIn.
  - Entertainment: Netflix, Twitch, Spotify.
  - Job Hunting: LinkedIn, Indeed, Glassdoor.
  - Custom Websites.
- Use visual icon tiles with clear selected/unselected states.
- Clicking a tile toggles selection.
- Provide **Add Website** for custom domains.
- Provide sensible validation and normalization for entered domains.
- Avoid relying only on text or checkbox lists.

### Session start and confirmation

- Require the user to select duration, sites, and Strict Mode before starting.
- Before committing, show a concise confirmation summary: duration, selected sites/count, and whether Strict Mode is enabled.
- Starting a session should persist the session start/end timestamps and selected configuration.
- Once a session starts, its blocking configuration and Strict Mode setting should not be casually changeable.

### Active session

- Replace the idle start action with a clean, focused active-session view:
  - **Circular timer dial**: A prominent circular progress ring with centered digital countdown display (`HH:MM:SS`, e.g., `0:59:57`).
  - **Status indicator**: Display `"Focus Mode Active"` directly below the timer ring.
  - **Give Up control (Normal mode)**: A subtle, bordered `"Give Up"` button at the bottom of the view.
  - **Strict Mode**: The `"Give Up"` button is completely hidden in the extension UI. Strict Mode must be set prior to starting and cannot be toggled during an active session.
  - **Platform limitation**: Chrome cannot prevent disabling/uninstalling the extension. Strict Mode means no in-extension exit path, not absolute OS/browser lockdown.

### Give Up friction flow (Normal mode)

When the user clicks **Give Up** during a normal session, do not terminate immediately. Instead, trigger a high-friction confirmation overlay/modal:
- **Heading**: `"Don't Give Up"`.
- **Motivational dynamic progress message**: Displays session elapsed time and remaining time to motivate the user, e.g.:
  > *"You're {X} minutes in. You only need {Y} more to win this session. Don't let a moment of weakness ruin your progress."*
- **Typing friction challenge**:
  - Instruction: `"TYPE THIS TO CONFIRM:"`.
  - Target penalty phrase highlighted in a callout box: `"I will try harder next time"`.
  - Input field with placeholder: `"Type the text above..."`.
- **Actions**:
  - **"KEEP GOING"**: High-emphasis primary button (dark/solid) that immediately dismisses the modal and keeps the session active.
  - **"I GIVE UP"**: Destructive button, locked/disabled until the user types the exact penalty phrase. Once verified and clicked, the session ends and records an incomplete or abandoned session.

### Visual theme

- Clean, high-contrast **Light Mode** aesthetic.
- Crisp typography, subtle borders, rounded-card elements, and thoughtful whitespace.

### Blocked page

- When an active session blocks a visited URL, redirect to an internal extension blocked page (`blocked.html`).
- **Aesthetic**: Minimalist light theme with a subtle graph-paper / grid background pattern.
- **Center elements**:
  - App/site icon in a rounded white card with subtle shadow.
  - Uppercase site label underneath the icon (e.g., `FACEBOOK`).
  - Prominent headline: `"Stay focused."`
  - Subtle motivational caption: `"Your attention determines what you achieve."` (with rotating/selectable calm focus reminders).
  - Primary button: `"CLOSE TAB"` (solid black button, white uppercase text, triggers tab closure).
- Top corner: Subtle brand watermark/logo.

### Completion and statistics

- Show a simple session-completed state when the timer reaches zero.
- Record completed sessions and aggregate at least:
  - Focus time today.
  - Completed session count.
  - Websites blocked.
  - Basic weekly history.
- Avoid complex productivity scoring in the first implementation.

## Product scope

### Free/core functionality

- Custom websites.
- Custom duration.
- Multiple blocked websites.
- Presets.
- Strict Mode behavior as described above.
- Focus timer.
- Blocked page.
- Session history.
- No account required.
- No subscription required for manual blocking.

### Possible future premium/automation scope

Do not make these prerequisites for the core MVP:

- Scheduled sessions.
- Recurring schedules.
- Cross-device synchronization.
- Advanced statistics and analytics.
- Automatic workday routines.
- AI-generated focus plans.

## Technical direction

- **Framework & Tooling**: Chrome Extension Manifest V3, built with React, TypeScript, Vite, and Tailwind CSS.
- **Component Architecture**:
  - Pure custom UI components built directly with Tailwind CSS; no external UI component libraries.
  - Granular, atomic composition: start with reusable primitives (`Button`, `Input`, `Text`, `Heading`, `Card`, `Badge`, `Modal`, `Toggle`), and compose them into composite elements (e.g., forms composed of inputs/labels; tables decomposed into `DataTable`, `TableRow`, `TableColumn`).
- **Database & Storage Architecture (Supabase-Ready)**:
  - MVP relies 100% on `chrome.storage.local` for instant, offline-first, zero-latency execution without requiring login or network calls.
  - Data models must be designed with relational normalization (relational entities, UUID `id`, `user_id` placeholder, `created_at`, `updated_at` ISO timestamps).
  - Use a repository/adapter pattern (`StorageAdapter`) so switching to or syncing with a Supabase PostgreSQL backend in v2 is completely seamless.

- **Project Structure & Entry Points**:
  - HTML documents: Located in `src/default/` (`src/default/popup.html` and `src/default/blocked.html`).
  - Architecture: Feature-sliced modules (`src/features/`), atomic UI (`src/components/ui/`), app contracts & storage repository (`src/app/api/`), background service worker (`src/background/`), and entries (`src/entries/`).

Likely extension surfaces:

- Popup UI: `src/default/popup.html` -> `src/entries/popup/main.tsx`
- Background service worker: `src/background/serviceWorker.ts` for timer countdowns, alarms, and blocking rules.
- Declarative Net Request rules for blocking URLs.
- Blocked-page route: `src/default/blocked.html` -> `src/entries/blocked/main.tsx`
- Local storage adapter for settings, active session, and history (`src/app/api/localRepository.ts`).

Do not assume a blocking API, manifest version, build tool, or persistence schema without checking the repository and current Chrome extension constraints.

## Agent working rules

1. Read `AGENTS.md` and `STATE.md` before making changes.
2. Treat `AGENTS.md` as the stable product/project contract. Update it when product decisions, architecture, scope, or acceptance criteria materially change.
3. Treat `STATE.md` as the current execution ledger. Update it after meaningful work, including implementation, tests, discoveries, blockers, and decisions.
4. Never claim a feature is implemented or tested unless the repository and test output support that claim.
5. Keep original branding and visuals; use Monk Mode only as a high-level UX reference.
6. Preserve the free manual/custom-blocking promise unless the user explicitly changes it.
7. Keep Strict Mode honest: it removes the in-extension Give Up path but cannot prevent disabling/uninstalling the extension.
8. Prefer small, reviewable changes and document assumptions.
9. Before handing off, record what changed, validation performed, remaining risks, and the recommended next step in `STATE.md`.

## Definition of done for the MVP

The MVP is ready for review when a user can:

- Open the popup and see Deep Work as the default experience.
- Select a duration.
- Select/unselect built-in sites through icon tiles.
- Add and remove custom domains.
- Review a pre-session summary.
- Start a session and see an accurate countdown.
- Have selected sites blocked during the session.
- See an original blocked page with remaining-time context.
- Use Give Up with the "Don't Give Up" typing friction modal ("I will try harder next time") in normal mode.
- Have no Give Up control in Strict Mode.
- Complete a session and see it reflected in basic stats/history.
- Reload the extension/browser without losing valid active-session state.

## Out of scope unless explicitly approved

- Copying Monk Mode's brand, assets, or exact UI.
- Accounts, payments, or subscription gating for manual blocking.
- Claims of unbreakable browser-level enforcement.
- Complex gamification or productivity scoring.
- Cross-device sync and advanced automation in the first MVP.
