# Flash Engine ⚡

A low-latency, high-concurrency Flash Sale Platform built with a high-performance Java ecosystem backend and a real-time reactive frontend dashboard. The architecture is engineered to safely process tens of thousands of concurrent transactional orders per second during competitive flash events without race conditions, stock overselling, or system degradation.

## 🚀 Key Architectural Features

- **High-Concurrency Backend:** Core distributed locking and transaction mechanics built with Java and optimized project builds.
- **Low-Latency Client UI:** React 19 single-page workspace running on Vite 6 and styled using the ultra-fast, native compilation of Tailwind CSS v4.
- **Performance Telemetry:** Integrated system statistics capturing operational pipeline latency metrics, transaction rates, and inventory saturation tracking.
- **Load Simulation & Benchmarking:** Configured with performance simulation scripts utilizing Locust for rigorous high-load telemetry testing.

---

## 🛠️ Tech Stack

### Frontend Workspace (`/frontend`)
- **Library:** React 19 (Functional Components, Hooks)
- **Bundler & Tooling:** Vite 6 (Optimized Build Engine)
- **Styling Framework:** Tailwind CSS v4 (Native CSS engine with inline configuration)
- **Iconography:** Lucide React

### Backend Infrastructure (`/`)
- **Language/Ecosystem:** Java
- **Build Automation:** Apache Maven
- **Load Testing Framework:** Locust (Python-based distributed user load generation)

---

## 📁 Directory Structure

```text
flashEngine/
├── .mvn/wrapper/          # Maven wrapper configuration
├── src/                   # Core Java backend production source code
├── frontend/              # React 19 SPA workspace
│   ├── src/               # UI components, App.jsx dashboard context
│   ├── vite.config.js     # Cleaned Vite 6 build instructions
│   └── package.json       # Node package manifests
├── locustfile.py          # Locust workload simulation models
├── pom.xml                # Project Object Model dependencies for Maven
└── README.md              # Project documentation
