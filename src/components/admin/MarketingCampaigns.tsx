import React, { useState, useEffect } from 'react';
import { 
  Zap, Calendar, Clock, Target, Gift, Plus,
  TrendingUp, ArrowRight, Trash2, Edit2, 
  ToggleLeft, ToggleRight, Sparkles, Tag, PieChart
} from 'lucide-react';
import { adminService } from '../../lib/adminServices';

const MarketingCampaigns = () => {
    const [activeTab, setActiveTab] = useState('flash');
    const [campaigns, setCampaigns] = useState<any[]>([]);

    const CampaignCard = ({ title, status, reach, color }: any) => (
        <div className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between group">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${color} bg-opacity-10 rounded-2xl flex items-center justify-center ${color.replace('bg-', 'text-')}`}>
                    <Zap size={20} />
                </div>
                <div>
                    <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">{title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{status} • {reach} Reach</span>
                    </div>
                </div>
            </div>
            <button className="w-9 h-9 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full group-hover:bg-slate-900 group-hover:text-white transition-all">
                <ArrowRight size={16} />
            </button>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="p-4 flex gap-2 bg-white border-b border-slate-100 overflow-x-auto no-scrollbar">
                {[
                    { id: 'flash', label: 'Flash Sales', icon: Zap },
                    { id: 'coupons', label: 'Coupons', icon: Tag },
                    { id: 'popups', label: 'Marketing Popups', icon: Sparkles },
                    { id: 'analytics', label: 'Performance', icon: PieChart }
                ].map((tab) => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeTab === 'flash' && (
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-[32px] p-6 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-orange-100 mb-1">Live Experiment</p>
                                        <h3 className="text-2xl font-black italic tracking-tighter">FLASH SALE ENGINE</h3>
                                    </div>
                                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                        <Zap size={20} className="text-white" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20">
                                        <p className="text-[9px] font-bold uppercase tracking-tight">Time Left</p>
                                        <p className="font-black text-lg">04:12:45</p>
                                    </div>
                                    <button className="flex-1 h-12 bg-white text-orange-600 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all">
                                        Manage Timer
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center px-1">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Featured Deals</h4>
                            <button className="text-[10px] font-black text-purple-600 uppercase">View All</button>
                        </div>

                        <div className="space-y-3">
                            <CampaignCard title="Summer Heatwave" status="Active" reach="1.2k" color="bg-orange-500" />
                            <CampaignCard title="Electronics Expo" status="Ended" reach="8.4k" color="bg-blue-500" />
                            <CampaignCard title="Weekend Flash" status="Active" reach="450" color="bg-purple-600" />
                        </div>

                        <button className="w-full h-16 border-2 border-dashed border-slate-200 rounded-[24px] flex items-center justify-center gap-3 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-white hover:border-purple-300 hover:text-purple-600 transition-all">
                            <Plus size={18} /> Schedule New Flash Sale
                        </button>
                    </div>
                )}

                {activeTab === 'popups' && (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Active Popups</h3>
                                <button className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                                    <Plus size={20} />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { title: 'Welcome Discount', type: 'Entry', status: true },
                                    { title: 'Wait! Don\'t Go', type: 'Exit Intent', status: false },
                                    { title: 'Free Shipping Alert', type: 'Scroll', status: true },
                                ].map((p, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.status ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                                                <Sparkles size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-xs">{p.title}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase">{p.type} Trigger</p>
                                            </div>
                                        </div>
                                        <button className={`w-12 h-6 rounded-full relative transition-all ${p.status ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${p.status ? 'right-1' : 'left-1'}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 bg-slate-900 rounded-[32px] text-white">
                             <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Popup Strategy Guide</h4>
                             <p className="text-xs font-medium text-slate-300 leading-relaxed">
                                Use <span className="text-purple-400 font-bold">Exit Intent</span> popups to reduce cart abandonment by offering a unique discount just before the user leaves.
                             </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketingCampaigns;
