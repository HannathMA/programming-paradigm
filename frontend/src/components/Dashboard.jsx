import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Database, 
  Clock, 
  CheckCircle2, 
  Zap, 
  Trash2, 
  RefreshCw, 
  Filter, 
  TrendingUp, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { api } from '../services/api';

export default function Dashboard({ network, onRefreshAll }) {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [filterMatch, setFilterMatch] = useState('all');
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, historyRes] = await Promise.all([
        api.getDashboardStats(),
        api.getHistory(50, 0, filterMatch === 'all' ? null : filterMatch === 'match'),
      ]);
      setStats(statsRes);
      setHistory(historyRes.history || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filterMatch]);

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear SQLite test history?')) {
      try {
        await api.clearHistory();
        fetchDashboardData();
        if (onRefreshAll) onRefreshAll();
      } catch (err) {
        console.error('Failed to clear history:', err);
      }
    }
  };

  const nodes = network?.nodes || {};
  const getNodeName = (id) => nodes[id]?.name || id;

  const severityPieData = stats?.network_summary?.severity_distribution || [
    { name: 'Low (Normal)', value: 9, color: '#10b981' },
    { name: 'Medium', value: 4, color: '#f59e0b' },
    { name: 'Heavy', value: 2, color: '#f97316' },
    { name: 'Critical', value: 0, color: '#ef4444' },
  ];

  return (
    <div className="dashboard-view">
      {/* 1. High-Level KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
            <Database size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Test Cases</span>
            <span className="kpi-value">{stats?.total_tests || 0}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Paradigm Match Rate</span>
            <span className="kpi-value" style={{ color: '#10b981' }}>
              {stats?.match_rate_percent || 100}%
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            <Zap size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Avg Python Time</span>
            <span className="kpi-value" style={{ color: '#38bdf8' }}>
              {stats?.avg_python_ms || 0} ms
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc' }}>
            <Clock size={24} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Avg Prolog Time</span>
            <span className="kpi-value" style={{ color: '#c084fc' }}>
              {stats?.avg_prolog_ms || 0} ms
            </span>
          </div>
        </div>
      </div>

      {/* 2. Charts Row */}
      <div className="charts-row">
        {/* Left: Execution Time Comparison Chart */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title">
              <TrendingUp size={20} color="var(--accent-cyan)" />
              <span>Prolog vs Python Execution Time History (Recent Runs)</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SQLite Logged</span>
          </div>

          <div className="chart-container">
            {stats?.recent_benchmarks && stats.recent_benchmarks.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.recent_benchmarks} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={11} label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ background: '#ffffff', border: '1px solid #bae6fd', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 14px rgba(2, 132, 199, 0.15)' }}
                    formatter={(val, name) => [`${val} ms`, name === 'python_ms' ? 'Python Dijkstra' : 'Prolog Engine']}
                  />
                  <Legend wrapperStyle={{ paddingTop: '8px' }} />
                  <Bar dataKey="python_ms" name="Python (ms)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="prolog_ms" name="Prolog (ms)" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', paddingTop: '80px', color: 'var(--text-muted)' }}>
                No recent benchmarks available in SQLite.
              </div>
            )}
          </div>
        </div>

        {/* Right: Traffic Severity Distribution Donut */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title">
              <Layers size={20} color="var(--accent-emerald)" />
              <span>Road Congestion Profile</span>
            </div>
          </div>

          <div className="chart-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={severityPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#ffffff', border: '1px solid #bae6fd', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 14px rgba(2, 132, 199, 0.15)' }}
                  formatter={(val, name) => [`${val} roads`, name]}
                />
              </PieChart>
            </ResponsiveContainer>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', fontSize: '0.72rem', marginTop: '6px' }}>
              {severityPieData.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. SQLite Test History Table */}
      <div className="glass-card">
        <div className="card-header">
          <div className="card-title">
            <Database size={20} color="var(--accent-cyan)" />
            <span>SQLite Test Scenarios &amp; Historical Comparisons</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <Filter size={14} />
              <select 
                className="control-select" 
                style={{ padding: '6px 12px', fontSize: '0.8rem', width: 'auto' }}
                value={filterMatch}
                onChange={(e) => setFilterMatch(e.target.value)}
              >
                <option value="all">All Tests</option>
                <option value="match">Matches Only</option>
                <option value="mismatch">Mismatches Only</option>
              </select>
            </div>

            <button 
              className="btn-secondary" 
              onClick={fetchDashboardData}
              disabled={loading}
              title="Refresh SQLite table"
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>

            <button 
              className="btn-secondary" 
              style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              onClick={handleClearHistory}
              title="Clear all test records in SQLite"
            >
              <Trash2 size={14} />
              <span>Clear History</span>
            </button>
          </div>
        </div>

        <div className="results-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Test ID</th>
                <th>Timestamp</th>
                <th>Scenario</th>
                <th>Origin &rarr; Destination</th>
                <th>Prolog Route</th>
                <th>Python Route</th>
                <th>Match</th>
                <th>Cost</th>
                <th>Prolog (ms)</th>
                <th>Python (ms)</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map((row) => (
                  <tr key={row.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                      #{row.id}
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {row.timestamp}
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{row.scenario_name}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {getNodeName(row.source)} &rarr; {getNodeName(row.destination)}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#c084fc' }}>
                      {row.prolog_route.map(n => n.slice(0, 3).toUpperCase()).join('&rarr;')}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#38bdf8' }}>
                      {row.python_route.map(n => n.slice(0, 3).toUpperCase()).join('&rarr;')}
                    </td>
                    <td>
                      {row.routes_match ? (
                        <span className="severity-tag severity-low">MATCH</span>
                      ) : (
                        <span className="severity-tag severity-critical">DIFF</span>
                      )}
                    </td>
                    <td style={{ fontWeight: 600 }}>{row.python_cost}</td>
                    <td style={{ color: '#c084fc' }}>{row.prolog_time_ms} ms</td>
                    <td style={{ color: '#38bdf8' }}>{row.python_time_ms} ms</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No test records found in SQLite database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
