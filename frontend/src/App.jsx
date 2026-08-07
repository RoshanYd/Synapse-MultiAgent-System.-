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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {niches.map(niche => {
              const nicheComps = competitors.filter(c => c.business_niche === niche);
              const avgPrice = (nicheComps.reduce((s, c) => s + Number(c.current_price), 0) / nicheComps.length).toFixed(2);
              const avgSent = (nicheComps.reduce((s, c) => s + Number(c.sentiment_score), 0) / nicheComps.length).toFixed(2);
              return (
                <div key={niche} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 hover:border-electric-blue/30 transition-colors shadow-lg">
                  <h4 className="text-lg font-bold text-white capitalize mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    {niche}
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg"><span className="text-slate-400 font-medium">Competitors Tracked</span><span className="text-white font-bold bg-slate-700/50 px-2.5 py-0.5 rounded text-xs">{nicheComps.length}</span></div>
                    <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg"><span className="text-slate-400 font-medium">Average Market Price</span><span className="text-electric-blue font-bold tracking-wide">${avgPrice}</span></div>
                    <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg">
                      <span className="text-slate-400 font-medium">Market Sentiment</span>
                      <span className={`font-bold px-2.5 py-0.5 rounded text-xs ${Number(avgSent) >= 0.3 ? 'bg-emerald-accent/10 text-emerald-accent' : Number(avgSent) >= 0 ? 'bg-amber-400/10 text-amber-400' : 'bg-red-400/10 text-red-400'}`}>
                        {Number(avgSent) >= 0.3 ? 'Positive' : Number(avgSent) >= 0 ? 'Neutral' : 'Negative'} ({avgSent})
                      </span>
                    </div>
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
        <p className="text-sm text-slate-400 mt-1">Platform configuration & engine diagnostics</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-electric-blue/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-white">Engine Configuration</h3>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-700/30">
              <span className="text-slate-300 font-medium">NLP Engine</span>
              <span className="px-3 py-1 rounded-md bg-emerald-accent/10 text-emerald-accent text-xs font-bold border border-emerald-accent/20 tracking-wide">NLTK VADER</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-700/30">
              <span className="text-slate-300 font-medium">ML Model</span>
              <span className="px-3 py-1 rounded-md bg-electric-blue/10 text-electric-blue text-xs font-bold border border-electric-blue/20 tracking-wide">LINEAR REGRESSION (Python)</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-700/30">
              <span className="text-slate-300 font-medium">Search Engine</span>
              <span className="px-3 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20 tracking-wide">DUCKDUCKGO</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-700/30">
              <span className="text-slate-300 font-medium">Database</span>
              <span className="px-3 py-1 rounded-md bg-amber-400/10 text-amber-400 text-xs font-bold border border-amber-400/20 tracking-wide">SUPABASE (PostgreSQL)</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-500/5 rounded-lg border border-red-500/20">
              <span className="text-slate-300 font-medium">LLM Usage</span>
              <span className="px-3 py-1 rounded-md bg-red-400/10 text-red-400 text-xs font-bold border border-red-400/30 tracking-wide">NONE — DETERMINISTIC</span>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6">
           <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-accent/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-white">System Status</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-emerald-accent/5 border border-emerald-accent/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-emerald-accent rounded-full"></div>
                  <div className="absolute inset-0 bg-emerald-accent rounded-full animate-ping opacity-75"></div>
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-accent">All Systems Operational</p>
                  <p className="text-xs text-emerald-accent/70 mt-0.5">Connected to Supabase Realtime</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-700/30">
               <p className="text-xs text-slate-400 leading-relaxed">
                 Synapse Analytics Engine is currently running in local development mode. Live scraping requests are routed directly to DuckDuckGo HTML without utilizing proxy networks. Rate limits may apply on high-frequency analysis.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AboutView() {
  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <img src="/logo.svg" alt="Synapse Logo" className="w-32 h-32 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-white tracking-wide">SYNAPSE <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-emerald-accent">ANALYTICS ENGINE</span></h2>
        <p className="text-slate-400 mt-3 text-lg max-w-2xl mx-auto">A deterministic, AI-augmented business intelligence platform that transforms raw web data into actionable launch strategies.</p>
      </div>
      
      <div className="glass-card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-electric-blue/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-accent/5 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10 space-y-8">
          <section>
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              The Vision
            </h3>
            <p className="text-slate-300 leading-relaxed text-sm">
              Standard data dashboards are passive. Synapse was built to be an <strong>Active Business Deployment Engine</strong>. By leveraging deterministic algorithms rather than unpredictable LLMs, Synapse provides reliable, mathematically sound insights for pricing, sentiment, and market entry strategies.
            </p>
          </section>

          <section>
             <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              Core Architecture
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/30">
                <h4 className="text-white font-bold text-sm mb-2">Live Reconnaissance</h4>
                <p className="text-slate-400 text-xs leading-relaxed">Direct HTML parsing of DuckDuckGo search results enables real-time competitor discovery without API rate limits or subscription costs.</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/30">
                <h4 className="text-white font-bold text-sm mb-2">Lexical Sentiment (NLTK)</h4>
                <p className="text-slate-400 text-xs leading-relaxed">VADER (Valence Aware Dictionary and sEntiment Reasoner) analyzes competitor messaging to assign objective sentiment polarity scores.</p>
              </div>
               <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/30">
                <h4 className="text-white font-bold text-sm mb-2">Predictive Pricing (ML)</h4>
                <p className="text-slate-400 text-xs leading-relaxed">Scikit-Learn linear regression models forecast competitor pricing trajectories based on simulated historical time-series data.</p>
              </div>
               <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/30">
                <h4 className="text-white font-bold text-sm mb-2">Rule-Based Strategy</h4>
                <p className="text-slate-400 text-xs leading-relaxed">A deterministic SWOT engine processes numeric metrics to formulate precise market entry recommendations and break-even targets.</p>
              </div>
            </div>
          </section>
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
      const resp = await fetch(`https://synapse-multiagent-system.onrender.com/api/competitors/${id}`, { method: 'DELETE' });
      if (!resp.ok) throw new Error('Delete failed');
      setCompetitors(prev => prev.filter(c => c.id !== id));
      showNotification('Competitor record deleted.', 'success');
    } catch (err) {
      showNotification('Failed to delete competitor.', 'error');
    }
  }, [showNotification]);

  const handleDeleteBulk = useCallback(async (ids) => {
    try {
      const resp = await fetch('https://synapse-multiagent-system.onrender.com/api/competitors/bulk-delete', { 
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
      const resp = await fetch('https://synapse-multiagent-system.onrender.com/api/competitors/delete-all', { method: 'POST' });
      if (!resp.ok) throw new Error('Delete all failed');
      setCompetitors([]);
      showNotification('All competitor records have been purged.', 'success');
    } catch (err) {
      showNotification('Failed to delete all competitors.', 'error');
    }
  }, [showNotification]);

  const handleResetAnalytics = useCallback(async () => {
    try {
      const resp = await fetch('https://synapse-multiagent-system.onrender.com/api/competitors/delete-all', { method: 'POST' });
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
      case 'about':
        return <AboutView />;
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
                {currentView === 'about' && 'The vision and architecture behind Synapse'}
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
            className={`mb-6 px-4 py-3 rounded-lg border text-sm font-medium animate-slide-up flex items-center gap-2 shadow-lg
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

