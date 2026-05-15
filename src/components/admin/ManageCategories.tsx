import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Camera, Check, X,
  ChevronLeft, ChevronRight, Eye, RefreshCcw, Image as ImageIcon,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { categoryService, storageService, optimizeImage } from '../../lib/services';
import { adminService } from '../../lib/adminServices';

const CategoryImage = ({ src, className, alt = "" }: any) => {
    const fallback = 'https://images.unsplash.com/photo-1555529733-0e670560f8e1?q=80&w=400&fit=crop';
    return (
        <img 
            src={src || fallback} 
            className={className} 
            alt={alt}
            onError={(e: any) => { e.target.src = fallback; }}
            referrerPolicy="no-referrer"
        />
    );
};

const ManageCategories: React.FC = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [heroBanners, setHeroBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState<'hero' | 'category'>('hero');
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [showHeroForm, setShowHeroForm] = useState(false);

    // Category Form State
    const [categoryFormData, setCategoryFormData] = useState({
        category_name: '',
        slug: '',
        description: '',
        icon: '',
        banner_image: '',
        top_banner: '',
        parent_id: '',
        is_featured: false,
        is_active: true,
        sort_order: 0
    });
    const [categoryFiles, setCategoryFiles] = useState<{icon?: File, banner_image?: File, top_banner?:File}>({});

    // Hero Banner Form State
    const [heroFormData, setHeroFormData] = useState({
        title: '',
        subtitle: '',
        banner_image: '',
        mobile_banner: '',
        desktop_banner: '',
        product_images: [] as string[],
        button_text: 'Shop Now',
        redirect_url: '/shop',
        is_active: true,
        sort_order: 0
    });
    const [heroFiles, setHeroFiles] = useState<{banner_image?: File, mobile_banner?: File, desktop_banner?: File, product_images: File[]}>({
        product_images: []
    });

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cats, banners] = await Promise.all([
                adminService.getCategoryBanners(),
                adminService.getHeroBanners()
            ]);
            setCategories(cats || []);
            setHeroBanners(banners || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file: File, type: string) => {
        const formData = new FormData();
        formData.append('banner', file);
        formData.append('type', type);
        
        try {
            const res = await fetch('/api/banners/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            return data.url;
        } catch (e) {
            console.error('Upload failed', e);
            return '';
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            if (categoryFiles.icon) formData.append('icon', categoryFiles.icon);
            if (categoryFiles.banner_image) formData.append('banner_image', categoryFiles.banner_image);
            if (categoryFiles.top_banner) formData.append('top_banner', categoryFiles.top_banner);

            let uploadedUrls = {};
            if (Object.keys(categoryFiles).length > 0) {
                uploadedUrls = await adminService.uploadCategoryBanners(formData);
            }

            const slug = categoryFormData.slug || categoryFormData.category_name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            await adminService.addCategoryBanner({ 
                ...categoryFormData, 
                ...uploadedUrls,
                slug 
            });
            await fetchData();
            setShowCategoryForm(false);
            setCategoryFiles({});
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddHero = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            if (heroFiles.banner_image) formData.append('banner_image', heroFiles.banner_image);
            if (heroFiles.mobile_banner) formData.append('mobile_banner', heroFiles.mobile_banner);
            if (heroFiles.desktop_banner) formData.append('desktop_banner', heroFiles.desktop_banner);
            heroFiles.product_images.forEach(file => {
                formData.append('product_images', file);
            });

            let uploadedUrls = { product_images: [] as string[] };
            if (heroFiles.banner_image || heroFiles.mobile_banner || heroFiles.desktop_banner || heroFiles.product_images.length > 0) {
                uploadedUrls = await adminService.uploadHeroBanners(formData);
            }

            await adminService.addHeroBanner({ 
                ...heroFormData, 
                ...uploadedUrls,
                product_images: [...(uploadedUrls.product_images || [])] as string[]
            });
            await fetchData();
            setShowHeroForm(false);
            setHeroFiles({ product_images: [] });
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (confirm('Delete category?')) {
            await adminService.deleteCategoryBanner(id);
            fetchData();
        }
    };

    const handleDeleteHero = async (id: string) => {
        if (confirm('Delete banner?')) {
            await adminService.deleteHeroBanner(id);
            fetchData();
        }
    };

    const handlePopulateDemo = async () => {
        if (!confirm('This will add demo banners and categories. Continue?')) return;
        setLoading(true);
        try {
            const demoHeros = [
                {
                    title: 'PREMIUM FASHION 2026',
                    subtitle: 'Experience the new era of curated essential styles for the modern individual.',
                    banner_image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
                    button_text: 'EXPLORE COLLECTIONS',
                    redirect_url: '/shop',
                    is_active: true,
                    sort_order: 1
                }
            ];

            const demoCats = [
                {
                    category_name: 'Men',
                    slug: 'men',
                    banner_image: 'https://images.unsplash.com/photo-1516257984877-a03aae3acbc8?q=80&w=2070&auto=format&fit=crop',
                    icon: '👔',
                    is_active: true,
                    sort_order: 1
                },
                {
                    category_name: 'Women',
                    slug: 'women',
                    banner_image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop',
                    icon: '👗',
                    is_active: true,
                    sort_order: 2
                }
            ];

            for (const h of demoHeros) await adminService.addHeroBanner(h);
            for (const c of demoCats) await adminService.addCategoryBanner(c);
            
            alert('Demo data populated successfully!');
            fetchData();
        } catch (e) {
            console.error(e);
            alert('Failed to populate demo data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-8 pb-32">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">CATEGORIES & BANNERS</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manage storefront experience</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={handlePopulateDemo}
                        disabled={loading}
                        className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2"
                    >
                        <Zap size={14} />
                        demo data
                    </button>
                    <button 
                        onClick={() => setShowHeroForm(true)}
                        className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:shadow-xl active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Plus size={16} />
                        add hero banner
                    </button>
                </div>
            </header>

            <div className="flex bg-white p-2 rounded-[24px] border border-slate-100 mb-8 shadow-sm max-w-md">
                <button 
                    onClick={() => setActiveSection('hero')}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${activeSection === 'hero' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                    Hero Banners
                </button>
                <button 
                    onClick={() => setActiveSection('category')}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all ${activeSection === 'category' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                    Category Banners
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center animate-pulse uppercase text-[10px] font-black tracking-widest">Loading Manager...</div>
            ) : activeSection === 'hero' ? (
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-slate-800">Hero Banner Manager</h2>
                        <button 
                            onClick={() => setShowHeroForm(true)}
                            className="bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                        >
                            <Plus size={14} /> Add Banner
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.isArray(heroBanners) && heroBanners.map((banner) => (
                            <div key={banner.id} className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm group">
                                <div className="aspect-[21/9] relative overflow-hidden">
                                    <CategoryImage src={banner.banner_image || banner.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <button className="w-8 h-8 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-primary transition-all"><Edit2 size={14} /></button>
                                        <button onClick={() => handleDeleteHero(banner.id)} className="w-8 h-8 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                                    </div>
                                    {!banner.is_active && (
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                                            <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Inactive</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <h3 className="font-black text-slate-900 text-sm">{banner.title}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">{banner.subtitle}</p>
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex -space-x-2">
                                            {Array.isArray(banner.product_images) && banner.product_images.slice(0, 3).map((img: string, i: number) => (
                                                <div key={i} className="w-6 h-6 rounded-full border-2 border-white overflow-hidden bg-slate-100 shadow-sm">
                                                    <CategoryImage src={img} className="w-full h-full object-cover" alt="" />
                                                </div>
                                            ))}
                                            {Array.isArray(banner.product_images) && banner.product_images.length > 3 && (
                                                <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-500">
                                                    {banner.product_images.length - 3}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">#{banner.sort_order || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ) : (
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-black text-slate-800">Category Banner Manager</h2>
                        <button 
                            onClick={() => setShowCategoryForm(true)}
                            className="bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                        >
                            <Plus size={14} /> Add Category
                        </button>
                    </div>

                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Icon</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thumbnail</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Top Banner</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {Array.isArray(categories) && categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-slate-50 transition-all">
                                        <td className="px-6 py-4">
                                            <p className="font-black text-slate-900 text-sm">{cat.category_name || cat.name}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase">/{cat.slug}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                                                {cat.icon ? <CategoryImage src={cat.icon} className="w-full h-full object-cover" alt="" /> : <ImageIcon size={20} className="text-slate-300" />}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-16 h-20 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                                {cat.banner_image ? <CategoryImage src={cat.banner_image} className="w-full h-full object-cover" alt="" /> : <ImageIcon size={20} className="text-slate-300" />}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="h-10 w-32 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                                {cat.top_banner ? <CategoryImage src={cat.top_banner} className="w-full h-full object-cover" alt="" /> : <span className="text-[9px] font-bold text-slate-300 uppercase">No Banner</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${cat.is_active !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                {cat.is_active !== false ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:text-primary transition-all flex items-center justify-center"><Edit2 size={14} /></button>
                                                <button onClick={() => handleDeleteCategory(cat.id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* Modals for Adding */}
            <AnimatePresence>
                {(showHeroForm || showCategoryForm) && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setShowHeroForm(false); setShowCategoryForm(false); }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ y: 50, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 50, opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-black text-slate-900 uppercase text-sm tracking-widest">
                                    {showHeroForm ? 'Add Hero Banner' : 'Add Category Banner'}
                                </h3>
                                <button onClick={() => { setShowHeroForm(false); setShowCategoryForm(false); }} className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto no-scrollbar pb-20">
                                {showHeroForm ? (
                                    <form onSubmit={handleAddHero} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Banner Title</label>
                                                <input required type="text" value={heroFormData.title} onChange={e => setHeroFormData({...heroFormData, title: e.target.value})} className="w-full bg-slate-50 border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none" placeholder="Summer 2024 Collection" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Subtitle</label>
                                                <input type="text" value={heroFormData.subtitle} onChange={e => setHeroFormData({...heroFormData, subtitle: e.target.value})} className="w-full bg-slate-50 border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none" placeholder="Up to 50% Off" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Button Text</label>
                                                <input type="text" value={heroFormData.button_text} onChange={e => setHeroFormData({...heroFormData, button_text: e.target.value})} className="w-full bg-slate-50 border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Redirect URL</label>
                                                <input type="text" value={heroFormData.redirect_url} onChange={e => setHeroFormData({...heroFormData, redirect_url: e.target.value})} className="w-full bg-slate-50 border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none" placeholder="/shop" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Banner Image (Main)</label>
                                                <div className="flex items-center gap-3">
                                                    <input type="file" onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) setHeroFiles({...heroFiles, banner_image: file});
                                                    }} className="hidden" id="hero-main" />
                                                    <label htmlFor="hero-main" className="flex-1 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all">
                                                        {heroFiles.banner_image ? <img src={URL.createObjectURL(heroFiles.banner_image)} className="h-12 w-12 object-cover rounded-lg" /> : <Camera className="text-slate-300" />}
                                                        <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Upload Image</span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Mobile Banner</label>
                                                <input type="file" onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) setHeroFiles({...heroFiles, mobile_banner: file});
                                                }} className="hidden" id="hero-mobile" />
                                                <label htmlFor="hero-mobile" className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all">
                                                    {heroFiles.mobile_banner ? <img src={URL.createObjectURL(heroFiles.mobile_banner)} className="h-12 w-12 object-cover rounded-lg" /> : <Camera className="text-slate-300" />}
                                                    <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Upload Mobile</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Desktop Banner (Wide)</label>
                                            <input type="file" onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) setHeroFiles({...heroFiles, desktop_banner: file});
                                            }} className="hidden" id="hero-desktop" />
                                            <label htmlFor="hero-desktop" className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all">
                                                {heroFiles.desktop_banner ? <div className="h-12 w-full bg-slate-100 flex items-center justify-center rounded-lg overflow-hidden"><img src={URL.createObjectURL(heroFiles.desktop_banner)} className="w-full h-full object-cover" /></div> : <Camera className="text-slate-300" />}
                                                <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Upload Desktop</span>
                                            </label>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Product Images (Multiple Upload)</label>
                                            <div className="grid grid-cols-4 gap-2 mb-2">
                                                {heroFiles.product_images.map((img, i) => (
                                                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                                                        <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" />
                                                        <button 
                                                            type="button"
                                                            onClick={() => setHeroFiles({...heroFiles, product_images: heroFiles.product_images.filter((_, idx) => idx !== i)})}
                                                            className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <input type="file" multiple onChange={(e) => {
                                                    const files = Array.from(e.target.files || []);
                                                    setHeroFiles({...heroFiles, product_images: [...heroFiles.product_images, ...files]});
                                                }} className="hidden" id="hero-products" />
                                                <label htmlFor="hero-products" className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-primary transition-all">
                                                    <Plus className="text-slate-300" size={16} />
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl">
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" checked={heroFormData.is_active} onChange={e => setHeroFormData({...heroFormData, is_active: e.target.checked})} className="w-5 h-5 rounded-lg text-primary focus:ring-primary border-slate-200" />
                                                <span className="text-[10px] font-black text-slate-900 uppercase">Active Banner</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-slate-400 uppercase">Sort Order</span>
                                                <input type="number" value={heroFormData.sort_order} onChange={e => setHeroFormData({...heroFormData, sort_order: parseInt(e.target.value)})} className="w-16 bg-white border-slate-100 rounded-lg p-2 text-center text-xs font-bold" />
                                            </div>
                                        </div>
                                        <button disabled={submitting} type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">
                                            {submitting ? 'Saving...' : 'Create Hero Banner'}
                                        </button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleAddCategory} className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Category Name</label>
                                                <input required type="text" value={categoryFormData.category_name} onChange={e => setCategoryFormData({...categoryFormData, category_name: e.target.value})} className="w-full bg-slate-50 border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none" placeholder="Men, Women, etc." />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Category Slug</label>
                                                <input type="text" value={categoryFormData.slug} onChange={e => setCategoryFormData({...categoryFormData, slug: e.target.value})} className="w-full bg-slate-50 border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none" placeholder="men-fashion" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Parent Category</label>
                                                <select
                                                    value={categoryFormData.parent_id}
                                                    onChange={e => setCategoryFormData({...categoryFormData, parent_id: e.target.value})}
                                                    className="w-full bg-slate-50 border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none"
                                                >
                                                    <option value="">None (Main Category)</option>
                                                    {categories.filter(c => !c.parent_id).map(c => (
                                                        <option key={c.id} value={c.id}>{c.category_name || c.name || c.id}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Sort Order</label>
                                                <input type="number" value={categoryFormData.sort_order} onChange={e => setCategoryFormData({...categoryFormData, sort_order: parseInt(e.target.value)})} className="w-full bg-slate-50 border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Description</label>
                                                <textarea value={categoryFormData.description} onChange={e => setCategoryFormData({...categoryFormData, description: e.target.value})} className="w-full bg-slate-50 border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none resize-none h-24" placeholder="Description..."></textarea>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Category Banner</label>
                                                <input type="file" onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) setCategoryFiles({...categoryFiles, banner_image: file});
                                                }} className="hidden" id="cat-banner" />
                                                <label htmlFor="cat-banner" className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all">
                                                    {categoryFiles.banner_image ? <img src={URL.createObjectURL(categoryFiles.banner_image)} className="h-10 w-10 object-cover rounded-lg" /> : <Camera className="text-slate-300" />}
                                                    <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Upload Banner</span>
                                                </label>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Floating Icon</label>
                                                <input type="file" onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) setCategoryFiles({...categoryFiles, icon: file});
                                                }} className="hidden" id="cat-icon" />
                                                <label htmlFor="cat-icon" className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all">
                                                    {categoryFiles.icon ? <img src={URL.createObjectURL(categoryFiles.icon)} className="h-10 w-10 object-cover rounded-lg" /> : <Camera className="text-slate-300" />}
                                                    <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Upload Icon</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Category Top Banner</label>
                                            <input type="file" onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) setCategoryFiles({...categoryFiles, top_banner: file});
                                            }} className="hidden" id="cat-top" />
                                            <label htmlFor="cat-top" className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all">
                                                {categoryFiles.top_banner ? <div className="h-10 w-full bg-slate-100 flex items-center justify-center rounded-lg overflow-hidden"><img src={URL.createObjectURL(categoryFiles.top_banner)} className="w-full h-full object-cover" /></div> : <Camera className="text-slate-300" />}
                                                <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Upload Top Banner</span>
                                            </label>
                                        </div>
                                        <div className="flex gap-4">
                                            <label className="flex-1 flex items-center gap-3 p-4 bg-slate-50 rounded-3xl cursor-pointer">
                                                <input type="checkbox" checked={categoryFormData.is_active} onChange={e => setCategoryFormData({...categoryFormData, is_active: e.target.checked})} className="w-6 h-6 rounded-lg border-slate-200 text-primary" />
                                                <span className="text-[10px] font-black text-slate-900 uppercase">Visible on Storefront</span>
                                            </label>
                                            <label className="flex-1 flex items-center gap-3 p-4 bg-slate-50 rounded-3xl cursor-pointer">
                                                <input type="checkbox" checked={categoryFormData.is_featured} onChange={e => setCategoryFormData({...categoryFormData, is_featured: e.target.checked})} className="w-6 h-6 rounded-lg border-slate-200 text-purple-600 focus:ring-purple-600" />
                                                <span className="text-[10px] font-black text-slate-900 uppercase">Featured Category</span>
                                            </label>
                                        </div>
                                        <button disabled={submitting} type="submit" className="w-full py-5 bg-primary text-white rounded-[24px] font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">
                                            {submitting ? 'Saving...' : 'Create Category Banner'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageCategories;
