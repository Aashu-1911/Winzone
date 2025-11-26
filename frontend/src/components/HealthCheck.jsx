import { useState, useEffect } from 'react';

/**
 * HealthCheck Component
 * Calls the backend /api/health endpoint and displays the response
 */
function HealthCheck() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkBackendHealth();
  }, []);

  /**
   * Fetch health status from backend API
   */
  const checkBackendHealth = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/health');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setHealthStatus(data);
    } catch (err) {
      setError(err.message);
      console.error('Health check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Backend Health Status
        </h2>
        <button
          onClick={checkBackendHealth}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2"
          disabled={loading}
        >
          <span>🔄</span>
          {loading ? 'Checking...' : 'Refresh'}
        </button>
      </div>

      <div className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <span className="text-2xl mr-3">❌</span>
              <div>
                <h3 className="text-red-800 font-semibold">Connection Error</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <p className="text-red-500 text-xs mt-2">
                  Make sure the backend server is running on http://localhost:5000
                </p>
              </div>
            </div>
          </div>
        )}

        {healthStatus && !loading && !error && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <div className="flex items-center">
              <span className="text-2xl mr-3">✅</span>
              <div className="flex-1">
                <h3 className="text-green-800 font-semibold text-lg">
                  {healthStatus.status}
                </h3>
                {healthStatus.timestamp && (
                  <p className="text-green-600 text-sm mt-1">
                    Last checked: {new Date(healthStatus.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          API Endpoint:
        </h3>
        <code className="text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded">
          GET /api/health
        </code>
      </div>
    </div>
  );
}

export default HealthCheck;
