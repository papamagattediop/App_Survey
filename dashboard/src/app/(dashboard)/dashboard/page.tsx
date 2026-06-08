import dynamic from 'next/dynamic';
import KpiCard   from '@/components/ui/KpiCard';
import AgentCard from '@/components/ui/AgentCard';
import { getStatsGlobales, getAgentsStats, getCollectesParJour } from '@/lib/queries';

const CollectesChart = dynamic(() => import('@/components/charts/CollectesChart'), { ssr: false });

export const revalidate = 60;

export default async function DashboardPage() {
  const [stats, agents, collectes] = await Promise.all([
    getStatsGlobales(),
    getAgentsStats(),
    getCollectesParJour(14),
  ]);

  // Trier par identifiant pour numerotation stable
  const agentsOrdonnes = [...agents].sort((a, b) => a.identifiant.localeCompare(b.identifiant));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Tableau de bord</h1>
        <p className="text-sm text-slate-400 mt-0.5">Vue d'ensemble de la collecte terrain</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Total collectes"  value={stats.total}       subtitle="Depuis le debut" />
        <KpiCard title="Aujourd'hui"      value={stats.aujourd_hui} subtitle="Questionnaires crees" accent />
        <KpiCard title="En cours"         value={stats.en_cours}    subtitle="Non encore soumis" />
        <KpiCard title="Soumis / Valides" value={stats.soumis}      subtitle="Prets pour analyse" trend="up" />
      </div>

      {/* Graphique + Agents */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-700">Collectes par jour</h2>
              <p className="text-xs text-slate-400 mt-0.5">14 derniers jours</p>
            </div>
          </div>
          <CollectesChart data={collectes} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Agents terrain</h2>
            <span className="text-xs text-slate-400">{agentsOrdonnes.length} agent{agentsOrdonnes.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {agentsOrdonnes.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Aucun agent enregistre</p>
            ) : (
              agentsOrdonnes.map((agent, i) => (
                <AgentCard key={agent.id} agent={agent} numero={i + 1} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
