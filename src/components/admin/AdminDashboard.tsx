import React, { useState, useEffect, Suspense } from 'react';
import { Sidebar } from './Sidebar';
import { AdminHeader } from './AdminHeader';
import { useSettings } from '../../context/SettingsContext';
import { demoProducts } from '../../lib/demoData';
import { 
  Banknote, Box, Users, Tag, RotateCcw, 
  ShoppingBag, Image as ImageIcon, Zap, Ticket, BarChart3, FolderTree, Package, TrendingUp
} from 'lucide-react';

import CompanyDetailsSettings from './CompanyDetailsSettings';
import ProfileSettings from './ProfileSettings';
import ShopSettings from './ShopSettings';
import ManageProducts from './ManageProducts';
import CategoryProductsManagement from './CategoryProductsManagement';
import ManageCategories from './ManageCategories';
import AdminOrders from './AdminOrders';
import MarketingCampaigns from './MarketingCampaigns';
import AnalyticsDashboard from './AnalyticsDashboard';
import BlogManagement from './BlogManagement';
import CourierManagement from './CourierManagement';
import BillingSettings from './BillingSettings';
import HelpCenterSettings from './HelpCenterSettings';
import ManageBanners from './ManageBanners';
import { FlashSaleManagement } from '../shop/FlashSaleManagement';
import { AdminSupportCenter } from './AdminSupportCenter';

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

import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { adminService } from '../../lib/adminServices';
import toast, { Toaster } from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const HomeContent = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
    const { settings } = useSettings();
    const [orders, setOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        const fetchMisc = async () => {
            try {
                const prods = await adminService.getProducts();
                setProducts(prods || []);
            } catch (err) {
                console.error("Failed to fetch admin products", err);
            }
        };
        fetchMisc();

        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        let initialLoadCompleted = false;

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Check for new order after initial load
            if (initialLoadCompleted) {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const newOrder = change.doc.data();
                        toast.success(`New order received! ৳${newOrder.total}`, {
                            icon: '🛍️',
                            style: { borderRadius: '100px', background: '#333', color: '#fff' }
                        });
                        // play notification sound using built-in HTML5 audio
                        const audio = new Audio('/notification.mp3'); // We'll just try to play standard ding or rely on Toast
                        audio.play().catch(e => console.log('Audio disabled'));
                    }
                });
            }

            setOrders(fetchedOrders);
            setIsInitialLoad(false);
            initialLoadCompleted = true;
        }, (error) => {
            console.error("Firestore onSnapshot error:", error);
            toast.error("You don't have permission to view orders or session expired.");
            setIsInitialLoad(false); // Stop loader even on error
        });

        return () => unsubscribe();
    }, []);

    // Calculations
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    let totalRevenue = 0;
    let todayRevenue = 0;
    let monthlyRevenue = 0;
    
    let pendingCount = 0;
    let confirmedCount = 0;
    let deliveredCount = 0;
    let returnCount = 0;

    const uniqueCustomers = new Set<string>();

    orders.forEach(order => {
        if (order.userId) uniqueCustomers.add(order.userId);
        
        if (order.status === 'pending') pendingCount++;
        else if (order.status === 'confirmed') confirmedCount++;
        else if (order.status === 'delivered') deliveredCount++;
        else if (order.status === 'return_requested' || order.status === 'returned') returnCount++;

        // Revenues (ignoring cancelled for revenue)
        if (order.status !== 'cancelled' && order.status !== 'returned') {
            const amount = Number(order.total) || 0;
            totalRevenue += amount;
            
            const dateStr = order.createdAt?.split('T')[0];
            if (dateStr === todayStr) {
                todayRevenue += amount;
            }
            if (dateStr) {
                const dateObj = new Date(dateStr);
                if (dateObj.getMonth() === thisMonth && dateObj.getFullYear() === thisYear) {
                    monthlyRevenue += amount;
                }
            }
        }
    });

    const recentOrders = orders.slice(0, 5);

    // Format currency
    const formatMoney = (amount: number) => `৳ ${amount.toLocaleString('en-IN')}`;

    return (
        <div className="dashboard-wrapper relative">
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
            
            {/* ... Skeleton if loading ... */}
            {isInitialLoad && (
                <div className="absolute inset-0 bg-[#F8F9FC] z-10 p-8 flex flex-col gap-6">
                    <div className="h-20 bg-slate-200 animate-pulse rounded-2xl w-full max-w-md"></div>
                    <div className="h-40 bg-slate-200 animate-pulse rounded-3xl w-full"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-2xl"></div>)}
                    </div>
                </div>
            )}

            <div className="mb-6">
               <h1 className="text-[18px] font-bold text-slate-800">Overview</h1>
               <p className="text-[12px] text-slate-500 font-medium">Welcome back, here's what's happening with your store today.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-[10px] mb-8">
               {/* Total Revenue */}
               <div className="bg-white rounded-[18px] p-3 shadow-sm border border-slate-100/60 h-[90px] lg:h-[100px] hover:shadow-md hover:-translate-y-0.5 transition-all group flex flex-col justify-between">
                   <div className="flex items-start justify-between">
                       <h3 className="text-[12px] font-medium text-slate-500 leading-none">Total Revenue</h3>
                       <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center shadow-inner">
                           <Banknote size={14} className="text-purple-600 drop-shadow-sm" />
                       </div>
                   </div>
                   <div className="flex items-end justify-between">
                       <h2 className="text-[22px] lg:text-[24px] font-bold text-slate-800 leading-none tracking-tight">{formatMoney(totalRevenue)}</h2>
                       <span className="text-[11px] font-medium text-slate-400 mb-0.5">+4.5%</span>
                   </div>
               </div>

               {/* Today Revenue */}
               <div className="bg-white rounded-[18px] p-3 shadow-sm border border-slate-100/60 h-[90px] lg:h-[100px] hover:shadow-md hover:-translate-y-0.5 transition-all group flex flex-col justify-between">
                   <div className="flex items-start justify-between">
                       <h3 className="text-[12px] font-medium text-slate-500 leading-none">Today Revenue</h3>
                       <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center shadow-inner">
                           <Banknote size={14} className="text-purple-600 drop-shadow-sm" />
                       </div>
                   </div>
                   <div className="flex items-end justify-between">
                       <h2 className="text-[22px] lg:text-[24px] font-bold text-slate-800 leading-none tracking-tight">{formatMoney(todayRevenue)}</h2>
                       <span className="text-[11px] font-medium text-slate-400 mb-0.5">+12%</span>
                   </div>
               </div>

               {/* Pending Orders */}
               <div className="bg-white rounded-[18px] p-3 shadow-sm border border-slate-100/60 h-[90px] lg:h-[100px] hover:shadow-md hover:-translate-y-0.5 transition-all group flex flex-col justify-between">
                   <div className="flex items-start justify-between">
                       <h3 className="text-[12px] font-medium text-slate-500 leading-none">Pending Orders</h3>
                       <div className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center shadow-inner">
                           <ShoppingBag size={14} className="text-orange-600 drop-shadow-sm" />
                       </div>
                   </div>
                   <div className="flex items-end justify-between">
                       <h2 className="text-[22px] lg:text-[24px] font-bold text-slate-800 leading-none tracking-tight">{pendingCount}</h2>
                       <span className="text-[11px] font-medium text-slate-400 mb-0.5">-1</span>
                   </div>
               </div>

               {/* Delivered Orders */}
               <div className="bg-white rounded-[18px] p-3 shadow-sm border border-slate-100/60 h-[90px] lg:h-[100px] hover:shadow-md hover:-translate-y-0.5 transition-all group flex flex-col justify-between">
                   <div className="flex items-start justify-between">
                       <h3 className="text-[12px] font-medium text-slate-500 leading-none">Delivered</h3>
                       <div className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center shadow-inner">
                           <Package size={14} className="text-orange-600 drop-shadow-sm" />
                       </div>
                   </div>
                   <div className="flex items-end justify-between">
                       <h2 className="text-[22px] lg:text-[24px] font-bold text-slate-800 leading-none tracking-tight">{deliveredCount}</h2>
                       <span className="text-[11px] font-medium text-slate-400 mb-0.5">+8</span>
                   </div>
               </div>

               {/* Customers */}
               <div className="bg-white rounded-[18px] p-3 shadow-sm border border-slate-100/60 h-[90px] lg:h-[100px] hover:shadow-md hover:-translate-y-0.5 transition-all group flex flex-col justify-between">
                   <div className="flex items-start justify-between">
                       <h3 className="text-[12px] font-medium text-slate-500 leading-none">Customers</h3>
                       <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center shadow-inner">
                           <Users size={14} className="text-blue-600 drop-shadow-sm" />
                       </div>
                   </div>
                   <div className="flex items-end justify-between">
                       <h2 className="text-[22px] lg:text-[24px] font-bold text-slate-800 leading-none tracking-tight">{uniqueCustomers.size > 0 ? uniqueCustomers.size : 12}</h2>
                       <span className="text-[11px] font-medium text-slate-400 mb-0.5">+3</span>
                   </div>
               </div>

               {/* Products */}
               <div className="bg-white rounded-[18px] p-3 shadow-sm border border-slate-100/60 h-[90px] lg:h-[100px] hover:shadow-md hover:-translate-y-0.5 transition-all group flex flex-col justify-between">
                   <div className="flex items-start justify-between">
                       <h3 className="text-[12px] font-medium text-slate-500 leading-none">Products</h3>
                       <div className="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center shadow-inner">
                           <Tag size={14} className="text-green-600 drop-shadow-sm" />
                       </div>
                   </div>
                   <div className="flex items-end justify-between">
                       <h2 className="text-[22px] lg:text-[24px] font-bold text-slate-800 leading-none tracking-tight">{products.length}</h2>
                       <span className="text-[11px] font-medium text-slate-400 mb-0.5">Active</span>
                   </div>
               </div>

               {/* Monthly Revenue */}
               <div className="bg-white rounded-[18px] p-3 shadow-sm border border-slate-100/60 h-[90px] lg:h-[100px] hover:shadow-md hover:-translate-y-0.5 transition-all group flex flex-col justify-between">
                   <div className="flex items-start justify-between">
                       <h3 className="text-[12px] font-medium text-slate-500 leading-none">Monthly Rev</h3>
                       <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center shadow-inner">
                           <TrendingUp size={14} className="text-purple-600 drop-shadow-sm" />
                       </div>
                   </div>
                   <div className="flex items-end justify-between">
                       <h2 className="text-[22px] lg:text-[24px] font-bold text-slate-800 leading-none tracking-tight">{formatMoney(monthlyRevenue)}</h2>
                       <span className="text-[11px] font-medium text-slate-400 mb-0.5">This Mo</span>
                   </div>
               </div>

               {/* Return Orders */}
               <div className="bg-white rounded-[18px] p-3 shadow-sm border border-slate-100/60 h-[90px] lg:h-[100px] hover:shadow-md hover:-translate-y-0.5 transition-all group flex flex-col justify-between">
                   <div className="flex items-start justify-between">
                       <h3 className="text-[12px] font-medium text-slate-500 leading-none">Return Orders</h3>
                       <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center shadow-inner">
                           <RotateCcw size={14} className="text-red-500 drop-shadow-sm" />
                       </div>
                   </div>
                   <div className="flex items-end justify-between">
                       <h2 className="text-[22px] lg:text-[24px] font-bold text-slate-800 leading-none tracking-tight">{returnCount}</h2>
                       <span className="text-[11px] font-medium text-slate-400 mb-0.5">Issues</span>
                   </div>
               </div>
            </div>

            <h3 className="text-[13px] font-bold text-slate-800 mt-2 mb-3 tracking-wide">Quick Actions</h3>
            <div className="grid grid-cols-4 gap-[10px] lg:flex lg:flex-wrap mb-8">
               <button onClick={() => setActiveTab('products')} className="flex flex-col items-center justify-center bg-white rounded-[18px] shadow-sm border border-slate-100/60 w-full h-[80px] lg:w-[80px] hover:-translate-y-0.5 hover:shadow-md transition-all group">
                   <div className="w-8 h-8 rounded-full bg-blue-50/80 flex items-center justify-center mb-1 shadow-inner">
                       <Box size={16} className="text-blue-600" />
                   </div>
                   <span className="text-[11px] font-medium text-slate-600">Product</span>
               </button>
               <button onClick={() => setActiveTab('banners')} className="flex flex-col items-center justify-center bg-white rounded-[18px] shadow-sm border border-slate-100/60 w-full h-[80px] lg:w-[80px] hover:-translate-y-0.5 hover:shadow-md transition-all group">
                   <div className="w-8 h-8 rounded-full bg-purple-50/80 flex items-center justify-center mb-1 shadow-inner">
                       <ImageIcon size={16} className="text-purple-600" />
                   </div>
                   <span className="text-[11px] font-medium text-slate-600">Banner</span>
               </button>
               <button onClick={() => setActiveTab('orders')} className="flex flex-col items-center justify-center bg-white rounded-[18px] shadow-sm border border-slate-100/60 w-full h-[80px] lg:w-[80px] hover:-translate-y-0.5 hover:shadow-md transition-all group">
                   <div className="w-8 h-8 rounded-full bg-orange-50/80 flex items-center justify-center mb-1 shadow-inner">
                       <ShoppingBag size={16} className="text-orange-600" />
                   </div>
                   <span className="text-[11px] font-medium text-slate-600">Orders</span>
               </button>
               <button onClick={() => setActiveTab('customers')} className="flex flex-col items-center justify-center bg-white rounded-[18px] shadow-sm border border-slate-100/60 w-full h-[80px] lg:w-[80px] hover:-translate-y-0.5 hover:shadow-md transition-all group">
                   <div className="w-8 h-8 rounded-full bg-blue-50/80 flex items-center justify-center mb-1 shadow-inner">
                       <Users size={16} className="text-blue-600" />
                   </div>
                   <span className="text-[11px] font-medium text-slate-600">People</span>
               </button>
               <button onClick={() => setActiveTab('categories')} className="flex flex-col items-center justify-center bg-white rounded-[18px] shadow-sm border border-slate-100/60 w-full h-[80px] lg:w-[80px] hover:-translate-y-0.5 hover:shadow-md transition-all group">
                   <div className="w-8 h-8 rounded-full bg-pink-50/80 flex items-center justify-center mb-1 shadow-inner">
                       <FolderTree size={16} className="text-pink-600" />
                   </div>
                   <span className="text-[11px] font-medium text-slate-600">Category</span>
               </button>
               <button onClick={() => setActiveTab('flash-sale')} className="flex flex-col items-center justify-center bg-white rounded-[18px] shadow-sm border border-slate-100/60 w-full h-[80px] lg:w-[80px] hover:-translate-y-0.5 hover:shadow-md transition-all group">
                   <div className="w-8 h-8 rounded-full bg-red-50/80 flex items-center justify-center mb-1 shadow-inner">
                       <Zap size={16} className="text-red-600" />
                   </div>
                   <span className="text-[11px] font-medium text-slate-600">Sales</span>
               </button>
               <button onClick={() => setActiveTab('promo-codes')} className="flex flex-col items-center justify-center bg-white rounded-[18px] shadow-sm border border-slate-100/60 w-full h-[80px] lg:w-[80px] hover:-translate-y-0.5 hover:shadow-md transition-all group">
                   <div className="w-8 h-8 rounded-full bg-indigo-50/80 flex items-center justify-center mb-1 shadow-inner">
                       <Ticket size={16} className="text-indigo-600" />
                   </div>
                   <span className="text-[11px] font-medium text-slate-600">Coupons</span>
               </button>
               <button onClick={() => setActiveTab('reports')} className="flex flex-col items-center justify-center bg-white rounded-[18px] shadow-sm border border-slate-100/60 w-full h-[80px] lg:w-[80px] hover:-translate-y-0.5 hover:shadow-md transition-all group">
                   <div className="w-8 h-8 rounded-full bg-teal-50/80 flex items-center justify-center mb-1 shadow-inner">
                       <BarChart3 size={16} className="text-teal-600" />
                   </div>
                   <span className="text-[11px] font-medium text-slate-600">Reports</span>
               </button>
            </div>

            <div className="chart-card">
               <div className="flex items-center justify-between mb-6">
                   <h3 className="text-xl font-bold text-slate-800">Sales Analytics</h3>
                   <select className="bg-slate-50 border border-slate-100 text-sm font-bold text-slate-600 rounded-xl px-3 py-1.5 outline-none">
                       <option>Today</option>
                       <option>7 Days</option>
                       <option>30 Days</option>
                       <option>12 Months</option>
                   </select>
               </div>
               <div className="h-[300px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={[
                           { name: 'Mon', sales: 4000, orders: 24 },
                           { name: 'Tue', sales: 3000, orders: 13 },
                           { name: 'Wed', sales: 5000, orders: 38 },
                           { name: 'Thu', sales: 2780, orders: 39 },
                           { name: 'Fri', sales: 6890, orders: 48 },
                           { name: 'Sat', sales: 8390, orders: 38 },
                           { name: 'Sun', sales: 10490, orders: 43 },
                       ]} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                           <defs>
                               <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                               </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                           <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dx={-10} tickFormatter={(val) => `৳${val/1000}k`} />
                           <Tooltip 
                               contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                               labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                               formatter={(val: number) => [`৳${val}`, 'Sales']}
                           />
                           <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                       </AreaChart>
                   </ResponsiveContainer>
               </div>
            </div>

            <h3 className="text-xl font-bold text-slate-800 mt-10 mb-4">Recent Orders</h3>
            {recentOrders.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-100">
                    <p className="text-slate-500 font-bold">No Orders Yet</p>
                </div>
            ) : (
                recentOrders.map(order => (
                    <div key={order.id} className="order-item cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('orders')}>
                       <div>
                          <h4 className="font-bold text-slate-800">{order.customerDetails?.name || 'Customer'}</h4>
                          <p className="text-xs text-slate-500">ID: #{order.id.slice(-6).toUpperCase()}</p>
                       </div>
                       <div className="text-right flex flex-col items-end">
                          <span className="font-black text-slate-800">{formatMoney(order.total)}</span>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black mt-1 ${
                              order.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                              order.status === 'confirmed' ? 'bg-blue-100 text-blue-600' :
                              order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                              'bg-slate-100 text-slate-600'
                          }`}>
                              {order.status?.toUpperCase() || 'PENDING'}
                          </span>
                       </div>
                    </div>
                ))
            )}
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
                            case 'dashboard': return <HomeContent setActiveTab={setActiveTab} />;
                            case 'my-profile': return <ProfileSettings />;
                            case 'upload-logo': return <ShopSettings />;
                            case 'company-details': return <CompanyDetailsSettings />;
                            case 'category-products': return <CategoryProductsManagement />;
                            case 'products': return <ManageProducts />;
                            case 'categories': return <ManageCategories />;
                            case 'orders': return <AdminOrders />;
                            case 'customers': return <PlaceholderPage title="Customers" />;
                            case 'marketing': return <MarketingCampaigns />;
                            case 'support-center': return <AdminSupportCenter setActiveTab={setActiveTab} />;
                            case 'flash-sale': return <FlashSaleManagement />;
                            case 'banner-slider': return <ManageCategories />;
                            case 'category-banners': return <ManageCategories />;
                            case 'site-settings': return <ShopSettings />;
                            case 'promo-codes': return <PlaceholderPage title="Promo Codes" />;
                            case 'analytics': return <AnalyticsDashboard />;
                            case 'reports': return <PlaceholderPage title="Reports" />;
                            case 'manage-shop': return <ShopSettings />;
                            case 'blog-engine': return <BlogManagement />;
                            case 'delivery-system': return <CourierManagement />;
                            case 'billing': return <BillingSettings />;
                            case 'banners': return <ManageBanners />;
                            case 'help-center': return <HelpCenterSettings />;
                            case 'support-center-manager': return <HelpCenterSettings />;
                            case 'inventory': return <PlaceholderPage title="Inventory" />;
                            case 'seo': return <PlaceholderPage title="SEO" />;
                            case 'live-chat': return <PlaceholderPage title="Live Chat" />;
                            case 'media-library': return <PlaceholderPage title="Media Library" />;
                            case 'mobile-app': return <PlaceholderPage title="Mobile App" />;
                            case 'security': return <PlaceholderPage title="Security" />;
                            case 'staff': return <PlaceholderPage title="Staff" />;
                            case 'language': return <PlaceholderPage title="Language" />;
                            case 'ai-manager': return <PlaceholderPage title="AI Manager" />;
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
                <AdminHeader toggleSidebar={toggleSidebar} setActiveTab={setActiveTab} />
                <main className="min-h-screen bg-[#F8F9FC]">{renderContent()}</main>
            </div>
        </div>
    );
};

export default AdminDashboard;
