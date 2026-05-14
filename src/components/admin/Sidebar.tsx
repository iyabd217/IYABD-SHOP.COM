import React from 'react';
import { motion } from 'motion/react';
import { Icon } from '@iconify/react';

const SidebarItem = ({ icon, label, gradient, activeTab, onClick }: any) => {
  const normalizedLabel = label.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
  const isActive = activeTab === normalizedLabel;
  
  return (
    <motion.button
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(normalizedLabel)}
      className={`menu-item group ${isActive ? 'active' : ''}`}
    >
      <div className={`menu-icon bg-gradient-to-br ${gradient} shadow-md group-hover:rotate-6 transition-transform duration-300`}>
        <Icon icon={icon} />
      </div>
      <span className={`font-['Poppins'] font-semibold text-sm ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{label}</span>
      {isActive && <motion.div layoutId="activeGlow" className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />}
    </motion.button>
  );
};

export const Sidebar = ({ activeTab, setActiveTab }: any) => {
  const menuSections = [
    {
      title: "Profile",
      items: [
        { icon: "solar:user-bold-duotone", label: "My Profile", gradient: "from-purple-500 to-blue-600" },
        { icon: "solar:gallery-wide-bold-duotone", label: "Upload Logo", gradient: "from-orange-500 to-pink-500" },
        { icon: "solar:buildings-bold-duotone", label: "Company Details", gradient: "from-cyan-500 to-blue-500" },
      ]
    },
    {
      title: "Main Control",
      items: [
           { icon: "solar:widget-3-bold-duotone", label: "Dashboard", gradient: "from-blue-500 to-cyan-500" },
           { icon: "solar:bag-bold-duotone", label: "Products", gradient: "from-orange-500 to-yellow-500" },
           { icon: "solar:folder-open-bold-duotone", label: "Categories", gradient: "from-purple-500 to-pink-500" },
           { icon: "solar:box-bold-duotone", label: "Orders", gradient: "from-emerald-500 to-teal-500" },
           { icon: "solar:users-group-rounded-bold-duotone", label: "Customers", gradient: "from-blue-500 to-purple-500" },
           { icon: "solar:megaphone-bold-duotone", label: "Marketing", gradient: "from-red-500 to-orange-500" },
           { icon: "solar:tag-horizontal-bold-duotone", label: "Promo Codes", gradient: "from-green-500 to-emerald-500" },
           { icon: "solar:chart-square-bold-duotone", label: "Analytics", gradient: "from-teal-500 to-cyan-500" },
           { icon: "solar:document-text-bold-duotone", label: "Reports", gradient: "from-slate-500 to-blue-500" },
           { icon: "solar:settings-bold-duotone", label: "Manage Shop", gradient: "from-slate-700 to-indigo-600" },
           { icon: "solar:book-bold-duotone", label: "Blog Engine", gradient: "from-indigo-500 to-violet-500" },
            { icon: "solar:delivery-bold-duotone", label: "Delivery System", gradient: "from-orange-500 to-amber-500" },
            { icon: "solar:card-bold-duotone", label: "Billing", gradient: "from-lime-500 to-green-500" },
            { icon: "solar:hand-stars-bold-duotone", label: "Reviews", gradient: "from-yellow-400 to-orange-500" },
            { icon: "solar:refresh-bold-duotone", label: "Returns", gradient: "from-red-400 to-rose-600" },
            { icon: "solar:shop-2-bold-duotone", label: "Inventory", gradient: "from-blue-400 to-indigo-600" },
            { icon: "solar:map-arrow-square-bold-duotone", label: "SEO", gradient: "from-sky-400 to-cyan-600" },
            { icon: "solar:chat-round-bold-duotone", label: "Live Chat", gradient: "from-pink-400 to-rose-600" },
            { icon: "solar:gallery-bold-duotone", label: "Media Library", gradient: "from-purple-400 to-indigo-600" },
            { icon: "solar:phone-bold-duotone", label: "Mobile App", gradient: "from-blue-400 to-purple-600" },
             { icon: "solar:shield-check-bold-duotone", label: "Security", gradient: "from-slate-500 to-slate-700" },
             { icon: "solar:users-group-rounded-bold-duotone", label: "Staff", gradient: "from-gray-500 to-zinc-600" },
             { icon: "solar:globus-bold-duotone", label: "Language", gradient: "from-emerald-400 to-teal-600" },
             { icon: "solar:stars-bold-duotone", label: "AI Manager", gradient: "from-indigo-400 to-purple-600" },
             { icon: "solar:help-bold-duotone", label: "Help Center", gradient: "from-sky-500 to-purple-500" }
      ]
    }
  ];

  return (
    <aside className="admin-sidebar p-4 md:flex flex-col overflow-y-auto custom-scrollbar">
      {/* Brand Control Center */}
      <div className="bg-[#1e293b] rounded-3xl p-5 mb-8 border border-white/5 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
                <Icon icon="solar:crown-bold-duotone" className="text-white text-2xl" />
            </div>
            <div className="flex flex-col">
                <span className="text-white font-bold text-sm">FashionAdmin</span>
                <span className="text-emerald-400 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
                    <Icon icon="solar:check-circle-bold" /> Verified
                </span>
            </div>
        </div>
        <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-xs font-semibold backdrop-blur-sm transition-colors">
            Brand Control Center
        </button>
      </div>
      
      <div className="space-y-6">
        {menuSections.map((section, idx) => (
            <div key={idx}>
                <p className="text-[10px] uppercase font-black text-slate-500 mb-4 px-4 tracking-[0.2em]">{section.title}</p>
                <div className="space-y-1">
                    {section.items.map((item, i) => (
                       <SidebarItem key={i} {...item} activeTab={activeTab} onClick={setActiveTab} />
                    ))}
                </div>
            </div>
        ))}
      </div>
    </aside>
  );
};
