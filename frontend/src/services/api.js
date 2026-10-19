/**
 * API Service for communicating with the Flask Backend.
 */

const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || `Request failed with status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  getHealth: () => request('/health'),
  getNetwork: () => request('/network'),
  getScenarios: () => request('/scenarios'),
  
  compareRoute: (source, destination, scenario = 'normal', severities = {}) =>
    request('/route/compare', {
      method: 'POST',
      body: JSON.stringify({ source, destination, scenario, severities }),
    }),

  runTestSuite: (scenario = 'morning_rush') =>
    request('/scenarios/run_suite', {
      method: 'POST',
      body: JSON.stringify({ scenario }),
    }),

  getBenchmarkMetrics: () => request('/benchmark/metrics'),

  runStressBenchmark: (iterations = 10) =>
    request('/benchmark/stress', {
      method: 'POST',
      body: JSON.stringify({ iterations }),
    }),

  getHistory: (limit = 50, offset = 0, match = null) => {
    let url = `/history?limit=${limit}&offset=${offset}`;
    if (match !== null && match !== '') {
      url += `&match=${match}`;
    }
    return request(url);
  },

  clearHistory: () =>
    request('/history/clear', {
      method: 'POST',
    }),

  getDashboardStats: () => request('/dashboard/stats'),

  analyzeWithGemini: (routeData) =>
    request('/ai/analyze', {
      method: 'POST',
      body: JSON.stringify(routeData),
    }),

  askGeminiCopilot: (query, context = {}) =>
    request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ query, context }),
    }),
};
