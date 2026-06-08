// Fonctions client-safe uniquement (pas de next/headers)
import { supabase } from './supabase';

export async function signIn(identifiant: string, motDePasse: string) {
  const email = `${identifiant.toLowerCase().replace(/[^a-z0-9]/g, '')}@ansd-enquete.sn`;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });
  if (error) throw new Error('Identifiant ou mot de passe incorrect');

  const { data: agent, error: agentErr } = await supabase
    .from('agents').select('*').eq('id', data.user.id).single();
  if (agentErr || !agent) throw new Error('Profil introuvable');
  if (!agent.actif) throw new Error('Compte desactive');
  if (!['superviseur', 'admin'].includes(agent.role))
    throw new Error('Acces reserve aux superviseurs');

  return agent;
}

export async function signOut() {
  await supabase.auth.signOut();
}
