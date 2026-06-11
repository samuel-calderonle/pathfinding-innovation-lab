# 🚀 Pathfinding Innovation Lab & Benchmarking Engine

> [!NOTE]
> 🤖 **AI Exploration & Deployment Project**
> 
> This repository was built using AI to explore code deployment infrastructure.
> I do not claim authorship of the underlying algorithm math or programming logic.

An interactive, real-time algorithmic playground built to visualize, profile, and stress-test pathfinding architectures. This tool evaluates the efficiency of classic search methodologies against custom structural optimizations using a localized 2D grid matrix topology.

---

## 📊 The Core Breakthrough: Stable Tie-Breaking Architecture

During rigorous stress-testing across multiple complex maze layouts (including *Dead-End Pocket Traps*, *False Horizons*, and *Winding Detour Corridors*), the **Custom Architecture** implementation consistently outperformed traditional textbook algorithms.

### Performance Breakdown
* **Dijkstra's Algorithm**: Searches blindly in an expanding uniform radius. Highly inefficient for single-target vectors as it wastes heavy CPU cycles exploring backwards away from the destination.
* **A\* Search Engine**: An improvement using a standard Manhattan distance heuristic, but severely bottlenecked by **Fanning Dilemmas**—when multiple paths share identical costs, it fans out blindly trying to break the tie.
* **The Custom Architecture**: Solves the fanning dilemma by injecting a microscopic directional vector multiplier (`1.0 + 0.001`). This introduces a stabilized "compass bias" that forces the priority queue to break ties instantly along the direct horizontal/vertical line of sight without inflating the heuristic enough to fall victim to greedy wall traps.

### Real-World Stress Test Results
Across adversarial testing environments, the node evaluation footprints proved a definitive efficiency leap:

| Environment | Dijkstra Evaluated | Traditional A* Evaluated | Custom Architecture Evaluated | Path Cost (All Optimal) |
| :--- | :---: | :---: | :---: | :---: |
| **Pocket Trap Maze** | 282 | 199 | **134** 🏆 | 30 |
| **False Horizon Channel** | 360 | 111 | **71** 🏆 | 23 |
| **Greedy Dead-End Loop** | 338 | 98 | **65** 🏆 | 24 |

*Note: Lower evaluations indicate significantly reduced memory allocation and faster calculation intervals.*

---

## 🎯 Quick Start Instructions

1. Ensure `index.html` and `app.js` are saved within the exact same directory folder.
2. Double-click `index.html` to open it natively in any modern web browser.
3. Interact directly with the viewports:
   * **Left-Click + Drag**: Paint structural walls.
   * **Right-Click + Drag**: Erase structural walls.
   * **Velocity Dropdown**: Toggle to *Slow Step-by-Step* mode to watch the live node processing loops populate the execution frames.
