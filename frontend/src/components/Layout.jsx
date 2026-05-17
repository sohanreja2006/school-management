import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ toggleDarkMode, darkMode }) => {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-secondary-950 transition-colors duration-500">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
        <main className="px-10 py-6 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
