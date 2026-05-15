import React, { useState, useEffect } from 'react';
import { adminService } from '../../lib/adminServices';
import { Plus, Trash2, Check, X, ShieldAlert, Image as ImageIcon } from 'lucide-react';

export const ManageCategoryBanners = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    button_text: 'View More',
    category_slug: '',
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [fetchedBanners, fetchedCategories] = await Promise.all([
      adminService.getCategoryBanners(),
      adminService.getCategories(),
    ]);
    // Also include some manual categories just to cover demo data if real DB is empty
    const manualCategories = [
      { id: 't-shirt', slug: 'tshirt', name: 'T-Shirt' },
      { id: 'polo', slug: 'polo-shirt', name: 'Polo' },
      { id: 'premium-shirt', slug: 'premium-shirt', name: 'Premium Shirt' },
      { id: 'punjabi', slug: 'punjabi', name: 'Punjabi' },
      { id: 'women-fashion', slug: 'women-fashion', name: 'Women Fashion' },
      { id: 'tops-hoodies', slug: 'tops-hoodies', name: 'Tops & Hoodies' }
    ];

    setBanners(fetchedBanners || []);
    
    // Combine fetched categories with manual categories correctly
    const allSlugs = new Set((fetchedCategories || []).map((c: any) => c.slug || c.name?.toLowerCase()));
    const finalCats = [...(fetchedCategories || [])];
    manualCategories.forEach(mc => {
      if (!allSlugs.has(mc.slug)) finalCats.push(mc);
    });

    setCategories(finalCats);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category_slug || !form.image_url) return alert('Category and Image are required.');
    
    // Find category name
    const selectedCat = categories.find(c => (c.slug || c.name?.toLowerCase().replace(/\s+/g, '-')) === form.category_slug);
    
    const res = await adminService.addCategoryBanner({
      banner_title: form.title,
      banner_subtitle: form.subtitle,
      banner_image: form.image_url,
      button_text: form.button_text,
      category_name: selectedCat ? selectedCat.name : form.category_slug,
      category_slug: form.category_slug,
      status: form.is_active ? 'Active' : 'Inactive',
      is_active: form.is_active,
      sort_order: Date.now()
    });
    
    if (res) {
      setForm({ title: '', subtitle: '', image_url: '', button_text: 'View More', category_slug: '', is_active: true });
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this banner?')) {
      await adminService.deleteCategoryBanner(id);
      fetchData();
    }
  };

  const handleToggleStatus = async (banner: any) => {
    await adminService.updateCategoryBanner(banner.id, { is_active: !banner.is_active });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex gap-6 flex-col lg:flex-row">
        <div className="flex-1 w-full max-w-sm shrink-0">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Add Category Banner</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Category</label>
              <select 
                value={form.category_slug} 
                onChange={e => setForm({...form, category_slug: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">-- Choose Category --</option>
                {categories.map((c, i) => (
                  <option key={i} value={c.slug || c.name?.toLowerCase().replace(/\s+/g, '-')}>{c.name || c.title || c.slug}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Banner Title</label>
              <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="e.g. New Summer Collection" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Banner Subtitle</label>
              <input type="text" value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Up to 40% OFF" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Banner Image URL (Will auto-resize to 16:9)</label>
              <input type="text" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="URL" />
              {form.image_url && (
                <div className="mt-2 text-xs text-green-600 font-bold flex items-center gap-1"><Check size={12}/> Valid Image URL</div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Button Text</label>
              <input type="text" value={form.button_text} onChange={e => setForm({...form, button_text: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="View More" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer mt-2">
               <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="w-4 h-4 rounded text-primary focus:ring-primary" />
               <span className="text-sm font-semibold text-slate-700">Active Status</span>
            </label>
            <button type="submit" className="w-full py-3 rounded-xl bg-primary text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors">
              <Plus size={18} /> Add Banner
            </button>
          </form>
        </div>

        <div className="flex-1 w-full min-w-0">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
            <ImageIcon size={18} /> Current Banners
          </h3>
          
            <div className="space-y-3">
               {loading ? (
                  <div className="text-center py-10 opacity-50"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>
               ) : banners.length === 0 ? (
                  <div className="text-center py-10 px-4 flex flex-col items-center gap-3">
                      <div className="text-slate-400 font-bold bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center gap-2">
                          <ShieldAlert size={16} /> No banners found. Add demo banners below.
                      </div>
                      <button 
                        onClick={async () => {
                          const demoBanners = [
                            { category_slug: 'tshirt', category_name: 'T-Shirt', banner_title: 'Summer Fashion Sale', banner_subtitle: 'Up To 40% OFF', banner_image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=1200&h=675&fit=crop', status: 'Active', is_active: true, button_text: 'Shop Now' },
                            { category_slug: 'polo-shirt', category_name: 'Polo', banner_title: 'Premium Polo Edition', banner_subtitle: 'The new standard', banner_image: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?w=1200&h=675&fit=crop', status: 'Active', is_active: true, button_text: 'View More' },
                            { category_slug: 'premium-shirt', category_name: 'Premium Shirt', banner_title: 'Luxury Shirt Collection', banner_subtitle: 'Step up your style', banner_image: 'https://images.unsplash.com/photo-1489987707023-afc8c1ce7510?w=1200&h=675&fit=crop', status: 'Active', is_active: true, button_text: 'View More' },
                            { category_slug: 'women-fashion', category_name: 'Women Fashion', banner_title: 'New Women Fashion Arrivals', banner_subtitle: 'Exclusive designs', banner_image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=675&fit=crop', status: 'Active', is_active: true, button_text: 'View More' }
                          ];
                          setLoading(true);
                          for (const dbanner of demoBanners) {
                            await adminService.addCategoryBanner(dbanner);
                          }
                          fetchData();
                        }}
                        className="bg-black text-white text-xs font-bold px-5 py-2.5 rounded-lg active:scale-95 transition-transform"
                      >
                         Generate Demo Banners
                      </button>
                  </div>
               ) : (
                banners.map((b) => (
                   <div key={b.id} className="flex flex-col sm:flex-row gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 items-start sm:items-center">
                     <div className="w-full sm:w-32 aspect-video bg-slate-200 rounded-lg overflow-hidden shrink-0">
                        <img src={b.banner_image || b.image_url} alt={b.banner_title || b.title} className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1 min-w-0 flex flex-col">
                        <span className="text-[10px] font-black uppercase text-primary tracking-widest">{b.category_name || b.category_slug}</span>
                        <h4 className="text-sm font-bold text-slate-900 truncate">{b.banner_title || b.title || 'Untitled Banner'}</h4>
                        <p className="text-xs text-slate-500 truncate">{b.banner_subtitle || b.subtitle}</p>
                     </div>
                     <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={() => handleToggleStatus(b)} 
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}
                        >
                          {b.is_active ? 'Active' : 'Hidden'}
                        </button>
                        <button onClick={() => handleDelete(b.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                          <Trash2 size={16} />
                        </button>
                     </div>
                   </div>
                ))
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
