"""
Flask Backend API for Smart Traffic Management
Provides REST endpoints for Interactive Map, Paradigm Comparison (Prolog vs Python),
Performance Benchmark, Scenario Testing, and SQLite Test History.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import time
import random

from network_data import NODES, DEFAULT_ROADS, PRESET_SCENARIOS, SEVERITY_MULTIPLIERS
import python_engine
import prolog_engine
import db
import gemini_service

app = Flask(__name__)
CORS(app)

# Initialize SQLite database
db.init_db()


def build_route_segment_details(route_nodes, severities_override=None):
    """
    Constructs detailed step-by-step street descriptions and coordinates
    for rendering the highlighted route on the map.
    """
    if not route_nodes or len(route_nodes) < 2:
        return []

    road_by_uv = {}
    for r in DEFAULT_ROADS:
        road_by_uv[(r["u"], r["v"])] = r
        road_by_uv[(r["v"], r["u"])] = r

    segments = []
    for i in range(len(route_nodes) - 1):
        u = route_nodes[i]
        v = route_nodes[i + 1]
        road = road_by_uv.get((u, v))
        if road:
            r_id = road["id"]
            sev = (severities_override or {}).get(r_id, road.get("severity", "low"))
            mult = SEVERITY_MULTIPLIERS.get(sev, 1.0)
            u_node = NODES.get(u, {})
            v_node = NODES.get(v, {})
            segments.append({
                "road_id": r_id,
                "name": road["name"],
                "from_node": u,
                "from_name": u_node.get("name", u),
                "to_node": v,
                "to_name": v_node.get("name", v),
                "distance_km": road["distance_km"],
                "severity": sev,
                "multiplier": mult,
                "effective_cost": round(road["distance_km"] * mult, 2),
                "coordinates": road["coordinates"]
            })
    return segments


@app.get("/")
def home():
    return jsonify({
        "service": "Smart Traffic Management API",
        "paradigms": ["Declarative (Prolog)", "Imperative (Python)"],
        "endpoints": [
            "/api/health",
            "/api/network",
            "/api/scenarios",
            "/api/route/compare",
            "/api/scenarios/run_suite",
            "/api/benchmark/metrics",
            "/api/history",
            "/api/history/clear",
            "/api/dashboard/stats"
        ]
    })


@app.get("/api/health")
def health():
    return jsonify({
        "status": "running",
        "project": "Smart Traffic Congestion Management",
        "message": "Backend connected successfully",
        "sqlite": "connected",
        "prolog_engine": "SWI-Prolog available"
    })


@app.get("/api/network")
def get_network():
    """
    Returns full road network graph: nodes, roads with current severities and coordinates.
    """
    return jsonify({
        "nodes": NODES,
        "roads": DEFAULT_ROADS,
        "severity_multipliers": SEVERITY_MULTIPLIERS
    })


@app.get("/api/scenarios")
def get_scenarios():
    """
    Returns preset traffic scenarios.
    """
    return jsonify({
        "scenarios": PRESET_SCENARIOS
    })


@app.post("/api/route/compare")
def compare_route():
    """
    Runs both Prolog and Python on the specified inputs.
    Compares outputs side-by-side, saves results to SQLite, and returns details.
    """
    data = request.get_json() or {}
    source = data.get("source", "central_station")
    destination = data.get("destination", "airport_terminal")
    scenario_id = data.get("scenario", "normal")
    custom_severities = data.get("severities", {})

    if source not in NODES or destination not in NODES:
        return jsonify({"error": "Invalid source or destination node."}), 400

    # Determine active severities
    scenario = PRESET_SCENARIOS.get(scenario_id, PRESET_SCENARIOS["normal"])
    scenario_severities = dict(scenario["severities"])
    # Merge custom overrides
    scenario_severities.update(custom_severities)

    # 1. Run Python Engine
    py_res = python_engine.find_optimal_route(
        source, destination, DEFAULT_ROADS, severities_override=scenario_severities
    )

    # 2. Run Prolog Engine
    pl_res = prolog_engine.find_optimal_route(
        source, destination, DEFAULT_ROADS, severities_override=scenario_severities
    )

    # Determine match and cost difference
    routes_match = (py_res.get("route") == pl_res.get("route"))
    cost_diff = abs(round(float(py_res.get("cost", 0.0)) - float(pl_res.get("cost", 0.0)), 2))

    # Persist to SQLite
    record_id = db.record_test_run(
        source=source,
        destination=destination,
        scenario_name=scenario["name"],
        prolog_res=pl_res,
        python_res=py_res
    )

    # Calculate speedup
    py_time = py_res.get("execution_time_ms", 0.1)
    pl_time = pl_res.get("execution_time_ms", 1.0)
    speedup = round(pl_time / py_time, 1) if py_time > 0 else 1.0

    # Build road segment breakdown
    route_segments = build_route_segment_details(py_res.get("route", []), scenario_severities)

    return jsonify({
        "test_id": record_id,
        "source": source,
        "source_name": NODES[source]["name"],
        "destination": destination,
        "destination_name": NODES[destination]["name"],
        "scenario": scenario["name"],
        "routes_match": routes_match,
        "cost_difference": cost_diff,
        "prolog": pl_res,
        "python": py_res,
        "route_segments": route_segments,
        "metrics": {
            "speedup_ratio": f"{speedup}x faster (Python)" if speedup >= 1.0 else f"{round(1/speedup, 1)}x faster (Prolog)",
            "fastest_engine": "Python (Imperative)" if py_time < pl_time else "Prolog (Declarative)",
            "time_diff_ms": round(abs(pl_time - py_time), 3)
        }
    })


@app.post("/api/scenarios/run_suite")
def run_test_suite():
    """
    Runs an automated batch of test cases across multiple origin-destination pairs
    for a chosen scenario, evaluates match rate, records in SQLite, and returns results.
    """
    data = request.get_json() or {}
    scenario_id = data.get("scenario", "morning_rush")
    scenario = PRESET_SCENARIOS.get(scenario_id, PRESET_SCENARIOS["morning_rush"])
    scenario_severities = scenario["severities"]

    test_pairs = [
        ("central_station", "airport_terminal"),
        ("central_station", "financial_dist"),
        ("suburb_north", "harbor_bay"),
        ("tech_park", "suburb_north"),
        ("arts_quarter", "airport_terminal"),
        ("west_market", "financial_dist"),
        ("university_campus", "harbor_bay"),
        ("medical_center", "suburb_north")
    ]

    suite_results = []
    matches = 0

    for src, dst in test_pairs:
        py_res = python_engine.find_optimal_route(src, dst, DEFAULT_ROADS, scenario_severities)
        pl_res = prolog_engine.find_optimal_route(src, dst, DEFAULT_ROADS, scenario_severities)

        is_match = (py_res.get("route") == pl_res.get("route"))
        if is_match:
            matches += 1

        db.record_test_run(
            source=src,
            destination=dst,
            scenario_name=scenario["name"],
            prolog_res=pl_res,
            python_res=py_res
        )

        suite_results.append({
            "source": src,
            "source_name": NODES[src]["name"],
            "destination": dst,
            "destination_name": NODES[dst]["name"],
            "match": is_match,
            "prolog_route": pl_res.get("route", []),
            "python_route": py_res.get("route", []),
            "cost": py_res.get("cost", 0.0),
            "distance_km": py_res.get("distance_km", 0.0),
            "prolog_time_ms": pl_res.get("execution_time_ms", 0.0),
            "python_time_ms": py_res.get("execution_time_ms", 0.0)
        })

    total = len(test_pairs)
    match_rate = round((matches / total) * 100.0, 1)

    return jsonify({
        "scenario_id": scenario["id"],
        "scenario_name": scenario["name"],
        "total_tests": total,
        "matches": matches,
        "match_rate_percent": match_rate,
        "tests": suite_results
    })


@app.get("/api/benchmark/metrics")
def get_benchmark_metrics():
    """
    Returns code complexity, architectural metrics, and theoretical paradigm comparison.
    """
    py_metrics = python_engine.get_python_code_metrics()
    pl_metrics = prolog_engine.get_prolog_code_metrics()

    return jsonify({
        "python": py_metrics,
        "prolog": pl_metrics,
        "summary": {
            "loc_reduction_prolog": f"{round((1 - pl_metrics['lines_of_code']/py_metrics['lines_of_code']) * 100)}% fewer lines in Prolog",
            "cyclomatic_reduction_prolog": f"{round((1 - pl_metrics['cyclomatic_complexity']/py_metrics['cyclomatic_complexity']) * 100)}% lower complexity in Prolog",
            "verdict": "Prolog achieves maximum declarative conciseness and pure knowledge representation; Python achieves superior raw execution speed and granular memory control."
        }
    })


@app.post("/api/benchmark/stress")
def run_stress_benchmark():
    """
    Runs repeated random queries to generate real-time latency distribution curves.
    """
    data = request.get_json() or {}
    iterations = min(max(data.get("iterations", 10), 5), 25)

    node_keys = list(NODES.keys())
    latencies = []

    for i in range(iterations):
        src = random.choice(node_keys)
        dst = random.choice(node_keys)
        while dst == src:
            dst = random.choice(node_keys)

        t1 = time.perf_counter()
        py_res = python_engine.find_optimal_route(src, dst, DEFAULT_ROADS)
        t2 = time.perf_counter()

        t3 = time.perf_counter()
        pl_res = prolog_engine.find_optimal_route(src, dst, DEFAULT_ROADS)
        t4 = time.perf_counter()

        py_ms = round((t2 - t1) * 1000, 2)
        pl_ms = round((t4 - t3) * 1000, 2)

        latencies.append({
            "test_num": i + 1,
            "pair": f"{src[:4]}->{dst[:4]}",
            "python_ms": py_ms,
            "prolog_ms": pl_ms,
            "match": py_res.get("route") == pl_res.get("route")
        })

    return jsonify({
        "iterations": iterations,
        "latencies": latencies
    })


@app.get("/api/history")
def get_test_history():
    """
    Returns SQLite historical comparison runs with optional filter.
    """
    limit = request.args.get("limit", 50, type=int)
    offset = request.args.get("offset", 0, type=int)
    match_param = request.args.get("match", None)

    filter_match = None
    if match_param is not None and match_param != "":
        filter_match = True if match_param.lower() in ["1", "true"] else False

    history_items = db.get_history(limit=limit, offset=offset, filter_match=filter_match)
    return jsonify({
        "total": len(history_items),
        "history": history_items
    })


@app.post("/api/history/clear")
def clear_history_records():
    """
    Clears all saved tests from SQLite.
    """
    db.clear_history()
    return jsonify({"message": "History cleared successfully."})


@app.get("/api/dashboard/stats")
def get_dashboard_statistics():
    """
    Returns high-level KPI cards and road traffic distribution for Feature 4.
    """
    stats = db.get_dashboard_stats()

    # Calculate current road network severity distribution
    severity_counts = {"low": 0, "medium": 0, "heavy": 0, "critical": 0}
    for r in DEFAULT_ROADS:
        sev = r.get("severity", "low")
        severity_counts[sev] = severity_counts.get(sev, 0) + 1

    stats["network_summary"] = {
        "total_nodes": len(NODES),
        "total_roads": len(DEFAULT_ROADS),
        "severity_distribution": [
            {"name": "Low (Normal Flow)", "value": severity_counts["low"], "color": "#10b981"},
            {"name": "Medium (Moderate)", "value": severity_counts["medium"], "color": "#f59e0b"},
            {"name": "Heavy (Congested)", "value": severity_counts["heavy"], "color": "#f97316"},
            {"name": "Critical (Gridlock)", "value": severity_counts["critical"], "color": "#ef4444"}
        ]
    }

    return jsonify(stats)


@app.post("/api/ai/analyze")
def ai_analyze_route():
    """
    Generates intelligent route analysis using Gemini AI.
    """
    data = request.get_json() or {}
    analysis = gemini_service.analyze_route_with_gemini(data)
    return jsonify(analysis)


@app.post("/api/ai/chat")
def ai_chat_copilot():
    """
    Interactive Q&A with Gemini Traffic Copilot.
    """
    data = request.get_json() or {}
    query = data.get("query", "")
    context = data.get("context", {})
    if not query:
        return jsonify({"error": "Query cannot be empty"}), 400
    res = gemini_service.ask_gemini_copilot(query, context)
    return jsonify(res)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
