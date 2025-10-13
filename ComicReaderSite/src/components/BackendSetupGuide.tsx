'use client';

import { useState } from 'react';
import { backendTester } from '../utils/backendTester';

export function BackendSetupGuide() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const results = await backendTester.runAllTests();
      setTestResults(results);
    } catch (error) {
      setTestResults({ success: false, message: 'Test failed' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-purple-600/30 bg-gray-900/80 p-5 text-purple-50 shadow-lg">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <svg className="h-5 w-5 text-amber-300" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-amber-200">Backend Not Connected</h3>
            <p className="text-sm text-purple-100/80">
              Mock data is active. Configure Tomcat 10.1.46 on port 8080 to unlock live analytics and user management.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="rounded-lg border border-purple-500/40 bg-purple-600/20 px-3 py-1 text-sm font-medium text-purple-100 transition hover:border-purple-300 disabled:opacity-50"
          >
            {isTesting ? 'Testing…' : 'Test Connection'}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium text-gray-100 transition hover:border-purple-400"
          >
            {isExpanded ? 'Hide Setup' : 'Show Setup'}
          </button>
        </div>
      </div>

      {testResults && (
        <div
          className={`mt-4 rounded-xl border p-4 text-sm ${
            testResults.success
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100'
              : 'border-red-500/40 bg-red-500/10 text-red-100'
          }`}
        >
          <div className="font-semibold">
            {testResults.success ? '✅ Backend connection successful!' : '❌ Backend connection failed'}
          </div>
          <div className="text-xs opacity-75 mt-1">{testResults.message}</div>
        </div>
      )}

      {isExpanded && (
        <div className="mt-5 space-y-5 rounded-2xl border border-purple-500/20 bg-black/40 p-5 text-sm text-purple-100">
          <h4 className="text-sm font-semibold text-purple-200">Backend Setup Checklist</h4>

          <div>
            <h5 className="font-medium text-purple-100 mb-2">1. Tomcat Configuration</h5>
            <ul className="ml-5 list-disc space-y-1 text-purple-100/80">
              <li>Start Apache Tomcat 10.1.46 on <code className="rounded bg-white/10 px-1">http://localhost:8080</code></li>
              <li>Deploy the ComicReader Jakarta EE backend</li>
              <li>Enable CORS for <code className="rounded bg-white/10 px-1">http://localhost:3000</code></li>
            </ul>
          </div>

          <div>
            <h5 className="font-medium text-purple-100 mb-2">2. Required API Endpoints</h5>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 font-mono text-xs leading-relaxed text-purple-50">
              <div>GET /api/health</div>
              <div>POST /api/auth/login</div>
              <div>GET /api/auth/me</div>
              <div>GET /api/dashboard/stats</div>
              <div>GET /api/dashboard/activity</div>
              <div>GET /api/manga</div>
              <div>GET /api/users (admin only)</div>
            </div>
          </div>

          <div>
            <h5 className="font-medium text-purple-100 mb-2">3. CORS Filter</h5>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="mb-2 text-purple-100/80">Add this entry to <code className="bg-white/10 px-1 rounded">web.xml</code>:</p>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded border border-purple-500/20 bg-black/60 p-3 text-xs text-purple-50">
{`<filter>
  <filter-name>CorsFilter</filter-name>
  <filter-class>org.apache.catalina.filters.CorsFilter</filter-class>
  <init-param>
    <param-name>cors.allowed.origins</param-name>
    <param-value>http://localhost:3000</param-value>
  </init-param>
</filter>`}
              </pre>
            </div>
          </div>

          <div>
            <h5 className="font-medium text-purple-100 mb-2">4. Connection Test</h5>
            <p className="text-purple-100/80">
              Use the <span className="font-semibold text-purple-200">Test Connection</span> button above after deploying to confirm the dashboard can reach your backend.
            </p>
          </div>

          <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm text-sky-100">
            <strong>Tip:</strong> Once the API reports healthy, the dashboard automatically swaps to real data—no reload required.
          </div>
        </div>
      )}
    </div>
  );
}