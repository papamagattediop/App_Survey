import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const identifiant = ((formData.get('identifiant') as string) ?? '').trim();
  const motDePasse  = (formData.get('motDePasse')  as string) ?? '';

  if (!identifiant || !motDePasse) {
    return NextResponse.redirect(new URL('/login?erreur=champs', request.url), { status: 303 });
  }

  const email = `${identifiant.toLowerCase().replace(/[^a-z0-9]/g, '')}@ansd-enquete.sn`;

  // 303 = See Other : le browser fait un GET sur la destination (Post/Redirect/Get)
  const redirectOk  = NextResponse.redirect(new URL('/dashboard', request.url), { status: 303 });
  const redirectErr = NextResponse.redirect(new URL('/login?erreur=identifiants', request.url), { status: 303 });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        // Les cookies sont ecrits directement sur la reponse redirect
        set(name: string, value: string, options: any) {
          redirectOk.cookies.set({ name, value, ...options, secure: false });
        },
        remove(name: string, options: any) {
          redirectOk.cookies.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );

  const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse });

  if (error) {
    return redirectErr;
  }

  return redirectOk;
}
