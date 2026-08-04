/**
 * MetricsCards — Responsive grid of key metric cards.
 * Displays: Average Price, Market Sentiment, Competitors Tracked, Prediction Trend.
 */

export default function MetricsCards({ competitors }) {
  // Compute metrics
  const count = competitors.length;

  const avgPrice = count > 0
    ? (competitors.reduce((sum, c) => sum + Number(c.current_price), 0) / count).toFixed(2)
    : '—';

  const avgSentiment = count > 0
    ? (competitors.reduce((sum, c) => sum + Number(c.sentiment_score), 0) / count).toFixed(4)
    : '—';

  const avgPredicted = count > 0
    ? (competitors.reduce((sum, c) => sum + Number(c.predicted_next_price), 0) / count).toFixed(2)
    : '—';

  // Trend: average prediction vs average current price
  const trendPct = count > 0
    ? (((Number(avgPredicted) - Number(avgPrice)) / Number(avgPrice)) * 100).toFixed(1)
    : null;

  const sentimentLabel = (val) => {
    if (val === '—') return { text: 'No Data', color: 'text-slate-500' };
    const n = Number(val);
    if (n >= 0.3) return { text: 'Positive', color: 'text-emerald-accent text-glow-emerald' };
    if (n >= 0.0) return { text: 'Neutral', color: 'text-amber-400' };
    return { text: 'Negative', color: 'text-red-400' };
  };

  const sentiment = sentimentLabel(avgSentiment);

  const cards = [
    {
      id: 'avg-price',
      label: 'Average Price',
      value: avgPrice !== '—' ? `$${avgPrice}` : '—',
      sub: 'Across all competitors',
      color: 'text-electric-blue text-glow-blue',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-electric-blue/10',
      iconColor: 'text-electric-blue',
    },
    {
      id: 'market-sentiment',
      label: 'Market Sentiment',
      value: avgSentiment !== '—' ? Number(avgSentiment).toFixed(2) : '—',
      sub: sentiment.text,
      color: sentiment.color,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      iconBg: 'bg-emerald-accent/10',
      iconColor: 'text-emerald-accent',
    },
    {
      id: 'competitors-count',
      label: 'Competitors Tracked',
      value: count.toString(),
      sub: 'Total in database',
      color: 'text-white',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-400',
    },
    {
      id: 'prediction-trend',
      label: 'Prediction Trend',
      value: trendPct !== null ? `${Number(trendPct) >= 0 ? '+' : ''}${trendPct}%` : '—',
      sub: 'Avg predicted vs current',
      color: trendPct !== null
        ? Number(trendPct) >= 0 ? 'text-emerald-accent text-glow-emerald' : 'text-red-400'
        : 'text-slate-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      iconBg: trendPct !== null && Number(trendPct) >= 0 ? 'bg-emerald-accent/10' : 'bg-red-400/10',
      iconColor: trendPct !== null && Number(trendPct) >= 0 ? 'text-emerald-accent' : 'text-red-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={card.id}
          id={card.id}
          className="glass-card p-5 animate-slide-up hover:shadow-card transition-shadow duration-300"
          style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'both' }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg ${card.iconBg}`}>
              <span className={card.iconColor}>{card.icon}</span>
            </div>
          </div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{card.label}</p>
          <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
          <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
