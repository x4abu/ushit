# ushit 📝

> **A minimalist, distraction-free block notes app inspired by Notion's core architecture, engineered for pure speed and aesthetic clarity.**

---

## 🌟 Why ushit?

Notion revolutionized note-taking by introducing **block-based editing**. However, over time, Notion on mobile became heavy, cluttered with slow-loading databases, formulas, and deep menus that get in the way of instant thinking.

**ushit** takes the best foundational concepts of Notion and strips away all the bloat:
* **Instant Start (< 150ms):** Launches immediately, 100% offline-first.
* **Block-Based Editing:** Every paragraph, heading, todo item, quote, or snippet is an atomic block.
* **Slash Commands (`/`):** Type `/` anywhere to trigger headings, checkboxes, bullets, callout boxes, or code blocks.
* **Aesthetic & Minimal UI:** Quiet typography, warm graphite dark theme, ceramic paper light theme, and zero visual clutter.
* **Touch-Ergonomic:** Includes a bottom quick-format bar designed specifically for mobile keyboard ergonomics.
* **Export & Backup:** One-click export to CommonMark Markdown (`.md`) or complete JSON workspace backup/restore.

---

## 🏗️ Notion Reverse-Engineering Analysis

Detailed technical documentation on how Notion's block tree model was deconstructed and simplified can be found in:
👉 **[REVERSE_ENGINEERING_NOTION.md](REVERSE_ENGINEERING_NOTION.md)**

### Feature Matrix

| Feature | Notion Mobile | ushit |
| :--- | :--- | :--- |
| **Startup Time** | 4–8 seconds | **Instant (< 150ms)** |
| **Block-based Architecture** | Yes | **Yes** |
| **Slash `/` Shortcuts** | Yes (often hidden in drawers) | **Yes (Inline & Mobile Bar)** |
| **Offline-First Storage** | Sync-dependent queue | **100% Local-First** |
| **Memory & CPU Footprint** | 200MB+ | **< 15MB** |
| **UI Complexity** | High (Relational databases, rollups) | **Minimalist & Distraction-Free** |

---

## 📱 Download APK (`ushit.apk`)

Automated Android builds are compiled directly via GitHub Actions CI/CD.

You can download the latest compiled `ushit.apk` directly from:
👉 **[GitHub Releases](https://github.com/x4abu/ushit/releases)**

---

## 💻 Tech Architecture

- **Core Editor Engine:** High-performance, zero-dependency DOM Block Engine with Local-First persistence.
- **Android Native Container:** Native Android wrapper (`MainActivity.java`) with hardware acceleration and deep dark-mode status bar styling.
- **CI/CD Build System:** GitHub Actions workflow (`.github/workflows/build-apk.yml`) building signed release APKs on push.

---

## 📄 License

MIT License. Crafted for thinkers, writers, and makers who love simplicity.
