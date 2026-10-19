import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Cpu, 
  Clock, 
  Zap, 
  GitCompare, 
  Layers, 
  ArrowRight, 
  HelpCircle,
  Play
} from 'lucide-react';

export default function ParadigmComparison({ 
  comparisonResult, 
  network, 
  source, 
  destination, 
  onRunTest, 
  loading 
}) {
  const nodes = network?.nodes || {};

  if (!comparisonResult) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <GitCompare size={48} color="var(--accent-cyan)" style={{ margin: '0 auto 16px', opacity: 0.8 }} />
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>No Comparison Run Selected</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 24px' }}>
          Select a source and destination to run Prolog and Python on the same road inputs and observe how declarative logic compares against imperative priority queues.
        </p>
        <button className="btn-primary" style={{ maxWidth: '240px', margin: '0 auto' }} onClick={onRunTest} disabled={loading}>
          <Play size={18} />
          <span>{loading ? 'Evaluating...' : 'Run Paradigm Comparison'}</span>
        </button>
      </div>
    );
  }

  const { prolog, python, routes_match, cost_difference, metrics, scenario, source_name, destination_name } = comparisonResult;

  const getNodeName = (id) => nodes[id]?.name || id;

  return (
    <div className="comparison-view">
      {/* 1. Convergence & Match Banner */}
      <div className={`match-banner ${routes_match ? 'matched' : 'mismatched'}`}>
        <div className="match-title">
          {routes_match ? (
            <>
              <CheckCircle2 size={32} color="#10b981" />
              <div>
                <div style={{ color: '#10b981' }}>PARADIGM CONVERGENCE: 100% IDENTICAL ROUTE</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-secondary)' }}>
                  Both Prolog (declarative unification) and Python (imperative Dijkstra) proved the same globally optimal path.
                </div>
              </div>
            </>
          ) : (
            <>
              <XCircle size={32} color="#ef4444" />
              <div>
                <div style={{ color: '#ef4444' }}>DIVERGENT ROUTES COMPUTED</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-secondary)' }}>
                  Cost Delta: {cost_difference} units between declarative and imperative paths.
                </div>
              </div>
            </>
          )}
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Speed Ratio</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
            {metrics?.speedup_ratio || 'N/A'}
          </div>
        </div>
      </div>

      {/* Query Context Pill */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Evaluation Pair:</span>
          <strong style={{ color: 'var(--accent-emerald)' }}>{source_name}</strong>
          <ArrowRight size={16} color="var(--text-muted)" />
          <strong style={{ color: '#ef4444' }}>{destination_name}</strong>
          <span style={{ marginLeft: '16px', color: 'var(--text-muted)' }}>Scenario:</span>
          <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>{scenario}</span>
        </div>
        <button className="btn-secondary" onClick={onRunTest} disabled={loading} style={{ padding: '6px 14px' }}>
          <Play size={14} />
          <span>{loading ? 'Re-running...' : 'Re-run Comparison'}</span>
        </button>
      </div>

      {/* 2. Side-by-Side Paradigm Breakdown */}
      <div className="comparison-grid">
        {/* Left Column: Prolog Declarative Paradigm */}
        <div className="paradigm-card prolog">
          <div className="paradigm-header">
            <div>
              <span className="paradigm-badge prolog">LOGIC PROGRAMMING</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginTop: '6px' }}>Prolog Engine</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Declarative Knowledge Base &amp; First-Order Predicates
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Runtime</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#c084fc', fontFamily: 'var(--font-display)' }}>
                {prolog?.execution_time_ms} ms
              </div>
            </div>
          </div>

          {/* Metrics Strip */}
          <div className="metric-strip">
            <div>
              <div className="stat-label">Total Cost</div>
              <div className="stat-value" style={{ color: '#c084fc', fontSize: '1.1rem' }}>{prolog?.cost}</div>
            </div>
            <div>
              <div className="stat-label">Distance</div>
              <div className="stat-value" style={{ fontSize: '1.1rem' }}>{prolog?.distance_km} km</div>
            </div>
            <div>
              <div className="stat-label">Routes Explored</div>
              <div className="stat-value" style={{ color: 'var(--accent-cyan)', fontSize: '1.1rem' }}>
                {prolog?.explored_routes || 'All Acyclic'}
              </div>
            </div>
          </div>

          {/* Route Sequence Nodes */}
          <div>
            <div className="control-label" style={{ marginBottom: '8px' }}>
              <span>Computed Optimal Route Sequence</span>
              <span>{prolog?.route?.length || 0} nodes</span>
            </div>
            <div className="route-sequence-chips">
              {prolog?.route?.map((nodeId, idx) => (
                <React.Fragment key={idx}>
                  <span className="route-chip" style={{ border: '1px solid rgba(139, 92, 246, 0.4)' }}>
                    {getNodeName(nodeId)}
                  </span>
                  {idx < prolog.route.length - 1 && (
                    <ArrowRight size={14} color="#8b5cf6" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Logic Execution Trace */}
          <div>
            <div className="control-label" style={{ marginBottom: '6px' }}>
              <span>Prolog Logic Resolution Trace</span>
              <span style={{ color: '#c084fc' }}>Horn Clauses</span>
            </div>
            <div className="trace-log-box">
              <div className="trace-line">query: best_route('{source}', '{destination}', Path, Cost, Dist, Explored).</div>
              <div className="trace-line">assertz dynamic facts: road(U, V, Dist, Factor, Id)...</div>
              {prolog?.trace?.map((t, idx) => (
                <div key={idx} className="trace-line">{t}</div>
              ))}
              <div className="trace-line">Unification completed. Optimal ground term bound.</div>
            </div>
          </div>

          {/* Key Paradigm Attributes */}
          <div style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 600, color: '#c084fc', marginBottom: '4px' }}>Declarative Attributes:</div>
            <ul style={{ paddingLeft: '16px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <li>Specifies <em>what</em> constitutes a valid path rather than <em>how</em> to step through loops.</li>
              <li>Employs resolution theorem proving with SLD-resolution.</li>
              <li>Cycle avoidance achieved via recursive negation-as-failure: <code>\+ member(Next, Visited)</code>.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Python Imperative Paradigm */}
        <div className="paradigm-card python">
          <div className="paradigm-header">
            <div>
              <span className="paradigm-badge python">IMPERATIVE / OOP</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginTop: '6px' }}>Python Engine</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Dijkstra's Algorithm &amp; Min-Heap Priority Queue
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Runtime</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-display)' }}>
                {python?.execution_time_ms} ms
              </div>
            </div>
          </div>

          {/* Metrics Strip */}
          <div className="metric-strip">
            <div>
              <div className="stat-label">Total Cost</div>
              <div className="stat-value" style={{ color: '#38bdf8', fontSize: '1.1rem' }}>{python?.cost}</div>
            </div>
            <div>
              <div className="stat-label">Distance</div>
              <div className="stat-value" style={{ fontSize: '1.1rem' }}>{python?.distance_km} km</div>
            </div>
            <div>
              <div className="stat-label">Heap Operations</div>
              <div className="stat-value" style={{ color: 'var(--accent-emerald)', fontSize: '1.1rem' }}>
                {python?.steps_explored || 0} Relaxed
              </div>
            </div>
          </div>

          {/* Route Sequence Nodes */}
          <div>
            <div className="control-label" style={{ marginBottom: '8px' }}>
              <span>Computed Optimal Route Sequence</span>
              <span>{python?.route?.length || 0} nodes</span>
            </div>
            <div className="route-sequence-chips">
              {python?.route?.map((nodeId, idx) => (
                <React.Fragment key={idx}>
                  <span className="route-chip" style={{ border: '1px solid rgba(6, 182, 212, 0.4)' }}>
                    {getNodeName(nodeId)}
                  </span>
                  {idx < python.route.length - 1 && (
                    <ArrowRight size={14} color="#06b6d4" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Imperative Execution Trace */}
          <div>
            <div className="control-label" style={{ marginBottom: '6px' }}>
              <span>Priority Queue Step Trace</span>
              <span style={{ color: '#38bdf8' }}>heapq.heappop</span>
            </div>
            <div className="trace-log-box">
              <div className="trace-line">heapq.heappush(pq, (0.0, '{source}', ['{source}'], 0.0))</div>
              {python?.trace?.map((t, idx) => (
                <div key={idx} className="trace-line">{t}</div>
              ))}
              <div className="trace-line">Destination '{destination}' popped with minimum tentative cost.</div>
            </div>
          </div>

          {/* Key Paradigm Attributes */}
          <div style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 600, color: '#38bdf8', marginBottom: '4px' }}>Imperative Attributes:</div>
            <ul style={{ paddingLeft: '16px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <li>Explicit state mutation via distance dictionaries, visited sets, and binary heap arrays.</li>
              <li>Greedy edge relaxation guarantees polynomial time complexity O((V + E) log V).</li>
              <li>Low computational overhead with direct in-memory array operations.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
