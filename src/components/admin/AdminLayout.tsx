import React from 'react';
import { Sidebar } from './Sidebar';
import { AdminHeader } from './AdminHeader';

export const AdminLayout = ({ children, toggleSidebar }: { children: React.ReactNode, toggleSidebar: () => void }) => {
  return (
    <div className="admin-layout">
      <Sidebar activeTab="" setActiveTab={() => {}} />
      <div className="admin-main">
        <AdminHeader toggleSidebar={toggleSidebar} />
        {children}
      </div>
    </div>
  );
};
