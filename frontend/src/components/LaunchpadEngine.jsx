import { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';

export default function LaunchpadEngine({ activeNiche }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  // Simulator State
  const [fixedCosts, setFixedCosts] = useState(1500);
  const [variableCost, setVariableCost] = useState(0);
  const [breakEvenVol, setBreakEvenVol] = useState(0);

  // Roadmap State
  const [completedSteps, setCompletedSteps] = useState([]);

  useEffect(() => {
    if (activeNiche) {
      fetchBlueprint();
    }
  }, [activeNiche]);

  const fetchBlueprint = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/launchpad/${encodeURIComponent(activeNiche)}`);
      if (!res.ok) {
        throw new Error('Failed to fetch launchpad blueprint. Ensure you have competitors analyzed first.');
      }
      const json = await res.json();
      setData(json);
      setCompletedSteps([]); // reset steps
      // Pre-calculate initial breakeven based on recommended price
      calculateBreakEven(json.recommended_entry_price, fixedCosts, variableCost);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateBreakEven = async (price, fixed, variable) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/calculate-breakeven', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recommended_price: Number(price),
          fixed_costs: Number(fixed),
          variable_cost: Number(variable)
        })
      });
      const json = await res.json();
      setBreakEvenVol(json.break_even_volume);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSliderChange = (type, value) => {
    const val = Number(value);
    if (type === 'fixed') {
      setFixedCosts(val);
      calculateBreakEven(data.recommended_entry_price, val, variableCost);
    } else {
      setVariableCost(val);
      calculateBreakEven(data.recommended_entry_price, fixedCosts, val);
    }
  };

  const toggleStep = (idx) => {
    if (completedSteps.includes(idx)) {
      setCompletedSteps(completedSteps.filter(i => i !== idx));
    } else {
      setCompletedSteps([...completedSteps, idx]);
    }
  };

  if (!activeNiche) {
    return (
      <div className="glass-card p-10 text-center animate-fade-in">
        <p className="text-slate-400 font-medium">No Niche Selected</p>
        <p className="text-sm text-slate-600 mt-1">Run an analysis in the Competitor Intelligence tab first.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass-card p-10 flex flex-col items-center justify-center animate-fade-in min-h-[400px]">
        <div className="w-12 h-12 border-4 border-electric-blue/30 border-t-electric-blue rounded-full animate-spin mb-4" />
        <p className="text-electric-blue font-semibold animate-pulse">Generating Niche Blueprint...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-10 text-center animate-fade-in border-red-500/30 bg-red-500/5">
        <p className="text-red-400 font-medium">Engine Error</p>
        <p className="text-sm text-red-400/70 mt-1">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  // Prepare chart data
  const scatterData = data.competitors.map(c => ({
    name: c.company_name,
    sentiment: Number(c.sentiment_score),
    price: Number(c.current_price)
  }));
  // Add optimal point
  scatterData.push({
    name: '🎯 Optimal Entry',
    sentiment: data.avg_sentiment, // placing it at avg sentiment to highlight price difference
    price: data.recommended_entry_price,
    isOptimal: true
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`bg-slate-900/90 border ${data.isOptimal ? 'border-emerald-accent/50' : 'border-slate-700'} p-3 rounded-lg shadow-xl backdrop-blur-md`}>
          <p className={`font-bold mb-1 ${data.isOptimal ? 'text-emerald-accent' : 'text-white'}`}>{data.name}</p>
          <p className="text-sm text-slate-300">Price: <span className="text-electric-blue font-semibold">₹{data.price.toFixed(2)}</span></p>
          <p className="text-sm text-slate-300">Sentiment: <span className="text-amber-400 font-semibold">{data.sentiment.toFixed(2)}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Key Metrics row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 border-l-4 border-l-slate-600 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-slate-600/10 rounded-full blur-2xl" />
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Market Avg Price</h3>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-white">₹{data.avg_market_price.toFixed(2)}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Based on {data.competitors.length} live competitors</p>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-electric-blue relative overflow-hidden group hover:border-l-electric-blue/80 transition-colors">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-electric-blue/10 rounded-full blur-2xl group-hover:bg-electric-blue/20 transition-all" />
          <h3 className="text-sm font-semibold text-electric-blue uppercase tracking-wider mb-2 text-glow-blue">Recommended Entry Price</h3>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-white">₹{data.recommended_entry_price.toFixed(2)}</span>
            <span className="text-sm font-medium text-emerald-accent bg-emerald-accent/10 px-2 py-1 rounded-md mb-1 border border-emerald-accent/20">
              {data.avg_sentiment < 0 ? 'Premium Positioning' : 'Disruptive Positioning'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Algorithmic pricing based on avg sentiment ({data.avg_sentiment.toFixed(2)})</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Interactive Financial Simulator */}
        <div className="glass-card p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-5 h-5 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-bold text-white">Financial Simulator</h3>
          </div>

          <div className="space-y-6 flex-1">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-300">Monthly Fixed Costs</label>
                <span className="text-sm font-bold text-white">₹{fixedCosts}</span>
              </div>
              <input 
                type="range" 
                min="0" max="10000" step="100" 
                value={fixedCosts}
                onChange={(e) => handleSliderChange('fixed', e.target.value)}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-electric-blue"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-300">Variable Cost / Unit</label>
                <span className="text-sm font-bold text-white">₹{variableCost.toFixed(2)}</span>
              </div>
              <input 
                type="range" 
                min="0" max={data.recommended_entry_price} step="0.5" 
                value={variableCost}
                onChange={(e) => handleSliderChange('variable', e.target.value)}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-electric-blue"
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700/50 flex flex-col items-center justify-center">
            <p className="text-sm text-slate-400 mb-1 uppercase tracking-widest font-semibold">Break-Even Required</p>
            {breakEvenVol < 0 ? (
              <span className="text-2xl font-bold text-red-500">Unprofitable Model</span>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-emerald-accent text-glow-emerald">{breakEvenVol}</span>
                <span className="text-emerald-accent/70 font-medium">units / mo</span>
              </div>
            )}
          </div>
        </div>

        {/* Strategic Matrix Plot */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-5 h-5 text-emerald-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <h3 className="text-lg font-bold text-white">Strategic Matrix</h3>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis 
                  type="number" 
                  dataKey="price" 
                  name="Price" 
                  stroke="#64748b" 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                  domain={['auto', 'auto']}
                  label={{ value: 'Price (₹)', position: 'insideBottom', offset: -15, fill: '#64748b', fontSize: 12 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="sentiment" 
                  name="Sentiment" 
                  stroke="#64748b" 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                  domain={[-1, 1]}
                  label={{ value: 'Sentiment', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }}
                />
                <ZAxis range={[60, 100]} />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                
                {/* Standard Competitors */}
                <Scatter data={scatterData.filter(d => !d.isOptimal)} fill="#00f0ff" opacity={0.6} />
                
                {/* Optimal Entry Crosshair Node */}
                <Scatter data={scatterData.filter(d => d.isOptimal)} fill="#007F5F">
                  {scatterData.filter(d => d.isOptimal).map((entry, index) => (
                    <circle key={`cell-${index}`} cx={0} cy={0} r={8} className="animate-pulse-soft" style={{ filter: 'drop-shadow(0 0 8px rgba(0, 127, 95, 0.8))' }} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center mt-4">
             <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-accent shadow-[0_0_8px_rgba(0,127,95,0.8)] animate-pulse" />
                <span className="text-xs text-slate-400">Calculated Optimal Entry Point</span>
             </div>
          </div>
        </div>
      </div>

      {/* SWOT Analysis Matrix */}
      {data.swot && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
              <h3 className="text-lg font-bold text-white">Rule-Based SWOT Engine</h3>
            </div>
            <span className="px-3 py-1 bg-purple-500/10 text-xs font-medium text-purple-400 rounded-full border border-purple-500/20">
              Deterministic Analysis
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="bg-slate-800/40 border border-emerald-500/30 rounded-xl p-4 hover:bg-slate-800/60 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">S</div>
                <h4 className="text-emerald-400 font-semibold tracking-wide uppercase text-sm">Strengths</h4>
              </div>
              <ul className="space-y-2">
                {data.swot.strengths.map((item, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Weaknesses */}
            <div className="bg-slate-800/40 border border-amber-500/30 rounded-xl p-4 hover:bg-slate-800/60 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">W</div>
                <h4 className="text-amber-400 font-semibold tracking-wide uppercase text-sm">Weaknesses</h4>
              </div>
              <ul className="space-y-2">
                {data.swot.weaknesses.map((item, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="bg-slate-800/40 border border-electric-blue/30 rounded-xl p-4 hover:bg-slate-800/60 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded bg-electric-blue/20 flex items-center justify-center text-electric-blue font-bold text-xs">O</div>
                <h4 className="text-electric-blue font-semibold tracking-wide uppercase text-sm text-glow-blue">Opportunities</h4>
              </div>
              <ul className="space-y-2">
                {data.swot.opportunities.map((item, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-electric-blue mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Threats */}
            <div className="bg-slate-800/40 border border-red-500/30 rounded-xl p-4 hover:bg-slate-800/60 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded bg-red-500/20 flex items-center justify-center text-red-400 font-bold text-xs">T</div>
                <h4 className="text-red-400 font-semibold tracking-wide uppercase text-sm">Threats</h4>
              </div>
              <ul className="space-y-2">
                {data.swot.threats.map((item, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Launch Roadmap Tree */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-bold text-white">Execution Roadmap</h3>
          </div>
          <span className="px-3 py-1 bg-slate-800 text-xs font-medium text-slate-300 rounded-full border border-slate-700">
            {completedSteps.length} / {data.checklist.length} Completed
          </span>
        </div>
        
        <div className="relative pl-6 border-l-2 border-slate-800 ml-4 space-y-6">
          {data.checklist.map((step, idx) => {
            const isCompleted = completedSteps.includes(idx);
            
            return (
              <div 
                key={idx} 
                className="relative cursor-pointer group"
                onClick={() => toggleStep(idx)}
              >
                {/* Timeline node */}
                <div className={`absolute -left-[35px] top-1.5 w-4 h-4 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-electric-blue border-electric-blue shadow-[0_0_10px_rgba(0,240,255,0.8)]' 
                    : 'bg-slate-900 border-slate-600 group-hover:border-slate-400'
                }`}>
                  {isCompleted && (
                    <svg className="w-2.5 h-2.5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  )}
                </div>

                {/* Step Card */}
                <div className={`p-4 rounded-xl border transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-electric-blue/5 border-electric-blue/40 shadow-[0_0_15px_rgba(0,240,255,0.1)]' 
                    : 'bg-slate-800/40 border-slate-700/50 group-hover:bg-slate-800/80 group-hover:border-slate-600'
                }`}>
                  <h4 className={`font-semibold transition-colors duration-300 ${isCompleted ? 'text-electric-blue text-glow-blue' : 'text-slate-300'}`}>
                    Step {idx + 1}: {step}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
