'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Badge from '@/components/ui/Badge';
import type { Questionnaire, Agent } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const PAR_PAGE = 20;

// Retourne "Agent 1", "Agent 2"... ou "Admin" selon le role
function nomAffichage(agent: any, agentsOrdonnes: Agent[]): string {
  if (!agent) return '-';
  if (agent.role === 'superviseur' || agent.role === 'admin') return 'Admin';
  const idx = agentsOrdonnes.findIndex(a => a.id === agent.id);
  return idx >= 0 ? `Agent ${idx + 1}` : agent.identifiant;
}

function ModalDetail({
  questionnaire,
  agentsOrdonnes,
  onFermer,
  onSupprimer,
}: {
  questionnaire: Questionnaire;
  agentsOrdonnes: Agent[];
  onFermer: () => void;
  onSupprimer: (id: string) => void;
}) {
  const [reponses, setReponses] = useState<Record<string, string>>({});
  const [chargement, setChargement] = useState(true);
  const [confirmSuppr, setConfirmSuppr] = useState(false);

  useEffect(() => {
    supabase
      .from('reponses')
      .select('code_variable, valeur_texte, valeur_nombre')
      .eq('questionnaire_id', questionnaire.id)
      .then(({ data }) => {
        const map: Record<string, string> = {};
        (data ?? []).forEach((r: any) => {
          map[r.code_variable] = r.valeur_texte ?? (r.valeur_nombre !== null ? String(r.valeur_nombre) : '');
        });
        setReponses(map);
        setChargement(false);
      });
  }, [questionnaire.id]);

  const agent = (questionnaire as any).agents;
  const nomAgent = nomAffichage(agent, agentsOrdonnes);

  const lignes: [string, string][] = [
    ['N° questionnaire',  questionnaire.n_quest    ?? '-'],
    ['Agent',             nomAgent],
    ['Chef de menage',    questionnaire.nom_chef   ?? '-'],
    ['Telephone',         questionnaire.tel_chef   ?? '-'],
    ['Region',            questionnaire.nom_region ?? '-'],
    ['Village',           questionnaire.nom_commune ?? '-'],
    ['Milieu',            reponses['milieu'] === '1' ? 'Rural' : reponses['milieu'] === '2' ? 'Urbain' : '-'],
    ['Date interview',    questionnaire.date_interview ?? '-'],
    ['Statut',            questionnaire.statut],
    ['GPS',               questionnaire.latitude ? `${questionnaire.latitude?.toFixed(5)}, ${questionnaire.longitude?.toFixed(5)}` : '-'],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onFermer}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-base font-bold text-slate-800">Apercu questionnaire</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{questionnaire.n_quest}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge statut={questionnaire.statut} />
            <button onClick={onFermer} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Corps */}
        <div className="px-6 py-5 space-y-6">
          {/* Identification */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Identification</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {lignes.map(([label, val]) => (
                <div key={label} className="py-1.5 border-b border-slate-50">
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="text-sm font-medium text-slate-700 mt-0.5">{val}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Reponses par section */}
          {chargement ? (
            <p className="text-sm text-slate-400 text-center py-4">Chargement des reponses...</p>
          ) : Object.keys(reponses).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Aucune reponse synchronisee</p>
          ) : (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Reponses collectees</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {Object.entries(reponses).map(([code, val]) => (
                  <div key={code} className="py-1.5 border-b border-slate-50">
                    <p className="text-xs text-slate-400 font-mono">{code}</p>
                    <p className="text-sm text-slate-700 mt-0.5 break-words">{val || '-'}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Zone suppression */}
          <section className="pt-2 border-t border-slate-100">
            {!confirmSuppr ? (
              <button
                onClick={() => setConfirmSuppr(true)}
                className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Supprimer ce questionnaire
              </button>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-red-700 mb-1">Confirmer la suppression ?</p>
                <p className="text-xs text-red-500 mb-3">Cette action est irreversible. Le questionnaire sera supprime definitivement.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onSupprimer(questionnaire.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition"
                  >
                    Oui, supprimer
                  </button>
                  <button
                    onClick={() => setConfirmSuppr(false)}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default function QuestionnairesPage() {
  const [data,        setData]        = useState<Questionnaire[]>([]);
  const [total,       setTotal]       = useState(0);
  const [page,        setPage]        = useState(0);
  const [chargement,  setChargement]  = useState(true);
  const [agents,      setAgents]      = useState<Agent[]>([]);
  const [selectionne, setSelectionne] = useState<Questionnaire | null>(null);

  const [recherche, setRecherche] = useState('');
  const [statut,    setStatut]    = useState('tous');
  const [agentId,   setAgentId]   = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin,   setDateFin]   = useState('');

  // Agents tries par identifiant pour numerotation stable
  const agentsOrdonnes = [...agents].sort((a, b) => a.identifiant.localeCompare(b.identifiant));

  useEffect(() => {
    supabase.from('agents').select('*').eq('role', 'agent').then(({ data }) => {
      if (data) setAgents(data as Agent[]);
    });
  }, []);

  const charger = useCallback(async (p = 0) => {
    setChargement(true);
    let query = supabase
      .from('questionnaires')
      .select('*, agents(id, identifiant, nom, prenom, role)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(p * PAR_PAGE, (p + 1) * PAR_PAGE - 1);

    if (statut !== 'tous') query = query.eq('statut', statut);
    if (agentId)           query = query.eq('agent_id', agentId);
    if (dateDebut)         query = query.gte('created_at', `${dateDebut}T00:00:00`);
    if (dateFin)           query = query.lte('created_at', `${dateFin}T23:59:59`);
    if (recherche.trim())  query = query.or(`nom_chef.ilike.%${recherche}%,n_quest.ilike.%${recherche}%`);

    const { data: rows, count } = await query;
    setData((rows ?? []) as Questionnaire[]);
    setTotal(count ?? 0);
    setChargement(false);
  }, [recherche, statut, agentId, dateDebut, dateFin]);

  useEffect(() => { charger(0); setPage(0); }, [charger]);

  async function valider(id: string) {
    await supabase.from('questionnaires').update({ statut: 'valide' }).eq('id', id);
    charger(page);
  }

  async function supprimer(id: string) {
    await supabase.from('reponses').delete().eq('questionnaire_id', id);
    await supabase.from('questionnaires').delete().eq('id', id);
    setSelectionne(null);
    charger(page);
  }

  const totalPages = Math.ceil(total / PAR_PAGE);

  return (
    <div className="p-6 space-y-5">
      {selectionne && (
        <ModalDetail
          questionnaire={selectionne}
          agentsOrdonnes={agentsOrdonnes}
          onFermer={() => setSelectionne(null)}
          onSupprimer={supprimer}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Questionnaires</h1>
          <p className="text-sm text-slate-400 mt-0.5">{total.toLocaleString('fr-FR')} questionnaire{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            type="search"
            placeholder="Recherche (nom chef, n quest)..."
            value={recherche}
            onChange={e => setRecherche(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy lg:col-span-2"
          />
          <select value={statut} onChange={e => setStatut(e.target.value)} className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy">
            <option value="tous">Tous les statuts</option>
            <option value="brouillon">Brouillon</option>
            <option value="soumis">Soumis</option>
            <option value="valide">Valide</option>
          </select>
          <select value={agentId} onChange={e => setAgentId(e.target.value)} className="h-9 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy">
            <option value="">Tous les agents</option>
            {agentsOrdonnes.map((a, i) => (
              <option key={a.id} value={a.id}>Agent {i + 1}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} className="flex-1 h-9 px-2 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy" />
            <input type="date" value={dateFin}   onChange={e => setDateFin(e.target.value)}   className="flex-1 h-9 px-2 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-navy" />
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['N Quest', 'Agent', 'Chef menage', 'Village', 'Region', 'Date', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chargement ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400 text-sm">Chargement...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400 text-sm">Aucun questionnaire trouve</td></tr>
              ) : data.map(q => {
                const agent = (q as any).agents;
                const nom   = nomAffichage(agent, agentsOrdonnes);
                return (
                  <tr
                    key={q.id}
                    className="border-b border-slate-50 hover:bg-blue-50/40 cursor-pointer transition"
                    onClick={() => setSelectionne(q)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{q.n_quest ?? '-'}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-slate-700 font-medium text-xs">{nom}</p>
                        <p className="text-slate-400 text-xs">{agent?.identifiant ?? ''}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{q.nom_chef ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{q.nom_commune ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{q.nom_region ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {q.date_interview ?? format(new Date(q.created_at), 'dd/MM/yyyy', { locale: fr })}
                    </td>
                    <td className="px-4 py-3"><Badge statut={q.statut} /></td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        {q.statut === 'soumis' && (
                          <button
                            onClick={() => valider(q.id)}
                            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded transition"
                          >
                            Valider
                          </button>
                        )}
                        <button
                          onClick={() => setSelectionne(q)}
                          className="text-xs font-medium text-slate-500 hover:text-navy bg-slate-50 hover:bg-blue-50 px-2 py-1 rounded transition"
                        >
                          Voir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">Page {page + 1} sur {totalPages} ({total} resultats)</p>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => { setPage(p => p - 1); charger(page - 1); }} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition">Precedent</button>
              <button disabled={page >= totalPages - 1} onClick={() => { setPage(p => p + 1); charger(page + 1); }} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition">Suivant</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
