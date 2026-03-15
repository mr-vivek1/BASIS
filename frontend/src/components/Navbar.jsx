import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Sales', path: '/sales' },
    { name: 'Maintenance', path: '/maintenance' },
    { name: 'Attendance', path: '/attendance' },
    { name: 'Loans', path: '/loans' },
  ];

  return (
    <nav className="bg-secondary px-4 py-3 sticky top-0 z-50 border-b border-gray-800">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/" className="text-xl font-bold text-accent">BunkManager</Link>
        
        <div className="hidden md:flex space-x-6">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`hover:text-accent transition-colors ${location.pathname === item.path ? 'text-accent' : 'text-gray-300'}`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <button onClick={logout} className="text-gray-400 hover:text-red-500 text-sm font-medium">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
