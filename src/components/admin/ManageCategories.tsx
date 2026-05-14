import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Camera, Check, X,
  ChevronLeft, ChevronRight, Eye, RefreshCcw, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { categoryService, storageService, optimizeImage } from '../../lib/services';
import { adminService } from '../../lib/adminServices';

const ManageCategories: React.FC = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        image_url: '',
        banner_url: '',
        mobile_banner_url: '',
        promo_banner_url: '',
        description: '',
        is_active: true
    });
    const [submitting, setSubmitting] = useState(false);
    const catFileInputRef = useRef<HTMLInputElement>(null);
    const ytFileInputRef = useRef<HTMLInputElement>(null);
    const [categoryBanner, setCategoryBanner] = useState<string | null>(null);
    const [youtubeBanner, setYoutubeBanner] = useState<string | null>(null);

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'category' | 'youtube') => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                setSubmitting(true);
                const optimized = await optimizeImage(file);
                const { url } = await storageService.uploadProductImage('categories', optimized, Date.now());
                
                if (type === 'category') {
                    setCategoryBanner(url);
                    setFormData(prev => ({ ...prev, banner_url: url }));
                } else {
                    setYoutubeBanner(url);
                    setFormData(prev => ({ ...prev, promo_banner_url: url }));
                }
            } catch(e) { 
                console.error(e); 
                alert('Upload failed');
            } finally {
                setSubmitting(false);
            }
        }
    };

    const removeBanner = (type: 'category' | 'youtube') => {
        if (type === 'category') setCategoryBanner(null);
        else setYoutubeBanner(null);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await categoryService.getAll();
            // We can add counts if needed by fetching products too
            setCategories(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await categoryService.create(formData.name, formData.image_url);
            // This is a simplified create, normally we'd pass the full formData
            // For now let's use a wrapper that handles the full object if I update categoryService.create
            await fetchCategories();
            setShowAddForm(false);
            setFormData({ 
                name: '', 
                image_url: '', 
                banner_url: '',
                mobile_banner_url: '',
                promo_banner_url: '',
                description: '', 
                is_active: true 
            });
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    const toggleStatus = async (category: any) => {
        try {
            await adminService.updateCategory(category.id, { is_active: !category.is_active });
            setCategories(prev => prev.map(c => c.id === category.id ? { ...c, is_active: !c.is_active } : c));
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await adminService.deleteCategory(id);
                setCategories(prev => prev.filter(c => c.id !== id));
            } catch (e) {
                console.error(e);
            }
        }
    };

    const filteredCategories = categories.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-6 pb-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        ALL CATEGORIES
                        <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-[10px] font-black">
                            {categories.length} TOTAL
                        </span>
                    </h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Manage your shop collections</p>
                </div>
                <button 
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-black/10 active:scale-95 transition-all"
                >
                    <Plus size={16} strokeWidth={3} /> Add New Category
                </button>
            </div>

            {/* Demo Banner Previews */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {/* Category Banner Demo */}
                <div className="bg-white p-4 rounded-[18px] border border-slate-100 shadow-sm flex items-center gap-4">
                    <input type="file" ref={catFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleBannerUpload(e, 'category')} />
                    <div className="w-20 h-20 rounded-[14px] bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer" onClick={() => catFileInputRef.current?.click()}>
                        {categoryBanner ? (
                            <img src={categoryBanner} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon size={24} className="text-slate-300" />
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category Banner</p>
                        <p className="font-black text-slate-900 text-sm">{categoryBanner ? 'Uploaded' : 'Demo Preview'}</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase">1600x600 px</p>
                        <div className="flex items-center justify-between mt-2">
                           <button className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${categoryBanner ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                {categoryBanner ? 'Live' : 'Private'}
                           </button>
                           <div className="flex gap-2">
                               <button className="bg-slate-900 text-white px-2 py-1 rounded text-[9px] font-black uppercase">Save</button>
                               <Edit2 size={14} className="text-slate-400 cursor-pointer hover:text-slate-900" onClick={() => catFileInputRef.current?.click()} />
                               {categoryBanner && <Trash2 size={14} className="text-rose-400 cursor-pointer hover:text-rose-600" onClick={() => removeBanner('category')} />}
                           </div>
                        </div>
                    </div>
                </div>
                {/* YouTube Banner Demo */}
                <div className="bg-white p-4 rounded-[18px] border border-slate-100 shadow-sm flex items-center gap-4">
                    <input type="file" ref={ytFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleBannerUpload(e, 'youtube')} />
                    <div className="w-20 h-20 rounded-[14px] bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer" onClick={() => ytFileInputRef.current?.click()}>
                        {youtubeBanner ? (
                            <img src={youtubeBanner} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon size={24} className="text-slate-300" />
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Homepage Promo Banner</p>
                        <p className="font-black text-slate-900 text-sm">{youtubeBanner ? 'Uploaded' : 'Demo Preview'}</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase">2560x1440 px</p>
                        <div className="flex items-center justify-between mt-2">
                           <button className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${youtubeBanner ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                {youtubeBanner ? 'Live' : 'Private'}
                           </button>
                           <div className="flex gap-2">
                               <button className="bg-slate-900 text-white px-2 py-1 rounded text-[9px] font-black uppercase">Save</button>
                               <Edit2 size={14} className="text-slate-400 cursor-pointer hover:text-slate-900" onClick={() => ytFileInputRef.current?.click()} />
                               {youtubeBanner && <Trash2 size={14} className="text-rose-400 cursor-pointer hover:text-rose-600" onClick={() => removeBanner('youtube')} />}
                           </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Summary - Mini */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                 <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Check size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Active</p>
                        <p className="text-xl font-black text-slate-900">{categories.filter(c => c.is_active).length}</p>
                    </div>
                 </div>
                 <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                        <Eye size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Private</p>
                        <p className="text-xl font-black text-slate-900">{categories.filter(c => !c.is_active).length}</p>
                    </div>
                 </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white rounded-[28px] p-2 mb-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search categories by name..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                    />
                </div>
                <button onClick={fetchCategories} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors">
                    <RefreshCcw size={18} />
                </button>
            </div>

            {/* Categories Table/List */}
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-16">#</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Preview</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category Name</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredCategories.length > 0 ? (
                                filteredCategories.map((cat, index) => (
                                    <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-5 text-center font-black text-slate-300 text-xs">{String(index + 1).padStart(2, '0')}</td>
                                        <td className="px-6 py-5">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
                                                {cat.image_url ? (
                                                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                        <Camera size={20} />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="font-black text-slate-800 text-sm">{cat.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate max-w-[150px]">
                                                    {cat.description || 'No description'}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                <span className="text-[10px] font-black text-purple-500 uppercase tracking-tighter">
                                                    {cat.productCount || 0} Products
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-center">
                                                <button 
                                                    onClick={() => toggleStatus(cat)}
                                                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${cat.is_active ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                                >
                                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${cat.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-end gap-2">
                                                <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(cat.id)}
                                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <p className="font-bold text-slate-300 uppercase tracking-widest text-xs">No categories found matching your search</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination Mockup */}
                <div className="px-6 py-4 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Showing {filteredCategories.length} of {categories.length} entries
                    </p>
                    <div className="flex items-center gap-2">
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 cursor-not-allowed"><ChevronLeft size={16} /></button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900 text-white font-black text-xs">1</button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 cursor-not-allowed"><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>

            {/* Add Category Modal/Overlay */}
            <AnimatePresence>
                {showAddForm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
                            className="bg-white w-full max-w-md rounded-[40px] shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h3 className="font-black text-slate-900 tracking-tight uppercase text-sm">Create Live Collection</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Upload new category</p>
                                </div>
                                <button onClick={() => setShowAddForm(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-200/50 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                                    <X size={20} strokeWidth={3} />
                                </button>
                            </div>

                            <form onSubmit={handleAddCategory} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                {/* Basic Section */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Basic Information</h4>
                                    
                                    <div className="flex gap-4">
                                        <div className="w-24 h-24 shrink-0 rounded-[24px] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group">
                                            {formData.image_url ? (
                                                <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <Camera size={24} className="text-slate-300" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1 block">Category Name</label>
                                                <input 
                                                    type="text" required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                    placeholder="Fashion, Tech, etc."
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:ring-4 focus:ring-purple-50 transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1 block">Thumbnail URL (500x500)</label>
                                                <input 
                                                    type="text"
                                                    value={formData.image_url}
                                                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                                                    placeholder="https://..."
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:ring-4 focus:ring-purple-50 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1 block">Short Description</label>
                                        <textarea 
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            rows={2}
                                            placeholder="What defines this collection?"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:ring-4 focus:ring-purple-50 transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Banners Section */}
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <ImageIcon size={14} className="text-purple-500" /> Advanced Banners
                                    </h4>

                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Desktop Banner (1600x600)</label>
                                                <span className="text-[8px] font-black text-purple-400 uppercase tracking-tighter">Ratio 8:3</span>
                                            </div>
                                            <input 
                                                type="text"
                                                value={formData.banner_url}
                                                onChange={(e) => setFormData({...formData, banner_url: e.target.value})}
                                                placeholder="Category Page Top Hero Banner"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:ring-4 focus:ring-purple-50 transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1 block">Mobile Banner (Responsive View)</label>
                                            <input 
                                                type="text"
                                                value={formData.mobile_banner_url}
                                                onChange={(e) => setFormData({...formData, mobile_banner_url: e.target.value})}
                                                placeholder="Portrait Banner for Mobile"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:ring-4 focus:ring-purple-50 transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1 block">Category Promo Banner (Slider)</label>
                                            <input 
                                                type="text"
                                                value={formData.promo_banner_url}
                                                onChange={(e) => setFormData({...formData, promo_banner_url: e.target.value})}
                                                placeholder="Secondary Promotional Slider Banner"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:bg-white focus:ring-4 focus:ring-purple-50 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors border border-slate-100 group">
                                        <div className={`w-10 h-6.5 rounded-full transition-all relative flex items-center px-1.5 ${formData.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${formData.is_active ? 'translate-x-3.5' : 'translate-x-0'}`} />
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            className="hidden"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                        />
                                        <div>
                                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest block">Active Status</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Display on storefront immediately</span>
                                        </div>
                                    </label>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-slate-900 text-white rounded-[24px] py-4.5 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>Create Advanced Collection <Check size={18} strokeWidth={3} /></>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageCategories;
