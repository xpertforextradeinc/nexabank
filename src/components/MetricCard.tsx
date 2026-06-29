import { motion } from 'motion/react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Wallet, PiggyBank, Briefcase } from 'lucide-react';

interface MetricCardProps {
  type: 'checking' | 'savings' | 'investment';
  balance: number;
  selected: boolean;
  onSelect: () => void;
}

export default function MetricCard({ type, balance, selected, onSelect }: MetricCardProps) {
  const meta = {
    checking: {
      title: 'Active Checking',
      desc: 'Daily spends & transfers',
      color: 'border-blue-100 bg-blue-50/10 text-blue-600',
      icon: <Wallet className="w-5 h-5" />,
      tag: 'Checking Account',
      sparkline: [35, 40, 32, 54, 48, 62, balance / 150],
      trend: '+12.4% vs last week',
      isUp: true
    },
    savings: {
      title: 'High-Yield Savings',
      desc: '4.85% APY locked rate',
      color: 'border-emerald-100 bg-emerald-50/10 text-emerald-600',
      icon: <PiggyBank className="w-5 h-5" />,
      tag: 'Savings Vault',
      sparkline: [100, 102, 105, 110, 114, 118, balance / 200],
      trend: '+4.85% Auto-Accruing',
      isUp: true
    },
    investment: {
      title: 'Strategic Portfolio',
      desc: 'Active index trackers',
      color: 'border-purple-100 bg-purple-50/10 text-purple-600',
      icon: <Briefcase className="w-5 h-5" />,
      tag: 'Investment Portfolio',
      sparkline: [80, 75, 85, 95, 90, 105, balance / 250],
      trend: '+24.1% Year-to-Date',
      isUp: true
    }
  }[type];

  // Helper to draw a clean SVG path for the sparkline
  const drawSparkline = (points: number[]) => {
    const width = 100;
    const height = 30;
    const maxVal = Math.max(...points);
    const minVal = Math.min(...points);
    const range = maxVal - minVal || 1;
    
    return points
      .map((val, idx) => {
        const x = (idx / (points.length - 1)) * width;
        const y = height - ((val - minVal) / range) * (height - 4) - 2;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.01 }}
      onClick={onSelect}
      className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between cursor-pointer ${
        selected
          ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-950/5 ring-2 ring-indigo-500/20'
          : 'bg-white border-slate-100 hover:border-slate-200 text-slate-950 shadow-sm'
      }`}
      id={`account-card-${type}`}
    >
      <div className="flex justify-between items-start w-full gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${selected ? 'bg-white/10 border-white/10 text-white' : meta.color}`}>
            {meta.icon}
          </div>
          <div>
            <span className={`text-[11px] font-mono uppercase tracking-wider ${selected ? 'text-slate-400' : 'text-slate-500'}`}>
              {meta.tag}
            </span>
            <h3 className="font-display font-semibold text-sm tracking-tight leading-tight mt-0.5">
              {meta.title}
            </h3>
          </div>
        </div>
        
        {/* Sparkline Indicator */}
        <div className="w-20 h-8 self-center opacity-85">
          <svg className="w-full h-full" viewBox="0 0 100 30">
            <path
              d={drawSparkline(meta.sparkline)}
              fill="none"
              stroke={selected ? '#34d399' : type === 'savings' ? '#10b981' : type === 'checking' ? '#3b82f6' : '#a855f7'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-end w-full">
        <div className="flex flex-col">
          <span className={`text-2xl font-display font-semibold tracking-tight ${selected ? 'text-white' : 'text-slate-900'}`}>
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`text-[10px] flex items-center gap-1 mt-1 font-sans ${selected ? 'text-emerald-400' : 'text-emerald-600'}`}>
            <TrendingUp className="w-3 h-3" />
            {meta.trend}
          </span>
        </div>

        <div className={`p-1.5 rounded-full transition-all ${selected ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-400'}`}>
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>
    </motion.button>
  );
}
