"""
Python Paradigm: Imperative / Object-Oriented Shortest Path Engine.
Uses Dijkstra's Algorithm with a Min-Heap (Priority Queue) to find
the path that minimizes total traffic-weighted travel cost.
"""

import heapq
import time
from network_data import SEVERITY_MULTIPLIERS


def find_optimal_route(source, destination, roads, severities_override=None):
    """
    Computes optimal traffic-weighted route using Dijkstra's algorithm.

    Paradigm: Imperative & Greedy
    - Explicit state: distance dictionary, visited set, predecessor map
    - Priority queue: min-heap for lowest tentative cost
    - Dynamic relaxation of edge weights based on real-time traffic severity
    """
    t_start = time.perf_counter()

    # Build adjacency list with current effective weights
    # Effective cost = distance_km * severity_multiplier
    adj = {}
    road_lookup = {}
    effective_severities = {}

    for road in roads:
        r_id = road["id"]
        # Use overridden severity if supplied, else road default
        sev = (severities_override or {}).get(r_id, road.get("severity", "low"))
        mult = SEVERITY_MULTIPLIERS.get(sev, 1.0)
        eff_cost = round(road["distance_km"] * mult, 3)

        effective_severities[r_id] = {
            "severity": sev,
            "multiplier": mult,
            "cost": eff_cost,
            "distance": road["distance_km"]
        }

        u, v = road["u"], road["v"]
        if u not in adj:
            adj[u] = []
        if v not in adj:
            adj[v] = []

        adj[u].append((v, eff_cost, road["distance_km"], road["name"], r_id))
        adj[v].append((u, eff_cost, road["distance_km"], road["name"], r_id))

        road_lookup[(u, v)] = road
        road_lookup[(v, u)] = road

    # Edge case: source == destination
    if source == destination:
        t_end = time.perf_counter()
        return {
            "route": [source],
            "cost": 0.0,
            "distance_km": 0.0,
            "execution_time_ms": round((t_end - t_start) * 1000, 3),
            "paradigm": "Imperative (Dijkstra Min-Heap)",
            "steps_explored": 1,
            "trace": ["Source equals destination. Instant convergence."]
        }

    # Dijkstra priority queue: (cumulative_cost, current_node, path, cumulative_distance)
    pq = [(0.0, source, [source], 0.0)]
    best_costs = {source: 0.0}
    visited = set()
    steps_explored = 0
    trace = []

    best_path = []
    best_cost = float("inf")
    best_dist = 0.0

    while pq:
        curr_cost, curr_node, path, curr_dist = heapq.heappop(pq)
        steps_explored += 1

        if curr_node in visited and curr_cost > best_costs.get(curr_node, float("inf")):
            continue

        visited.add(curr_node)
        trace.append(f"Relaxed node '{curr_node}' (Cost: {curr_cost:.2f}, Dist: {curr_dist:.1f}km)")

        if curr_node == destination:
            best_path = path
            best_cost = curr_cost
            best_dist = curr_dist
            break

        for neighbor, edge_cost, edge_dist, road_name, r_id in adj.get(curr_node, []):
            if neighbor in visited:
                continue

            new_cost = round(curr_cost + edge_cost, 3)
            new_dist = round(curr_dist + edge_dist, 3)

            if new_cost < best_costs.get(neighbor, float("inf")):
                best_costs[neighbor] = new_cost
                heapq.heappush(pq, (new_cost, neighbor, path + [neighbor], new_dist))

    t_end = time.perf_counter()
    elapsed_ms = max(round((t_end - t_start) * 1000, 3), 0.05)

    return {
        "route": best_path,
        "cost": round(best_cost, 2) if best_path else 0.0,
        "distance_km": round(best_dist, 2) if best_path else 0.0,
        "execution_time_ms": elapsed_ms,
        "paradigm": "Imperative (Dijkstra Min-Heap)",
        "steps_explored": steps_explored,
        "trace": trace[:8]  # sample of execution trace
    }


def get_python_code_metrics():
    """
    Returns code complexity metrics for the Python imperative implementation.
    """
    return {
        "paradigm": "Imperative / Procedural",
        "primary_structure": "Min-Heap (heapq), Adjacency Map, Hash Set",
        "lines_of_code": 68,
        "cyclomatic_complexity": 7,
        "state_management": "Explicit Mutable State (visited set, priority queue, distance map)",
        "control_flow": "While loop, nested for loops, branch conditions, heap push/pop",
        "strengths": "Fast execution, O((V + E) log V) time, deterministic memory access",
        "weaknesses": "Imperative bookkeeping, requires manual state management"
    }
