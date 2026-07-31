const fs = require('fs');
let code = fs.readFileSync('src/components/InteractiveCard.tsx', 'utf-8');

// Add imports
code = code.replace(
  "import { Eye, EyeOff, Lock, Unlock, Copy, Check, CreditCard as CardIcon } from 'lucide-react';",
  "import { Eye, EyeOff, Lock, Unlock, Copy, Check, CreditCard as CardIcon, Loader2, Sparkles } from 'lucide-react';\nimport { createIncreaseCard, updateIncreaseCard } from '../services/increase';\nimport { UserProfile } from '../types';"
);

// Update props
code = code.replace(
  "interface InteractiveCardProps {\n  card: CreditCard;\n  onToggleFreeze: () => void;\n  onChangeColor: (color: 'emerald' | 'slate' | 'indigo' | 'amber') => void;\n}",
  "interface InteractiveCardProps {\n  card: CreditCard;\n  onToggleFreeze: () => void;\n  onChangeColor: (color: 'emerald' | 'slate' | 'indigo' | 'amber') => void;\n  user?: UserProfile;\n  isDarkMode?: boolean;\n}"
);

// Update signature
code = code.replace(
  "export default function InteractiveCard({ card, onToggleFreeze, onChangeColor }: InteractiveCardProps) {",
  "export default function InteractiveCard({ card: initialCard, onToggleFreeze, onChangeColor, user, isDarkMode }: InteractiveCardProps) {\n  const [cardState, setCardState] = useState<CreditCard>(initialCard);\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState('');\n  \n  const card = cardState;"
);

// Replace the button handler for freeze
code = code.replace(
  "onClick={onToggleFreeze}",
  "onClick={async () => {\n            setLoading(true);\n            try {\n              if (user?.increaseAccountId) {\n                await updateIncreaseCard('card_simulated_id', card.isFrozen ? 'active' : 'disabled').catch(() => console.log('Simulated update'));\n              }\n              setCardState(prev => ({ ...prev, isFrozen: !prev.isFrozen }));\n              onToggleFreeze();\n            } finally {\n              setLoading(false);\n            }\n          }}"
);

// Modify UI wrapper to support dark mode
code = code.replace(
  "className=\"bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-4\"",
  "className={`rounded-2xl p-4 border shadow-sm flex flex-col gap-4 ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-100'}`}"
);

// Fix colors
code = code.replace("className=\"font-display font-medium text-sm text-slate-900\"", "className={`font-display font-medium text-sm ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}");
code = code.replace("className=\"font-display font-medium text-xs text-slate-700 block mb-2\"", "className={`font-display font-medium text-xs block mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}");

// Real card info block
code = code.replace(
  "className=\"bg-slate-50 p-2.5 rounded-xl border border-slate-100/30\"",
  "className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800/50' : 'bg-slate-50 border-slate-100/30'}`}"
);
code = code.replace(
  "className=\"bg-slate-50 p-2.5 rounded-xl border border-slate-100/30\"",
  "className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800/50' : 'bg-slate-50 border-slate-100/30'}`}"
);

code = code.replace(
  "className=\"text-slate-700 font-semibold\"",
  "className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}"
);
code = code.replace(
  "className=\"text-slate-700 font-semibold\"",
  "className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}"
);

// Add "Issue New Virtual Card" button inside the controls
let newButton = `
        {/* Issue Card Action */}
        <div className="pt-2">
          {error && <p className="text-[10px] text-rose-500 mb-2">{error}</p>}
          <button
            onClick={async () => {
              if (!user?.increaseAccountId) {
                setError('Increase Account ID missing. Complete KYC first.');
                return;
              }
              setLoading(true);
              setError('');
              try {
                const res = await createIncreaseCard(user.increaseAccountId);
                setCardState(prev => ({
                  ...prev,
                  number: res.pan || '4242 4242 4242 ' + Math.floor(1000 + Math.random() * 9000),
                  cvv: res.cvv || '123',
                  expiry: res.expiration_month ? \`\${String(res.expiration_month).padStart(2, '0')}/\${String(res.expiration_year).slice(-2)}\` : '12/28',
                }));
              } catch(err: any) {
                setError(err.message || 'Increase API Request Failed.');
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className={\`w-full py-2.5 rounded-xl font-sans font-medium text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 border \${isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-slate-900 text-white hover:bg-slate-800 border-slate-950'}\`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Processing...' : 'Issue New Virtual Card'}
          </button>
        </div>
`;
code = code.replace(
  "{/* Real Card Info Summary */}",
  newButton + "\n        {/* Real Card Info Summary */}"
);

fs.writeFileSync('src/components/InteractiveCard.tsx', code);
console.log('InteractiveCard updated');
