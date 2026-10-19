import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import TrafficMap from './components/TrafficMap';
import ParadigmComparison from './components/ParadigmComparison';
import ScenarioTesting from './components/ScenarioTesting';
import Dashboard from './components/Dashboard';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [backendStatus, setBackendStatus] = useState(null);
  const [network, setNetwork] = useState(null);
  const [scenarios, setScenarios] = useState({});
  const [activeScenario, setActiveScenario] = useState('morning_rush');
  const [source, setSource] = useState('central_station');
  const [destination, setDestination] = useState('airport_terminal');
  const [customSeverities, setCustomSeverities] = useState({});
  const [comparisonResult, setComparisonResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Initial data loading
  useEffect(() => {
    api.getHealth()
      .then(res => setBackendStatus(res))
      .catch(err => console.error('Health check failed:', err));

    api.getNetwork()
      .then(net => {
        setNetwork(net);
        const nodeKeys = Object.keys(net.nodes || {});
        if (nodeKeys.length >= 2) {
          setSource(nodeKeys[0]); // central_station
          setDestination(nodeKeys[4] || nodeKeys[1]); // airport_terminal
        }
      })
      .catch(err => console.error('Failed to load network:', err));

    api.getScenarios()
      .then(sc => {
        setScenarios(sc.scenarios || {});
      })
      .catch(err => console.error('Failed to load scenarios:', err));
  }, []);

  // Compute initial route once network and scenarios are loaded
  useEffect(() => {
    if (network && source && destination && !comparisonResult) {
      handleCalculateRoute();
    }
  }, [network, source, destination]);

  // Handler for route evaluation
  const handleCalculateRoute = async () => {
    if (!source || !destination) return;
    try {
      setLoading(true);
      const res = await api.compareRoute(source, destination, activeScenario, customSeverities);
      setComparisonResult(res);
      showToast(
        res.routes_match 
          ? 'Route solved: Both Prolog and Python converged to the optimal path!' 
          : 'Route calculated: Paradigms diverged due to weight penalties.'
      );
    } catch (err) {
      console.error('Failed to calculate route:', err);
      showToast('Error calculating route: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        backendStatus={backendStatus} 
      />

      <main className="main-content">
        {/* Tab 1: Interactive Traffic Map (Feature 1) */}
        {activeTab === 'map' && (
          <TrafficMap
            network={network}
            scenarios={scenarios}
            activeScenario={activeScenario}
            setActiveScenario={setActiveScenario}
            source={source}
            setSource={setSource}
            destination={destination}
            setDestination={setDestination}
            customSeverities={customSeverities}
            setCustomSeverities={setCustomSeverities}
            comparisonResult={comparisonResult}
            onCalculateRoute={handleCalculateRoute}
            onNavigateToCompare={() => setActiveTab('compare')}
            loading={loading}
          />
        )}

        {/* Tab 2: Paradigm Comparison (Feature 2) */}
        {activeTab === 'compare' && (
          <ParadigmComparison
            comparisonResult={comparisonResult}
            network={network}
            source={source}
            destination={destination}
            onRunTest={handleCalculateRoute}
            loading={loading}
          />
        )}

        {/* Tab 3: Scenario Testing & Benchmark (Feature 3) */}
        {activeTab === 'scenarios' && (
          <ScenarioTesting
            scenarios={scenarios}
            activeScenario={activeScenario}
            setActiveScenario={setActiveScenario}
            onSuiteFinished={() => showToast('Automated test suite finished and recorded in SQLite!')}
          />
        )}

        {/* Tab 4: Dashboard & History (Feature 4) */}
        {activeTab === 'dashboard' && (
          <Dashboard
            network={network}
            onRefreshAll={() => showToast('Test history refreshed from SQLite.')}
          />
        )}
      </main>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="toast-container">
          <div className="toast" style={{ borderColor: toast.type === 'error' ? '#ef4444' : 'var(--accent-cyan)' }}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
