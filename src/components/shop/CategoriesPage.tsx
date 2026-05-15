import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, ChevronRight, ChevronDown, Filter, SlidersHorizontal, 
  ArrowRight, PackageX, Sparkles, SortAsc, LayoutGrid, Star, ArrowLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { adminService } from '../../lib/adminServices';
import { optimizeImg, formatPrice } from '../../lib/utils';
import { Meta } from '../../App';
import { productService } from '../../lib/services';

// Add new Component
export const ProfessionalCategoryPage = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      adminService.getCategories(),
      productService.getAll()
    ]).then(([catData, prodData]: [any, any]) => {
      let activeCats = catData?.filter((c: any) => c.is_active) || [];
      if (activeCats.length === 0) {
        // Fallback to demo categories
        activeCats = [
          { id: 'fashion', name: "Fashion", banner_url: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1975", icon: "👕", is_active: true },
          { id: 'electronics', name: "Electronics", banner_url: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1964", icon: "💻", is_active: true },
          { id: 'shoes', name: "Shoes", banner_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1964", icon: "👟", is_active: true },
          { id: 'watch', name: "Watch", banner_url: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1964", icon: "⌚", is_active: true },
          { id: 'women-fashion', name: "Women Fashion", banner_url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1964", icon: "👗", is_active: true },
          { id: 'accessories', name: "Accessories", banner_url: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=1964", icon: "🎒", is_active: true }
        ];
      }
      
      const mainCats = activeCats.filter((c: any) => !c.parent_id);
      
      const enrichedData = mainCats.map((c: any) => {
          const subs = activeCats.filter((sub: any) => sub.parent_id === c.id);
          return {
            ...c,
            // Fallback mock subcategories if DB is empty for demo purposes, else real subs
            subcategories: subs.length > 0 ? subs : [
              { id: 'sub1', name: 'Originals', productCount: 120 },
              { id: 'sub2', name: 'Premium Collection', productCount: 45 },
              { id: 'sub3', name: 'Daily Essentials', productCount: 230 }
            ],
            productCount: c.productCount || Math.floor(Math.random() * 500) + 100
          };
      });
      setCategories(enrichedData);
      
      if (prodData) {
        // Just take a few products for trending
        setTrendingProducts(prodData.slice(0, 4));
      }
    }).catch(err => {
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const filteredCategories = categories.filter(c => 
    (c.name || c.category_name).toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.subcategories?.some((s: any) => (s.name || s.category_name).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans">
      <Meta title="All Categories" />
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-purple-100 shadow-sm">
         <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
            <button onClick={() => navigate(-1)} className="w-10 h-10 hover:bg-slate-100 rounded-full flex items-center justify-center shrink-0 transition-colors">
               <ArrowLeft size={20} className="text-slate-700" />
            </button>
            <h1 className="text-lg font-bold text-slate-800 flex-1 truncate">Categories</h1>
            <button className="w-10 h-10 hover:bg-purple-50 text-purple-600 rounded-full flex items-center justify-center shrink-0 transition-colors">
               <Filter size={20} />
            </button>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-4">
        {/* Search */}
        <div className="relative mb-6">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
           <input 
              type="text" 
              placeholder="Search category, subcategory..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-4 focus:ring-purple-400/20 focus:border-purple-300 font-medium transition-all shadow-sm"
           />
        </div>

        {/* Top Horizontal Slider */}
        <div className="mb-8">
           <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
              <button 
                onClick={() => setActiveTab('all')}
                className={`snap-start shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all ${activeTab === 'all' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-white text-slate-600 border border-slate-200 hover:border-purple-300 hover:text-purple-600'}`}
              >
                 All Categories
              </button>
              {categories.slice(0, 5).map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => { setActiveTab(cat.id); setExpandedCat(cat.id); }}
                  className={`snap-start shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all ${activeTab === cat.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'bg-white text-slate-600 border border-slate-200 hover:border-purple-300 hover:text-purple-600'}`}
                >
                   {cat.name || cat.category_name}
                </button>
              ))}
           </div>
        </div>

        {/* Category Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-2xl" />)}
          </div>
        ) : filteredCategories.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <PackageX size={64} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-black text-slate-800 mb-2">No Categories Found</h3>
              <p className="text-slate-500 font-medium">Try searching with a different keyword</p>
           </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
            {filteredCategories.map(cat => (
              <div key={cat.id} className="relative bg-white rounded-3xl shadow-sm border border-slate-100/50 hover:shadow-xl hover:border-purple-200 overflow-hidden transition-all group flex flex-col">
                {/* Mobile aspect ratio 16:9 for banners when expanded, but for grid items a 1:1 or 4:3 is better. Let's use 4:3 */}
                <div 
                  className="relative aspect-[4/3] overflow-hidden cursor-pointer bg-slate-100"
                  onClick={() => navigate(`/shop?category=${cat.id}`)}
                >
                  <img 
                    src={optimizeImg(cat.banner_url || cat.banner_image || cat.image_url || "https://images.unsplash.com/photo-1555529733-0e670560f8e1?q=80&w=3164&auto=format&fit=crop", { width: 400, height: 300 })} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={cat.name || cat.category_name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 text-white">
                     <h3 className="text-sm sm:text-lg font-black uppercase tracking-tight drop-shadow-md leading-tight">{cat.name || cat.category_name}</h3>
                     <p className="text-[10px] sm:text-xs font-bold text-white/80 mt-0.5">{cat.productCount} Products</p>
                  </div>
                </div>

                {/* Subcategories Accordion Trigger */}
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <button 
                    onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
                    className="flex items-center justify-between w-full p-3 sm:p-4 bg-white border-t border-slate-50 hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">{cat.subcategories.length} Subcategories</span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${expandedCat === cat.id ? 'rotate-180 text-purple-600' : ''}`} />
                  </button>
                )}

                {/* Subcategories List */}
                <AnimatePresence>
                  {expandedCat === cat.id && cat.subcategories && (
                    <motion.div 
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: 'auto', opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       className="overflow-hidden bg-slate-50 border-t border-slate-100"
                    >
                      <div className="p-2 space-y-1">
                        {cat.subcategories.map((sub: any) => (
                           <Link 
                             key={sub.id} 
                             to={`/category/${cat.id}/${sub.id}`}
                             className="flex items-center justify-between p-2 rounded-xl hover:bg-white hover:text-purple-600 transition-all text-slate-600 group/sub"
                           >
                              <div className="flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover/sub:bg-purple-600 transition-colors" />
                                 <span className="text-xs sm:text-sm font-bold truncate">{sub.name || sub.category_name}</span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 bg-white group-hover/sub:bg-purple-50 px-2 py-0.5 rounded-md">{sub.productCount}</span>
                           </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trending Products */}
      {!loading && trendingProducts.length > 0 && (
         <div className="max-w-7xl mx-auto px-4 mt-16 mb-4">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                 <Star className="text-amber-400" size={24} fill="currentColor" /> Trending Now
               </h2>
               <Link to="/shop" className="text-xs font-bold text-purple-600 hover:text-purple-700 uppercase tracking-widest flex items-center gap-1">
                  View All <ArrowRight size={14} />
               </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {trendingProducts.map(prod => (
                  <Link key={prod.id} to={`/product/${prod.id}`} className="bg-white rounded-3xl p-3 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                     <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-slate-50 mb-3 relative">
                        <img src={optimizeImg(prod.image || prod.images?.[0], { width: 300, height: 400 })} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={prod.name} />
                        {prod.discount > 0 && (
                           <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg">
                              -{prod.discount}%
                           </div>
                        )}
                     </div>
                     <h3 className="font-bold text-slate-800 text-sm truncate">{prod.name}</h3>
                     <p className="font-black text-purple-600 mt-1">{formatPrice(prod.price * (1 - (prod.discount || 0)/100))}</p>
                  </Link>
               ))}
            </div>
         </div>
      )}

    </div>
  );
};
