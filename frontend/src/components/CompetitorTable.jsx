/**
 * CompetitorTable — Data table with clickable company website links,
 * sentiments, ML price forecasts, and delete functionality.
 * Features: Delete Specific (per-row), Delete All (with confirmation modal).
 */

import { useState } from 'react';

export default function CompetitorTable({ competitors, onDeleteBulk, onDeleteAll }) {
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  if (competitors.length === 0) {
    return (
      <div className="glass-card p-10 text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/60 flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-slate-400 font-medium">No competitor data yet</p>
        <p className="text-sm text-slate-600 mt-1">Submit a business niche above to scrape live competitors</p>
      </div>
    );
  }

  const getSentimentColor = (score) => {
    const n = Number(score);
    if (n >= 0.3) return 'text-emerald-accent text-glow-emerald';
    if (n >= 0.0) return 'text-amber-400';
    return 'text-red-400';
  };

  const getSentimentBadge = (score) => {
    const n = Number(score);
    if (n >= 0.3) return { label: 'Positive', bg: 'bg-emerald-accent/10 border-emerald-accent/20' };
    if (n >= 0.0) return { label: 'Neutral', bg: 'bg-amber-400/10 border-amber-400/20' };
    return { label: 'Negative', bg: 'bg-red-400/10 border-red-400/20' };
  };

  const formatPrice = (price) => `₹${Number(price).toFixed(2)}`;
  
  const formatPriceRange = (c) => {
    if (c.min_price && c.max_price && c.min_price !== c.max_price) {
      return `₹${Number(c.min_price).toFixed(0)} - ₹${Number(c.max_price).toFixed(0)}`;
    }
    // Fallback if min/max aren't set or are equal
    return `₹${Number(c.current_price).toFixed(2)}`;
  };

  const ExternalLinkIcon = () => (
    <svg className="w-3 h-3 inline-block ml-1 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(competitors.map(c => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleDeleteSelectedConfirmed = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    await onDeleteBulk(Array.from(selectedIds));
    setSelectedIds(new Set());
    setIsDeleting(false);
    setShowDeleteSelectedConfirm(false);
    setShowDeleteMenu(false);
  };

  const handleDeleteAllConfirmed = async () => {
    setIsDeleting(true);
    setShowDeleteAllConfirm(false);
    setShowDeleteMenu(false);
    await onDeleteAll();
    setSelectedIds(new Set());
    setIsDeleting(false);
  };

  return (
    <>
      <div className="glass-card overflow-hidden animate-fade-in">
        <div className="px-6 py-4 border-b border-slate-700/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Competitor Intelligence</h3>
              <p className="text-xs text-slate-500 mt-0.5">{competitors.length} records · Live scraped from the web</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="status-dot status-dot-active animate-pulse-soft" />
                <span className="text-xs text-emerald-accent font-medium">Live</span>
              </div>

              {/* Delete Buttons */}
              <div className="flex items-center gap-2">
                {selectedIds.size > 0 ? (
                  <button
                    onClick={() => setShowDeleteSelectedConfirm(true)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-all duration-200 flex items-center gap-1.5 animate-fade-in"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Selected ({selectedIds.size})
                  </button>
                ) : (
                  <button
                    onClick={() => setShowDeleteAllConfirm(true)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all duration-200 flex items-center gap-1.5 animate-fade-in"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete All
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full" id="competitor-table">
            <thead>
              <tr className="border-b border-slate-700/30">
                <th className="px-6 py-3 text-left w-12">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.size === competitors.length && competitors.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-electric-blue focus:ring-electric-blue focus:ring-offset-slate-900 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Niche</th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Current Price</th>
                <th className="px-6 py-3 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Sentiment</th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Predicted Price</th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Δ Forecast</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/20">
              {competitors.map((comp, idx) => {
                const badge = getSentimentBadge(comp.sentiment_score);
                const delta = (Number(comp.predicted_next_price) - Number(comp.current_price)).toFixed(2);
                const deltaColor = Number(delta) >= 0 ? 'text-emerald-accent' : 'text-red-400';
                const deltaSign = Number(delta) >= 0 ? '+' : '';
                const isSelected = selectedIds.has(comp.id);

                return (
                  <tr
                    key={comp.id || idx}
                    className={`transition-colors duration-150 animate-slide-up ${isSelected ? 'bg-electric-blue/10' : 'hover:bg-slate-800/40'} ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
                    style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}
                  >
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => handleSelectOne(comp.id)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-electric-blue focus:ring-electric-blue focus:ring-offset-slate-900 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold text-electric-blue border border-slate-600/30 flex-shrink-0">
                          {comp.company_name?.charAt(0) || '?'}
                        </div>
                        <div className="min-w-0">
                          {comp.website_url ? (
                            <a
                              href={comp.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-white hover:text-electric-blue transition-colors duration-150 group flex items-center"
                              title={`Visit ${comp.company_name}`}
                            >
                              <span className="truncate max-w-[180px]">{comp.company_name}</span>
                              <ExternalLinkIcon />
                            </a>
                          ) : (
                            <span className="text-sm font-medium text-white">{comp.company_name}</span>
                          )}
                          {comp.website_url && (
                            <p className="text-[10px] text-slate-600 truncate max-w-[200px]">{comp.website_url}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700/50">
                        {comp.business_niche}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-electric-blue text-glow-blue">
                        {formatPriceRange(comp)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-sm font-bold ${getSentimentColor(comp.sentiment_score)}`}>
                          {Number(comp.sentiment_score).toFixed(2)}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${badge.bg} ${getSentimentColor(comp.sentiment_score)}`}>
                          {badge.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-semibold text-electric-blue text-glow-blue">
                        {formatPrice(comp.predicted_next_price)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-sm font-semibold ${deltaColor}`}>
                        {deltaSign}₹{Math.abs(Number(delta)).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Selected Confirmation Modal */}
      {showDeleteSelectedConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => { setShowDeleteSelectedConfirm(false); setShowDeleteMenu(false); }}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md mx-4 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">Delete Selected Records</h3>
            </div>
            <p className="text-sm text-slate-300 mb-6">Are you sure you want to delete the <strong className="text-white">{selectedIds.size} selected</strong> competitor(s)?</p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => { setShowDeleteSelectedConfirm(false); setShowDeleteMenu(false); }}
                className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSelectedConfirmed}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-sm text-amber-400 font-medium hover:bg-amber-500/30 transition-colors flex items-center gap-2"
              >
                {isDeleting ? <span className="w-4 h-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" /> : null}
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => { setShowDeleteAllConfirm(false); setShowDeleteMenu(false); }}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md mx-4 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete All Competitor Data</h3>
                <p className="text-xs text-red-400/70">Destructive action — cannot be undone</p>
              </div>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 mb-4">
              <p className="text-sm text-slate-300 mb-3">Are you sure you want to delete <strong className="text-white">{competitors.length} competitor records</strong>?</p>
              <ul className="text-xs text-slate-400 space-y-1.5">
                <li className="flex items-start gap-2">
                  <svg className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  All competitor intelligence records will be permanently removed from the database
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  All analytics charts and visualizations will be cleared
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Historical price data and sentiment scores cannot be recovered
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => { setShowDeleteAllConfirm(false); setShowDeleteMenu(false); }}
                className="px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-300 hover:bg-slate-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllConfirmed}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-lg bg-red-500/20 border border-red-500/40 text-sm text-red-400 font-semibold hover:bg-red-500/30 transition-colors flex items-center gap-2"
              >
                {isDeleting ? <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" /> : null}
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click-away overlay for dropdown */}
      {showDeleteMenu && (
        <div className="fixed inset-0 z-20" onClick={() => setShowDeleteMenu(false)} />
      )}
    </>
  );
}
