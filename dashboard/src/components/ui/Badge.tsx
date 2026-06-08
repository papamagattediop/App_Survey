type Statut = 'brouillon' | 'soumis' | 'valide' | 'erreur' | 'complet' | 'local' | 'synchronise' | 'en_cours' | string;

const COULEURS: Record<string, string> = {
  brouillon:    'bg-slate-100 text-slate-600',
  complet:      'bg-blue-50 text-blue-600',
  soumis:       'bg-amber-50 text-amber-700 border border-amber-200',
  valide:       'bg-emerald-50 text-emerald-700 border border-emerald-200',
  erreur:       'bg-red-50 text-red-700 border border-red-200',
  local:        'bg-slate-100 text-slate-500',
  en_cours:     'bg-blue-50 text-blue-600',
  synchronise:  'bg-emerald-50 text-emerald-600',
};

const LABELS: Record<string, string> = {
  brouillon:   'Brouillon',
  complet:     'Complet',
  soumis:      'Soumis',
  valide:      'Valide',
  erreur:      'Erreur',
  local:       'Local',
  en_cours:    'En cours',
  synchronise: 'Synchronise',
};

interface BadgeProps {
  statut: Statut;
}

export default function Badge({ statut }: BadgeProps) {
  const classes = COULEURS[statut] ?? 'bg-slate-100 text-slate-500';
  const label   = LABELS[statut] ?? statut;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
}
