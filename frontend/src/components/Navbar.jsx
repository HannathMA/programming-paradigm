import React from 'react';
import { 
  Navigation, 
  GitCompare, 
  FlaskConical, 
  LayoutDashboard, 
  Cpu, 
  Activity,
  Layers
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, backendStatus }) {
  const tabs = [
    { id: 'map', label: 'Traffic Route Planner', icon: Navigation, badge: 'Interactive' },
    { id: 'compare', label: 'Prolog vs Python', icon: GitCompare, badge: 'Side-by-Side' },
    { id: 'scenarios', label: 'Scenario Testing', icon: FlaskConical, badge: 'Benchmark' },
    { id: 'dashboard', label: 'Dashboard & History', icon: LayoutDashboard, badge: 'SQLite' },
  ];

  return (
    <header className="navbar">
      <div className="brand">
        <div className="brand-icon">
          <Navigation size={22} />
        </div>
        <div className="brand-text">
          <h1>Smart Traffic Management</h1>
          <div className="brand-subtitle">Prolog vs Python AI Paradigm Routing</div>
        </div>
      </div>

      <nav className="nav-tabs" role="tablist">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              role="tab"
              aria-selected={isActive}
              className={`nav-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="status-pill" title="Backend connected via Flask, SWI-Prolog and SQLite">
          <span className="status-indicator" />
          <span>{backendStatus?.status === 'running' ? 'Engines Online' : 'Connecting...'}</span>
        </div>
      </div>
    </header>
  );
}
