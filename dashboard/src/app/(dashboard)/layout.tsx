import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth-server';
import Sidebar from '@/components/layout/Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect('/login');

  return (
    <div className="flex min-h-screen">
      <Sidebar
        identifiant={user.identifiant}
        nom={`${user.prenom} ${user.nom}`.trim()}
        role={user.role}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
