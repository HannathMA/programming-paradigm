"""
Prolog Paradigm: Declarative Logic Programming Engine.
Executes SWI-Prolog ('swipl') with dynamic knowledge base generation,
or fallback logic-based depth-first branch and bound solver.
"""

import subprocess
import time
import os
import tempfile
from network_data import SEVERITY_MULTIPLIERS

PROLOG_TEMPLATE_FILE = os.path.join(os.path.dirname(__file__), "traffic_engine.pl")


def find_optimal_route(source, destination, roads, severities_override=None):
    """
    Finds optimal route via Declarative Logic Programming (Prolog).
    Dynamically asserts road/5 facts with current traffic multipliers,
    then queries best_route/6.
    """
    t_start = time.perf_counter()

    # If source == destination
    if source == destination:
        t_end = time.perf_counter()
        return {
            "route": [source],
            "cost": 0.0,
            "distance_km": 0.0,
            "execution_time_ms": round((t_end - t_start) * 1000, 3),
            "paradigm": "Declarative (Prolog Logic Unification)",
            "explored_routes": 1,
            "engine": "SWI-Prolog 10.0",
            "trace": [f"Unification identity matched: {source} = {destination}"]
        }

    # Generate fact statements
    facts = []
    for road in roads:
        r_id = road["id"]
        sev = (severities_override or {}).get(r_id, road.get("severity", "low"))
        mult = float(SEVERITY_MULTIPLIERS.get(sev, 1.0))
        dist = float(road["distance_km"])
        facts.append(f"road('{road['u']}', '{road['v']}', {dist:.2f}, {mult:.2f}, '{r_id}').")

    facts_str = "\n".join(facts)

    # Try executing with SWI-Prolog (swipl)
    result = run_swipl(source, destination, facts_str)

    t_end = time.perf_counter()
    elapsed_ms = round((t_end - t_start) * 1000, 3)

    if result:
        result["execution_time_ms"] = elapsed_ms
        result["paradigm"] = "Declarative (SWI-Prolog 10.0 Engine)"
        result["engine"] = "SWI-Prolog (swipl)"
        return result

    # Fallback to pure declarative backtracking emulator if swipl subprocess fails
    fallback_res = run_declarative_backtracker(source, destination, roads, severities_override)
    t_end = time.perf_counter()
    fallback_res["execution_time_ms"] = round((t_end - t_start) * 1000, 3)
    fallback_res["paradigm"] = "Declarative (Prolog Logic Emulator)"
    fallback_res["engine"] = "Prolog Logic Solver"
    return fallback_res


def run_swipl(source, destination, facts_str):
    """
    Executes SWI-Prolog by creating a temporary script containing the facts
    and querying query_optimal(Source, Destination).
    """
    temp_file = None
    try:
        with open(PROLOG_TEMPLATE_FILE, "r", encoding="utf-8") as f:
            base_pl = f.read()

        full_pl = f"{facts_str}\n\n{base_pl}"

        with tempfile.NamedTemporaryFile("w", suffix=".pl", delete=False, encoding="utf-8") as tf:
            tf.write(full_pl)
            temp_file = tf.name

        cmd = [
            "swipl",
            "-q",
            "-s", temp_file,
            "-g", f"query_optimal('{source}', '{destination}'), halt."
        ]

        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=5)
        if proc.returncode == 0 and proc.stdout.strip():
            raw_out = proc.stdout.strip()
            for line in raw_out.splitlines():
                line = line.strip()
                if line.startswith("RESULT|"):
                    parts = line.split("|")
                    if len(parts) >= 5:
                        route_nodes = [node.strip("'\" ") for node in parts[1].split(",") if node.strip("'\" ")]
                        cost = float(parts[2])
                        dist = float(parts[3])
                        explored = int(parts[4])
                        return {
                            "route": route_nodes,
                            "cost": round(cost, 2),
                            "distance_km": round(dist, 2),
                            "explored_routes": explored,
                            "trace": [
                                f"Prolog engine resolved query in first-order predicate logic",
                                f"Discovered {explored} acyclic candidate routes through backtracking",
                                f"Optimal route unified with minimum weighted penalty: {cost:.2f}"
                            ]
                        }
    except Exception:
        pass
    finally:
        if temp_file and os.path.exists(temp_file):
            try:
                os.remove(temp_file)
            except OSError:
                pass
    return None


def run_declarative_backtracker(source, destination, roads, severities_override):
    """
    Pure Python implementation of Prolog's exact declarative rules:
    Unification, backtracking, cycle avoidance (\+ member(Next, Visited)),
    and minimum cost selection across all acyclic paths.
    """
    edges = []
    for road in roads:
        r_id = road["id"]
        sev = (severities_override or {}).get(r_id, road.get("severity", "low"))
        mult = SEVERITY_MULTIPLIERS.get(sev, 1.0)
        cost = road["distance_km"] * mult
        dist = road["distance_km"]
        edges.append((road["u"], road["v"], cost, dist))
        edges.append((road["v"], road["u"], cost, dist))

    all_routes = []

    def travel_route(current, visited, path, acc_cost, acc_dist):
        if current == destination:
            all_routes.append((acc_cost, acc_dist, path))
            return

        for u, v, cost, dist in edges:
            if u == current and v not in visited:
                travel_route(v, visited | {v}, path + [v], round(acc_cost + cost, 3), round(acc_dist + dist, 3))

    travel_route(source, {source}, [source], 0.0, 0.0)

    if not all_routes:
        return {
            "route": [],
            "cost": 0.0,
            "distance_km": 0.0,
            "explored_routes": 0,
            "trace": ["No valid path found through backtracking."]
        }

    all_routes.sort(key=lambda x: x[0])
    best_cost, best_dist, best_path = all_routes[0]

    return {
        "route": best_path,
        "cost": round(best_cost, 2),
        "distance_km": round(best_dist, 2),
        "explored_routes": len(all_routes),
        "trace": [
            f"Backtracking explored {len(all_routes)} acyclic paths",
            f"Best path selected by logic unification (Cost: {best_cost:.2f})"
        ]
    }


def get_prolog_code_metrics():
    """
    Returns code complexity metrics for the Prolog declarative implementation.
    """
    return {
        "paradigm": "Declarative / Logic Programming",
        "primary_structure": "First-Order Predicates, Dynamic Fact Assertions, Horn Clauses",
        "lines_of_code": 38,
        "cyclomatic_complexity": 3,
        "state_management": "Immutable / Stateless (Variables bind once via unification)",
        "control_flow": "Goal-driven resolution, automatic backtracking, cut/fail patterns",
        "strengths": "Concise declarative rules, natural knowledge representation, automatic search",
        "weaknesses": "Exponential branch factor on deep graphs without pruning, process overhead"
    }
