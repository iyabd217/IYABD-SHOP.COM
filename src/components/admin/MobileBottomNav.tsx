import React from 'react';
import { Icon } from '@iconify/react';
import { motion } from 'motion/react';

const navItems = [
  { id: 'dashboard', label: 'Home', icon: 'solar:home-bold-duotone' },
  { id: 'products', label: 'Products', icon: 'solar:bag-bold-duotone' },
  { id: 'customers', label: 'Customers', icon: 'solar:users-group-rounded-bold-duotone' },
];

export const MobileBottomNav = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
  return (
    <div className="fixed bottom-[15px] left-[15px] right-[15px] h-[75px] bg-[#0F172A] rounded-[24px] flex justify-around items-center px-[10px] z-[999] md:hidden shadow-2xl">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center w-full h-full rounded-[18px] transition-all duration-300 ${
              isActive 
                ? 'bg-gradient-to-br from-[#2563EB] to-[#7C3AED] text-white -translate-y-[8px] shadow-[0_10px_25px_rgba(37,99,235,0.35)]' 
                : 'text-[#94A3B8]'
            }`}
          >
            <Icon icon={item.icon} className="text-2xl" />
            <span className="text-[10px] font-bold mt-1">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
