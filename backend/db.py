"""
Database management for Smart Traffic Management using SQLite.
Stores test scenarios, benchmark runs, and historical comparison outputs.
"""

import sqlite3
import json
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "traffic_tests.db")


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Table for storing test results and comparison runs
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS test_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            source TEXT NOT NULL,
            destination TEXT NOT NULL,
            scenario_name TEXT NOT NULL,
            prolog_route TEXT NOT NULL,
            prolog_cost REAL NOT NULL,
            prolog_distance_km REAL NOT NULL,
            prolog_time_ms REAL NOT NULL,
            python_route TEXT NOT NULL,
            python_cost REAL NOT NULL,
            python_distance_km REAL NOT NULL,
            python_time_ms REAL NOT NULL,
            routes_match INTEGER NOT NULL,
            cost_difference REAL NOT NULL
        )
    """)

    # Check if sample seed data is needed
    cursor.execute("SELECT COUNT(*) FROM test_history")
    count = cursor.fetchone()[0]
    if count == 0:
        seed_sample_history(cursor)

    conn.commit()
    conn.close()


def seed_sample_history(cursor):
    samples = [
        ("central_station", "airport_terminal", "Morning Peak Rush Hour",
         ["central_station", "arts_quarter", "medical_center", "airport_terminal"], 7.9, 6.3, 4.82,
         ["central_station", "arts_quarter", "medical_center", "airport_terminal"], 7.9, 6.3, 0.45, 1, 0.0),

        ("central_station", "financial_dist", "Morning Peak Rush Hour",
         ["central_station", "arts_quarter", "suburb_north", "financial_dist"], 8.5, 8.5, 4.10,
         ["central_station", "arts_quarter", "suburb_north", "financial_dist"], 8.5, 8.5, 0.38, 1, 0.0),

        ("suburb_north", "harbor_bay", "Off-Peak Free Flow",
         ["suburb_north", "financial_dist", "harbor_bay"], 4.6, 4.6, 3.92,
         ["suburb_north", "financial_dist", "harbor_bay"], 4.6, 4.6, 0.31, 1, 0.0),

        ("tech_park", "suburb_north", "Severe Rainstorm & Flooding",
         ["tech_park", "central_station", "arts_quarter", "suburb_north"], 7.5, 7.5, 5.12,
         ["tech_park", "central_station", "arts_quarter", "suburb_north"], 7.5, 7.5, 0.49, 1, 0.0),

        ("arts_quarter", "airport_terminal", "Accident on Airport Expressway",
         ["arts_quarter", "university_campus", "medical_center", "airport_terminal"], 6.4, 6.4, 4.25,
         ["arts_quarter", "university_campus", "medical_center", "airport_terminal"], 6.4, 6.4, 0.41, 1, 0.0),

        ("west_market", "harbor_bay", "Arts & Music Festival",
         ["west_market", "medical_center", "university_campus", "central_station", "tech_park", "harbor_bay"], 11.9, 11.9, 6.40,
         ["west_market", "medical_center", "university_campus", "central_station", "tech_park", "harbor_bay"], 11.9, 11.9, 0.62, 1, 0.0),

        ("central_station", "harbor_bay", "Off-Peak Free Flow",
         ["central_station", "financial_dist", "harbor_bay"], 4.2, 4.2, 3.65,
         ["central_station", "financial_dist", "harbor_bay"], 4.2, 4.2, 0.34, 1, 0.0),

        ("university_campus", "financial_dist", "Morning Peak Rush Hour",
         ["university_campus", "arts_quarter", "central_station", "financial_dist"], 9.2, 7.0, 4.70,
         ["university_campus", "arts_quarter", "central_station", "financial_dist"], 9.2, 7.0, 0.44, 1, 0.0)
    ]

    for item in samples:
        cursor.execute("""
            INSERT INTO test_history (
                timestamp, source, destination, scenario_name,
                prolog_route, prolog_cost, prolog_distance_km, prolog_time_ms,
                python_route, python_cost, python_distance_km, python_time_ms,
                routes_match, cost_difference
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            item[0], item[1], item[2],
            json.dumps(item[3]), item[4], item[5], item[6],
            json.dumps(item[7]), item[8], item[9], item[10],
            item[11], item[12]
        ))


def record_test_run(source, destination, scenario_name, prolog_res, python_res):
    conn = get_db_connection()
    cursor = conn.cursor()

    prolog_route = json.dumps(prolog_res.get("route", []))
    python_route = json.dumps(python_res.get("route", []))

    p_cost = float(prolog_res.get("cost", 0.0))
    py_cost = float(python_res.get("cost", 0.0))
    cost_diff = abs(round(p_cost - py_cost, 4))
    match = 1 if prolog_res.get("route", []) == python_res.get("route", []) else 0

    cursor.execute("""
        INSERT INTO test_history (
            timestamp, source, destination, scenario_name,
            prolog_route, prolog_cost, prolog_distance_km, prolog_time_ms,
            python_route, python_cost, python_distance_km, python_time_ms,
            routes_match, cost_difference
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        source, destination, scenario_name,
        prolog_route, p_cost, float(prolog_res.get("distance_km", 0.0)), float(prolog_res.get("execution_time_ms", 0.0)),
        python_route, py_cost, float(python_res.get("distance_km", 0.0)), float(python_res.get("execution_time_ms", 0.0)),
        match, cost_diff
    ))

    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return new_id


def get_history(limit=50, offset=0, filter_match=None):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM test_history"
    params = []
    if filter_match is not None:
        query += " WHERE routes_match = ?"
        params.append(1 if filter_match else 0)

    query += " ORDER BY id DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    cursor.execute(query, params)
    rows = cursor.fetchall()

    results = []
    for r in rows:
        results.append({
            "id": r["id"],
            "timestamp": r["timestamp"],
            "source": r["source"],
            "destination": r["destination"],
            "scenario_name": r["scenario_name"],
            "prolog_route": json.loads(r["prolog_route"]),
            "prolog_cost": r["prolog_cost"],
            "prolog_distance_km": r["prolog_distance_km"],
            "prolog_time_ms": r["prolog_time_ms"],
            "python_route": json.loads(r["python_route"]),
            "python_cost": r["python_cost"],
            "python_distance_km": r["python_distance_km"],
            "python_time_ms": r["python_time_ms"],
            "routes_match": bool(r["routes_match"]),
            "cost_difference": r["cost_difference"]
        })

    conn.close()
    return results


def clear_history():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM test_history")
    conn.commit()
    conn.close()


def get_dashboard_stats():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM test_history")
    total_tests = cursor.fetchone()[0]

    if total_tests == 0:
        conn.close()
        return {
            "total_tests": 0,
            "matching_tests": 0,
            "match_rate_percent": 100.0,
            "avg_prolog_ms": 0.0,
            "avg_python_ms": 0.0,
            "speedup_ratio": 1.0,
            "fastest_prolog_ms": 0.0,
            "fastest_python_ms": 0.0,
            "recent_benchmarks": []
        }

    cursor.execute("SELECT COUNT(*) FROM test_history WHERE routes_match = 1")
    matching_tests = cursor.fetchone()[0]

    cursor.execute("SELECT AVG(prolog_time_ms), AVG(python_time_ms), MIN(prolog_time_ms), MIN(python_time_ms) FROM test_history")
    avg_prolog, avg_python, min_prolog, min_python = cursor.fetchone()

    cursor.execute("""
        SELECT id, timestamp, source, destination, scenario_name, prolog_time_ms, python_time_ms, routes_match, prolog_cost
        FROM test_history ORDER BY id DESC LIMIT 15
    """)
    recent_rows = cursor.fetchall()
    recent = []
    for r in reversed(recent_rows):
        recent.append({
            "id": r["id"],
            "label": f"#{r['id']} {r['source'][:3].upper()}->{r['destination'][:3].upper()}",
            "scenario": r["scenario_name"],
            "prolog_ms": round(r["prolog_time_ms"], 2),
            "python_ms": round(r["python_time_ms"], 2),
            "match": bool(r["routes_match"]),
            "cost": round(r["prolog_cost"], 1)
        })

    match_rate = round((matching_tests / total_tests) * 100.0, 1) if total_tests > 0 else 100.0
    speedup = round(avg_prolog / avg_python, 1) if avg_python and avg_python > 0 else 1.0

    conn.close()
    return {
        "total_tests": total_tests,
        "matching_tests": matching_tests,
        "match_rate_percent": match_rate,
        "avg_prolog_ms": round(avg_prolog or 0.0, 2),
        "avg_python_ms": round(avg_python or 0.0, 2),
        "speedup_ratio": speedup,
        "fastest_prolog_ms": round(min_prolog or 0.0, 2),
        "fastest_python_ms": round(min_python or 0.0, 2),
        "recent_benchmarks": recent
    }
