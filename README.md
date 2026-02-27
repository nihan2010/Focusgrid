<div align="center">
  <img src="public/logo.png" width="120" height="120" alt="FocusGrid Logo" />
  <h1>FocusGrid</h1>
  <p><strong>24/7 Study Marathon Command Center</strong></p>
  <p>A premium, minimalist PWA built for intense focus and long-term productivity.</p>
</div>

---

## 🚀 Overview

**FocusGrid** is a state-of-the-art productivity application designed for students, developers, and deep-work enthusiasts. It goes beyond simple timers by providing a comprehensive "command center" for your daily habits, featuring data-driven growth tracking and background-safe alerting.

## ✨ Key Features

- **🛡️ Hard Mode**: Prevents distraction by requiring interaction on session completion and re-triggering notifications every 15 seconds until acknowledged.
- **📱 PWA Ready**: Install FocusGrid as a standalone app on Windows, macOS, and Android for a native-like experience.
- **🔔 Background Notifications**: Leverages Service Workers to deliver system-level alerts even when the tab is minimized or the browser is in the background.
- **🌲 Focus Tree**: A data-driven visual growth system where your digital tree matures based on your real daily completion percentage.
- **🔄 Session Persistence**: Never lose your progress. Active Pomodoros resume accurately even after page reloads or system sleep.
- **📊 Advanced Analytics**: Detailed archive system keyed by ISO date, tracking study minutes, breaks, and session completion rates.
- **🎮 MiniPlayer Mode**: A floating, draggable timer interface that stays on top of your work area.
- **🌙 Dynamic Themes**: Support for Light, Dark, and System modes with a flicker-free "No-FOUC" initialization.

## 🛠️ Tech Stack

- **Core**: [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Database**: [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) (via custom lib)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Background Logic**: [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) (for timer precision)
- **Notifications**: [Web Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API) + [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/nihan2010/Focusgrid.git
   cd FocusGrid
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  Built with obsession for FocusGrid.
</div>
