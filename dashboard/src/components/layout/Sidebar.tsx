'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth';

interface NavItem {
  href:  string;
  label: string;
  icon:  string;
}

const NAV: NavItem[] = [
  { href: '/dashboard',      label: 'Tableau de bord', icon: '▣' },
  { href: '/questionnaires', label: 'Questionnaires',  icon: '≡' },
  { href: '/export',         label: 'Export donnees',  icon: '↓' },
];

interface SidebarProps {
  identifiant?: string;
  nom?:         string;
  role?:        string;
}

export default function Sidebar({ identifiant, nom, role }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push('/login');
  }

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-navy text-white shrink-0">
      {/* Logo ACCES */}
      <div className="px-6 py-6 border-b border-navy-light">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber flex items-center justify-center shrink-0">
            <span className="text-navy font-bold text-base">A</span>
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">ACCES</p>
            <p className="text-slate-400 text-xs leading-tight">Electrification Rurale</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(item => {
          const actif = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
                ${actif
                  ? 'bg-white/10 text-white border-l-2 border-amber pl-[10px]'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <span className="text-base w-5 text-center leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Pied : profil + deconnexion */}
      <div className="px-4 py-4 border-t border-navy-light">
        <div className="mb-3 px-2">
          <p className="text-white text-sm font-medium truncate">Admin</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-amber">Superviseur</span>
            {identifiant && <span className="text-slate-500 text-xs">· {identifiant}</span>}
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white text-sm transition"
        >
          <span className="text-base">→</span>
          Deconnexion
        </button>
      </div>
    </aside>
  );
}
