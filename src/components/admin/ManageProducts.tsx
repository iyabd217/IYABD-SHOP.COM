import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Edit, Trash2, MoreVertical, Check, X,
  Filter, Tag, ImageIcon, Video, Box, ArrowLeft, ArrowRight, Save, LayoutGrid, Clock, AlertTriangle, Play, Eye, 
  Copy, QrCode, Share2, ToggleRight, Archive, EyeOff, Layers, TrendingUp, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { productService, storageService, optimizeImage, brandService, categoryService } from '../../lib/services';
import { useSettings } from '../../context/SettingsContext';

const ManageProducts: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [menuState, setMenuState] = useState<{
        isOpen: boolean;
        product: any | null;
    }>({ isOpen: false, product: null });

    const [productToDelete, setProductToDelete] = useState<any | null>(null);
    const [viewProduct, setViewProduct] = useState<any | null>(null);
    const [quickEditProduct, setQuickEditProduct] = useState<any | null>(null);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);

    const [mainImage, setMainImage] = useState<string | null>(null);
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [galleryImageFiles, setGalleryImageFiles] = useState<File[]>([]);
    
    // File inputs refs
    const mainImageRef = useRef<HTMLInputElement>(null);
    const galleryImageRef = useRef<HTMLInputElement>(null);

    // Form data
    const [formData, setFormData] = useState({
        name: '', 
        slug: '', 
        sku: '', 
        category: '', 
        subCategory: '', 
        brand: '', 
        tags: '',
        regularPrice: '', 
        discountPrice: '', 
        tax: '', 
        stockQuantity: '', 
        lowStockAlert: '',
        active: true, 
        featured: false, 
        bestSeller: false, 
        newArrival: false,
        weight: '', 
        dimensions: '', 
        shippingClass: 'Standard',
        metaTitle: '', 
        metaDescription: '', 
        keywords: '',
        description: ''
    });

    const [saving, setSaving] = useState(false);
    const [sizes, setSizes] = useState<string[]>([]);
    const [colors, setColors] = useState<string[]>([]);
    const [sizeInput, setSizeInput] = useState('');
    const [colorInput, setColorInput] = useState('');

    // Initial Fetch (Real-time)
    useEffect(() => {
        const unsubscribe = productService.subscribe((data) => {
            setProducts(data);
            setLoading(false);
        });

        const fetchMeta = async () => {
            const [cData, bData] = await Promise.all([
                categoryService.getAll(),
                brandService.getAll()
            ]);
            setCategories(cData);
            setBrands(bData);
        };
        fetchMeta();

        return () => unsubscribe();
    }, []);

    const fetchProducts = async () => {
        // fetchProducts is now handled by subscribe, but we keep it as a fallback or for manual refresh if needed
        setLoading(true);
        try {
            const data = await productService.getAll();
            setProducts(data);
        } catch (error) {
            console.error("Fetch products error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isGallery: boolean) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        
        Array.from(files).forEach(file => {
            if (isGallery) {
                setGalleryImageFiles(prev => [...prev, file]);
                const reader = new FileReader();
                reader.onloadend = () => setGalleryImages(prev => [...prev, reader.result as string]);
                reader.readAsDataURL(file);
            } else {
                setMainImageFile(file);
                const reader = new FileReader();
                reader.onloadend = () => setMainImage(reader.result as string);
                reader.readAsDataURL(file);
            }
        });
    };

    const openMenu = (e: React.MouseEvent, prod: any) => {
        e.stopPropagation();
        setMenuState({ isOpen: true, product: prod });
    };

    const closeMenu = () => setMenuState({ isOpen: false, product: null });

    const handleAction = async (label: string, prod: any) => {
        closeMenu();
        
        switch (label) {
            case 'View Product':
                setViewProduct(prod);
                break;
            case 'Edit Product':
                setEditingProduct(prod);
                setFormData({
                    name: prod.name,
                    slug: prod.slug || '',
                    sku: prod.sku || '',
                    category: prod.category || '',
                    subCategory: prod.subCategory || '',
                    brand: prod.brand || '',
                    tags: prod.tags || '',
                    regularPrice: prod.price?.toString() || '',
                    discountPrice: prod.discountPrice?.toString() || '',
                    tax: prod.tax?.toString() || '',
                    stockQuantity: prod.stock?.toString() || '',
                    lowStockAlert: prod.lowStockAlert?.toString() || '',
                    active: prod.status === 'Published',
                    featured: prod.featured || false,
                    bestSeller: prod.bestSeller || false,
                    newArrival: prod.newArrival || false,
                    weight: prod.weight || '',
                    dimensions: prod.dimensions || '',
                    shippingClass: prod.shippingClass || 'Standard',
                    metaTitle: prod.metaTitle || '',
                    metaDescription: prod.metaDescription || '',
                    keywords: prod.keywords || '',
                    description: prod.description || ''
                });
                setMainImage(prod.image || null);
                setGalleryImages(prod.gallery || []);
                setSizes(prod.sizes || []);
                setColors(prod.colors || []);
                setShowAddForm(true);
                break;
            case 'Quick Edit':
                setQuickEditProduct(prod);
                break;
            case 'Duplicate':
                setLoading(true);
                const duplicateData = {
                    ...prod,
                    name: `${prod.name} (Copy)`,
                    sku: `${prod.sku}-COPY`,
                    sold: 0,
                    rating: 5.0,
                    createdAt: undefined,
                    updatedAt: undefined
                };
                delete duplicateData.id;
                await productService.create(duplicateData);
                fetchProducts();
                break;
            case 'Delete':
                setProductToDelete(prod);
                break;
            case 'Publish':
                await productService.update(prod.id, { status: 'Published' });
                fetchProducts();
                break;
            case 'Draft':
                await productService.update(prod.id, { status: 'Draft' });
                fetchProducts();
                break;
            case 'Hide':
                await productService.update(prod.id, { status: 'Hidden' });
                fetchProducts();
                break;
            case 'Archive':
                await productService.update(prod.id, { status: 'Archived' });
                fetchProducts();
                break;
            case 'Featured':
                await productService.update(prod.id, { featured: !prod.featured });
                fetchProducts();
                break;
            case 'Flash Sale':
                await productService.update(prod.id, { flashSale: !prod.flashSale });
                fetchProducts();
                break;
            case 'Trending':
                await productService.update(prod.id, { trending: !prod.trending });
                fetchProducts();
                break;
            case 'Stock Update':
                setQuickEditProduct(prod);
                break;
            case 'QR Code':
                alert(`QR Code for ${prod.name} generated! (Demo)`);
                break;
            case 'Share':
                if (navigator.share) {
                    navigator.share({
                        title: prod.name,
                        url: `${window.location.origin}/product/${prod.id}`
                    }).catch(console.error);
                } else {
                    navigator.clipboard.writeText(`${window.location.origin}/product/${prod.id}`);
                    alert('Link copied to clipboard (Share not supported)');
                }
                break;
            case 'Out of Stock':
                await productService.update(prod.id, { stock: 0, status: 'Out of Stock' });
                break;
            case 'Copy Link':
                navigator.clipboard.writeText(`${window.location.origin}/product/${prod.id}`);
                alert('Link copied to clipboard');
                break;
            default:
                console.log(`Action ${label} on ${prod.name}`);
        }
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;
        setLoading(true);
        try {
            await productService.delete(productToDelete.id);
            // Optionally delete images from storage here if needed
            fetchProducts();
        } catch (error) {
            alert('Error deleting product');
        } finally {
            setProductToDelete(null);
            setLoading(false);
        }
    };

    // Stats
    const statsData = [
      { id: 1, title: 'Total Products', value: (products?.length || 0).toString(), icon: Box, color: 'text-blue-600', bg: 'bg-blue-100' },
      { id: 2, title: 'Published', value: (products?.filter(p => p.status === 'Published').length || 0).toString(), icon: Check, color: 'text-emerald-600', bg: 'bg-emerald-100' },
      { id: 3, title: 'Draft', value: (products?.filter(p => p.status === 'Draft' || p.status === 'Archived').length || 0).toString(), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
      { id: 4, title: 'Out Of Stock', value: (products?.filter(p => p.stock <= 0).length || 0).toString(), icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-100' },
      { id: 5, title: 'Low Stock', value: (products?.filter(p => p.stock > 0 && p.stock <= (p.lowStockAlert || 5)).length || 0).toString(), icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100' },
    ];

    const addSize = () => {
        if (sizeInput && !sizes.includes(sizeInput)) {
            setSizes([...sizes, sizeInput]);
            setSizeInput('');
        }
    };

    const removeSize = (s: string) => setSizes(sizes.filter(item => item !== s));

    const addColor = () => {
        if (colorInput && !colors.includes(colorInput)) {
            setColors([...colors, colorInput]);
            setColorInput('');
        }
    };

    const removeColor = (c: string) => setColors(colors.filter(item => item !== c));

    const handleSave = async () => {
        // Validation
        if (!formData.name || !formData.regularPrice || !formData.category) {
            alert('Please fill in required fields (Name, Price, Category)');
            return;
        }

        setSaving(true);

        try {
            const finalSlug = formData.slug || formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            const finalSku = formData.sku || `SKU-${Math.floor(Math.random() * 1000000)}`;

            let mainImageUrl = mainImage;
            const galleryUrls: string[] = [...galleryImages];

            // If it's a new product, we need a path/id for storage
            const tempProductId = editingProduct?.id || `prod_${Date.now()}`;

            // Optimize and Upload Main Image if changed
            if (mainImageFile) {
                const optimized = await optimizeImage(mainImageFile);
                const uploadResult = await storageService.uploadProductImage(tempProductId, optimized);
                mainImageUrl = uploadResult.url;
            }

            // Optimize and Upload Gallery Images if any new ones
            if (galleryImageFiles.length > 0) {
                for (let i = 0; i < galleryImageFiles.length; i++) {
                    const optimized = await optimizeImage(galleryImageFiles[i]);
                    const uploadResult = await storageService.uploadProductImage(tempProductId, optimized, i);
                    galleryUrls.push(uploadResult.url);
                }
            }

            const productData = {
                name: formData.name,
                slug: finalSlug,
                sku: finalSku,
                category: formData.category,
                subCategory: formData.subCategory,
                brand: formData.brand,
                tags: formData.tags,
                price: parseFloat(formData.regularPrice),
                discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
                tax: formData.tax ? parseFloat(formData.tax) : 0,
                stock: parseInt(formData.stockQuantity || '0'),
                lowStockAlert: formData.lowStockAlert ? parseInt(formData.lowStockAlert) : 5,
                status: formData.active ? 'Published' : 'Draft',
                featured: formData.featured,
                bestSeller: formData.bestSeller,
                newArrival: formData.newArrival,
                image: mainImageUrl,
                gallery: galleryUrls,
                sizes,
                colors,
                weight: formData.weight,
                dimensions: formData.dimensions,
                shippingClass: formData.shippingClass,
                metaTitle: formData.metaTitle,
                metaDescription: formData.metaDescription,
                keywords: formData.keywords,
                description: formData.description,
                rating: editingProduct?.rating || 5.0,
                sold: editingProduct?.sold || 0
            };

            // Auto-save brand if new
            if (formData.brand && !brands.some(b => b.name === formData.brand)) {
                await brandService.create(formData.brand);
            }

            if (editingProduct) {
                await productService.update(editingProduct.id, productData);
            } else {
                await productService.create(productData);
            }

            alert('Product Saved Successfully!');
            setShowAddForm(false);
            setEditingProduct(null);
            fetchProducts();
            
            // Reset form
            setFormData({
                name: '', slug: '', sku: '', category: '', subCategory: '', brand: '', tags: '',
                regularPrice: '', discountPrice: '', tax: '', stockQuantity: '', lowStockAlert: '',
                active: true, featured: false, bestSeller: false, newArrival: false,
                weight: '', dimensions: '', shippingClass: 'Standard',
                metaTitle: '', metaDescription: '', keywords: '', description: ''
            });
            setMainImage(null);
            setMainImageFile(null);
            setGalleryImages([]);
            setGalleryImageFiles([]);
            setSizes([]);
            setColors([]);
        } catch (error) {
            console.error("Save Error:", error);
            alert('Failed to save product. Please check console for details.');
        } finally {
            setSaving(false);
        }
    };

    if (showAddForm) {
      return (
        <div className="w-full h-full p-4 sm:p-6 pb-24 font-['Poppins',sans-serif]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowAddForm(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm hover:bg-slate-50 transition-colors">
                        <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Add New Product</h2>
                        <p className="text-sm text-slate-500">Create a new product for your store</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowAddForm(false)} className="px-6 py-3 rounded-[16px] bg-white border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors">
                        Discard
                    </button>
                    <button 
                        disabled={saving}
                        onClick={handleSave}
                        className={`px-6 py-3 rounded-[16px] text-white font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity ${saving ? 'opacity-70 cursor-not-allowed' : ''}`} 
                        style={{ background: '#6D28D9' }}
                    >
                        {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />} 
                        {saving ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 space-y-5">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">Basic Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Product Name *</label>
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#6D28D9]" 
                                    placeholder="e.g. Premium Cotton T-Shirt" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Product Slug (Auto-generated if empty)</label>
                                <input 
                                    type="text" 
                                    value={formData.slug}
                                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#6D28D9]" 
                                    placeholder="premium-cotton-t-shirt" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">SKU (Auto-generated if empty)</label>
                                <input 
                                    type="text" 
                                    value={formData.sku}
                                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#6D28D9]" 
                                    placeholder="TS-001" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Category *</label>
                                <select 
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#6D28D9]"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                    {categories.length === 0 && (
                                        <>
                                            <option value="Clothing">Clothing</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Fashion">Fashion</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Sub Category</label>
                                <select 
                                    value={formData.subCategory}
                                    onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#6D28D9]"
                                >
                                    <option value="">Select Sub Category</option>
                                    <option value="Men">Men</option>
                                    <option value="Women">Women</option>
                                    <option value="Accessories">Accessories</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Brand (Select or Type)</label>
                                <input 
                                    type="text" 
                                    list="brands-list"
                                    value={formData.brand}
                                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#6D28D9]" 
                                    placeholder="Gucci, Nike, Adidas..." 
                                />
                                <datalist id="brands-list">
                                    {brands.map(brand => (
                                        <option key={brand.id} value={brand.name} />
                                    ))}
                                </datalist>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                                <textarea 
                                    rows={5} 
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#6D28D9] resize-none" 
                                    placeholder="Enter full product details..."
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Tags</label>
                                <input 
                                    type="text" 
                                    value={formData.tags}
                                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#6D28D9]" 
                                    placeholder="Cotton, Summer, Men" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Stock */}
                    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 space-y-5">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">Pricing & Stock</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Regular Price *</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                    <input 
                                        type="number" 
                                        value={formData.regularPrice}
                                        onChange={(e) => setFormData({...formData, regularPrice: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-[12px] pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-[#6D28D9]" 
                                        placeholder="0.00" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Discount Price</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                    <input 
                                        type="number" 
                                        value={formData.discountPrice}
                                        onChange={(e) => setFormData({...formData, discountPrice: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-[12px] pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-[#6D28D9]" 
                                        placeholder="0.00" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Tax (%)</label>
                                <input 
                                    type="number" 
                                    value={formData.tax}
                                    onChange={(e) => setFormData({...formData, tax: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#6D28D9]" 
                                    placeholder="0" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Stock Quantity</label>
                                <input 
                                    type="number" 
                                    value={formData.stockQuantity}
                                    onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#6D28D9]" 
                                    placeholder="100" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Low Stock Alert</label>
                                <input 
                                    type="number" 
                                    value={formData.lowStockAlert}
                                    onChange={(e) => setFormData({...formData, lowStockAlert: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#6D28D9]" 
                                    placeholder="10" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Variations */}
                    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-bold text-slate-800">Variations</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Size</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={sizeInput}
                                        onChange={(e) => setSizeInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addSize()}
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#6D28D9]" 
                                        placeholder="Add size (e.g. XL)" 
                                    />
                                    <button onClick={addSize} className="px-4 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold flex items-center gap-1 hover:bg-slate-800 transition-colors">
                                        <Plus size={16} /> Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {sizes.map((s, idx) => (
                                        <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
                                            {s} <button onClick={() => removeSize(s)}><X size={14}/></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Color</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={colorInput}
                                        onChange={(e) => setColorInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addColor()}
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#6D28D9]" 
                                        placeholder="Add color (e.g. Red)" 
                                    />
                                    <button onClick={addColor} className="px-4 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold flex items-center gap-1 hover:bg-slate-800 transition-colors">
                                        <Plus size={16} /> Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {colors.map((c, idx) => (
                                        <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
                                            {c} <button onClick={() => removeColor(c)}><X size={14}/></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping */}
                    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 space-y-5">
                       <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">Shipping</h3>
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Weight (kg)</label>
                                <input 
                                    type="number" 
                                    value={formData.weight}
                                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#6D28D9]" 
                                    placeholder="0.5" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Dimensions (cm) L x W x H</label>
                                <input 
                                    type="text" 
                                    value={formData.dimensions}
                                    onChange={(e) => setFormData({...formData, dimensions: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#6D28D9]" 
                                    placeholder="10x10x10" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Shipping Class</label>
                                <select 
                                    value={formData.shippingClass}
                                    onChange={(e) => setFormData({...formData, shippingClass: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#6D28D9]"
                                >
                                    <option value="Standard">Standard</option>
                                    <option value="Express">Express</option>
                                    <option value="Free Delivery">Free Delivery</option>
                                    <option value="Fragile">Fragile</option>
                                    <option value="Heavy Product">Heavy Product</option>
                                </select>
                            </div>
                       </div>
                    </div>

                    {/* SEO & Meta */}
                    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 space-y-5">
                       <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">SEO & Meta</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Meta Title</label>
                                <input 
                                    type="text" 
                                    value={formData.metaTitle}
                                    onChange={(e) => setFormData({...formData, metaTitle: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#6D28D9]" 
                                    placeholder="Product Meta Title" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Meta Description</label>
                                <textarea 
                                    rows={3} 
                                    value={formData.metaDescription}
                                    onChange={(e) => setFormData({...formData, metaDescription: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#6D28D9] resize-none" 
                                    placeholder="Product Meta Description"
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Keywords</label>
                                <input 
                                    type="text" 
                                    value={formData.keywords}
                                    onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#6D28D9]" 
                                    placeholder="keyword1, keyword2" 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Product Status */}
                    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 space-y-5">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">Product Status</h3>
                        <div className="space-y-4">
                            {[
                                { id: 'active', label: 'Active', desc: 'Product will be visible on store', value: formData.active },
                                { id: 'featured', label: 'Featured Product', desc: 'Show in featured section', value: formData.featured },
                                { id: 'bestSeller', label: 'Best Seller', desc: 'Add best seller badge', value: formData.bestSeller },
                                { id: 'newArrival', label: 'New Arrival', desc: 'Add new arrival badge', value: formData.newArrival }
                            ].map((item, i) => (
                                <div key={i} className="flex items-start justify-between">
                                    <div>
                                        <p className="font-semibold text-slate-700 text-sm">{item.label}</p>
                                        <p className="text-xs text-slate-500">{item.desc}</p>
                                    </div>
                                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in mt-1">
                                        <input 
                                            type="checkbox" 
                                            name="toggle" 
                                            id={item.id} 
                                            className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer" 
                                            checked={item.value} 
                                            onChange={(e) => setFormData({...formData, [item.id]: e.target.checked})}
                                            style={{ right: item.value ? '0' : 'auto', left: item.value ? 'auto' : '0' }} 
                                        />
                                        <label htmlFor={item.id} className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${item.value ? 'bg-[#6D28D9]' : 'bg-slate-300'}`}></label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Images */}
                    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 space-y-5">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex justify-between items-center">
                            Product Images
                            <span className="text-xs text-slate-400 font-normal">Max 5MB</span>
                        </h3>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Main Upload</label>
                            <input type="file" ref={mainImageRef} onChange={e => handleFileChange(e, false)} className="hidden" accept="image/*" />
                            <div 
                                onClick={() => mainImageRef.current?.click()}
                                className="w-full h-40 border-2 border-dashed border-slate-200 rounded-[24px] bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-[#6D28D9] transition-all overflow-hidden relative group"
                            >
                                {mainImage ? (
                                    <>
                                        <img src={mainImage} alt="Main" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <p className="text-white font-bold text-sm">Change Image</p>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setMainImage(null); }}
                                            className="absolute top-2 right-2 bg-rose-500 text-white p-1.5 rounded-full shadow-lg"
                                        >
                                            <X size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon size={32} className="text-slate-400 mb-2" />
                                        <p className="text-sm font-semibold text-[#6D28D9]">Click to upload main image</p>
                                        <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP</p>
                                    </>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Thumbnail Gallery (Optional)</label>
                            <input type="file" ref={galleryImageRef} onChange={e => handleFileChange(e, true)} className="hidden" accept="image/*" multiple />
                            <div className="grid grid-cols-3 gap-3">
                                {galleryImages.map((img, i) => (
                                    <div key={i} className="aspect-square rounded-[12px] overflow-hidden relative group">
                                        <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                                        <button 
                                            onClick={() => setGalleryImages(galleryImages.filter((_, idx) => idx !== i))}
                                            className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                {galleryImages.length < 15 && (
                                    <div 
                                        onClick={() => galleryImageRef.current?.click()}
                                        className="aspect-square border-2 border-dashed border-slate-200 rounded-[12px] bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-[#6D28D9] text-[#6D28D9] text-xs font-semibold text-center p-2"
                                    >
                                        <Plus size={16} className="mb-1" /> Add More
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Product Media */}
                    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 space-y-5">
                        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3">Product Media</h3>
                         <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Video Upload (Optional)</label>
                            <div className="w-full h-32 border-2 border-dashed border-slate-200 rounded-[16px] bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-[#6D28D9] transition-colors">
                                <Video size={24} className="text-slate-400 mb-2" />
                                <p className="text-sm font-semibold text-[#6D28D9]">Upload Video</p>
                                <p className="text-xs text-slate-500 mt-1">MP4, max 10MB</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            
            {/* Mobile Bottom Navigation (Hidden on desktop) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 sm:hidden flex justify-between gap-3 z-50 rounded-t-[24px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                 <button onClick={() => setShowAddForm(false)} className="flex-1 py-3.5 rounded-[16px] bg-slate-100 text-slate-700 font-semibold text-sm">
                    Discard
                </button>
                <button 
                    disabled={saving}
                    onClick={handleSave}
                    className={`flex-[2] py-3.5 rounded-[16px] text-white font-semibold text-sm shadow-lg flex justify-center items-center gap-2 ${saving ? 'opacity-70' : ''}`} 
                    style={{ background: '#6D28D9' }}
                >
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />} 
                    {saving ? 'Saving...' : 'Save Product'}
                </button>
            </div>
            <style dangerouslySetInnerHTML={{__html:`
                .toggle-checkbox:checked { right: 0; border-color: #6D28D9; background-color: white; transform: translateX(100%); }
                .toggle-checkbox:checked + .toggle-label { background-color: #6D28D9; }
            `}} />
        </div>
      );
    }

    return (
        <div className="w-full h-full p-4 sm:p-6 pb-24 font-['Poppins',sans-serif]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 hidden sm:flex">
                <div>
                   <h2 className="text-2xl font-bold text-slate-800">Products List</h2>
                   <p className="text-sm text-slate-500">Manage your store products and inventory</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-3 rounded-[16px] bg-white border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors shadow-sm">
                        Export
                    </button>
                    <button className="flex items-center gap-2 px-5 py-3 rounded-[16px] bg-white border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors shadow-sm">
                        Import
                    </button>
                    <button 
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center justify-center gap-2 text-white px-6 py-3 rounded-[16px] font-semibold text-sm shadow-md hover:opacity-90 transition-all"
                        style={{ background: '#6D28D9' }}
                    >
                        <Plus size={18} strokeWidth={2.5} /> Add Product
                    </button>
                </div>
            </div>

            {/* Mobile Header Equivalent */}
            <div className="sm:hidden space-y-4 mb-6">
                 <div className="flex items-center justify-between">
                   <h2 className="text-xl font-bold text-slate-800">Products</h2>
                </div>
                <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search Products..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-[16px] text-sm focus:outline-none focus:border-[#6D28D9] transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {statsData.map(stat => (
                    <div key={stat.id} className="bg-white p-5 rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col items-start gap-4">
                        <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                            <p className="text-xs font-semibold text-slate-500 mt-0.5">{stat.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-[24px] p-4 mb-6 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex flex-col md:flex-row gap-4 justify-between items-center">
                 <div className="relative w-full md:w-96 hidden md:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search Products..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-[12px] text-sm focus:outline-none focus:border-[#6D28D9] transition-all"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                     <select className="flex-1 md:flex-none w-full md:w-auto bg-slate-50 border border-slate-200 rounded-[12px] px-4 py-2.5 text-sm outline-none text-slate-600 font-medium">
                        <option>Category Filter</option>
                     </select>
                     <select className="flex-1 md:flex-none w-full md:w-auto bg-slate-50 border border-slate-200 rounded-[12px] px-4 py-2.5 text-sm outline-none text-slate-600 font-medium">
                        <option>Status Filter</option>
                     </select>
                     <select className="flex-1 md:flex-none w-full md:w-auto bg-slate-50 border border-slate-200 rounded-[12px] px-4 py-2.5 text-sm outline-none text-slate-600 font-medium">
                        <option>Stock Filter</option>
                     </select>
                     <button className="flex-1 md:flex-none w-full md:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-[12px] text-sm font-semibold hover:bg-slate-800 transition-colors">
                        <Filter size={16} /> Filter
                     </button>
                </div>
            </div>

            {/* Desktop Table (Hidden on Mobile) */}
            <div className="hidden md:block bg-white rounded-[24px] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50">
                            <th className="p-4 font-semibold text-slate-500 text-sm pl-6">Product Image</th>
                            <th className="p-4 font-semibold text-slate-500 text-sm">Product Name</th>
                            <th className="p-4 font-semibold text-slate-500 text-sm">SKU</th>
                            <th className="p-4 font-semibold text-slate-500 text-sm">Category</th>
                            <th className="p-4 font-semibold text-slate-500 text-sm">Price</th>
                            <th className="p-4 font-semibold text-slate-500 text-sm">Rating / Sold</th>
                            <th className="p-4 font-semibold text-slate-500 text-sm">Status & Badges</th>
                            <th className="p-4 font-semibold text-slate-500 text-sm pr-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products?.map((prod) => (
                            <tr key={prod.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 pl-6">
                                    <div className="w-12 h-12 rounded-[12px] overflow-hidden bg-slate-100">
                                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                                    </div>
                                </td>
                                <td className="p-4 font-semibold text-slate-800 text-sm">{prod.name}</td>
                                <td className="p-4 text-slate-500 text-sm">{prod.sku}</td>
                                <td className="p-4 text-slate-500 text-sm">{prod.category}</td>
                                <td className="p-4 font-bold text-slate-800 text-sm">${prod.price}{prod.discount > 0 && <span className="text-xs text-rose-500 ml-1">-{prod.discount}%</span>}</td>
                                <td className="p-4 text-slate-700 text-sm">
                                    <div className="flex items-center gap-1 font-medium">
                                        <span className="text-yellow-400">⭐</span> {prod.rating}
                                        <span className="text-slate-400 ml-2">{(prod.sold/1000).toFixed(1)}k</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-1">
                                       <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${prod.status === 'Published' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                                           {prod.status}
                                       </span>
                                       {prod.featured && <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded-full">Featured</span>}
                                       {prod.flashSale && <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-full">Flash Sale</span>}
                                       {prod.trending && <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full">Trending</span>}
                                    </div>
                                </td>
                                <td className="p-4 pr-6">
                                    <div className="flex items-center justify-end gap-2 text-slate-400">
                                        <button onClick={() => setViewProduct(prod)} className="p-1.5 hover:bg-slate-100 hover:text-slate-600 rounded-md transition-colors"><Eye size={16} /></button>
                                        <button onClick={() => handleAction('Edit Product', prod)} className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"><Edit size={16} /></button>
                                        <button onClick={(e) => openMenu(e, prod)} className="p-1.5 hover:bg-slate-100 hover:text-slate-600 rounded-md transition-colors"><MoreVertical size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Product Cards (Hidden on Desktop) */}
            <div className="md:hidden space-y-4">
                {products?.map((prod) => (
                     <div key={prod.id} className="bg-white p-4 rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-100 flex gap-4 relative overflow-hidden">
                         {prod.discount > 0 && (
                            <div className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">-{prod.discount}%</div>
                         )}
                         <div className="w-20 h-20 rounded-[14px] overflow-hidden bg-slate-100 shrink-0 relative">
                              <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-1 flex flex-col justify-between">
                              <div className="flex justify-between items-start">
                                   <div>
                                        <h4 className="font-semibold text-slate-800 text-sm line-clamp-1">{prod.name}</h4>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <span className="text-yellow-400 text-xs">⭐</span>
                                            <span className="text-slate-600 text-xs font-medium">{prod.rating}</span>
                                            <span className="text-slate-400 text-xs">({(prod.sold/1000).toFixed(1)}k Sold)</span>
                                        </div>
                                   </div>
                                   <button onClick={(e) => openMenu(e, prod)} className="text-slate-400"><MoreVertical size={16}/></button>
                              </div>
                              <div className="flex items-end justify-between mt-2">
                                  <div className="flex flex-col">
                                      <span className="font-bold text-slate-800 text-base">${prod.price}</span>
                                  </div>
                                  <div className="flex items-center gap-1 flex-wrap justify-end">
                                      {prod.featured && <span className="bg-purple-100 text-purple-700 text-[9px] font-bold px-1.5 py-0.5 rounded">Featured</span>}
                                      {prod.flashSale && <span className="bg-orange-100 text-orange-700 text-[9px] font-bold px-1.5 py-0.5 rounded">Flash Sale</span>}
                                      {prod.trending && <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded">Trending</span>}
                                  </div>
                              </div>
                         </div>
                     </div>
                ))}
            </div>

            {/* Product Menu Overlay */}
        <AnimatePresence>
            {menuState.isOpen && menuState.product && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={closeMenu} />
                    <motion.div 
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 md:absolute md:top-[60px] md:right-0 md:bottom-auto bg-white rounded-t-[24px] md:rounded-[24px] shadow-2xl z-50 p-4 w-full md:w-72 max-h-[80vh] overflow-y-auto"
                    >
                        <div className="md:hidden w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />
                        <h3 className="font-bold text-slate-800 text-lg mb-4">Actions: {menuState.product.name}</h3>
                        
                        <div className="space-y-6">
                            {[
                                { title: 'Product Actions', actions: [{ label: 'View Product', icon: Eye }, { label: 'Edit Product', icon: Edit }, { label: 'Quick Edit', icon: Edit }, { label: 'Duplicate', icon: Copy }, { label: 'Delete', icon: Trash2, danger: true }] },
                                { title: 'Status Control', actions: [{ label: 'Publish', icon: Check }, { label: 'Draft', icon: Clock }, { label: 'Hide', icon: EyeOff }, { label: 'Archive', icon: Archive }] },
                                { title: 'Marketing', actions: [{ label: 'Featured', icon: Layers }, { label: 'Flash Sale', icon: Zap }, { label: 'Trending', icon: TrendingUp }] },
                                { title: 'Inventory', actions: [{ label: 'Stock Update', icon: Box }, { label: 'Out of Stock', icon: ToggleRight }] },
                                { title: 'Share', actions: [{ label: 'Copy Link', icon: Copy }, { label: 'QR Code', icon: QrCode }, { label: 'Share', icon: Share2 }] }
                            ].map((section, idx) => (
                                <div key={idx}>
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">{section.title}</h4>
                                    <div className="space-y-0.5">
                                        {section.actions.map((action, aIdx) => (
                                            <button key={aIdx} onClick={() => handleAction(action.label, menuState.product)} className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm font-medium transition-colors ${action.danger ? 'text-rose-600 hover:bg-rose-50' : 'text-slate-700 hover:bg-slate-50'}`}>
                                                <action.icon size={16} /> {action.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
        
        {/* View Product Modal */}
        <AnimatePresence>
            {viewProduct && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm" onClick={() => setViewProduct(null)} />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-[32px] shadow-2xl z-[70] p-0 w-[95%] max-w-4xl max-h-[90vh] overflow-hidden"
                    >
                        <div className="flex flex-col md:flex-row h-full">
                            <div className="w-full md:w-1/2 h-64 md:h-auto bg-slate-100">
                                <img src={viewProduct.image} alt={viewProduct.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="w-full md:w-1/2 p-8 overflow-y-auto">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex gap-2 mb-2">
                                            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">{viewProduct.category}</span>
                                            {viewProduct.featured && <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded">Featured</span>}
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-800">{viewProduct.name}</h2>
                                        <p className="text-slate-500 text-sm mt-1">SKU: {viewProduct.sku}</p>
                                    </div>
                                    <button onClick={() => setViewProduct(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
                                </div>
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-3xl font-bold text-slate-800">${viewProduct.price}</span>
                                    {viewProduct.discount > 0 && <span className="text-lg text-rose-500 line-through opacity-50">${(viewProduct.price / (1 - viewProduct.discount/100)).toFixed(2)}</span>}
                                </div>
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                                        <span className="text-slate-500">Brand</span>
                                        <span className="font-bold text-slate-800">{viewProduct.brand || 'No Brand'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                                        <span className="text-slate-500">Stock Status</span>
                                        <span className={`font-bold ${viewProduct.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{viewProduct.stock > 0 ? `${viewProduct.stock} Units` : 'Out of Stock'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                                        <span className="text-slate-500">Total Sold</span>
                                        <span className="font-bold text-slate-800">{(viewProduct.sold/1000).toFixed(1)}k Units</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                                        <span className="text-slate-500">Avg Rating</span>
                                        <span className="font-bold text-slate-800 flex items-center gap-1">⭐ {viewProduct.rating}</span>
                                    </div>
                                    <div className="pt-4">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Description</h4>
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{viewProduct.description || 'No description provided.'}</p>
                                    </div>
                                    {viewProduct.gallery && viewProduct.gallery.length > 0 && (
                                        <div className="pt-4">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Gallery</h4>
                                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                                {viewProduct.gallery.map((img: string, i: number) => (
                                                    <img key={i} src={img} className="w-20 h-20 rounded-xl object-cover border border-slate-100" alt="Gallery" />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => { setViewProduct(null); handleAction('Edit Product', viewProduct); }} className="flex-1 py-3 px-6 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors">Edit Product</button>
                                    <button onClick={() => {
                                        setProductToDelete(viewProduct);
                                        setViewProduct(null);
                                    }} className="px-5 py-3 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"><Trash2 size={20}/></button>
                                    <button onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/product/${viewProduct.id}`);
                                        alert('Link copied!');
                                    }} className="px-5 py-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"><Share2 size={20}/></button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>

        {/* Quick Edit Drawer */}
        <AnimatePresence>
            {quickEditProduct && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm" onClick={() => setQuickEditProduct(null)} />
                    <motion.div 
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        className="fixed top-0 right-0 h-full bg-white shadow-2xl z-[70] p-6 w-full max-w-sm flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800">Quick Edit</h2>
                            <button onClick={() => setQuickEditProduct(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl mb-6">
                            <img src={quickEditProduct.image} className="w-12 h-12 rounded-lg object-cover" />
                            <div>
                                <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{quickEditProduct.name}</h3>
                                <p className="text-xs text-slate-500">{quickEditProduct.sku}</p>
                            </div>
                        </div>
                        <div className="space-y-5 flex-1 overflow-y-auto pr-2">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Price ($)</label>
                                <input 
                                    type="number" 
                                    value={quickEditProduct.price}
                                    onChange={(e) => setQuickEditProduct({...quickEditProduct, price: parseFloat(e.target.value)})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Stock Inventory</label>
                                <input 
                                    type="number" 
                                    value={quickEditProduct.stock}
                                    onChange={(e) => setQuickEditProduct({...quickEditProduct, stock: parseInt(e.target.value)})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sale Discount (%)</label>
                                <input 
                                    type="number" 
                                    value={quickEditProduct.discountPrice}
                                    onChange={(e) => setQuickEditProduct({...quickEditProduct, discountPrice: parseFloat(e.target.value)})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                                <span className="text-sm font-semibold text-slate-700">Flash Sale</span>
                                <button 
                                    onClick={() => setQuickEditProduct({...quickEditProduct, flashSale: !quickEditProduct.flashSale})}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${quickEditProduct.flashSale ? 'bg-blue-600' : 'bg-slate-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${quickEditProduct.flashSale ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                                <span className="text-sm font-semibold text-slate-700">Featured</span>
                                <button 
                                    onClick={() => setQuickEditProduct({...quickEditProduct, featured: !quickEditProduct.featured})}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${quickEditProduct.featured ? 'bg-purple-600' : 'bg-slate-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${quickEditProduct.featured ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-slate-100 mt-auto">
                            <button 
                                onClick={async () => { 
                                    setSaving(true);
                                    try {
                                        await productService.update(quickEditProduct.id, {
                                            price: quickEditProduct.price,
                                            stock: quickEditProduct.stock,
                                            discountPrice: quickEditProduct.discountPrice,
                                            flashSale: quickEditProduct.flashSale,
                                            featured: quickEditProduct.featured
                                        });
                                        alert('Settings saved successfully!');
                                        setQuickEditProduct(null); 
                                        fetchProducts();
                                    } catch (error) {
                                        alert('Failed to save changes');
                                    } finally {
                                        setSaving(false);
                                    }
                                }} 
                                disabled={saving}
                                className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
        
        {/* Delete Confirmation Modal */}
        <AnimatePresence>
            {productToDelete && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm" onClick={() => setProductToDelete(null)} />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-[24px] shadow-2xl z-[70] p-6 w-[90%] max-w-sm"
                    >
                        <h3 className="font-bold text-lg text-slate-800 mb-2">Are you sure?</h3>
                        <p className="text-slate-600 text-sm mb-6">Are you sure you want to permanently delete {productToDelete.name}? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setProductToDelete(null)} className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200">Cancel</button>
                            <button onClick={confirmDelete} className="flex-1 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700">Delete Permanently</button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
        
        {/* Floating Add Button for Mobile */}
            <button 
                onClick={() => setShowAddForm(true)}
                className="md:hidden fixed bottom-24 right-5 w-14 h-14 rounded-full text-white shadow-xl shadow-[#6D28D9]/30 flex items-center justify-center active:scale-95 transition-transform z-40"
                style={{ background: '#6D28D9' }}
            >
                <Plus size={24} strokeWidth={2.5} />
            </button>
        </div>
    );
};

export default ManageProducts;

