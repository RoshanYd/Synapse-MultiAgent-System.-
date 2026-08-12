/**
 * Sidebar — Persistent left navigation with brand, nav items, and status indicator.
 * Receives activeView and onViewChange from App.jsx to control navigation.
 */

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'about',
    label: 'About',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

// Inline SVG Logo Component matching the user's provided brand mark
function SynapseLogo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 90" className="w-9 h-9">
      <defs>
        <linearGradient id="sidebarNeonBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f0ff" />
          <stop offset="100%" stopColor="#74B4D9" />
        </linearGradient>
        <filter id="sidebarGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Structural Hexagon */}
      <path d="M10 45 L 35 10 L 65 10 L 90 45 L 65 80 L 35 80 Z" 
            fill="none" stroke="url(#sidebarNeonBlue)" strokeWidth="2" 
            strokeLinejoin="round" opacity="0.3"/>
      {/* Active Data Trajectory */}
      <path d="M10 45 L 45 25 L 65 65 L 90 35" 
            fill="none" stroke="url(#sidebarNeonBlue)" strokeWidth="4" 
            strokeLinecap="round" strokeLinejoin="round" filter="url(#sidebarGlow)"/>
      {/* Data Nodes */}
      <circle cx="10" cy="45" r="5" fill="#007F5F" filter="url(#sidebarGlow)"/>
      <circle cx="45" cy="25" r="4" fill="#00f0ff" />
      <circle cx="65" cy="65" r="5" fill="#007F5F" filter="url(#sidebarGlow)"/>
      <circle cx="90" cy="35" r="4" fill="#EBEBEB" />
    </svg>
  );
}

export default function Sidebar({ activeView, onViewChange, isMobileMenuOpen, setIsMobileMenuOpen }) {
  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden animate-fade-in" 
          onClick={() => setIsMobileMenuOpen?.(false)} 
        />
      )}
      
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/40 flex flex-col z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        
        {/* Close Button on Mobile */}
        <button 
          onClick={() => setIsMobileMenuOpen?.(false)} 
          className="md:hidden absolute top-6 right-4 text-slate-400 hover:text-white transition-colors p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

      {/* Brand */}
      <div className="px-6 py-6 border-b border-slate-700/30">
        <div className="flex items-center gap-3">
          <SynapseLogo />
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">SYNAPSE</h1>
            <p className="text-[10px] font-medium text-slate-400 tracking-widest uppercase">Analytics Engine</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 mb-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Navigation</p>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
              ${activeView === item.id
                ? 'bg-emerald-accent/10 text-emerald-light border border-emerald-accent/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
          >
            <span className={`transition-colors duration-200 ${
              activeView === item.id ? 'text-emerald-accent' : 'text-slate-500 group-hover:text-slate-300'
            }`}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Status Footer */}
      <div className="px-4 py-4 border-t border-slate-700/30">
        <div className="flex items-center gap-2">
          <div className="status-dot status-dot-active" />
          <span className="text-xs text-slate-400">System Operational</span>
        </div>
        <p className="text-[10px] text-slate-600 mt-1.5">v2.0.0 · Live Scraping · No LLMs</p>
      </div>
    </aside>
    </>
  );
}
