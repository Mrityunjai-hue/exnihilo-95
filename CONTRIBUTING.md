# Contributing to ExNihilo 95

Thank you for your interest in contributing to **ExNihilo 95** — the zero-configuration, in-browser SQL IDE built in the iconic Windows 95 aesthetic! 🗄️

We're actively looking for contributors to help build **premium features** and expand ExNihilo into a robust, full-featured SQL development platform.

---

## 🚀 How to Get Started

### 1. Fork & Clone

```bash
git clone https://github.com/YOUR_USERNAME/exnihilo-95.git
cd exnihilo-95
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app running locally.

### 2. Pick a Feature

Check out our **[Premium Features Roadmap](PREMIUM_FEATURES.md)** for the full list of planned features organized by priority phase:

| Phase | Features | Priority |
|-------|----------|:--------:|
| **Phase 1** | Unlimited Tabs, Theme Skins, JSON/DDL Export, Shareable Links | 🔴 High |
| **Phase 2** | Cloud Sync & Persistence, Advanced Data Generation, Chart Builder | 🟠 Medium |
| **Phase 3** | AI SQL Copilot, Live Database Connections | 🟡 Future |
| **Phase 4** | Real-Time Collaboration, Teaching & Challenge Mode | 🔵 Stretch |

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 4. Submit a Pull Request

- Write clear, descriptive commit messages
- Include screenshots or recordings for UI changes
- Add or update tests where applicable
- Reference the relevant feature from [PREMIUM_FEATURES.md](PREMIUM_FEATURES.md) in your PR description

---

## 🏗️ Project Structure

```
exnihilo-95/
├── src/
│   ├── app/                  # Next.js app router
│   ├── components/
│   │   ├── IDE/              # IDEShell, CodeMirror editor, result grids
│   │   ├── Win95/            # Desktop, Taskbar, HelpWindow, WelcomeWindow
│   │   ├── Tour/             # Guided tour component
│   │   └── Boot/             # Win95 boot animation
│   ├── engine/               # SQL execution engine
│   │   ├── executor.ts       # SQLExecutor — main orchestrator
│   │   ├── inference.ts      # AST walker & schema inference
│   │   ├── materializer.ts   # DDL/INSERT generation & Faker.js data
│   │   └── errors.ts         # Error classification
│   ├── hooks/                # Custom React hooks (useDraggable, etc.)
│   └── styles/               # Win95 CSS theme
├── public/                   # Static assets (wasm, icons)
├── PREMIUM_FEATURES.md       # Full premium feature roadmap
└── CONTRIBUTING.md           # This file
```

---

## 🎯 What We're Looking For

### 🧑‍💻 Developers
- **Frontend (React/Next.js/TypeScript):** UI components, chart builder, theme engine, collaboration features
- **Backend/Infrastructure:** Authentication, cloud sync, database proxy for live connections
- **AI/ML:** Natural language to SQL, query optimization suggestions, auto-visualization

### 🎨 Designers
- Theme designs (Windows 98, XP Luna, Dark Mode)
- UX improvements for the IDE workflow
- Data visualization and chart component design

### 📝 Documentation & Community
- Writing SQL tutorials and challenge puzzles for Teaching Mode
- Translating documentation
- Community management and developer relations

---

## 📋 Code Guidelines

- **TypeScript** — All code must be strongly typed. No `any` unless absolutely necessary.
- **Components** — Keep components focused and reusable. Follow the existing Win95 design patterns.
- **Styling** — Use the existing Win95 CSS class system (`win95-button`, `win95-window`, `win95-inset`, etc.).
- **Comments** — Preserve existing comments. Add JSDoc for public functions.
- **Testing** — Run `npm run build` to verify zero TypeScript errors before submitting.

---

## 🤝 Code of Conduct

- Be respectful and constructive in all interactions
- Welcome newcomers and help them get oriented
- Credit others' work and ideas
- Focus on building something great together

---

## 📬 Contact

- **Creator:** [Mrityunjai](https://github.com/Mrityunjai-hue)
- **Community:** [N8N Data Science Community](https://n8n-ds-community.netlify.app/)
- **Issues:** [GitHub Issues](https://github.com/Mrityunjai-hue/exnihilo-95/issues)

---

**Let's build the future of SQL tooling together! 🚀**
