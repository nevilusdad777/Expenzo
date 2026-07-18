import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiHome, FiCreditCard, FiList, FiPlusCircle, FiLogOut, FiPieChart, FiSettings, FiSearch, FiBell } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
  return (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full gradient-primary text-sm font-bold text-white shadow-md shadow-primary/30 border border-white/10">
      {initials}
    </div>
  );
}

export function AppShell() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleNotificationsClick = () => {
    toast('Your financial ecosystem is fully secure. No new alerts.', {
      icon: '🔔',
      style: {
        background: 'rgba(19, 19, 21, 0.9)',
        color: '#fff',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '1rem',
        fontSize: '13px',
      },
    });
  };

  return (
    <div className="min-h-screen bg-background text-on-surface pb-32">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-surface/55 backdrop-blur-md shadow-[0_0_30px_rgba(196,192,255,0.15)] z-40 border-b border-white/10">
        <div className="flex justify-between items-center px-6 max-w-5xl mx-auto h-full w-full">
          <div className="text-2xl font-bold tracking-tight text-primary">Expenzo</div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/transactions')}
              className="text-on-surface-variant hover:bg-white/5 hover:text-primary transition-colors active:scale-95 duration-200 p-2 rounded-full"
            >
              <FiSearch size={20} />
            </button>
            <button
              onClick={handleNotificationsClick}
              className="text-on-surface-variant hover:bg-white/5 hover:text-primary transition-colors active:scale-95 duration-200 p-2 rounded-full"
            >
              <FiBell size={20} />
            </button>
            
            {user && (
              <div className="flex items-center gap-3">
                <UserAvatar name={user.name} />
                <span className="hidden text-sm font-semibold text-on-surface sm:inline">{user.name}</span>
                <button
                  onClick={() => void logout()}
                  className="flex items-center gap-1 rounded-full bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-semibold text-on-surface transition-all active:scale-95 border border-white/10"
                >
                  <FiLogOut size={12} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-28 px-4 max-w-5xl mx-auto">
        <Outlet />
      </main>

      {/* Floating Bottom Nav Dock (iOS Capsule Style) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-surface/55 backdrop-blur-xl rounded-full px-4 py-2 border border-white/10 shadow-[0_0_40px_rgba(196,192,255,0.15)] max-w-[90vw] md:max-w-xl">
        {/* Dashboard */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-200 active:scale-95 ${
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
              {isActive && <span className="text-xs font-semibold">Dashboard</span>}
            </>
          )}
        </NavLink>

        {/* Accounts */}
        <NavLink
          to="/accounts"
          end
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-200 active:scale-95 ${
              isActive
                ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(135,129,255,0.5)]'
                : 'text-on-surface-variant hover:text-primary'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <FiCreditCard size={18} />
              {isActive && <span className="text-xs font-semibold">Accounts</span>}
            </>
          )}
        </NavLink>

        {/* Floating Action Button (FAB) for Add Transaction */}
        <NavLink
          to="/transactions/new"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary shadow-[0_0_15px_rgba(196,192,255,0.4)] hover:scale-110 active:scale-90 transition-all mx-1"
        >
          <FiPlusCircle size={22} />
        </NavLink>

        {/* Transactions */}
        <NavLink
          to="/transactions"
          end
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-200 active:scale-95 ${
              isActive
                ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(135,129,255,0.5)]'
                : 'text-on-surface-variant hover:text-primary'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <FiList size={18} />
              {isActive && <span className="text-xs font-semibold">Transactions</span>}
            </>
          )}
        </NavLink>

        {/* Charts */}
        <NavLink
          to="/charts"
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-200 active:scale-95 ${
              isActive
                ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(135,129,255,0.5)]'
                : 'text-on-surface-variant hover:text-primary'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <FiPieChart size={18} />
              {isActive && <span className="text-xs font-semibold">Charts</span>}
            </>
          )}
        </NavLink>

        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-200 active:scale-95 ${
              isActive
                ? 'bg-primary-container text-on-primary-container shadow-[0_0_12px_rgba(135,129,255,0.5)]'
                : 'text-on-surface-variant hover:text-primary'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <FiSettings size={18} />
              {isActive && <span className="text-xs font-semibold">Settings</span>}
            </>
          )}
        </NavLink>
      </nav>
    </div>
  );
}
