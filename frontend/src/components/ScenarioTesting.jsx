import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Zap, 
  Cpu, 
  Activity, 
  BarChart2, 
  Layers, 
  RotateCw 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { api } from '../services/api';

export default function ScenarioTesting({ 
  scenarios, 
  activeScenario, 
  setActiveScenario,
  onSuiteFinished
}) {
  const [suiteResults, setSuiteResults] = useState(null);
  const [runningSuite, setRunningSuite] = useState(false);
  const [complexityMetrics, setComplexityMetrics] = useState(null);
  const [stressData, setStressData] = useState(null);
  const [runningStress, setRunningStress] = useState(false);

  // Load code complexity metrics
  useEffect(() => {
    api.getBenchmarkMetrics()
      .then(res => setComplexityMetrics(res))
      .catch(err => console.error('Failed to load metrics:', err));
  }, []);

  // Run full automated test suite for current scenario
  const handleRunSuite = async () => {
    try {
      setRunningSuite(true);
      const res = await api.runTestSuite(activeScenario);
      setSuiteResults(res);
      if (onSuiteFinished) {
        onSuiteFinished();
      }
    } catch (err) {
      console.error('Test suite execution failed:', err);
    } finally {
      setRunningSuite(false);
    }
  };

  // Run stress benchmark
  const handleRunStress = async (iterations = 10) => {
    try {
      setRunningStress(true);
      const res = await api.runStressBenchmark(iterations);
      setStressData(res.latencies);
    } catch (err) {
      console.error('Stress test failed:', err);
    } finally {
      setRunningStress(false);
    }
  };

  return (
    <div className="scenario-testing-view">
      {/* 1. Scenario Selector Bar */}
      <div className="glass-card">
        <div className="card-header">
          <div className="card-title">
            <FlaskConical size={20} color="var(--accent-cyan)" />
            <span>Select Traffic Simulation Scenario</span>
          </div>
          <button 
            id="run-full-suite-btn"
            className="btn-primary" 
            style={{ width: 'auto', padding: '10px 20px' }}
            onClick={handleRunSuite}
            disabled={runningSuite}
          >
            <Play size={16} fill="currentColor" />
            <span>{runningSuite ? 'Executing Batch Suite...' : 'Run Automated Test Suite (8 Route Pairs)'}</span>
          </button>
        </div>

        <div className="scenario-pill-list">
          {Object.entries(scenarios).map(([key, sc]) => {
            const isActive = activeScenario === key;
            return (
              <div 
                key={key} 
                className={`scenario-pill ${isActive ? 'active' : ''}`}
                onClick={() => setActiveScenario(key)}
              >
                <span className="scenario-pill-name">{sc.name}</span>
                <span className="scenario-pill-desc">{sc.description}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Automated Test Suite Results Table */}
      {suiteResults && (
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title">
              <CheckCircle2 size={20} color="var(--accent-emerald)" />
              <span>Test Suite Outcomes — {suiteResults.scenario_name}</span>
            </div>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <span className="status-pill" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                Match Rate: {suiteResults.match_rate_percent}% ({suiteResults.matches}/{suiteResults.total_tests})
              </span>
            </div>
          </div>

          <div className="results-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Origin &rarr; Destination</th>
                  <th>Route Match</th>
                  <th>Prolog Route</th>
                  <th>Python Route</th>
                  <th>Cost Index</th>
                  <th>Distance</th>
                  <th>Prolog Time</th>
                  <th>Python Time</th>
                  <th>Fastest</th>
                </tr>
              </thead>
              <tbody>
                {suiteResults.tests.map((t, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{t.source_name} &rarr; {t.destination_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pair #{idx + 1}</div>
                    </td>
                    <td>
                      {t.match ? (
                        <span className="severity-tag severity-low" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> MATCH
                        </span>
                      ) : (
                        <span className="severity-tag severity-critical" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <XCircle size={12} /> DIFF
                        </span>
                      )}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#c084fc' }}>
                      {t.prolog_route.map(n => n.slice(0, 3).toUpperCase()).join(' &rarr; ')}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#38bdf8' }}>
                      {t.python_route.map(n => n.slice(0, 3).toUpperCase()).join(' &rarr; ')}
                    </td>
                    <td style={{ fontWeight: 600 }}>{t.cost}</td>
                    <td>{t.distance_km} km</td>
                    <td style={{ color: '#c084fc', fontWeight: 600 }}>{t.prolog_time_ms} ms</td>
                    <td style={{ color: '#38bdf8', fontWeight: 600 }}>{t.python_time_ms} ms</td>
                    <td>
                      <span className="severity-tag severity-low">Python</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Code Complexity & Architectural Metrics */}
      {complexityMetrics && (
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title">
              <Cpu size={20} color="var(--accent-purple)" />
              <span>Paradigm Code Complexity &amp; Architecture Benchmark</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
              {complexityMetrics.summary?.loc_reduction_prolog}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Prolog Complexity Card */}
            <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span className="paradigm-badge prolog">Prolog Declarative</span>
                <span style={{ fontSize: '0.75rem', color: '#6d28d9', fontWeight: 600 }}>SWI-Prolog 10.0</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '14px' }}>
                <div className="route-stat-box">
                  <span className="stat-label">Lines of Code (LOC)</span>
                  <span className="stat-value" style={{ color: '#6d28d9' }}>{complexityMetrics.prolog?.lines_of_code}</span>
                </div>
                <div className="route-stat-box">
                  <span className="stat-label">Cyclomatic Complexity</span>
                  <span className="stat-value" style={{ color: '#6d28d9' }}>{complexityMetrics.prolog?.cyclomatic_complexity}</span>
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div><strong>State:</strong> <span style={{ color: 'var(--text-secondary)' }}>{complexityMetrics.prolog?.state_management}</span></div>
                <div><strong>Control Flow:</strong> <span style={{ color: 'var(--text-secondary)' }}>{complexityMetrics.prolog?.control_flow}</span></div>
                <div><strong>Strengths:</strong> <span style={{ color: '#047857' }}>{complexityMetrics.prolog?.strengths}</span></div>
              </div>
            </div>

            {/* Python Complexity Card */}
            <div style={{ background: '#f8fafc', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span className="paradigm-badge python">Python Imperative</span>
                <span style={{ fontSize: '0.75rem', color: '#0369a1', fontWeight: 600 }}>Python 3.12 Dijkstra</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '14px' }}>
                <div className="route-stat-box">
                  <span className="stat-label">Lines of Code (LOC)</span>
                  <span className="stat-value" style={{ color: '#0284c7' }}>{complexityMetrics.python?.lines_of_code}</span>
                </div>
                <div className="route-stat-box">
                  <span className="stat-label">Cyclomatic Complexity</span>
                  <span className="stat-value" style={{ color: '#0284c7' }}>{complexityMetrics.python?.cyclomatic_complexity}</span>
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div><strong>State:</strong> <span style={{ color: 'var(--text-secondary)' }}>{complexityMetrics.python?.state_management}</span></div>
                <div><strong>Control Flow:</strong> <span style={{ color: 'var(--text-secondary)' }}>{complexityMetrics.python?.control_flow}</span></div>
                <div><strong>Strengths:</strong> <span style={{ color: '#0369a1' }}>{complexityMetrics.python?.strengths}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Live Latency Distribution Chart */}
      <div className="glass-card">
        <div className="card-header">
          <div className="card-title">
            <Activity size={20} color="var(--accent-cyan)" />
            <span>Execution Latency Distribution (Benchmark Stress Test)</span>
          </div>
          <button 
            id="run-stress-test-btn"
            className="btn-secondary" 
            onClick={() => handleRunStress(12)} 
            disabled={runningStress}
          >
            <RotateCw size={14} className={runningStress ? 'spin' : ''} />
            <span>{runningStress ? 'Running Stress Test...' : 'Run 12x Randomized Stress Tests'}</span>
          </button>
        </div>

        {stressData ? (
          <div className="chart-container" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stressData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="pair" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ background: '#ffffff', border: '1px solid #bae6fd', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 14px rgba(2, 132, 199, 0.15)' }}
                  formatter={(val, name) => [`${val} ms`, name === 'python_ms' ? 'Python (Dijkstra)' : 'Prolog (Logic Engine)']}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="python_ms" name="Python (ms)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="prolog_ms" name="Prolog (ms)" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Click &quot;Run 12x Randomized Stress Tests&quot; to generate real-time execution time profiles across the network.
          </div>
        )}
      </div>
    </div>
  );
}
