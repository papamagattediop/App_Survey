'use client';

import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

function LoginForm() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const erreurParam = searchParams.get('erreur');
  const erreur =
    erreurParam === 'identifiants' ? 'Identifiant ou mot de passe incorrect.' :
    erreurParam === 'champs'       ? 'Veuillez remplir tous les champs.' :
    erreurParam === 'acces_refuse' ? 'Acces refuse : compte inactif ou role non autorise.' :
    null;

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber mb-4 shadow-lg">
            <span className="text-navy font-bold text-2xl">A</span>
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">ACCES</h1>
          <p className="text-slate-300 text-sm mt-1">Enquete d'Impact de l'Electrification Rurale</p>
          <p className="text-slate-400 text-xs mt-1">Tableau de bord superviseur</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-navy font-semibold text-lg mb-6">Connexion</h2>

          {erreur && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5 text-red-700 text-sm">
              {erreur}
            </div>
          )}

          <form
            action="/api/auth/login"
            method="POST"
            className="space-y-5"
            onSubmit={() => setLoading(true)}
          >
            <div>
              <label className="block text-slate-600 text-sm font-medium mb-1.5" htmlFor="identifiant">
                Identifiant
              </label>
              <input
                id="identifiant"
                name="identifiant"
                type="text"
                autoComplete="username"
                placeholder="ex : SUPV-001"
                required
                className="w-full h-11 px-4 rounded-lg border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-slate-600 text-sm font-medium mb-1.5" htmlFor="motDePasse">
                Mot de passe
              </label>
              <input
                id="motDePasse"
                name="motDePasse"
                type="password"
                autoComplete="current-password"
                required
                className="w-full h-11 px-4 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-navy hover:bg-navy-light text-white font-semibold rounded-lg text-sm transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Connexion en cours...
                </>
              ) : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="text-slate-500 text-xs text-center mt-6">
          Acces reserve aux superviseurs et administrateurs ACCES
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
