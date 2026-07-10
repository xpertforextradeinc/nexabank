import { motion } from 'motion/react';
import { Bitcoin, Shield, TrendingUp, Zap } from 'lucide-react';

export default function Services({ isDarkMode }: { isDarkMode: boolean }) {
  const services = [
    {
      title: 'Crypto Investment Vaults',
      description: 'Automated, high-yield investment strategies powered by AI-driven market analysis.',
      icon: Bitcoin,
      color: 'text-orange-500'
    },
    {
      title: 'Institutional Custody',
      description: 'Secure, multi-layer cold storage solutions for your digital assets.',
      icon: Shield,
      color: 'text-emerald-500'
    },
    {
      title: 'Real-time Market Analytics',
      description: 'Stay ahead with live tracking, predictive insights, and technical analysis.',
      icon: TrendingUp,
      color: 'text-indigo-500'
    },
    {
      title: 'Instant Liquidity Exchange',
      description: 'Swap between fiat and top-tier cryptocurrencies with minimal slippage.',
      icon: Zap,
      color: 'text-amber-500'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Our Services</h2>
        <p className="text-sm text-slate-500 mt-2">Specialized investment and custody services for digital assets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-3xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-100 shadow-sm'}`}
          >
            <service.icon className={`w-8 h-8 mb-4 ${service.color}`} />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{service.title}</h3>
            <p className="text-sm text-slate-500">{service.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
