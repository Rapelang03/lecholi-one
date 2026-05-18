import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { LogOut, UserCircle, Bell } from 'lucide-react';

export const Layout = () => {
  const { currentRole, setCurrentRole, tables } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    setCurrentRole(null);
    navigate('/');
  };

  const pendingBills = tables.filter(t => t.needsBill).length;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Top Header */}
      <header className="bg-card text-card-foreground sticky top-0 z-50 border-b border-border shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/assets/lecholi.jpg" alt="Lecholi Logo" className="h-12 w-auto object-contain rounded" />
          </div>

          {currentRole && (
            <div className="flex items-center gap-6">
              {currentRole === 'Cashier' && pendingBills > 0 && (
                <div className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-bold animate-pulse shadow-[0_0_10px_rgba(230,57,70,0.5)]">
                  <Bell size={16} />
                  <span>{pendingBills} Pending Bill(s)</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-primary">
                <UserCircle size={22} />
                <span className="font-bold tracking-wider hidden sm:block uppercase text-sm">{currentRole}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-muted-foreground hover:text-secondary transition-colors font-medium"
              >
                <LogOut size={20} />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};
