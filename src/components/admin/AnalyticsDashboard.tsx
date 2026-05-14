import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, ShoppingBag, Users, 
  ArrowUpRight, ArrowDownRight, Calendar, PieChart
} from 'lucide-react';
import { adminService } from '../../lib/adminServices';
import { formatPrice } from '../../lib/utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const AnalyticsDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const data = await adminService.getAnalyticsSummary();
            setStats(data);
            setLoading(false);
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-10 text-center animate-pulse font-black text-slate-300">CALCULATING METRICS...</div>;

    const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 ${color} bg-opacity-10 rounded-xl flex items-center justify-center ${color.replace('bg-', 'text-')}`}>
                    <Icon size={20} />
                </div>
                <span className={`flex items-center text-[10px] font-black ${change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {Math.abs(change)}%
                </span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-2xl font-black text-slate-900">{value}</h3>
        </div>
    );

    return (
        <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <StatCard 
                    title="Revenue" 
                    value={formatPrice(stats?.totalRevenue || 0)} 
                    change={12.5} 
                    icon={TrendingUp} 
                    color="bg-purple-600" 
                />
                <StatCard 
                    title="Orders" 
                    value={stats?.totalOrders || 0} 
                    change={8.2} 
                    icon={ShoppingBag} 
                    color="bg-emerald-600" 
                />
            </div>

            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Sales Over Time</h3>
                    <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-bold text-slate-500">Last 7 Days</div>
                </div>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats?.salesByDay || []}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }}
                                tickFormatter={(val) => val.split('-').slice(1).join('/')}
                            />
                            <YAxis hide />
                            <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 900 }}
                            />
                            <Area type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-slate-900 rounded-[32px] p-6 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <PieChart size={18} className="text-purple-400" />
                        <h3 className="text-sm font-black uppercase tracking-tight">Top Traffic Sources</h3>
                    </div>
                    <div className="space-y-4">
                        {[
                            { label: 'Facebook Ads', value: 65, color: 'bg-blue-500' },
                            { label: 'Direct Traffic', value: 25, color: 'bg-emerald-500' },
                            { label: 'Organic Search', value: 10, color: 'bg-white/20' }
                        ].map((s, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mb-1.5">
                                    <span>{s.label}</span>
                                    <span>{s.value}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className={`h-full ${s.color}`} style={{ width: `${s.value}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4">Conversion Funnel</h3>
                <div className="space-y-3">
                    {[
                        { label: 'Views', value: stats?.totalOrders * 20 || 842, sub: 'Product visits' },
                        { label: 'Cart', value: stats?.totalOrders * 5 || 210, sub: 'Add to cart' },
                        { label: 'Checkout', value: stats?.totalOrders * 1.5 || 63, sub: 'Initiated' },
                        { label: 'Purchase', value: stats?.totalOrders || 42, sub: 'Success' },
                    ].map((step, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="w-12 text-[10px] font-black text-slate-400 uppercase tracking-tight">{step.label}</div>
                            <div className="flex-1 h-3 bg-slate-50 rounded-full overflow-hidden">
                                <div className="h-full bg-slate-900" style={{ width: `${100 - (i * 20)}%` }} />
                            </div>
                            <div className="w-10 text-right text-xs font-black text-slate-800">{step.value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
