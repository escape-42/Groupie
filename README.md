# Groupie

<img width="448" height="549" alt="image" src="https://github.com/user-attachments/assets/ee635fdd-18ba-4407-a603-4cb4fa6b5a1c" />


> A lightweight browser extension for grouping tabs and switching between them instantly.

Think of it as a window manager for your browser — organize tabs into named groups, then jump between them with a single click. No clutter, no lost context.

---

## Features

- **Named groups** — create as many groups as you need, each with a custom color
- **One-click switching** — click any saved tab to instantly focus it (or open it if it's closed)
- **Add active tab** — drop the current page into any group without leaving it
- **Minimal footprint** — no background processes, no tracking, no network requests

---

## Installation

Groupie is not yet on the Chrome Web Store. Load it manually in under a minute:

1. Clone or download this repo
2. Open `chrome://extensions` (or `brave://extensions`)
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select the project folder

---

## Usage

| Action | How |
|---|---|
| Create a group | Click **+ New Group**, type a name, pick a color, press Enter |
| Add current tab | Click **+ Add Tab** → select a group |
| Switch to a tab | Click any tab row inside a group |
| Remove a tab | Hover the tab row → click **✕** |
| Delete a group | Hover the group header → click **✕** |
| Collapse / expand | Click anywhere on the group header |

---

## Stack

- **Manifest V3** Chrome extension
- Vanilla JS — no frameworks, no build step
- `chrome.storage.local` for persistence
- `chrome.tabs` + `chrome.windows` for tab management

---

## Browser Support

| Browser | Status |
|---|---|
| Chrome | ✅ |
| Brave | ✅ |
| Edge | ✅ |
| Firefox | ⚠ Partial (MV3 support varies) |

---

## Contributing

PRs welcome. Keep it dependency-free and under Manifest V3.
