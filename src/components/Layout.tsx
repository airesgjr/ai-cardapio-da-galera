import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Utensils, Calendar, ShoppingCart, LogOut, Menu, X, Home } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/eventos', label: 'Eventos', icon: Calendar },
    { path: '/pratos', label: 'Pratos', icon: Utensils },
    { path: '/ingredientes', label: 'Ingredientes', icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
        <h1 className="text-xl font-bold text-blue-400">Cardápio da Galera</h1>
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-slate-300 hover:text-white">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`
        ${menuOpen ? 'block' : 'hidden'} 
        md:block w-full md:w-64 bg-slate-800 border-r border-slate-700 flex-shrink-0
      `}>
        <div className="p-6 hidden md:block">
          <h1 className="text-2xl font-bold text-blue-400">Cardápio da Galera</h1>
        </div>
        
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-700">
          <div className="mb-4 px-3">
            <p className="text-sm text-slate-400">Logado como</p>
            <p className="font-medium truncate">{user?.nome}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 w-full rounded-lg text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
