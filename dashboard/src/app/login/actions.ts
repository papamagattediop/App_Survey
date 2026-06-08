'use server';

import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function loginAction(prevState: { erreur: string } | null, formData: FormData) {
  const identifiant = (formData.get('identifiant') as string ?? '').trim();
  const motDePasse  = (formData.get('motDePasse')  as string ?? '');

  if (!identifiant || !motDePasse) {
    return { erreur: 'Veuillez remplir tous les champs' };
  }

  const email = `${identifiant.toLowerCase().replace(/[^a-z0-9]/g, '')}@ansd-enquete.sn`;

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });

  if (error) {
    return { erreur: 'Identifiant ou mot de passe incorrect' };
  }

  redirect('/dashboard');
}
