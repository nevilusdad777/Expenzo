import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiHome, FiCreditCard, FiList, FiPlusCircle, FiLogOut, FiPieChart, FiSettings, FiSearch } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useIsFetching } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Logo } from '@/components/ui';

function UserAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container text-xs font-bold text-white shadow-inner border border-white/10 overflow-hidden">
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}

export function AppShell() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const isFetching = useIsFetching();

  return (
    <div className="min-h-screen bg-background text-on-surface pb-32">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 right-0 h-[72px] bg-surface/55 backdrop-blur-md shadow-[0_0_30px_rgba(196,192,255,0.15)] z-40 border-b border-white/10">
        {isFetching > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-primary via-tertiary to-primary animate-pulse" />
        )}
        <div className="flex justify-between items-center px-4 sm:px-6 max-w-5xl mx-auto h-full w-full">
          <div className="cursor-pointer select-none animate-fade-in" onClick={() => navigate('/')}>
            <Logo variant="navbar" className="scale-90 sm:scale-100 origin-left" />
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => navigate('/transactions')}
              className="text-on-surface-variant hover:bg-white/5 hover:text-primary transition-colors active:scale-95 duration-200 p-2 rounded-full"
            >
              <FiSearch size={20} />
            </button>
            
            {user && (
              <div className="flex items-center gap-2 sm:gap-3">
                <UserAvatar name={user.name} avatarUrl={user.avatarUrl} />
                <span className="hidden text-sm font-semibold text-on-surface md:inline">{user.name}</span>
                <button
                  onClick={() => void logout()}
                  className="flex items-center gap-1 rounded-full bg-white/5 hover:bg-white/10 p-2 sm:px-3 sm:py-1.5 text-xs font-semibold text-on-surface transition-all active:scale-95 border border-white/10"
                  title="Logout"
                >
                  <FiLogOut size={14} className="sm:w-3 sm:h-3" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-[104px] px-4 max-w-5xl mx-auto">
        <Outlet />
      </main>

      {/* Floating Bottom Nav Dock (iOS Capsule Style) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between sm:justify-center w-[95vw] sm:w-auto sm:gap-2 bg-surface/55 backdrop-blur-xl rounded-full px-2 sm:px-4 py-2 border border-white/10 shadow-[0_0_40px_rgba(196,192,255,0.15)] max-w-[400px] sm:max-w-xl">
        {/* Dashboard */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-full px-3 sm:px-4 py-2 transition-all duration-200 active:scale-95 ${
              isActive
                ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(135,129,255,0.5)]'
                : 'text-on-surface-variant hover:text-primary'
            }`
          }
          end
        >
          {({ isActive }) => (
            <>
              <FiHome size={18} />
              {isActive && <span className="text-xs font-semibold hidden min-[360px]:inline">Dashboard</span>}
            </>
          )}
        </NavLink>

        {/* Accounts */}
        <NavLink
          to="/accounts"
          end
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-full px-3 sm:px-4 py-2 transition-all duration-200 active:scale-95 ${
              isActive
                ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(135,129,255,0.5)]'
                : 'text-on-surface-variant hover:text-primary'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <FiCreditCard size={18} />
              {isActive && <span className="text-xs font-semibold hidden min-[360px]:inline">Accounts</span>}
            </>
          )}
        </NavLink>

        {/* Floating Action Button (FAB) for Add Transaction */}
        <Link
          to="/transactions/new"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary shadow-[0_0_15px_rgba(196,192,255,0.4)] hover:scale-110 active:scale-90 transition-all mx-0.5 sm:mx-1"
        >
          <FiPlusCircle size={22} />
        </Link>

        {/* Transactions */}
        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-full px-3 sm:px-4 py-2 transition-all duration-200 active:scale-95 ${
              (isActive && window.location.pathname === '/transactions')
                ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(135,129,255,0.5)]'
                : 'text-on-surface-variant hover:text-primary'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <FiList size={18} />
              {isActive && <span className="text-xs font-semibold hidden min-[360px]:inline">Transactions</span>}
            </>
          )}
        </NavLink>

        {/* Charts */}
        <NavLink
          to="/charts"
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-full px-3 sm:px-4 py-2 transition-all duration-200 active:scale-95 ${
              isActive
                ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(135,129,255,0.5)]'
                : 'text-on-surface-variant hover:text-primary'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <FiPieChart size={18} />
              {isActive && <span className="text-xs font-semibold hidden min-[360px]:inline">Charts</span>}
            </>
          )}
        </NavLink>

        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-full px-3 sm:px-4 py-2 transition-all duration-200 active:scale-95 ${
              isActive
                ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(135,129,255,0.5)]'
                : 'text-on-surface-variant hover:text-primary'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <FiSettings size={18} />
              {isActive && <span className="text-xs font-semibold hidden min-[360px]:inline">Settings</span>}
            </>
          )}
        </NavLink>
      </nav>
    </div>
  );
}
