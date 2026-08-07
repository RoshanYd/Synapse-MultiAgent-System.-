/**
 * AnalyzeForm — Input field for business niche + emerald green action button.
 * Calls the FastAPI backend to trigger competitor analysis.
 */

import { useState } from 'react';

const API_BASE = 'https://synapse-multiagent-system.onrender.com';

export default function AnalyzeForm({ onAnalysisStart, onAnalysisComplete, onError }) {
  const [niche, setNiche] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = niche.trim();
    if (!trimmed) return;

    setIsLoading(true);
    onAnalysisStart?.(trimmed);

    try {
      const response = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche: trimmed }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();
      onAnalysisComplete?.(data);
      setNiche('');
    } catch (err) {
      onError?.(err.message || 'Failed to connect to analytics engine.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card gradient-border p-6 animate-fade-in">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">Competitor Analysis</h2>
        <p className="text-sm text-slate-400 mt-1">
          Enter a business niche to mine competitor data, calculate sentiment scores, and predict pricing trends.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <input
            id="niche-input"
            type="text"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="e.g. fitness, SaaS, e-commerce, fintech..."
            disabled={isLoading}
            className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600/40 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-electric-blue/60 focus:ring-1 focus:ring-electric-blue/30 transition-all duration-200 disabled:opacity-50"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-emerald-accent/30 border-t-emerald-accent rounded-full animate-spin" />
            </div>
          )}
        </div>

        <button
          id="analyze-button"
          type="submit"
          disabled={isLoading || !niche.trim()}
          className="px-6 py-3 bg-emerald-accent hover:bg-emerald-light text-white text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-glow-emerald active:scale-[0.97] flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Analyze
            </>
          )}
        </button>
      </form>
    </div>
  );
}
