import { createSupabaseServer } from './supabase-server';
import type { StatsGlobales, StatAgent, CollecteParJour, FiltresQuestionnaire } from '@/types';

export async function getStatsGlobales(): Promise<StatsGlobales> {
  const sb     = createSupabaseServer();
  const today  = new Date().toISOString().split('T')[0];

  const [{ count: total }, { count: soumis }, { count: auj }] = await Promise.all([
    sb.from('questionnaires').select('*', { count: 'exact', head: true }),
    sb.from('questionnaires').select('*', { count: 'exact', head: true }).in('statut', ['soumis', 'valide']),
    sb.from('questionnaires').select('*', { count: 'exact', head: true }).gte('created_at', `${today}T00:00:00`),
  ]);

  const t = total ?? 0;
  const s = soumis ?? 0;
  return { total: t, soumis: s, aujourd_hui: auj ?? 0, en_cours: t - s };
}

export async function getAgentsStats(): Promise<StatAgent[]> {
  const sb    = createSupabaseServer();
  const today = new Date().toISOString().split('T')[0];

  const [{ data: agents }, { data: tousQ }, { data: positions }] = await Promise.all([
    sb.from('agents').select('id, identifiant, nom, prenom, role, actif, created_at').eq('role', 'agent'),
    sb.from('questionnaires').select('agent_id, statut, created_at'),
    sb.from('positions_agents').select('agent_id, latitude, longitude, timestamp').order('timestamp', { ascending: false }),
  ]);

  if (!agents) return [];

  const dernierePos = new Map<string, { latitude: number; longitude: number; timestamp: string }>();
  for (const p of positions ?? []) {
    if (!dernierePos.has(p.agent_id)) dernierePos.set(p.agent_id, p);
  }

  return agents.map(agent => {
    const qAgent      = (tousQ ?? []).filter(q => q.agent_id === agent.id);
    const total       = qAgent.length;
    const soumis      = qAgent.filter(q => q.statut === 'soumis' || q.statut === 'valide').length;
    const aujourd_hui = qAgent.filter(q => q.created_at >= `${today}T00:00:00`).length;
    return { ...agent, total, soumis, en_cours: total - soumis, aujourd_hui, derniere_pos: dernierePos.get(agent.id) ?? null };
  });
}

export async function getCollectesParJour(jours = 14): Promise<CollecteParJour[]> {
  const sb    = createSupabaseServer();
  const debut = new Date();
  debut.setDate(debut.getDate() - jours);

  const { data } = await sb
    .from('questionnaires')
    .select('created_at')
    .gte('created_at', debut.toISOString());

  const compteur = new Map<string, number>();
  for (let i = 0; i < jours; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (jours - 1 - i));
    compteur.set(d.toISOString().split('T')[0], 0);
  }

  for (const q of data ?? []) {
    const date = q.created_at.split('T')[0];
    compteur.set(date, (compteur.get(date) ?? 0) + 1);
  }

  return Array.from(compteur.entries()).map(([date, total]) => ({ date, total }));
}

export async function getQuestionnaires(filtres?: Partial<FiltresQuestionnaire>, page = 0, parPage = 20) {
  const sb = createSupabaseServer();
  let query = sb
    .from('questionnaires')
    .select('*, agents(identifiant, nom, prenom)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * parPage, (page + 1) * parPage - 1);

  if (filtres?.statut && filtres.statut !== 'tous')
    query = query.eq('statut', filtres.statut);
  if (filtres?.agent_id)
    query = query.eq('agent_id', filtres.agent_id);
  if (filtres?.date_debut)
    query = query.gte('created_at', `${filtres.date_debut}T00:00:00`);
  if (filtres?.date_fin)
    query = query.lte('created_at', `${filtres.date_fin}T23:59:59`);
  if (filtres?.recherche) {
    query = query.or(`nom_chef.ilike.%${filtres.recherche}%,n_quest.ilike.%${filtres.recherche}%`);
  }

  const { data, count, error } = await query;
  return { data: data ?? [], count: count ?? 0, error };
}

export async function getPositionsAgents() {
  const sb = createSupabaseServer();
  const { data } = await sb
    .from('positions_agents')
    .select('*, agents(identifiant, nom, prenom)')
    .order('timestamp', { ascending: false });
  return data ?? [];
}
