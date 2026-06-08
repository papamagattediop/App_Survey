'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { exportCSV, exportExcel, formaterPourExport } from '@/lib/export';
import type { Agent } from '@/types';

export default function ExportPage() {
  const [agents,     setAgents]     = useState<Agent[]>([]);
  const [agentId,    setAgentId]    = useState('');
  const [dateDebut,  setDateDebut]  = useState('');
  const [dateFin,    setDateFin]    = useState('');
  const [format,     setFormat]     = useState<'csv' | 'excel'>('excel');
  const [inclureRep, setInclureRep] = useState(true);
  const [chargement, setChargement] = useState(false);
  const [message,    setMessage]    = useState('');

  const [stats, setStats] = useState<{
    parAgent: { nom: string; total: number; soumis: number }[];
    parRegion: { region: string; total: number }[];
    parStatut: { statut: string; total: number }[];
  } | null>(null);
  const [chargementStats, setChargementStats] = useState(true);

  useEffect(() => {
    supabase.from('agents').select('*').eq('role', 'agent').then(({ data }) => {
      if (data) setAgents(data as Agent[]);
    });
    chargerStats();
  }, []);

  async function chargerStats() {
    setChargementStats(true);
    const [{ data: qs }, { data: agentsData }] = await Promise.all([
      supabase.from('questionnaires').select('agent_id, statut, nom_region'),
      supabase.from('agents').select('id, nom, prenom, identifiant').eq('role', 'agent'),
    ]);

    if (!qs || !agentsData) { setChargementStats(false); return; }

    const parStatut = ['brouillon', 'complet', 'soumis', 'valide'].map(s => ({
      statut: s,
      total:  qs.filter((q: any) => q.statut === s).length,
    }));

    const parAgent = agentsData.map((a: any) => {
      const qA = qs.filter((q: any) => q.agent_id === a.id);
      return { nom: `${a.prenom} ${a.nom} (${a.identifiant})`, total: qA.length, soumis: qA.filter((q: any) => ['soumis','valide'].includes(q.statut)).length };
    }).sort((a, b) => b.total - a.total);

    const regionMap = new Map<string, number>();
    for (const q of qs as any[]) {
      const r = q.nom_region ?? 'Non renseigne';
      regionMap.set(r, (regionMap.get(r) ?? 0) + 1);
    }
    const parRegion = Array.from(regionMap.entries())
      .map(([region, total]) => ({ region, total }))
      .sort((a, b) => b.total - a.total);

    setStats({ parAgent, parRegion, parStatut });
    setChargementStats(false);
  }

  async function handleExport() {
    setChargement(true);
    setMessage('');

    try {
      let query = supabase
        .from('questionnaires')
        .select('*, agents(identifiant, nom, prenom)')
        .order('created_at', { ascending: false });

      if (agentId)   query = query.eq('agent_id', agentId);
      if (dateDebut) query = query.gte('created_at', `${dateDebut}T00:00:00`);
      if (dateFin)   query = query.lte('created_at', `${dateFin}T23:59:59`);

      const { data: questionnaires } = await query;
      if (!questionnaires?.length) {
        setMessage('Aucun questionnaire trouve avec ces criteres.');
        return;
      }

      let reponses: any[] = [];
      if (inclureRep) {
        const ids = questionnaires.map((q: any) => q.id);
        const { data: reps } = await supabase.from('reponses').select('*').in('questionnaire_id', ids);
        reponses = reps ?? [];
      }

      const donnees = formaterPourExport(questionnaires, reponses);
      const nom = `ACCES_Collecte_${new Date().toISOString().split('T')[0]}`;

      if (format === 'csv') exportCSV(donnees, nom);
      else exportExcel(donnees, nom);

      setMessage(`Export reussi : ${donnees.length} questionnaire${donnees.length !== 1 ? 's' : ''}`);
    } catch (e: any) {
      setMessage('Erreur lors de l\'export : ' + (e.message ?? 'inconnue'));
    } finally {
      setChargement(false);
    }
  }

  const STATUT_LABELS: Record<string, string> = {
    brouillon: 'Brouillon', complet: 'Complet', soumis: 'Soumis', valide: 'Valide'
  };
  const STATUT_COLORS: Record<string, string> = {
    brouillon: 'bg-slate-100 text-slate-600',
    complet:   'bg-blue-50 text-blue-600',
    soumis:    'bg-amber-50 text-amber-700',
    valide:    'bg-emerald-50 text-emerald-700',
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Export des donnees</h1>
        <p className="text-sm text-slate-400 mt-0.5">Exporter les questionnaires en CSV ou Excel</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Formulaire export */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-slate-700">Parametres d'export</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-500 text-xs font-medium mb-1.5">Agent (optionnel)</label>
              <select
                value={agentId}
                onChange={e => setAgentId(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy"
              >
                <option value="">Tous les agents</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.prenom} {a.nom} ({a.identifiant})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 text-xs font-medium mb-1.5">Date debut</label>
                <input
                  type="date"
                  value={dateDebut}
                  onChange={e => setDateDebut(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
              <div>
                <label className="block text-slate-500 text-xs font-medium mb-1.5">Date fin</label>
                <input
                  type="date"
                  value={dateFin}
                  onChange={e => setDateFin(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 text-xs font-medium mb-2">Format</label>
              <div className="flex gap-3">
                {(['excel', 'csv'] as const).map(f => (
                  <label key={f} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value={f}
                      checked={format === f}
                      onChange={() => setFormat(f)}
                      className="accent-navy"
                    />
                    <span className="text-sm text-slate-700">{f === 'excel' ? 'Excel (.xlsx)' : 'CSV'}</span>
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inclureRep}
                onChange={e => setInclureRep(e.target.checked)}
                className="accent-navy"
              />
              <span className="text-sm text-slate-700">Inclure les reponses detaillees (sections A-F)</span>
            </label>
          </div>

          {message && (
            <div className={`rounded-lg px-4 py-3 text-sm ${
              message.startsWith('Erreur') || message.startsWith('Aucun')
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {message}
            </div>
          )}

          <button
            onClick={handleExport}
            disabled={chargement}
            className="w-full h-10 bg-navy hover:bg-navy-light text-white font-semibold rounded-lg text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {chargement ? 'Export en cours...' : `Exporter en ${format === 'excel' ? 'Excel' : 'CSV'}`}
          </button>
        </div>

        {/* Statistiques resumees */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h2 className="font-semibold text-slate-700 mb-4">Repartition par statut</h2>
            {chargementStats ? (
              <p className="text-xs text-slate-400">Chargement...</p>
            ) : (
              <div className="space-y-2">
                {stats?.parStatut.map(s => (
                  <div key={s.statut} className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUT_COLORS[s.statut] ?? 'bg-slate-100 text-slate-600'}`}>
                      {STATUT_LABELS[s.statut] ?? s.statut}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">{s.total}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h2 className="font-semibold text-slate-700 mb-4">Total par agent</h2>
            {chargementStats ? (
              <p className="text-xs text-slate-400">Chargement...</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                {stats?.parAgent.map((a, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 text-xs truncate flex-1 mr-2">{a.nom}</span>
                    <div className="flex gap-3 shrink-0">
                      <span className="text-slate-400 text-xs">{a.soumis} soumis</span>
                      <span className="font-semibold text-slate-700 w-6 text-right">{a.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h2 className="font-semibold text-slate-700 mb-4">Total par region</h2>
            {chargementStats ? (
              <p className="text-xs text-slate-400">Chargement...</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                {stats?.parRegion.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 text-xs">{r.region}</span>
                    <span className="font-semibold text-slate-700">{r.total}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
