import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Lock, Unlock, Copy, Check, CreditCard as CardIcon } from 'lucide-react';
import { CreditCard } from '../types';

interface InteractiveCardProps {
  card: CreditCard;
  onToggleFreeze: () => void;
  onChangeColor: (color: 'emerald' | 'slate' | 'indigo' | 'amber') => void;
}

export default function InteractiveCard({ card, onToggleFreeze, onChangeColor }: InteractiveCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const cardThemes = {
    slate: 'bg-gradient-to-br from-slate-900 via-zinc-800 to-black text-slate-100 border border-slate-700/50 shadow-2xl',
    emerald: 'bg-gradient-to-br from-emerald-950 via-teal-900 to-zinc-950 text-emerald-100 border border-emerald-500/20 shadow-emerald-950/20 shadow-2xl',
    indigo: 'bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-950 text-indigo-100 border border-indigo-500/20 shadow-indigo-950/20 shadow-2xl',
    amber: 'bg-gradient-to-br from-amber-950 via-yellow-900 to-zinc-950 text-amber-100 border border-amber-500/20 shadow-amber-950/20 shadow-2xl',
  };

  const glowStyles = {
    slate: 'shadow-slate-500/10',
    emerald: 'shadow-emerald-500/10',
    indigo: 'shadow-indigo-500/10',
    amber: 'shadow-amber-500/10',
  };

  const maskCardNumber = (num: string) => {
    if (showDetails) {
      return num.replace(/(\d{4})/g, '$1 ').trim();
    }
    return `•••• •••• •••• ${num.slice(-4)}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(card.number.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* 3D-Interactive Card Visual representation */}
      <div className="relative group perspective-1000 w-full">
        <motion.div
          whileHover={{ y: -4, rotateX: 2, rotateY: -2 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`relative h-56 w-full rounded-2xl p-6 flex flex-col justify-between overflow-hidden transition-all duration-300 ${cardThemes[card.color]} ${glowStyles[card.color]}`}
          id="virtual-card-container"
        >
          {/* Noise overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 to-transparent pointer-events-none opacity-40" />

          {/* Top Row: Brand & Chip */}
          <div className="flex justify-between items-start z-10">
            <div className="flex flex-col">
              <span className="font-display font-semibold tracking-wide text-sm opacity-90">NexaBank</span>
              <span className="font-mono text-[10px] uppercase tracking-widest opacity-60">Platinum Member</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Gold EMV Smart Chip */}
              <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 border border-amber-300/40 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-[1px] p-[2px]">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="border-[0.5px] border-amber-950/20 rounded-[1px]" />
                  ))}
                </div>
              </div>
              <CardIcon className="w-6 h-6 opacity-75" />
            </div>
          </div>

          {/* Middle Row: Card Number */}
          <div className="my-auto z-10 py-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xl sm:text-2xl tracking-widest font-medium text-white/90 drop-shadow-sm select-all">
                {maskCardNumber(card.number)}
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition text-white/80 hover:text-white"
                  title="Copy card number"
                  id="btn-copy-card"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition text-white/80 hover:text-white"
                  title={showDetails ? "Hide details" : "Show details"}
                  id="btn-toggle-card-details"
                >
                  {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row: Holder Name, Expiry & CVV */}
          <div className="flex justify-between items-end z-10">
            <div className="flex flex-col">
              <span className="font-mono text-[9px] uppercase tracking-wider opacity-50">Cardholder</span>
              <span className="font-sans font-medium text-sm tracking-wide text-white/90 truncate max-w-[150px] sm:max-w-[200px]">
                {card.holder}
              </span>
            </div>
            <div className="flex gap-6">
              <div className="flex flex-col items-end">
                <span className="font-mono text-[9px] uppercase tracking-wider opacity-50">Expires</span>
                <span className="font-mono text-xs font-semibold text-white/90">{card.expiry}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-mono text-[9px] uppercase tracking-wider opacity-50">CVV</span>
                <span className="font-mono text-xs font-semibold text-white/90">
                  {showDetails ? card.cvv : '•••'}
                </span>
              </div>
            </div>
          </div>

          {/* Frozen Overlay */}
          <AnimatePresence>
            {card.isFrozen && (
              <motion.div
                initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                animate={{ opacity: 1, backdropFilter: 'blur(6px)' }}
                exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center gap-2 z-20"
                id="card-frozen-overlay"
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-full text-rose-400"
                >
                  <Lock className="w-6 h-6 animate-pulse" />
                </motion.div>
                <span className="font-display font-medium text-sm tracking-wide text-rose-200">
                  Card Temporarily Frozen
                </span>
                <p className="text-[11px] text-slate-400">Unlock below to reactivate payments</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Card Controls Panel */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-50">
          <div>
            <h4 className="font-display font-medium text-sm text-slate-900">Card Status</h4>
            <p className="text-xs text-slate-500">
              {card.isFrozen ? 'Freeze status: INACTIVE' : 'Freeze status: ACTIVE & READY'}
            </p>
          </div>
          <button
            onClick={onToggleFreeze}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-sans font-medium text-xs transition-all duration-300 active:scale-95 border ${
              card.isFrozen
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
            id="btn-freeze-unfreeze"
          >
            {card.isFrozen ? (
              <>
                <Unlock className="w-3.5 h-3.5" />
                Unfreeze Card
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                Freeze Card
              </>
            )}
          </button>
        </div>

        {/* Card Theme Customizer */}
        <div>
          <span className="font-display font-medium text-xs text-slate-700 block mb-2">
            Card Customization Theme
          </span>
          <div className="flex gap-2">
            {(['slate', 'emerald', 'indigo', 'amber'] as const).map((color) => (
              <button
                key={color}
                onClick={() => onChangeColor(color)}
                className={`relative w-8 h-8 rounded-full transition-all duration-300 active:scale-90 flex items-center justify-center border-2 ${
                  card.color === color ? 'border-indigo-600 scale-110' : 'border-transparent hover:scale-105'
                }`}
                title={`Select ${color} card theme`}
                id={`btn-color-theme-${color}`}
              >
                <div
                  className={`w-6 h-6 rounded-full ${
                    color === 'slate'
                      ? 'bg-slate-800'
                      : color === 'emerald'
                      ? 'bg-emerald-600'
                      : color === 'indigo'
                      ? 'bg-indigo-600'
                      : 'bg-amber-500'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Real Card Info Summary */}
        <div className="grid grid-cols-2 gap-3 text-slate-500 text-xs font-mono pt-1">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/30">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">Card Type</span>
            <span className="text-slate-700 font-semibold">Visa Signature</span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100/30">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">Credit Limit</span>
            <span className="text-slate-700 font-semibold">${card.limit.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
