import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface PortfolioData {
  total_net_worth: number;
  crypto_allocation: number;
  fiat_allocation: number;
  staked_allocation: number;
}

// Mock timeline metrics matching institutional dark palette constraints
const performanceTimeline = [
  { name: 'Jan', value: 210000 },
  { name: 'Feb', value: 225000 },
  { name: 'Mar', value: 220000 },
  { name: 'Apr', value: 242000 },
  { name: 'May', value: 238000 },
  { name: 'Jun', value: 258450 },
];

export function AssetDashboard() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'1M' | '6M' | '1Y'>('6M');

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data, error } = await supabase
            .from('portfolios')
            .select('total_net_worth, crypto_allocation, fiat_allocation, staked_allocation')
            .eq('user_id', user.id)
            .single();

          if (!error && data) {
            setPortfolio(data);
          }
        }
      } catch (err) {
        console.error('Failed to hydrate asset intelligence matrix:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPortfolio();
  }, []);

  // Compute allocation breakdown dynamically on the client thread without UI freezing
  const splits = useMemo(() => {
    if (!portfolio) return [];
    const total = portfolio.total_net_worth || 1;
    return [
      { name: 'Digital Crypto Assets', value: portfolio.crypto_allocation, color: '#10B981', pct: ((portfolio.crypto_allocation / total) * 100).toFixed(1) },
      { name: 'Liquid Fiat Reserves', value: portfolio.fiat_allocation, color: '#3B82F6', pct: ((portfolio.fiat_allocation / total) * 100).toFixed(1) },
      { name: 'Staked Protocol Collateral', value: portfolio.staked_allocation, color: '#8B5CF6', pct: ((portfolio.staked_allocation / total) * 100).toFixed(1) },
    ];
  }, [portfolio]);

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-32 bg-white/[0.03] rounded-2xl border border-white/5" />
        <div className="h-64 bg-white/[0.03] rounded-2xl border border-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Atmospheric Value Panel */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0E1424]/80 backdrop-blur-xl p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <p className="text-sm font-medium tracking-widest text-slate-400 uppercase">Liquidity Aggregate Command</p>
        <h1 className="mt-2 text-4xl lg:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          ${portfolio?.total_net_worth?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </h1>
      </div>

      {/* Main Core Analytics Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart Frame */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#0E1424]/40 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold tracking-wide">Nexa Flow Performance Curve</h3>
            <div className="flex space-x-2 bg-black/40 p-1 rounded-lg border border-white/5">
              {(['1M', '6M', '1Y'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    timeframe === t ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Recharts Container Wrapper adjusted for absolute Flex sizing containment */}
          <div className="h-64 w-full" style={{ minHeight: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="glowTeal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0E1424', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ color: '#94A3B8' }}
                />
                <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={1.5} fillOpacity={1} fill="url(#glowTeal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset Class Matrix Panel */}
        <div className="rounded-2xl border border-white/5 bg-[#0E1424]/40 p-6 space-y-6">
          <h3 className="text-lg font-semibold tracking-wide">Asset Allocation Matrix</h3>
          <div className="space-y-4">
            {splits.map((item) => (
              <div key={item.name} className="p-4 rounded-xl bg-black/20 border border-white/5 flex items-center justify-between transition-hover hover:border-white/10">
                <div className="flex items-center space-x-3">
                  <span className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: item.color }} />
                  <div>
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.pct}% Weight allocation</p>
                  </div>
                </div>
                <p className="text-sm font-semibold tracking-tight">
                  ${item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
