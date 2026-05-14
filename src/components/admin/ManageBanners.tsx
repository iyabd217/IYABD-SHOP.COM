import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Camera, Check, X,
  ChevronLeft, ChevronRight, RefreshCcw, ExternalLink, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { adminService } from '../../lib/adminServices';

const ManageBanners: React.FC = () => {
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        image_url: '',
        link: '',
        position: 'Home Top',
        status: true,
        priority: 1,
        device: 'Both',
        type: 'Homepage'
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        setLoading(true);
        const data = await adminService.getBanners();
        setBanners(data);
        setLoading(false);
    };

    const handleAddBanner = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await adminService.addBanner(formData);
            await fetchBanners();
            setShowAddForm(false);
            setFormData({ 
                title: '', subtitle: '', image_url: '', 
                link: '', position: 'Home Top', status: true,
                priority: 1, device: 'Both', type: 'Homepage'
            });
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    const toggleStatus = async (banner: any) => {
        try {
            await adminService.updateBanner(banner.id, { status: !banner.status });
            setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, status: !b.status } : b));
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Remove this banner?')) {
            try {
                await adminService.deleteBanner(id);
                setBanners(prev => prev.filter(b => b.id !== id));
            } catch (e) {
                console.error(e);
            }
        }
    };

    const filteredBanners = banners.filter(b => 
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getPositionColor = (pos: string) => {
        switch(pos) {
            case 'Home Top': return 'bg-orange-50 text-orange-600';
            case 'Home Middle': return 'bg-indigo-50 text-indigo-600';
            case 'Home Bottom': return 'bg-purple-50 text-purple-600';
            case 'Category Page': return 'bg-emerald-50 text-emerald-600';
            default: return 'bg-slate-50 text-slate-600';
        }
    };

    return (
        <div className="p-4 sm:p-6 pb-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        ALL BANNERS
                        <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-black">
                            {banners.length} TOTAL
                        </span>
                    </h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Manage promotional sliders</p>
                </div>
                <button 
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center justify-center gap-2 bg-[#4f46e5] text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-200 active:scale-95 transition-all"
                >
                    <Plus size={16} strokeWidth={3} /> Add New Banner
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-[28px] p-2 mb-6 border border-slate-100 shadow-sm flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search banners..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none"
                    />
                </div>
                <button onClick={fetchBanners} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                    <RefreshCcw size={18} />
                </button>
            </div>

            {/* Banners Table */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-0 min-w-[950px]">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-5 w-16 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">#</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Preview</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Title</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Type</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Device</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center w-20">Priority</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="px-6 py-10"><div className="h-4 bg-slate-50 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredBanners.map((banner, index) => (
                                <tr key={banner.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-6 text-center font-black text-slate-300 text-xs border-b border-slate-50 group-last:border-none">{String(index+1).padStart(2, '0')}</td>
                                    <td className="px-6 py-6 border-b border-slate-50 group-last:border-none">
                                        <div className="w-24 h-14 rounded-2xl bg-white border border-slate-200 overflow-hidden relative shadow-sm">
                                            {banner.image_url ? (
                                                <img src={banner.image_url} className="w-full h-full object-cover" />
                                            ) : <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon size={20} /></div>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 border-b border-slate-50 group-last:border-none">
                                        <p className="font-black text-slate-800 text-sm leading-tight">{banner.title}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">{banner.subtitle || 'Promo Banner'}</p>
                                    </td>
                                    <td className="px-6 py-6 border-b border-slate-50 group-last:border-none">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight shadow-sm ${banner.type === 'YouTube Style' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'}`}>
                                            {banner.type || 'Homepage'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 border-b border-slate-50 group-last:border-none">
                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                            {banner.device || 'Both'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 border-b border-slate-50 group-last:border-none text-center">
                                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-50 text-slate-900 text-xs font-black border border-slate-100">
                                            {banner.priority || 1}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 border-b border-slate-50 group-last:border-none">
                                        <div className="flex justify-center">
                                            <button 
                                                onClick={() => toggleStatus(banner)}
                                                className={`w-12 h-6.5 rounded-full transition-all relative flex items-center px-1.5 ${banner.status ? 'bg-[#4f46e5] shadow-lg shadow-indigo-200' : 'bg-slate-200'}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${banner.status ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 border-b border-slate-50 group-last:border-none">
                                        <div className="flex justify-end gap-2.5">
                                            <button className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-400 hover:bg-[#4f46e5] hover:text-white hover:border-[#4f46e5] transition-all shadow-sm">
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(banner.id)}
                                                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Banner Modal */}
            <AnimatePresence>
                {showAddForm && (
                     <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 text-left">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddForm(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h3 className="font-black text-slate-900 tracking-tight uppercase text-sm">Add New Banner</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Live promo upload</p>
                                </div>
                                <button onClick={() => setShowAddForm(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-200/50 text-slate-500">
                                    <X size={20} strokeWidth={3} />
                                </button>
                            </div>

                            <form onSubmit={handleAddBanner} className="p-8 space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     <div className="col-span-full">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Banner Title (e.g. Eid Sale)</label>
                                        <input 
                                            type="text" required
                                            value={formData.title}
                                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:bg-white transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Subtitle/Label</label>
                                        <input 
                                            type="text"
                                            value={formData.subtitle}
                                            onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Device Target</label>
                                        <select 
                                            value={formData.device}
                                            onChange={(e) => setFormData({...formData, device: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none"
                                        >
                                            <option>Both</option>
                                            <option>Desktop Only</option>
                                            <option>Mobile Only</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Banner Type</label>
                                        <select 
                                            value={formData.type}
                                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none"
                                        >
                                            <option>Homepage</option>
                                            <option>Promo Banner</option>
                                            <option>YouTube Style</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Priority (1=High)</label>
                                        <input 
                                            type="number"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none"
                                        />
                                    </div>
                                    <div className="col-span-full">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Image URL (Use Cloudinary for Auto-Resize)</label>
                                        <input 
                                            type="text" required
                                            value={formData.image_url}
                                            onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none"
                                        />
                                    </div>
                                    <div className="col-span-full">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 block">Destination Link</label>
                                        <input 
                                            type="text" required
                                            value={formData.link}
                                            onChange={(e) => setFormData({...formData, link: e.target.value})}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none"
                                        />
                                    </div>
                                </div>
                                <button 
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-slate-900 text-white rounded-[24px] py-4.5 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {submitting ? 'Processing...' : 'Deploy Smart Banner'} <Check size={18} strokeWidth={3} />
                                </button>
                            </form>
                        </motion.div>
                     </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageBanners;
