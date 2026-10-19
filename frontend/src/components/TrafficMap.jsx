import React, { useState, useMemo } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polyline, 
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import { 
  Navigation, 
  ArrowRight, 
  Shuffle, 
  Play, 
  Sliders, 
  AlertTriangle, 
  Zap, 
  Gauge, 
  Route, 
  RotateCcw,
  Sparkles,
  Bot
} from 'lucide-react';
import { api } from '../services/api';

// Custom Map Auto-Fitter
function MapAutoFitter({ bounds }) {
  const map = useMap();
  React.useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [bounds, map]);
  return null;
}

export default function TrafficMap({ 
  network, 
  scenarios, 
  activeScenario, 
  setActiveScenario,
  source, 
  setSource, 
  destination, 
  setDestination,
  customSeverities,
  setCustomSeverities,
  comparisonResult,
  onCalculateRoute,
  onNavigateToCompare,
  loading 
}) {
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const handleRunGeminiAnalysis = async () => {
    if (!comparisonResult) return;
    try {
      setLoadingAi(true);
      const res = await api.analyzeWithGemini(comparisonResult);
      setAiAnalysis(res);
    } catch (err) {
      console.error('Failed to get Gemini analysis:', err);
      setAiAnalysis({ error: err.message });
    } finally {
      setLoadingAi(false);
    }
  };

  const nodes = network?.nodes || {};
  const roads = network?.roads || [];

  // Determine current severity for any road (custom override > scenario > road default)
  const getRoadSeverity = (roadId, defaultSev) => {
    if (customSeverities[roadId]) return customSeverities[roadId];
    if (activeScenario && scenarios[activeScenario]?.severities?.[roadId]) {
      return scenarios[activeScenario].severities[roadId];
    }
    return defaultSev || 'low';
  };

  const severityColors = {
    low: '#10b981',
    medium: '#f59e0b',
    heavy: '#f97316',
    critical: '#ef4444',
  };

  // Node markers with DivIcon
  const createNodeIcon = (nodeId, category) => {
    const isSource = nodeId === source;
    const isDest = nodeId === destination;
    let className = 'node-pin';
    let label = nodeId.slice(0, 3).toUpperCase();

    if (isSource) {
      className += ' source-pin';
      label = 'SRC';
    } else if (isDest) {
      className += ' destination-pin';
      label = 'DST';
    }

    return L.divIcon({
      className: 'custom-node-marker',
      html: `<div class="${className}" title="${nodes[nodeId]?.name || nodeId}">${label}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  // Swap source & destination
  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  // Cycle severity on click: low -> medium -> heavy -> critical -> low
  const cycleRoadSeverity = (roadId, currentSev) => {
    const nextMap = {
      low: 'medium',
      medium: 'heavy',
      heavy: 'critical',
      critical: 'low'
    };
    const nextSev = nextMap[currentSev] || 'medium';
    setCustomSeverities(prev => ({ ...prev, [roadId]: nextSev }));
  };

  // Reset custom road severities
  const handleResetSeverities = () => {
    setCustomSeverities({});
  };

  // Extract coordinates of the optimal recommended route for overlay
  const recommendedRouteCoordinates = useMemo(() => {
    if (!comparisonResult?.route_segments || comparisonResult.route_segments.length === 0) {
      return [];
    }
    const coords = [];
    comparisonResult.route_segments.forEach((seg, idx) => {
      if (idx === 0) {
        coords.push(...seg.coordinates);
      } else {
        coords.push(...seg.coordinates.slice(1));
      }
    });
    return coords;
  }, [comparisonResult]);

  // Compute bounding box
  const mapBounds = useMemo(() => {
    const allCoords = Object.values(nodes).map(n => [n.lat, n.lng]);
    return allCoords.length ? allCoords : [[37.74, -122.46], [37.81, -122.39]];
  }, [nodes]);

  return (
    <div className="map-view-grid">
      {/* Left: Interactive Map Container */}
      <div className="map-viewport-wrapper">
        <MapContainer 
          center={[37.7749, -122.4250]} 
          zoom={12.5} 
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Clean Light Canvas Map Tiles for Light Blue Theme */}
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>, USGS'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            maxZoom={16}
          />

          <MapAutoFitter bounds={mapBounds} />

          {/* Render All Network Roads */}
          {roads.map((road) => {
            const sev = getRoadSeverity(road.id, road.severity);
            const color = severityColors[sev] || '#10b981';
            const isSelected = selectedRoad?.id === road.id;

            return (
              <React.Fragment key={road.id}>
                {/* Glow/hit layer */}
                <Polyline
                  positions={road.coordinates}
                  pathOptions={{
                    color: isSelected ? '#0284c7' : color,
                    weight: isSelected ? 10 : 7,
                    opacity: isSelected ? 0.95 : 0.75,
                    lineCap: 'round',
                  }}
                  eventHandlers={{
                    click: () => {
                      setSelectedRoad(road);
                      cycleRoadSeverity(road.id, sev);
                    },
                  }}
                />
                {/* Core line */}
                <Polyline
                  positions={road.coordinates}
                  pathOptions={{
                    color: '#ffffff',
                    weight: 2.5,
                    opacity: 0.6,
                  }}
                />
              </React.Fragment>
            );
          })}

          {/* Render Recommended Optimal Route with Vivid Royal Blue / Emerald */}
          {recommendedRouteCoordinates.length > 0 && (
            <>
              {/* Outer Glow */}
              <Polyline
                positions={recommendedRouteCoordinates}
                pathOptions={{
                  color: '#0284c7',
                  weight: 12,
                  opacity: 0.85,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
              {/* Core Pulsing Highway */}
              <Polyline
                positions={recommendedRouteCoordinates}
                pathOptions={{
                  color: '#10b981',
                  weight: 5,
                  opacity: 1.0,
                  dashArray: '8, 8',
                }}
              />
            </>
          )}

          {/* Render City Nodes */}
          {Object.entries(nodes).map(([nodeId, node]) => (
            <Marker
              key={nodeId}
              position={[node.lat, node.lng]}
              icon={createNodeIcon(nodeId, node.category)}
              eventHandlers={{
                click: () => {
                  if (source === nodeId) {
                    setSource(destination);
                    setDestination(nodeId);
                  } else {
                    setDestination(nodeId);
                  }
                },
              }}
            >
              <Popup className="dark-popup">
                <div style={{ padding: '6px' }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: '13px', color: '#06b6d4' }}>{node.name}</h4>
                  <p style={{ margin: '0 0 8px', fontSize: '11px', color: '#94a3b8' }}>{node.description}</p>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      onClick={() => setSource(nodeId)} 
                      style={{ padding: '3px 8px', fontSize: '10px', background: '#059669', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Set Origin
                    </button>
                    <button 
                      onClick={() => setDestination(nodeId)} 
                      style={{ padding: '3px 8px', fontSize: '10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Set Destination
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend Overlay */}
        <div className="map-legend-overlay">
          <div className="legend-title">Road Traffic Congestion (Click Road to Toggle)</div>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-color-bar" style={{ background: severityColors.low }} />
              <span>Low (Clear)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color-bar" style={{ background: severityColors.medium }} />
              <span>Medium</span>
            </div>
            <div className="legend-item">
              <span className="legend-color-bar" style={{ background: severityColors.heavy }} />
              <span>Heavy</span>
            </div>
            <div className="legend-item">
              <span className="legend-color-bar" style={{ background: severityColors.critical }} />
              <span>Critical</span>
            </div>
            <div className="legend-item" style={{ marginLeft: '10px' }}>
              <span className="legend-color-bar" style={{ background: '#06b6d4', boxShadow: '0 0 6px #06b6d4' }} />
              <span style={{ color: '#06b6d4', fontWeight: 600 }}>Optimal Route</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Route Planner & Controller Panel */}
      <div className="planner-panel">
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title">
              <Sliders size={20} color="var(--accent-cyan)" />
              <span>Route Planner</span>
            </div>
            {Object.keys(customSeverities).length > 0 && (
              <button 
                className="btn-secondary" 
                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                onClick={handleResetSeverities}
                title="Reset manual road edits"
              >
                <RotateCcw size={12} />
                <span>Reset Edits</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Origin */}
            <div className="control-group">
              <label className="control-label">
                <span>Origin (Source)</span>
                <span style={{ color: 'var(--accent-emerald)', fontSize: '0.7rem' }}>START</span>
              </label>
              <select 
                id="source-node-select"
                className="control-select" 
                value={source} 
                onChange={(e) => setSource(e.target.value)}
              >
                {Object.entries(nodes).map(([id, n]) => (
                  <option key={id} value={id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                id="swap-route-btn"
                className="btn-secondary" 
                onClick={handleSwap}
                title="Swap source and destination"
                style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0 }}
              >
                <Shuffle size={16} />
              </button>
            </div>

            {/* Destination */}
            <div className="control-group">
              <label className="control-label">
                <span>Destination</span>
                <span style={{ color: '#ef4444', fontSize: '0.7rem' }}>FINISH</span>
              </label>
              <select 
                id="destination-node-select"
                className="control-select" 
                value={destination} 
                onChange={(e) => setDestination(e.target.value)}
              >
                {Object.entries(nodes).map(([id, n]) => (
                  <option key={id} value={id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Scenario Preset Selector */}
            <div className="control-group">
              <label className="control-label">
                <span>Traffic Scenario Preset</span>
                <span style={{ color: 'var(--accent-amber)', fontSize: '0.7rem' }}>SIMULATION</span>
              </label>
              <select 
                id="traffic-scenario-select"
                className="control-select"
                value={activeScenario}
                onChange={(e) => setActiveScenario(e.target.value)}
              >
                {Object.entries(scenarios).map(([key, s]) => (
                  <option key={key} value={key}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Run Route Calculation Button */}
            <button 
              id="calc-route-btn"
              className="btn-primary" 
              onClick={onCalculateRoute} 
              disabled={loading}
            >
              <Play size={18} fill="currentColor" />
              <span>{loading ? 'Solving Optimal Route...' : 'Calculate Optimal Route'}</span>
            </button>
          </div>
        </div>

        {/* Route Statistics Card */}
        {comparisonResult && (
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card-header" style={{ marginBottom: 0 }}>
              <div className="card-title">
                <Route size={18} color="var(--accent-emerald)" />
                <span>Recommended Route</span>
              </div>
              <span className="severity-tag severity-low">OPTIMIZED</span>
            </div>

            <div className="route-stat-grid">
              <div className="route-stat-box">
                <span className="stat-label">Total Distance</span>
                <span className="stat-value">{comparisonResult.python?.distance_km} km</span>
              </div>
              <div className="route-stat-box">
                <span className="stat-label">Travel Cost Index</span>
                <span className="stat-value" style={{ color: 'var(--accent-cyan)' }}>
                  {comparisonResult.python?.cost}
                </span>
              </div>
              <div className="route-stat-box">
                <span className="stat-label">Python Solved</span>
                <span className="stat-value" style={{ color: '#38bdf8', fontSize: '1rem' }}>
                  {comparisonResult.python?.execution_time_ms} ms
                </span>
              </div>
              <div className="route-stat-box">
                <span className="stat-label">Prolog Solved</span>
                <span className="stat-value" style={{ color: '#c084fc', fontSize: '1rem' }}>
                  {comparisonResult.prolog?.execution_time_ms} ms
                </span>
              </div>
            </div>

            {/* Turn-by-turn road steps */}
            <div className="control-group">
              <span className="control-label">
                <span>Waypoints & Road Conditions</span>
                <span>{comparisonResult.route_segments?.length || 0} links</span>
              </span>
              <div className="segment-steps">
                {comparisonResult.route_segments?.map((seg, idx) => (
                  <div key={idx} className="segment-item">
                    <div className="segment-left">
                      <span className="segment-road-name">{seg.name}</span>
                      <span className="segment-direction">
                        {seg.from_name} &rarr; {seg.to_name} ({seg.distance_km} km)
                      </span>
                    </div>
                    <span className={`severity-tag severity-${seg.severity}`}>
                      {seg.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gemini AI Traffic Analysis */}
            <div style={{ marginTop: '4px' }}>
              {!aiAnalysis ? (
                <button
                  id="gemini-ai-analyze-btn"
                  className="btn-secondary"
                  onClick={handleRunGeminiAnalysis}
                  disabled={loadingAi}
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.2))',
                    borderColor: 'rgba(139, 92, 246, 0.4)',
                    color: '#e2e8f0',
                    fontWeight: 600,
                  }}
                >
                  <Sparkles size={16} color="#c084fc" />
                  <span>{loadingAi ? 'Gemini 3.8 Flash Analyzing...' : 'Generate Gemini AI Traffic Insights'}</span>
                </button>
              ) : (
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #bae6fd',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0369a1', fontSize: '0.85rem' }}>
                      <Sparkles size={16} color="#0284c7" />
                      <span>Gemini Traffic Intelligence</span>
                    </div>
                    <button
                      onClick={handleRunGeminiAnalysis}
                      disabled={loadingAi}
                      style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 600, cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      {loadingAi ? 'Refreshing...' : 'Re-analyze'}
                    </button>
                  </div>

                  {aiAnalysis.text ? (
                    <div
                      style={{
                        fontSize: '0.8rem',
                        lineHeight: '1.55',
                        color: '#1e293b',
                        maxHeight: '220px',
                        overflowY: 'auto',
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {aiAnalysis.text}
                    </div>
                  ) : (
                    <div style={{ color: '#dc2626', fontSize: '0.8rem' }}>
                      {aiAnalysis.error || 'Failed to retrieve Gemini insights.'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Link to Feature 2: Side-by-side comparison */}
            <button 
              id="compare-paradigms-btn"
              className="btn-secondary" 
              onClick={onNavigateToCompare}
              style={{ justifyContent: 'space-between', marginTop: '4px' }}
            >
              <span>Compare Prolog vs Python Details</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
