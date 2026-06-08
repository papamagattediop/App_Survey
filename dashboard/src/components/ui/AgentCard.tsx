import type { StatAgent } from '@/types';

interface AgentCardProps {
  agent:  StatAgent;
  numero: number;
}

export default function AgentCard({ agent, numero }: AgentCardProps) {
  const pct = agent.total > 0 ? Math.round((agent.soumis / agent.total) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full shrink-0 mt-1 ${agent.actif ? 'bg-emerald-400' : 'bg-slate-300'}`} />
          <div>
            <p className="font-semibold text-slate-800 text-sm leading-tight">
              Agent {numero}
            </p>
            <span className="inline-block mt-0.5 text-xs font-mono bg-navy/10 text-navy px-1.5 py-0.5 rounded">
              {agent.identifiant}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold text-navy">{agent.aujourd_hui}</p>
          <p className="text-xs text-slate-400">auj.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: 'En cours', val: agent.en_cours },
          { label: 'Soumis',   val: agent.soumis },
          { label: 'Total',    val: agent.total },
        ].map(s => (
          <div key={s.label} className="text-center bg-slate-50 rounded-lg py-2">
            <p className="text-lg font-bold text-slate-700">{s.val}</p>
            <p className="text-xs text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Progression</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
