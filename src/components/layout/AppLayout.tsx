import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import { supabase } from '../../lib/supabase'

interface AppLayoutProps {
  children: ReactNode
}

function AppLayout({ children }: AppLayoutProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <div className="flex justify-end border-b border-slate-800 p-4">
          <button
            onClick={handleLogout}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Logout
          </button>
        </div>

        {children}
      </main>
    </div>
  )
}

export default AppLayout