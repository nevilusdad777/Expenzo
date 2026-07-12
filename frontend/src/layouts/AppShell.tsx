import { NavLink, Outlet } from 'react-router-dom';
import { FiBarChart2, FiHome, FiCreditCard, FiList, FiPlusCircle, FiLogOut, FiPieChart, FiSettings } from 'react-icons/fi';
import { Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import logoImg from '@/assets/logo.jpg';

const navLinkBase =
  'flex flex-col items-center justify-center gap-1 rounded-[var(--radius-button)] px-2 py-2 text-xs transition-colors duration-150 sm:flex-row sm:gap-2 sm:text-sm';

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
  return (
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full gradient-primary text-xs font-bold text-white shadow-md shadow-primary/30">
      {initials}
    </div>
  );
}

export function AppShell() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 border-b border-border bg-background/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Expenzo Logo" className="h-9 w-9 rounded-xl object-cover border border-primary/20 shadow-md shadow-primary/10" />
            <div className="leading-tight">
              <p className="text-sm font-bold text-text-primary">Expenzo</p>
              <p className="text-xs text-text-muted">Private on-device tracker</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `hidden items-center gap-2 rounded-[var(--radius-button)] px-3 py-2 text-sm transition-colors sm:inline-flex ${
                  isActive ? 'bg-surface-elevated text-text-primary' : 'text-text-secondary hover:bg-surface'
                }`
              }
            >
              <FiBarChart2 size={16} />
              Reports
            </NavLink>
            <NavLink
              to="/charts"
              className={({ isActive }) =>
                `hidden items-center gap-2 rounded-[var(--radius-button)] px-3 py-2 text-sm transition-colors sm:inline-flex ${
                  isActive ? 'bg-surface-elevated text-text-primary' : 'text-text-secondary hover:bg-surface'
                }`
              }
            >
              <FiPieChart size={16} />
              Charts
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `hidden items-center gap-2 rounded-[var(--radius-button)] px-3 py-2 text-sm transition-colors sm:inline-flex ${
                  isActive ? 'bg-surface-elevated text-text-primary' : 'text-text-secondary hover:bg-surface'
                }`
              }
            >
              <FiSettings size={16} />
              Settings
            </NavLink>

            {/* User Avatar + Name */}
            {user && (
              <div className="hidden items-center gap-2 sm:flex">
                <UserAvatar name={user.name} />
                <span className="text-sm font-medium text-text-primary">{user.name}</span>
              </div>
            )}

            <Button variant="ghost" onClick={() => void logout()} className="hidden sm:inline-flex">
              <FiLogOut />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-4">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/70 backdrop-blur">
        <div className="mx-auto grid max-w-5xl grid-cols-5 gap-1 px-2 py-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? 'bg-surface-elevated text-text-primary' : 'text-text-secondary hover:bg-surface'}`
            }
            end
          >
            <FiHome size={18} />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/accounts"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? 'bg-surface-elevated text-text-primary' : 'text-text-secondary hover:bg-surface'}`
            }
          >
            <FiCreditCard size={18} />
            <span>Accounts</span>
          </NavLink>

          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? 'bg-surface-elevated text-text-primary' : 'text-text-secondary hover:bg-surface'}`
            }
          >
            <FiList size={18} />
            <span>Txns</span>
          </NavLink>

          <NavLink
            to="/charts"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? 'bg-surface-elevated text-text-primary' : 'text-text-secondary hover:bg-surface'}`
            }
          >
            <FiPieChart size={18} />
            <span>Charts</span>
          </NavLink>

          <NavLink
            to="/transactions/new"
            className={`${navLinkBase} gradient-primary text-white shadow-lg shadow-primary/20`}
          >
            <FiPlusCircle size={18} />
            <span>Add</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
