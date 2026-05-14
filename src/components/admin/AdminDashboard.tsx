import React, { useState, Suspense } from 'react';
import { Sidebar } from './Sidebar';
import { AdminHeader } from './AdminHeader';
import { useSettings } from '../../context/SettingsContext';
import { demoProducts } from '../../lib/demoData';

import CompanyDetailsSettings from './CompanyDetailsSettings';
import ProfileSettings from './ProfileSettings';
import ShopSettings from './ShopSettings';
import ManageProducts from './ManageProducts';
import ManageCategories from './ManageCategories';
import AdminOrders from './AdminOrders';
import MarketingCampaigns from './MarketingCampaigns';
import AnalyticsDashboard from './AnalyticsDashboard';
import BlogManagement from './BlogManagement';
import CourierManagement from './CourierManagement';
import BillingSettings from './BillingSettings';
import HelpCenterSettings from './HelpCenterSettings';
import ManageBanners from './ManageBanners';

// Placeholder Pages with Real Demo Content
const SkeletonLoader = () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-slate-200 rounded-lg w-1/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>)}
      </div>
      <div className="h-64 bg-slate-200 rounded-2xl"></div>
    </div>
);

const HomeContent = () => {
    const { settings } = useSettings();
    return (
        <div className="dashboard-grid">
            <div className="dashboard-card shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                <h3 className="text-lg font-bold">{settings.companyName} Overview</h3>
                <p className="text-3xl font-black mt-2">৳ 12,40,000</p>
                <p className="text-xs mt-1 opacity-80">Total Revenue</p>
            </div>
            <div className="dashboard-card shadow-lg border-l-4 border-primary">
                <h3 className="text-lg font-bold text-slate-800">Pending Orders</h3>
                <p className="text-3xl font-black text-slate-900 mt-2">{demoProducts.length * 5}</p>
            </div>
        </div>
    );
};

const PlaceholderPage = ({ title }: { title: string }) => (
    <div className="p-10 bg-white rounded-3xl shadow-sm border border-slate-100 text-center">
        <h2 className="text-2xl font-bold text-slate-800 capitalize">{title}</h2>
        <p className="text-slate-500 mt-2">Dynamic content for {title} arriving soon.</p>
    </div>
);

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { settings } = useSettings();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const renderContent = () => {
        return (
            <div className={activeTab === 'products' ? "" : "dashboard-content pb-24 p-6"}>
                {activeTab !== 'products' && (
                    <div className="flex justify-between items-center mb-8">
                        <div className="text-2xl font-black text-slate-800 capitalize">{activeTab.replace(/-/g, ' ')}</div>
                        <div className="text-xs font-bold text-slate-400">{settings.companyName} Panel</div>
                    </div>
                )}
                <Suspense fallback={<SkeletonLoader />}>
                    {(() => {
                        switch (activeTab) {
                            case 'dashboard': return <HomeContent />;
                            case 'my-profile': return <ProfileSettings />;
                            case 'upload-logo': return <ShopSettings />;
                            case 'company-details': return <CompanyDetailsSettings />;
                            case 'products': return <ManageProducts />;
                            case 'categories': return <ManageCategories />;
                            case 'orders': return <AdminOrders />;
                            case 'customers': return <PlaceholderPage title="Customers" />;
                            case 'marketing': return <MarketingCampaigns />;
                            case 'promo-codes': return <PlaceholderPage title="Promo Codes" />;
                            case 'analytics': return <AnalyticsDashboard />;
                            case 'reports': return <PlaceholderPage title="Reports" />;
                            case 'manage-shop': return <ShopSettings />;
                            case 'blog-engine': return <BlogManagement />;
                            case 'delivery-system': return <CourierManagement />;
                            case 'billing': return <BillingSettings />;
                            case 'banners': return <ManageBanners />;
                            case 'help-center': return <HelpCenterSettings />;
                            case 'inventory': return <PlaceholderPage title="Inventory" />;
                            case 'seo': return <PlaceholderPage title="SEO" />;
                            case 'live-chat': return <PlaceholderPage title="Live Chat" />;
                            case 'media-library': return <PlaceholderPage title="Media Library" />;
                            case 'mobile-app': return <PlaceholderPage title="Mobile App" />;
                            case 'security': return <PlaceholderPage title="Security" />;
                            case 'staff': return <PlaceholderPage title="Staff" />;
                            case 'language': return <PlaceholderPage title="Language" />;
                            case 'ai-manager': return <PlaceholderPage title="AI Manager" />;
                            case 'help-center': return <PlaceholderPage title="Help Center" />;
                            default: return <PlaceholderPage title={activeTab.replace(/-/g, ' ')} />;
                        }
                    })()}
                </Suspense>
            </div>
        );
    };

    return (
        <div className="admin-layout min-h-screen bg-[#F3F4F6] relative">
            {/* Dark Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-[9998] backdrop-blur-sm" 
                    onClick={toggleSidebar}
                ></div>
            )}
            
            {/* Floating Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-[9999] w-[290px] bg-[#081028] transition-transform duration-400 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} rounded-r-3xl overflow-hidden shadow-2xl`}>
                <Sidebar activeTab={activeTab} setActiveTab={(tab: string) => { setActiveTab(tab); setIsSidebarOpen(false); }} />
            </div>
            
            {/* Main Content Area */}
            <div className={`admin-main flex flex-col w-full min-h-screen transition-all duration-300`}>
                <AdminHeader toggleSidebar={toggleSidebar} />
                <main className="min-h-screen bg-[#F8F9FC]">{renderContent()}</main>
            </div>
        </div>
    );
};

export default AdminDashboard;
