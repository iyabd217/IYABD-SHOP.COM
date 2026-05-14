import React from 'react';
import { Bell, Search, Languages, Moon, Sun, Menu } from 'lucide-react';
import { Icon } from '@iconify/react';
import { useSettings } from '../../context/SettingsContext';

export const AdminHeader = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
    const { settings } = useSettings();
    return (
        <header className="admin-header shadow-sm bg-white border-b border-gray-100 flex items-center justify-between px-6 h-[75px]">
          <div className="flex items-center gap-4">
              <button onClick={toggleSidebar} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                  <Menu size={20} />
              </button>
              <div className="flex items-center gap-3">
                 <img src={settings.logo} className="w-10 h-10 rounded-full object-cover border border-slate-200" alt="Logo" />
                 <span className="font-bold text-slate-800 text-sm hidden sm:block">{settings.companyName}</span>
              </div>
              <div className="relative w-[160px] ml-4 hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Search..." className="w-full bg-slate-50 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-[42px]" />
              </div>
          </div>
          
          <div className="flex items-center gap-4">
              <button className="text-slate-500 hover:text-blue-600 p-2"><Languages size={20} /></button>
              <button className="text-slate-500 hover:text-blue-600 p-2"><Moon size={20} /></button>
              
              <button className="relative text-slate-500 hover:text-blue-600 p-2">
                  <Bell size={22} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              
              <div className="flex items-center gap-3 border-l pl-4 border-slate-200">
                   <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden ring-2 ring-white shadow-md">
                      <img src="https://ui-avatars.com/api/?name=Admin&background=random" alt="Admin" />
                   </div>
                   <div className="flex flex-col hidden sm:flex">
                       <span className="text-sm font-bold text-slate-900">Admin</span>
                       <span className="text-[10px] text-slate-500">Super User</span>
                   </div>
                   <Icon icon="solar:alt-arrow-down-bold" className="text-slate-400" />
              </div>
          </div>
        </header>
    );
};
