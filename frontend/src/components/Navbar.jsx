import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Fuel, 
  Settings, 
  Users, 
  CircleDollarSign,
  Database,
  LogOut,
  Menu,
  X,
  Bell
} from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Sales', path: '/sales', icon: Fuel },
    { name: 'Inventory', path: '/tanks', icon: Database },
    { name: 'Maintenance', path: '/maintenance', icon: Settings },
    { name: 'Attendance', path: '/attendance', icon: Users },
    { name: 'Loans', path: '/loans', icon: CircleDollarSign },
  ];


  return (
    <nav className="nav-blur px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="bg-red-500 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
             <Fuel className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            PETROL<span className="text-red-500">PRO</span>
          </span>
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 group ${
                location.pathname === item.path 
                ? 'text-white' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-4 h-4 ${location.pathname === item.path ? 'text-red-500' : 'group-hover:text-red-400'}`} />
              <span>{item.name}</span>
              {location.pathname === item.path && (
                <motion.div 
                  layoutId="nav-glow"
                  className="absolute inset-0 bg-red-500/10 rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
             <Bell className="w-5 h-5" />
             <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950"></span>
          </button>
          
          <div className="h-6 w-[1px] bg-white/10 hidden md:block"></div>
          
          <button 
            onClick={logout} 
            className="flex items-center space-x-2 text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium hidden md:block">Logout</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-white/5 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 text-lg font-medium text-slate-300 active:text-white"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
