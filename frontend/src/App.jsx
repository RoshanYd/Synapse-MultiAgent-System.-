/**
 * Synapse Analytics Engine — Main Application
 * Orchestrates layout, Supabase Realtime subscription, view routing, and state management.
 */

import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';
import AnalyzeForm from './components/AnalyzeForm';
import MetricsCards from './components/MetricsCards';
import CompetitorTable from './components/CompetitorTable';
import LaunchpadEngine from './components/LaunchpadEngine';

// ---------------------------------------------------------------------------
// Placeholder views for non-Dashboard tabs
// ---------------------------------------------------------------------------
function AnalyticsView({ competitors, onResetAnalytics, selectedNiche, searchedNiches, onNicheChange }) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (competitors.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Visualizations</h2>
          <p className="text-sm text-slate-400 mt-1">Interactive machine learning & sentiment insights</p>
        </div>
        <div className="glass-card p-10 text-center">
          <p className="text-slate-500">No data available. Run an analysis from the Dashboard first.</p>
        </div>
      </div>
    );
  }

  // Prepare data for Scatter Plot (Sentiment vs Growth)
  const scatterData = competitors.map(c => ({
    name: c.company_name,
    sentiment: Number(c.sentiment_score),
    growth: Number(c.predicted_next_price) - Number(c.current_price),
    price: Number(c.current_price)
  }));

  // Prepare data for Line Chart (Historical Prices)
  // We'll take the top 3 competitors and plot their history
  const topComps = [...competitors].slice(0, 3);
  let maxHistoryLength = 0;
  topComps.forEach(c => {
    if (c.historical_prices && c.historical_prices.length > maxHistoryLength) {
      maxHistoryLength = c.historical_prices.length;
    }
  });

  const lineData = [];
  for (let i = 0; i < maxHistoryLength + 1; i++) {
    const point = { name: i === maxHistoryLength ? 'Forecast' : `T-${maxHistoryLength - i}` };
    topComps.forEach((c, idx) => {
      if (i === maxHistoryLength) {
        point[`comp${idx}`] = Number(c.predicted_next_price);
      } else if (c.historical_prices) {
        // align to the right
        const offset = maxHistoryLength - c.historical_prices.length;
        if (i >= offset) {
          point[`comp${idx}`] = c.historical_prices[i - offset];
        }
      }
    });
    lineData.push(point);
  }
  
  const colors = ['#007F5F', '#00f0ff', '#8b5cf6'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Niche Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Visualizations</h2>
          <p className="text-sm text-slate-400 mt-1">Interactive machine learning & sentiment insights</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Niche History Selector */}
          {searchedNiches && searchedNiches.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Viewing:</span>
              <div className="relative group">
                <select
                  value={selectedNiche || ''}
                  onChange={(e) => onNicheChange(e.target.value)}
                  className="appearance-none bg-slate-800 border border-slate-700 text-white text-sm rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-electric-blue focus:ring-1 focus:ring-electric-blue cursor-pointer min-w-[150px] shadow-sm"
                >
                  {searchedNiches.map(niche => (
                    <option key={niche} value={niche}>{niche}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset Analytics
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowResetConfirm(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md mx-4 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">Reset All Analytics</h3>
            </div>
            <p className="text-sm text-slate-300 mb-2">Are you sure you want to reset all analytics data?</p>
            <p className="text-xs text-slate-500 mb-6">This will permanently delete all competitor records and clear all charts. This action cannot be undone.</p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { onResetAnalytics(); setShowResetConfirm(false); }}
                className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-sm text-red-400 font-medium hover:bg-red-500/30 transition-colors"
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Scatter Plot */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white mb-6">Sentiment vs. Price Growth Forecast</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" dataKey="sentiment" name="Sentiment" domain={[-1, 1]} stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis type="number" dataKey="growth" name="Forecast Growth ($)" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} />
                <ZAxis type="number" range={[100, 100]} />
                <Tooltip 
                  cursor={{strokeDasharray: '3 3'}}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
                          <p className="text-white font-bold text-sm mb-1">{data.name}</p>
                          <p className="text-xs text-slate-300">Sentiment: <span className={data.sentiment > 0 ? 'text-emerald-400' : 'text-red-400'}>{data.sentiment.toFixed(2)}</span></p>
                          <p className="text-xs text-slate-300">Growth: <span className={data.growth > 0 ? 'text-emerald-400' : 'text-red-400'}>${data.growth.toFixed(2)}</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={scatterData} fill="#00f0ff" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 mt-4 text-center">Top right quadrant indicates optimal competitors (High Sentiment + Positive Growth)</p>
        </div>

        {/* Line Chart */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-white mb-6">Historical Price & ML Forecast</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
                          <p className="text-white font-bold text-sm mb-2">{label}</p>
                          {payload.map((entry, index) => (
                            <p key={index} className="text-xs flex items-center gap-2 mb-1">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                              <span className="text-slate-300">{topComps[index]?.company_name}:</span>
                              <span className="text-white font-medium">${Number(entry.value).toFixed(2)}</span>
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {topComps.map((c, idx) => (
                  <Line 
                    key={c.id || idx} 
                    type="monotone" 
                    dataKey={`comp${idx}`} 
                    stroke={colors[idx % colors.length]} 
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2, fill: '#0f172a' }}
                    activeDot={{ r: 6, fill: colors[idx % colors.length] }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 mt-4 text-center">Plotting historical simulated prices leading to Linear Regression forecast</p>
        </div>
      </div>
    </div>
  );
}

function ReportsView({ competitors }) {
  const niches = [...new Set(competitors.map(c => c.business_niche))];
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-white">Reports</h2>
        <p className="text-sm text-slate-400 mt-1">Summary reports of your competitor intelligence</p>
      </div>
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Niche Summary Reports</h3>
        {niches.length === 0 ? (
          <p className="text-slate-500 text-sm">No reports available. Analyze a niche from the Dashboard to generate reports.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {niches.map(niche => {
              const nicheComps = competitors.filter(c => c.business_niche === niche);
              const avgPrice = (nicheComps.reduce((s, c) => s + Number(c.current_price), 0) / nicheComps.length).toFixed(2);
              const avgSent = (nicheComps.reduce((s, c) => s + Number(c.sentiment_score), 0) / nicheComps.length).toFixed(2);
              return (
                <div key={niche} className="bg-slate-800/40 border border-slate-700/30 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-white capitalize mb-3">{niche}</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-slate-400">Competitors</span><span className="text-white font-medium">{nicheComps.length}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Avg Price</span><span className="text-electric-blue font-medium">${avgPrice}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Avg Sentiment</span><span className={`font-medium ${Number(avgSent) >= 0.3 ? 'text-emerald-accent' : 'text-amber-400'}`}>{avgSent}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-sm text-slate-400 mt-1">Platform configuration</p>
      </div>
      <div className="glass-card p-6 space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-white mb-2">Engine Configuration</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
              <span className="text-slate-400">NLP Engine</span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-accent/10 text-emerald-accent text-xs font-medium border border-emerald-accent/20">NLTK VADER</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
              <span className="text-slate-400">ML Model</span>
              <span className="px-2.5 py-1 rounded-md bg-electric-blue/10 text-electric-blue text-xs font-medium border border-electric-blue/20">Linear Regression (Pure Python)</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
              <span className="text-slate-400">Search Engine</span>
              <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-medium border border-purple-500/20">DuckDuckGo</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-800/50">
              <span className="text-slate-400">Database</span>
              <span className="px-2.5 py-1 rounded-md bg-amber-400/10 text-amber-400 text-xs font-medium border border-amber-400/20">Supabase (PostgreSQL)</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-400">LLM Usage</span>
              <span className="px-2.5 py-1 rounded-md bg-red-400/10 text-red-400 text-xs font-medium border border-red-400/20">None — 100% Deterministic</span>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white mb-2">About</h3>
          <p className="text-xs text-slate-500">Synapse Analytics Engine v2.0 — A fully deterministic, LLM-free competitor intelligence platform.</p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main App
// ---------------------------------------------------------------------------
export default function App() {
  const [competitors, setCompetitors] = useState([]);
  const [notification, setNotification] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [dashboardTab, setDashboardTab] = useState('intelligence'); // 'intelligence' | 'launchpad'
  const [selectedNiche, setSelectedNiche] = useState(null);

  // -----------------------------------------------------------------------
  // Fetch existing data on mount
  // -----------------------------------------------------------------------
  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const { data, error } = await supabase
          .from('competitor_metrics')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCompetitors(data || []);
        if (data && data.length > 0) {
          // Default to most recent niche
          setSelectedNiche(data[0].business_niche);
        }
      } catch (err) {
        console.error('[Synapse] Failed to fetch existing data:', err);
      } finally {
        setIsInitialLoad(false);
      }
    };

    fetchExisting();
  }, []);

  // -----------------------------------------------------------------------
  // Subscribe to Supabase Realtime INSERT events
  // -----------------------------------------------------------------------
  useEffect(() => {
    const channel = supabase
      .channel('competitor-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'competitor_metrics',
        },
        (payload) => {
          setCompetitors((prev) => {
            const exists = prev.some((c) => c.id === payload.new.id);
            if (exists) return prev;
            return [payload.new, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // -----------------------------------------------------------------------
  // Event handlers
  // -----------------------------------------------------------------------
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const handleAnalysisStart = useCallback((niche) => {
    showNotification(`Scraping live competitors for "${niche}"…`, 'info');
    setSelectedNiche(niche); // Switch view to the new niche being searched
  }, [showNotification]);

  const handleAnalysisComplete = useCallback((data) => {
    showNotification(
      `Found ${data.competitors?.length || 0} real competitors.`,
      'success'
    );
  }, [showNotification]);

  const handleError = useCallback((message) => {
    showNotification(message, 'error');
  }, [showNotification]);

  // -----------------------------------------------------------------------
  // Delete handlers
  const handleDeleteOne = useCallback(async (id) => {
    try {
      const resp = await fetch(`http://localhost:8000/api/competitors/${id}`, { method: 'DELETE' });
      if (!resp.ok) throw new Error('Delete failed');
      setCompetitors(prev => prev.filter(c => c.id !== id));
      showNotification('Competitor record deleted.', 'success');
    } catch (err) {
      showNotification('Failed to delete competitor.', 'error');
    }
  }, [showNotification]);

  const handleDeleteBulk = useCallback(async (ids) => {
    try {
      const resp = await fetch('http://localhost:8000/api/competitors/bulk-delete', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      if (!resp.ok) throw new Error('Bulk delete failed');
      setCompetitors(prev => prev.filter(c => !ids.includes(c.id)));
      showNotification(`Successfully deleted ${ids.length} competitor(s).`, 'success');
    } catch (err) {
      showNotification('Failed to delete selected competitors.', 'error');
    }
  }, [showNotification]);

  const handleDeleteAll = useCallback(async () => {
    try {
      const resp = await fetch('http://localhost:8000/api/competitors', { method: 'DELETE' });
      if (!resp.ok) throw new Error('Delete all failed');
      setCompetitors([]);
      showNotification('All competitor records have been purged.', 'success');
    } catch (err) {
      showNotification('Failed to delete all competitors.', 'error');
    }
  }, [showNotification]);

  const handleResetAnalytics = useCallback(async () => {
    try {
      const resp = await fetch('http://localhost:8000/api/competitors', { method: 'DELETE' });
      if (!resp.ok) throw new Error('Reset failed');
      setCompetitors([]);
      showNotification('Analytics data has been reset.', 'success');
    } catch (err) {
      showNotification('Failed to reset analytics.', 'error');
    }
  }, [showNotification]);

  // -----------------------------------------------------------------------
  // View rendering
  // -----------------------------------------------------------------------
  const renderView = () => {
    const searchedNiches = [...new Set(competitors.map(c => c.business_niche))];
    const filteredCompetitors = selectedNiche 
      ? competitors.filter(c => c.business_niche === selectedNiche) 
      : [];

    switch (currentView) {
      case 'analytics':
        return (
          <AnalyticsView 
            competitors={filteredCompetitors} 
            onResetAnalytics={handleDeleteAll} 
            selectedNiche={selectedNiche}
            searchedNiches={searchedNiches}
            onNicheChange={setSelectedNiche}
          />
        );
      case 'reports':
        return <ReportsView competitors={competitors} />;
      case 'settings':
        return <SettingsView />;
      case 'dashboard':
      default:
        return (
          <>
            {/* Dashboard Tabs & Niche Selector Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 mb-6">
              
              {/* Tabs */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setDashboardTab('intelligence')}
                  className={`pb-3 text-sm font-semibold transition-colors relative ${dashboardTab === 'intelligence' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Competitor Intelligence
                  {dashboardTab === 'intelligence' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-electric-blue rounded-t-md shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
                  )}
                </button>
                <button
                  onClick={() => setDashboardTab('launchpad')}
                  className={`pb-3 text-sm font-semibold transition-colors relative ${dashboardTab === 'launchpad' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Niche Launchpad Engine
                  {dashboardTab === 'launchpad' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-electric-blue rounded-t-md shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
                  )}
                </button>
              </div>

              {/* Niche History Selector */}
              {searchedNiches.length > 0 && (
                <div className="pb-3 flex items-center gap-2">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Viewing:</span>
                  <div className="relative group">
                    <select
                      value={selectedNiche || ''}
                      onChange={(e) => setSelectedNiche(e.target.value)}
                      className="appearance-none bg-slate-800 border border-slate-700 text-white text-sm rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-electric-blue focus:ring-1 focus:ring-electric-blue cursor-pointer min-w-[150px] shadow-sm"
                    >
                      {searchedNiches.map(niche => (
                        <option key={niche} value={niche}>{niche}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {dashboardTab === 'intelligence' ? (
              <div className="animate-fade-in">
                {/* Analysis Form */}
                <div className="mb-6">
                  <AnalyzeForm
                    onAnalysisStart={handleAnalysisStart}
                    onAnalysisComplete={handleAnalysisComplete}
                    onError={handleError}
                  />
                </div>

                {/* Metrics Cards */}
                <div className="mb-6">
                  <MetricsCards competitors={filteredCompetitors} />
                </div>

                {/* Competitor Table */}
                <div className="mb-8">
                  <CompetitorTable
                    competitors={filteredCompetitors}
                    onDeleteBulk={handleDeleteBulk}
                    onDeleteAll={handleDeleteAll}
                  />
                </div>
              </div>
            ) : (
              <LaunchpadEngine activeNiche={selectedNiche} />
            )}
          </>
        );
    }
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Persistent Sidebar */}
      <Sidebar activeView={currentView} onViewChange={setCurrentView} />

      {/* Main Workspace */}
      <main className="flex-1 ml-64 p-6 lg:p-8 max-w-[1400px]">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white capitalize">
                {currentView}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                {currentView === 'dashboard' && 'Live competitor mining & predictive analytics'}
                {currentView === 'analytics' && 'Deep-dive into scraped competitor intelligence'}
                {currentView === 'reports' && 'Summary reports by business niche'}
                {currentView === 'settings' && 'Platform configuration & stack details'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/30">
                <span className="text-xs text-slate-400">Source: </span>
                <span className="text-xs font-semibold text-electric-blue">DuckDuckGo Live</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/30">
                <span className="text-xs text-slate-400">LLMs: </span>
                <span className="text-xs font-semibold text-red-400">None</span>
              </div>
            </div>
          </div>
        </header>

        {/* Notification Toast */}
        {notification && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg border text-sm font-medium animate-slide-up flex items-center gap-2
              ${notification.type === 'success'
                ? 'bg-emerald-accent/10 border-emerald-accent/30 text-emerald-light'
                : notification.type === 'error'
                  ? 'bg-red-400/10 border-red-400/30 text-red-400'
                  : 'bg-electric-blue/10 border-electric-blue/30 text-electric-blue'
              }`}
          >
            {notification.type === 'success' && (
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {notification.type === 'error' && (
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {notification.type === 'info' && (
              <div className="w-4 h-4 border-2 border-electric-blue/30 border-t-electric-blue rounded-full animate-spin flex-shrink-0" />
            )}
            {notification.message}
          </div>
        )}

        {/* Active View */}
        {renderView()}

        {/* Footer */}
        <footer className="text-center py-4 border-t border-slate-800/50 mt-8">
          <p className="text-xs text-slate-600">
            Synapse Analytics Engine v2.0 · Live Web Scraping · NLTK + Pure-Python ML · Supabase & React · Zero LLM Dependency
          </p>
        </footer>
      </main>

      {/* Loading overlay for initial fetch */}
      {isInitialLoad && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-3 border-emerald-accent/20 border-t-emerald-accent rounded-full animate-spin" />
            <p className="text-sm text-slate-400 font-medium">Initializing Synapse Engine…</p>
          </div>
        </div>
      )}
    </div>
  );
}
