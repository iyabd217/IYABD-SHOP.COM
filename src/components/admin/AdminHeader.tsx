import React, { useState, useEffect } from 'react';
import { Bell, Search, Menu, LogOut, Settings, User, Moon, Languages, Sun } from 'lucide-react';
import { Icon } from '@iconify/react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../lib/authContext';
import { useNavigate } from 'react-router-dom';

export const AdminHeader = ({ toggleSidebar, setActiveTab }: { toggleSidebar: () => void, setActiveTab: (tab: string) => void }) => {
    const { settings } = useSettings();
    const { adminLogout } = useAuth();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);

    // Dark Mode & Language states
    const [darkMode, setDarkMode] = useState(false);
    const [language, setLanguage] = useState('en');

    useEffect(() => {
        const isDark = localStorage.getItem('adminDarkMode') === 'true';
        setDarkMode(isDark);
        if (isDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');

        const savedLang = localStorage.getItem('adminLanguage') || 'en';
        setLanguage(savedLang);
    }, []);

    const toggleDarkMode = () => {
        const val = !darkMode;
        setDarkMode(val);
        localStorage.setItem('adminDarkMode', String(val));
        if (val) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    };

    const toggleLanguage = () => {
        const val = language === 'en' ? 'bn' : 'en';
        setLanguage(val);
        localStorage.setItem('adminLanguage', val);
    };

    const handleLogout = async () => {
        await adminLogout();
        navigate('/admin-secure-login');
    };

    return (
        <header className="admin-header">
          <div className="flex items-center gap-4">
              <button onClick={toggleSidebar} className="p-2 text-slate-800 hover:text-primary transition-colors lg:hidden shrink-0">
                  <Menu size={24} strokeWidth={2} />
              </button>
              
              {/* Premium Logo */}
              <div className="admin-logo shrink-0 hidden sm:flex cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveTab('dashboard')}>
                  {settings.companyName.charAt(0).toUpperCase()}
              </div>

              {/* Advanced Search */}
              <div className="relative w-full max-w-[300px] ml-2 hidden md:block">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} strokeWidth={2.5} />
                  <input 
                      type="text" 
                      placeholder="Search orders, products..." 
                      className="w-full bg-slate-50/80 border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all"
                      onChange={(e) => console.log('Searching:', e.target.value)}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-black text-slate-400 shadow-sm">
                          ⌘ K
                      </kbd>
                  </div>
              </div>
          </div>
          
          <div className="admin-top-icons">
              {/* Language Toggle */}
              <button 
                  onClick={toggleLanguage}
                  className="p-2 text-slate-600 hover:text-primary transition-colors flex items-center gap-1"
                  title="Switch Language"
              >
                  <Languages size={20} strokeWidth={2} />
                  <span className="text-xs font-bold uppercase hidden sm:block">{language}</span>
              </button>

              {/* Dark Mode Toggle */}
              <button 
                  onClick={toggleDarkMode}
                  className="p-2 text-slate-600 hover:text-primary transition-colors hidden sm:block"
                  title="Toggle Dark Mode"
              >
                  {darkMode ? <Sun size={20} strokeWidth={2} /> : <Moon size={20} strokeWidth={2} />}
              </button>

              {/* Notifications */}
              <div className="relative">
                  <button 
                      onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                      className="notification-icon group"
                  >
                      <Bell size={22} className="text-slate-600 group-hover:text-primary transition-colors" strokeWidth={2} />
                      <span className="notification-dot" />
                  </button>

                  {/* Notification Dropdown */}
                  {isNotificationOpen && (
                      <div className="absolute top-14 right-0 w-80 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-50">
                          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                              <h4 className="font-bold text-slate-800">Notifications</h4>
                              <button className="text-[10px] font-black text-primary uppercase tracking-wider">Mark all read</button>
                          </div>
                          <div className="max-h-[300px] overflow-y-auto">
                              <div className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3">
                                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                      <Icon icon="solar:box-bold" width={20} />
                                  </div>
                                  <div>
                                      <p className="text-sm font-bold text-slate-800 line-clamp-1">New order #4921</p>
                                      <p className="text-xs text-slate-500 mt-0.5">John Doe placed an order for ৳2,450</p>
                                      <span className="text-[10px] font-black text-slate-400 mt-1 block">2 MINS AGO</span>
                                  </div>
                              </div>
                              <div className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3">
                                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                      <Icon icon="solar:danger-triangle-bold" width={20} />
                                  </div>
                                  <div>
                                      <p className="text-sm font-bold text-slate-800 line-clamp-1">Low Stock Alert</p>
                                      <p className="text-xs text-slate-500 mt-0.5">"Rolex Submariner" is out of stock</p>
                                      <span className="text-[10px] font-black text-slate-400 mt-1 block">1 HOUR AGO</span>
                                  </div>
                              </div>
                          </div>
                          <div className="p-3 bg-slate-50 border-t border-slate-100text-center">
                              <button className="w-full text-xs font-black text-slate-600 hover:text-primary transition-colors py-2">View all notifications</button>
                          </div>
                      </div>
                  )}
              </div>
              
              {/* Profile Dropdown */}
              <div className="relative">
                  <div 
                      className="flex items-center gap-3 cursor-pointer p-1.5 pr-3 rounded-2xl hover:bg-slate-50 transition-colors"
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                  >
                       <div className="w-11 h-11 rounded-xl bg-slate-200 overflow-hidden shadow-sm">
                          <img src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff&bold=true" alt="Admin" className="w-full h-full object-cover" />
                       </div>
                       <div className="flex flex-col hidden sm:flex">
                           <span className="text-sm font-black text-slate-900 leading-tight">Admin User</span>
                           <span className="text-[10px] font-bold text-slate-400">Super Admin</span>
                       </div>
                       <Icon icon="solar:alt-arrow-down-bold" className="text-slate-400 hidden sm:block" />
                  </div>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                      <div className="absolute top-16 right-0 w-64 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-50 py-2">
                          <button className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 text-slate-700 transition-colors">
                              <User size={18} />
                              <span className="font-bold text-sm">My Profile</span>
                          </button>
                          <button className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 text-slate-700 transition-colors">
                              <Settings size={18} />
                              <span className="font-bold text-sm">Account Settings</span>
                          </button>
                          <button onClick={toggleDarkMode} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 text-slate-700 transition-colors justify-between">
                              <div className="flex items-center gap-3">
                                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                                  <span className="font-bold text-sm">Dark Mode</span>
                              </div>
                              <div className={`w-10 h-5 rounded-full relative transition-colors ${darkMode ? 'bg-primary' : 'bg-slate-200'}`}>
                                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
                              </div>
                          </button>
                          <div className="h-px bg-slate-100 my-2 mx-4" />
                          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 text-red-600 transition-colors">
                              <LogOut size={18} />
                              <span className="font-bold text-sm">Logout</span>
                          </button>
                      </div>
                  )}
              </div>
          </div>
        </header>
    );
};
