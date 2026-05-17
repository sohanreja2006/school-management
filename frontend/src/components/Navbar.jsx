import React, { useState } from 'react';
import { Search, Bell, Moon, Sun, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import NotificationTray from './NotificationTray';
import { useSearch } from '../context/SearchContext';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ toggleDarkMode, darkMode }) => {
  const { searchQuery, setSearchQuery } = useSearch();
  const { logout, user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-20 flex items-center justify-between px-10 sticky top-0 z-20 bg-transparent">
      <div className="flex-1 max-w-2xl">
        <div className="flex items-center gap-4 bg-white/80 dark:bg-secondary-800/80 backdrop-blur-md border border-secondary-200/50 dark:border-secondary-700/50 px-6 py-3 rounded-2xl w-full focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-400 shadow-sm transition-all duration-300">
          <Search className="w-5 h-5 text-secondary-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-secondary-900 dark:text-white placeholder:text-secondary-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-8">
        <button 
          onClick={toggleDarkMode}
          className="p-2.5 text-secondary-500 hover:text-primary-600 hover:bg-white rounded-xl transition-all duration-300 shadow-sm border border-transparent hover:border-secondary-100"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="p-2.5 text-secondary-500 hover:text-primary-600 hover:bg-white rounded-xl relative transition-all duration-300 shadow-sm border border-transparent hover:border-secondary-100"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <NotificationTray isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

        <div className="flex items-center gap-3 pl-4 border-l border-secondary-200 dark:border-secondary-700">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-secondary-900 dark:text-white">{user?.name || 'John Doe'}</p>
            <p className="text-xs text-secondary-500 dark:text-secondary-400 capitalize">{user?.role || 'User'}</p>
          </div>
          <Link to="/profile" className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-100 shadow-sm cursor-pointer hover:border-primary-500 transition-colors block">
            <img 
              src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=8B5CF6&color=fff`} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
