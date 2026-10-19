# Smart Traffic Management: Programming Paradigm Comparison

A full-stack intelligent traffic congestion management application comparing **Declarative Logic Programming (Prolog)** against **Imperative Graph Algorithms (Python Dijkstra)** on real-time simulated city networks.

---

## 🌟 Architecture Overview

```
                      ┌───────────────────────────────────────┐
                      │       React + Vite Frontend (UI)       │
                      │  Interactive Leaflet Map & Benchmarks │
                      └──────────────────┬────────────────────┘
                                         │  REST API
                                         ▼
                      ┌───────────────────────────────────────┐
                      │         Flask Backend (app.py)        │
                      └──────────┬─────────────────┬──────────┘
                                 │                 │
                ┌────────────────┴────────┐        └────────────────┐
                ▼                         ▼                         ▼
   ┌─────────────────────────┐  ┌──────────────────┐   ┌──────────────────────────┐
   │ Declarative Prolog Engine│  │ Imperative Python│   │ SQLite & Gemini 3.8 AI   │
   │ (SWI-Prolog Horn Clauses│  │ (Dijkstra/HeapQ) │   │ (Test History & Insights)│
   └─────────────────────────┘  └──────────────────┘   └──────────────────────────┘
```

---

## 🚀 Key Features

### 1. Interactive Traffic Map (Feature 1)
- **City Network Graph**: 10 municipal hubs and 15 interconnected road segments.
- **Traffic Severity Levels**: Roads dynamically colored by congestion (*Low*, *Medium*, *Heavy*, *Critical*).
- **Interactive Congestion Editor**: Click any road on the map to cycle traffic severity in real-time.
- **Optimal Route Overlay**: Animated, glowing polyline highlighting the global minimum travel time path.

### 2. Paradigm Comparison: Prolog vs. Python (Feature 2)
- **Declarative Logic (Prolog)**: Dynamic knowledge base facts `road/5`, recursive path discovery with cycle prevention (`\+ member/2`), and unification with branch-and-bound optimization.
- **Imperative / OOP (Python)**: Dijkstra’s algorithm using min-heap priority queue (`heapq`) and iterative edge weight relaxation.
- **Side-by-Side Convergence**: Live indicator confirming 100% route convergence and microsecond-level timing comparisons.

### 3. Scenario Testing & Performance Benchmark (Feature 3)
- **Preset Scenarios**: *Off-Peak Free Flow*, *Morning Peak Rush*, *Airport Expressway Collision*, *Downtown Rainstorm*, *Arts Festival*.
- **Automated Batch Test Suite**: Runs 8 diverse Origin-Destination pairs and displays results in an interactive table.
- **Code Complexity Metrics**: Side-by-side comparison of Lines of Code (LOC), Cyclomatic Complexity, and state management models.
- **Stress Testing**: Multi-iteration benchmark with real-time latency distribution bar charts.

### 4. Dashboard & Test History (Feature 4)
- **KPI Metrics**: Total Test Cases, Paradigm Match Rate %, Average Latencies, Congested Road Distribution.
- **SQLite Database Persistence**: All test scenarios and execution outputs are logged into `traffic_tests.db`.
- **Search & Filter**: Filter history by match status and clear or refresh test records on demand.

### 5. Gemini AI Traffic Insights
- Integrated Google Gemini AI to generate route bottleneck assessments, paradigm rationale explanations, and municipal traffic dispatch recommendations.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Leaflet, React-Leaflet, Lucide React, Recharts, Vanilla CSS (Light Blue Sky theme).
- **Backend**: Python 3.12, Flask 3.1, Flask-CORS, SQLite3.
- **Logic Programming**: SWI-Prolog 10.0 (`swipl`).
- **AI Intelligence**: Google Gemini 3.8 Flash.

---

## ⚙️ Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- SWI-Prolog (`swipl` added to PATH)

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt # or: pip install flask flask-cors
python app.py
```
Backend runs on `http://127.0.0.1:5000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://127.0.0.1:5173`.

---

## ⚖️ Paradigm Summary

| Metric / Dimension | Prolog (Declarative Logic) | Python (Imperative Dijkstra) |
| :--- | :--- | :--- |
| **Philosophy** | Express *what* defines an optimal route | Express *how* step-by-step to reach target |
| **Primary Structure**| Horn clauses, Predicates, Dynamic Facts | Adjacency Map, Binary Min-Heap (`heapq`) |
| **State Management**| Immutable variables bound via Unification| Mutable priority queue, visited set |
| **Lines of Code (LOC)**| ~38 lines | ~68 lines |
| **Cyclomatic Complexity**| 3 | 7 |
| **Execution Speed** | Subprocess compilation + recursive search | Microsecond in-memory heap relaxation |
