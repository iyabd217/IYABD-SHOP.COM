import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Check, Search, UploadCloud, Trash2, Edit } from 'lucide-react';
import { productService, optimizeImage } from '../../lib/services';

const CATEGORIES = [
  { id: 'polo-shirt', label: 'Add Polo Products' },
  { id: 'premium-shirt', label: 'Add Shirt Products' },
  { id: 'punjabi', label: 'Add Punjabi Products' },
  { id: 'women-fashion', label: 'Add Women Products' },
  { id: 'tshirt', label: 'Add T-Shirts' },
  { id: 'tops-hoodies', label: 'Add Hoodies & Tops' }
];

const CategoryProductsManagement = () => {
    const [activeTab, setActiveTab] = useState(CATEGORIES[0].id);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Form fields
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        oldPrice: '',
        rating: '5',
        description: '',
        stock: '100',
        active: true
    });
    
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [categoryProducts, setCategoryProducts] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).slice(0, 8); // Max 8
            setImages([...images, ...files]);
            
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImagePreviews([...imagePreviews, ...newPreviews]);
        }
    };
    
    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
        
        const newPreviews = [...imagePreviews];
        newPreviews.splice(index, 1);
        setImagePreviews(newPreviews);
    };

    useEffect(() => {
        const unsub = productService.subscribe({ category: activeTab }, (data) => {
            setCategoryProducts(data);
        });
        return () => unsub();
    }, [activeTab]);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            await productService.delete(id);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.price) {
            alert('Name and Price are required');
            return;
        }

        setSaving(true);
        try {
            let imageUrls = [];
            // Upload images to gallery
            if (images.length > 0) {
                const imageFormData = new FormData();
                images.forEach(img => {
                    imageFormData.append('images', img);
                });
                
                const uploadRes = await fetch('/api/products/gallery', {
                    method: 'POST',
                    body: imageFormData
                });
                
                const uploadData = await uploadRes.json();
                imageUrls = uploadData.urls;
            }

            const productData = {
                name: formData.name,
                title: formData.name,
                category: activeTab,
                price: Number(formData.price),
                sale_price: Number(formData.price),
                oldPrice: formData.oldPrice ? Number(formData.oldPrice) : 0,
                old_price: formData.oldPrice ? Number(formData.oldPrice) : 0,
                rating: Number(formData.rating),
                description: formData.description,
                stock: Number(formData.stock),
                active: formData.active,
                status: formData.active ? 'active' : 'draft',
            };
            
            if (imageUrls && imageUrls.length > 0) {
                (productData as any).image = imageUrls[0];
                (productData as any).product_image = imageUrls[0];
                (productData as any).gallery = imageUrls;
            }

            if (editingId) {
                await productService.update(editingId, productData);
                alert('Product updated!');
            } else {
                await productService.create(productData);
                alert('Product added completely!');
            }
            
            setShowForm(false);
            setEditingId(null);
            setFormData({ name: '', price: '', oldPrice: '', rating: '5', description: '', stock: '100', active: true });
            setImages([]);
            setImagePreviews([]);
        } catch (error) {
            console.error(error);
            alert('Failed to save product');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (product: any) => {
        setEditingId(product.id);
        setFormData({
            name: product.name || product.title || '',
            price: product.price || product.sale_price || '',
            oldPrice: product.oldPrice || product.old_price || '',
            rating: product.rating || '5',
            description: product.description || '',
            stock: product.stock || '100',
            active: typeof product.active !== 'undefined' ? product.active : true
        });
        setImagePreviews(product.gallery || (product.image ? [product.image] : []));
        setImages([]); // we do not load file objects, just previews
        setShowForm(true);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-800">Category Products</h1>
                    <p className="text-slate-500 text-sm">Add and manage fashion products by specific categories.</p>
                </div>
                {!showForm && (
                     <button 
                         onClick={() => setShowForm(true)}
                         className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-colors"
                     >
                         <Plus size={18} /> Add Product
                     </button>
                )}
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl overflow-x-auto scrollbar-hide mb-8">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => { setActiveTab(cat.id); setShowForm(false); }}
                        className={`flex-shrink-0 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                            activeTab === cat.id ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {!showForm && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryProducts.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-400 font-bold">No products found for this category.</div>
                    )}
                    {categoryProducts.map((product) => (
                        <div key={product.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex gap-4">
                            <div className="w-24 h-24 rounded-xl bg-slate-50 overflow-hidden flex-shrink-0">
                                <img src={product.image || product.product_image} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-800 truncate">{product.name || product.title}</h3>
                                <p className="text-sm font-bold text-primary mt-1">৳{product.price || product.sale_price}</p>
                                <div className="flex items-center gap-2 mt-3">
                                    <button onClick={() => handleEdit(product)} className="text-xs font-bold text-slate-500 hover:text-primary flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg">
                                        <Edit size={14} /> Edit
                                    </button>
                                    <button onClick={() => handleDelete(product.id)} className="text-xs font-bold text-slate-500 hover:text-red-500 flex items-center gap-1 bg-slate-50 px-3 py-1.5 rounded-lg">
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                            Add to <span className="text-primary">{CATEGORIES.find(c => c.id === activeTab)?.label}</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Product Name</label>
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Enter product name..."
                                />
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Price (৳)</label>
                                    <input 
                                        type="number" 
                                        value={formData.price}
                                        onChange={e => setFormData({...formData, price: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Discount Price</label>
                                    <input 
                                        type="number" 
                                        value={formData.oldPrice}
                                        onChange={e => setFormData({...formData, oldPrice: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Rating</label>
                                    <input 
                                        type="number" 
                                        step="0.1"
                                        value={formData.rating}
                                        onChange={e => setFormData({...formData, rating: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Stock</label>
                                    <input 
                                        type="number" 
                                        value={formData.stock}
                                        onChange={e => setFormData({...formData, stock: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Description</label>
                                <div className="h-48 mb-8">
                                    <textarea 
                                        value={formData.description} 
                                        onChange={e => setFormData({...formData, description: e.target.value})} 
                                        className="w-full h-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" 
                                        placeholder="Product description..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Images */}
                        <div className="space-y-5">
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Product Images</label>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {imagePreviews.map((src, idx) => (
                                        <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden group">
                                            <img src={src} className="w-full h-full object-cover" />
                                            <button onClick={() => removeImage(idx)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="text-white" size={20} />
                                            </button>
                                        </div>
                                    ))}
                                    {imagePreviews.length < 8 && (
                                        <label className="aspect-[3/4] border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-primary hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors">
                                            <Plus size={24} className="mb-2" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Add Photo</span>
                                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                                        </label>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 font-medium">Select multiple images to create a gallery slider. First image is thumbnail.</p>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex justify-between items-center">
                                <label className="text-sm font-bold text-slate-700">Active Status</label>
                                <button 
                                    onClick={() => setFormData({...formData, active: !formData.active})}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.active ? 'bg-green-500' : 'bg-slate-300'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${formData.active ? 'translate-x-6' : ''}`} />
                                </button>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setShowForm(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                                    {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={18} />}
                                    {saving ? 'Saving...' : 'Publish'}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default CategoryProductsManagement;
