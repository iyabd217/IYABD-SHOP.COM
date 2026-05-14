import React from 'react';
import { Icon } from '@iconify/react';
import { useSettings } from '../../context/SettingsContext';

const menuItems = [
  { name: "Dashboard", icon: "solar:widget-3-bold-duotone", path: "/admin" },
  { name: "Products", icon: "solar:bag-bold-duotone", path: "/admin/products" },
  { name: "Categories", icon: "solar:folder-open-bold-duotone", path: "/admin/categories" },
  { name: "Orders", icon: "solar:box-bold-duotone", path: "/admin/orders" },
  { name: "Customers", icon: "solar:users-group-rounded-bold-duotone", path: "/admin/customers" },
  { name: "Marketing", icon: "solar:megaphone-bold-duotone", path: "/admin/marketing" },
  { name: "Analytics", icon: "solar:chart-square-bold-duotone", path: "/admin/analytics" },
  { name: "Reports", icon: "solar:document-text-bold-duotone", path: "/admin/reports" },
  { name: "Manage Shop", icon: "solar:settings-bold-duotone", path: "/admin/settings" }
];

export const AdminSidebar = () => {
    const { settings } = useSettings();
  return (
    <aside className="admin-sidebar p-4">
      <div className="flex items-center gap-3 px-4 mb-10 pt-4">
        <img src={settings.logo} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md" alt="Logo" />
        <div className="flex flex-col">
            <span className="text-white font-bold text-sm">{settings.companyName}</span>
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">CMS</span>
        </div>
      </div>
      
      {menuItems.map((item, index) => (
        <div key={index} className={`menu-item ${index === 0 ? 'active' : ''}`}>
            <div className="menu-icon">
                <Icon icon={item.icon} />
            </div>
            <span className="text-white font-semibold text-sm font-['Poppins']">{item.name}</span>
        </div>
      ))}
    </aside>
  );
};
