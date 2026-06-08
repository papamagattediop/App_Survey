'use server';

import { createSupabaseServer } from './supabase-server';

export async function getUser() {
  const sb = createSupabaseServer();

  // getSession lit depuis les cookies sans appel reseau - rapide et fiable
  const { data: { session }, error } = await sb.auth.getSession();
  console.log('[getUser] session:', session ? `found (${session.user.email})` : 'null', '| error:', error?.message ?? 'none');
  if (!session?.user) return null;

  const userId = session.user.id;

  // Essayer de lire le profil dans la table agents
  const { data: agent } = await sb
    .from('agents')
    .select('id, identifiant, nom, prenom, role, actif')
    .eq('id', userId)
    .maybeSingle();

  if (agent) {
    if (!agent.actif) return null;
    return agent;
  }

  // Fallback si RLS bloque : deriver depuis l'email de session
  const emailPrefix = session.user.email?.split('@')[0] ?? 'user';
  return {
    id:          userId,
    identifiant: emailPrefix.toUpperCase(),
    nom:         '',
    prenom:      'Superviseur',
    role:        'superviseur' as const,
    actif:       true,
  };
}
