import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '@iconify/react';
import { adminService } from '../../lib/adminServices';
import { optimizeImage } from '../../lib/services';
import { formatPrice } from '../../lib/utils';

export const FlashSaleManagement = () => {
    const [config, setConfig] = useState<any>({
        banner_url: '',
        is_active: false,
        end_time: ''
    });
    const [products, setProducts] = useState<any[]>([]);
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [conf, saleItems, prodItems] = await Promise.all([
            adminService.getFlashSaleConfig(),
            adminService.getFlashSaleProducts(),
            adminService.getProducts()
        ]);
        if (conf) setConfig(conf);
        if (saleItems) setProducts(saleItems);
        if (prodItems) setAllProducts(prodItems);
    };

    const handleConfigSave = async () => {
        setIsSaving(true);
        try {
            await adminService.updateFlashSaleConfig(config);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setIsSaving(true);
        try {
            const optimized = await optimizeImage(file);
            const formData = new FormData();
            formData.append('image', optimized, 'flash_banner.webp');
            
            const res = await fetch('/api/admin/flash-sale/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.url) {
                const newConfig = { ...config, banner_url: data.url };
                setConfig(newConfig);
                await adminService.updateFlashSaleConfig(newConfig);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        await adminService.deleteFlashSaleProduct(id);
        setProducts(products.filter(p => p.id !== id));
    };

    return (
        <div className="space-y-8">
            {/* Global Settings */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Global Flash Sale Settings</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Banner & Main Toggle</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Status</span>
                            <div 
                                onClick={() => setConfig({ ...config, is_active: !config.is_active })}
                                className={`w-14 h-7 rounded-full transition-colors relative flex items-center px-1 ${config.is_active ? 'bg-emerald-500' : 'bg-slate-200'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${config.is_active ? 'translate-x-7' : 'translate-x-0'}`} />
                            </div>
                        </label>
                        <button 
                            onClick={handleConfigSave}
                            disabled={isSaving}
                            className="bg-primary text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                        >
                            {isSaving ? <Icon icon="eos-icons:loading" /> : <Icon icon="solar:save-bold" />}
                            Save Changes
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Top Flash Banner (1920x1080)</label>
                        <div className="relative aspect-video rounded-[24px] overflow-hidden bg-slate-50 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center group">
                            {config.banner_url ? (
                                <>
                                    <img src={config.banner_url} className="w-full h-full object-cover" alt="" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <label className="bg-white text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase cursor-pointer hover:bg-primary hover:text-white transition-all">
                                            Change Banner
                                            <input type="file" className="hidden" onChange={handleBannerUpload} accept="image/*" />
                                        </label>
                                    </div>
                                </>
                            ) : (
                                <label className="flex flex-col items-center cursor-pointer">
                                    <Icon icon="solar:upload-bold-duotone" className="text-slate-300 text-5xl mb-4" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Banner</span>
                                    <input type="file" className="hidden" onChange={handleBannerUpload} accept="image/*" />
                                </label>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col justify-center gap-4">
                        <div className="bg-slate-50 p-6 rounded-[24px]">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Flash Sale End Time</label>
                            <input 
                                type="datetime-local" 
                                value={config.end_time?.split('.')[0] || ''} 
                                onChange={(e) => setConfig({ ...config, end_time: e.target.value })}
                                className="w-full bg-white border border-slate-100 p-4 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 ring-primary/10 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Management */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-xl font-black text-slate-800">Flash Sale Products</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage active flash items</p>
                    </div>
                    <button 
                        onClick={() => { setEditingProduct(null); setShowProductModal(true); }}
                        className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Icon icon="solar:plus-bold" /> Add Product
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products?.map(p => (
                        <div key={p.id} className="bg-slate-50 rounded-[28px] overflow-hidden border border-slate-100 flex flex-col group">
                            <div className="relative aspect-square">
                                <img src={p.product_image} className="w-full h-full object-cover" alt="" />
                                <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full">-{p.discount_percent}%</div>
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setEditingProduct(p); setShowProductModal(true); }} className="w-8 h-8 bg-white text-slate-600 rounded-lg flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm">
                                        <Icon icon="solar:pen-bold" width={16} height={16} />
                                    </button>
                                    <button onClick={() => handleDeleteProduct(p.id)} className="w-8 h-8 bg-white text-red-500 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                        <Icon icon="solar:trash-bin-trash-bold" width={16} height={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-5 flex-1">
                                <h4 className="text-sm font-black text-slate-800 mb-2 line-clamp-1">{p.title}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="text-secondary font-black text-lg">{formatPrice(p.sale_price)}</span>
                                    <span className="text-[10px] text-slate-400 line-through font-bold">{formatPrice(p.old_price)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {products.length === 0 && (
                        <div className="col-span-full py-20 text-center text-slate-300 border-2 border-dashed border-slate-200 rounded-[32px]">
                            <Icon icon="solar:bag-3-bold-duotone" className="mx-auto text-6xl mb-4 opacity-10" />
                            <p className="font-bold">No flash sale products added</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Product Modal */}
            <AnimatePresence>
                {showProductModal && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowProductModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden relative z-10 p-10 max-h-[90vh] flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black text-slate-900">{editingProduct ? 'Edit Flash Item' : 'New Flash Item'}</h3>
                                <button onClick={() => setShowProductModal(false)} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:text-red-500 transition-all"><Icon icon="solar:close-circle-bold" width={24} height={24}/></button>
                            </div>

                            <form className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1" onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const data = {
                                    title: formData.get('title'),
                                    product_id: formData.get('product_id'),
                                    discount_percent: Number(formData.get('discount_percent')),
                                    old_price: Number(formData.get('old_price')),
                                    sale_price: Number(formData.get('sale_price')),
                                    product_image: editingProduct?.product_image || '',
                                    sort_order: Number(formData.get('sort_order'))
                                };

                                setIsSaving(true);
                                try {
                                    if (editingProduct) {
                                        await adminService.updateFlashSaleProduct(editingProduct.id, data);
                                    } else {
                                        await adminService.addFlashSaleProduct(data);
                                    }
                                    loadData();
                                    setShowProductModal(false);
                                } catch (e) { console.error(e); }
                                finally { setIsSaving(false); }
                            }}>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Product</label>
                                    <select 
                                        name="product_id"
                                        required
                                        defaultValue={editingProduct?.product_id || ''}
                                        onChange={(e) => {
                                            const selected = allProducts.find(p => p.id === e.target.value);
                                            if (selected) {
                                                // Pre-fill
                                                const form = e.target.closest('form');
                                                if (form) {
                                                    (form.elements.namedItem('title') as HTMLInputElement).value = selected.name;
                                                    (form.elements.namedItem('old_price') as HTMLInputElement).value = selected.price.toString();
                                                }
                                            }
                                        }}
                                        className="w-full bg-slate-50 border border-slate-100 py-4 px-4 rounded-2xl text-sm font-bold outline-none"
                                    >
                                        <option value="">Choose a product...</option>
                                        {allProducts.map(p => <option key={p.id} value={p.id}>{p.name} - {formatPrice(p.price)}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Flash Title</label>
                                    <input name="title" required defaultValue={editingProduct?.title || ''} className="w-full bg-slate-50 border border-slate-100 py-4 px-4 rounded-2xl text-sm font-bold outline-none" />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Old Price (৳)</label>
                                        <input name="old_price" type="number" required defaultValue={editingProduct?.old_price || ''} className="w-full bg-slate-50 border border-slate-100 py-4 px-4 rounded-2xl text-sm font-bold outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sale Price (৳)</label>
                                        <input name="sale_price" type="number" required defaultValue={editingProduct?.sale_price || ''} className="w-full bg-slate-50 border border-slate-100 py-4 px-4 rounded-2xl text-sm font-bold outline-none" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Discount %</label>
                                        <input name="discount_percent" type="number" required defaultValue={editingProduct?.discount_percent || ''} className="w-full bg-slate-50 border border-slate-100 py-4 px-4 rounded-2xl text-sm font-bold outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sort Order</label>
                                        <input name="sort_order" type="number" defaultValue={editingProduct?.sort_order || 0} className="w-full bg-slate-50 border border-slate-100 py-4 px-4 rounded-2xl text-sm font-bold outline-none" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Image Override</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                                            {editingProduct?.product_image && <img src={editingProduct.product_image} className="w-full h-full object-cover" alt="" />}
                                        </div>
                                        <label className="flex-1 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl h-20 flex items-center justify-center cursor-pointer hover:border-primary group transition-all">
                                            <Icon icon="solar:camera-bold-duotone" className="text-slate-300 group-hover:text-primary mr-2" width={24} height={24} />
                                            <span className="text-[10px] font-black text-slate-400 uppercase">Change Image</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setIsSaving(true);
                                                    try {
                                                        const opt = await optimizeImage(file);
                                                        const fd = new FormData();
                                                        fd.append('image', opt, 'flash.webp');
                                                        const res = await fetch('/api/admin/flash-sale/upload', { method: 'POST', body: fd });
                                                        const data = await res.json();
                                                        if (data.url) setEditingProduct({ ...editingProduct, product_image: data.url });
                                                    } finally { setIsSaving(false); }
                                                }
                                            }} />
                                        </label>
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    className="w-full py-5 bg-primary text-white rounded-[24px] font-black shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
                                >
                                    {isSaving ? <Icon icon="eos-icons:loading" className="animate-spin" /> : <Icon icon="solar:check-circle-bold" />}
                                    {editingProduct ? 'Update Product' : 'Add to Flash Sale'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
