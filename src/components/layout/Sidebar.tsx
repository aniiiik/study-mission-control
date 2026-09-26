import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Clock3,
  FileText,
  Home,
  RotateCcw,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

function Sidebar() {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: Home },
    { to: '/timer', label: 'Timer', icon: Clock3 },
    { to: '/planner', label: 'Planner', icon: CalendarDays },
    { to: '/notes', label: 'Notes', icon: FileText },
    { to: '/revision', label: 'Revision', icon: RotateCcw },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/subjects', label: 'Subjects', icon: BookOpen },
  ]

  return (
    <aside className="hidden min-h-screen w-64 border-r border-slate-800 bg-slate-950 p-4 text-white md:block">
      <div className="mb-8 px-3">
        <h1 className="text-xl font-bold">Study Mission Control</h1>
        <p className="mt-1 text-sm text-slate-400">
          Your study command center
        </p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar