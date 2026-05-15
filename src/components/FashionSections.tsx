import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Autoplay } from 'swiper/modules';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { productService } from '../lib/services';

const DEMO_FASHION = {
  'polo-shirt': [
    { id: 'polo1', name: "Premium Cotton Polo", price: 890, oldPrice: 1120, rating: 4.8, image: "https://images.unsplash.com/photo-1593998066526-65fcab3021a2?w=800", isDemo: true },
    { id: 'polo2', name: "Classic Navy Polo", price: 950, oldPrice: 1300, rating: 4.7, image: "https://images.unsplash.com/photo-1618517351616-38fb9c1585bc?w=800", isDemo: true },
    { id: 'polo3', name: "Striped Summer Polo", price: 750, oldPrice: 900, rating: 4.5, image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800", isDemo: true },
    { id: 'polo4', name: "Athletic Fit Polo", price: 1050, oldPrice: 1500, rating: 4.9, image: "https://images.unsplash.com/photo-1593998066526-65fcab3021a2?w=800", isDemo: true },
    { id: 'polo5', name: "Vintage Wash Polo", price: 820, oldPrice: 1000, rating: 4.6, image: "https://images.unsplash.com/photo-1618517351616-38fb9c1585bc?w=800", isDemo: true },
    { id: 'polo6', name: "Business Casual Polo", price: 1200, oldPrice: 1600, rating: 4.8, image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800", isDemo: true },
  ],
  'premium-shirt': [
    { id: 'shirt1', name: "Oxford Button-Down", price: 1450, oldPrice: 1800, rating: 4.9, image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800", isDemo: true },
    { id: 'shirt2', name: "Silk Blend Dress Shirt", price: 2100, oldPrice: 2800, rating: 5.0, image: "https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800", isDemo: true },
    { id: 'shirt3', name: "Linen Summer Shirt", price: 1250, oldPrice: 1600, rating: 4.7, image: "https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=800", isDemo: true },
    { id: 'shirt4', name: "Premium Check Shirt", price: 1350, oldPrice: 1700, rating: 4.6, image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800", isDemo: true },
    { id: 'shirt5', name: "Slim Fit Executive Shirt", price: 1800, oldPrice: 2400, rating: 4.9, image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800", isDemo: true },
    { id: 'shirt6', name: "Casual Denim Shirt", price: 1600, oldPrice: 2000, rating: 4.8, image: "https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800", isDemo: true },
  ],
  'tshirt': [
    { id: 'tshirt1', name: "Heavyweight Cotton T-Shirt", price: 450, oldPrice: 600, rating: 4.8, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800", isDemo: true },
    { id: 'tshirt2', name: "Graphic Print T-Shirt", price: 550, oldPrice: 750, rating: 4.7, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800", isDemo: true },
    { id: 'tshirt3', name: "Essential V-Neck Tee", price: 400, oldPrice: 550, rating: 4.6, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800", isDemo: true },
    { id: 'tshirt4', name: "Oversized Streetwear Tee", price: 650, oldPrice: 900, rating: 4.9, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800", isDemo: true },
    { id: 'tshirt5', name: "Crew Neck Basic T-Shirt", price: 350, oldPrice: 500, rating: 4.5, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800", isDemo: true },
    { id: 'tshirt6', name: "Premium Modal Blend Tee", price: 750, oldPrice: 1000, rating: 4.8, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800", isDemo: true },
  ],
  'punjabi': [
    { id: 'punj1', name: "Premium Silk Panjabi", price: 3500, oldPrice: 4800, rating: 4.9, image: "https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=800", isDemo: true },
    { id: 'punj2', name: "Classic Cotton Panjabi", price: 1800, oldPrice: 2500, rating: 4.7, image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800", isDemo: true },
    { id: 'punj3', name: "Embroidered Festival Panjabi", price: 4200, oldPrice: 5500, rating: 5.0, image: "https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800", isDemo: true },
    { id: 'punj4', name: "Designer Linen Panjabi", price: 2800, oldPrice: 3800, rating: 4.8, image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800", isDemo: true },
    { id: 'punj5', name: "Casual Striped Panjabi", price: 1500, oldPrice: 2000, rating: 4.6, image: "https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=800", isDemo: true },
    { id: 'punj6', name: "Exclusive Wedding Panjabi", price: 6500, oldPrice: 8500, rating: 4.9, image: "https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800", isDemo: true },
  ],
  'women-fashion': [
    { id: 'wom1', name: "Elegant Summer Dress", price: 2100, oldPrice: 2900, rating: 4.8, image: "https://images.unsplash.com/photo-1515347619362-e67417b189ff?w=800", isDemo: true },
    { id: 'wom2', name: "Chic Casual Blouse", price: 1200, oldPrice: 1600, rating: 4.7, image: "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=800", isDemo: true },
    { id: 'wom3', name: "Premium Anarkali Suit", price: 5500, oldPrice: 7500, rating: 4.9, image: "https://images.unsplash.com/photo-1583391733958-65e2be10ef09?w=800", isDemo: true },
    { id: 'wom4', name: "Designer Tops & Trousers", price: 2800, oldPrice: 3800, rating: 4.8, image: "https://images.unsplash.com/photo-1515347619362-e67417b189ff?w=800", isDemo: true },
    { id: 'wom5', name: "Floral Maxi Skirt", price: 1500, oldPrice: 2100, rating: 4.6, image: "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=800", isDemo: true },
    { id: 'wom6', name: "Traditional Kurti", price: 1800, oldPrice: 2500, rating: 4.8, image: "https://images.unsplash.com/photo-1583391733958-65e2be10ef09?w=800", isDemo: true },
  ],
  'tops-hoodies': [
    { id: 'hood1', name: "Essential Fleece Hoodie", price: 1100, oldPrice: 1500, rating: 4.8, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800", isDemo: true },
    { id: 'hood2', name: "Oversized Zip-Up Hoodie", price: 1350, oldPrice: 1800, rating: 4.7, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800", isDemo: true },
    { id: 'hood3', name: "Premium Knit Sweater", price: 1800, oldPrice: 2400, rating: 4.9, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800", isDemo: true },
    { id: 'hood4', name: "Graphic Pullover Hoodie", price: 1250, oldPrice: 1600, rating: 4.8, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800", isDemo: true },
    { id: 'hood5', name: "Streetwear Crop Top", price: 850, oldPrice: 1200, rating: 4.6, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800", isDemo: true },
    { id: 'hood6', name: "Winter Thermal Top", price: 950, oldPrice: 1300, rating: 4.7, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800", isDemo: true },
  ]
};

const formatPrice = (price: number) => `৳${price.toLocaleString()}`;

export const FashionProductCard = ({ product }: { product: any }) => {
  const price = product.price || product.sale_price;
  const oldPrice = product.oldPrice || product.old_price;
  const discount = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  return (
    <Link to={`/product/${product.id}`} className="block relative bg-white rounded-[22px] overflow-hidden group shadow-[0_4px_18px_rgba(0,0,0,0.05)] transition-[transform] duration-300 ease-in-out hover:-translate-y-1">
      <div className="relative aspect-[4/5] bg-slate-50 overflow-hidden">
        <img 
          src={product.image || product.product_image} 
          alt={product.name || product.title} 
          loading="lazy" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
        />
        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg">
            -{discount}%
          </div>
        )}
        <button 
          onClick={(e) => { e.preventDefault(); }} 
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 shadow-sm transition-colors"
        >
          <Heart size={16} />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1 mb-2">
          <Star size={12} className="fill-amber-400 text-amber-400" />
          <span className="text-[10px] font-bold text-slate-600">{product.rating || '4.5'}</span>
        </div>
        <h3 className="text-sm font-semibold text-slate-800 line-clamp-1 mb-2 group-hover:text-primary transition-colors">{product.name || product.title}</h3>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base font-bold text-primary">{formatPrice(price)}</span>
          {oldPrice > 0 && (
             <span className="text-[10px] text-slate-400 line-through">{formatPrice(oldPrice)}</span>
          )}
        </div>
        
        <button 
          onClick={(e) => { e.preventDefault(); }}
          className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary transition-colors active:scale-95"
        >
          <ShoppingBag size={14} /> Add to Cart
        </button>
      </div>
    </Link>
  );
};

export const FashionSectionGroup = ({ title, slug }: { title: string, slug: string }) => {
  const [products, setProducts] = useState<any[]>(DEMO_FASHION[slug as keyof typeof DEMO_FASHION] || []);
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    // We subscribe so that when admin changes products, it updates instantly.
    const unsubscribe = productService.subscribe({ category: slug, limit: 10 }, (data) => {
      if (data && data.length > 0) setProducts(data);
      else setProducts(DEMO_FASHION[slug as keyof typeof DEMO_FASHION] || []);
    });
    return () => unsubscribe();
  }, [slug]);

  useEffect(() => {
    // Fetch banners specifically for this category
    const fetchBanners = async () => {
      try {
        const allBanners = await import('../../src/lib/adminServices').then(m => m.adminService.getCategoryBanners());
        const categoryBanners = (allBanners || []).filter((b: any) => 
            b.is_active !== false && 
            (b.category_slug?.toLowerCase().trim() === slug?.toLowerCase().trim() ||
             b.category_slug?.toLowerCase().trim() === slug?.replace('-', '')?.toLowerCase().trim() ||
             b.category_name?.toLowerCase().trim() === title?.toLowerCase().trim() ||
             b.category_name?.toLowerCase().trim() === slug?.toLowerCase().trim() ||
             title?.toLowerCase().trim().includes(b.category_name?.toLowerCase().trim() || 'XYZXYZ'))
        );
        
        if (categoryBanners.length === 0) {
           const fallbackDemos = [
             { category_slug: 'women-fashion', banner_title: 'NEW WOMEN COLLECTION', banner_subtitle: 'UP TO 50% OFF', banner_image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=675&fit=crop' },
             { category_slug: 'punjabi', banner_title: 'PREMIUM PANJABI COLLECTION', banner_subtitle: 'Explore the latest styles', banner_image: 'https://images.unsplash.com/photo-1596455607563-ad6193f76b17?w=1200&h=675&fit=crop' },
             { category_slug: 'tshirt', banner_title: 'SUMMER T-SHIRT SALE', banner_subtitle: 'Stay cool', banner_image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=1200&h=675&fit=crop' }
           ];
           const matchedFallback = fallbackDemos.filter(b => b.category_slug === slug || b.category_slug === slug.replace('-', ''));
           setBanners(matchedFallback as any[]);
        } else {
           setBanners(categoryBanners);
        }
      } catch (err) {
        console.error("Failed to load category banners", err);
      }
    };
    fetchBanners();
  }, [slug, title]);

  if (!products || products.length === 0) {
    // fallback if no demo either
    return null;
  }

  // Generate banners logic
  // We'll slide them if there are multiple. For simplicity, just use the first active banner if multiple, or a basic swiper.
  return (
    <section className="category-section mb-14 px-4 overflow-hidden">
      <div className="category-header flex flex-row justify-between items-center mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">{title}</h2>
        </div>
        <Link 
           to={`/category/${slug}`}
           className="text-[12px] px-[12px] py-[6px] rounded-[20px] bg-[#f3f3f3] text-slate-700 font-bold hover:bg-slate-200 transition-all active:scale-95 whitespace-nowrap"
        >
           View More
        </Link>
      </div>

      {banners.length > 0 && (
         <div className="category-banner w-full rounded-[18px] overflow-hidden bg-slate-100 flex drop-shadow-sm touch-pan-y relative mb-[18px] h-[140px] md:h-[220px] shrink-0" style={{ aspectRatio: '16/9' }}>
           <Swiper
             modules={[Autoplay]}
             slidesPerView={1}
             spaceBetween={0}
             loop={true}
             autoplay={{ delay: 3000, disableOnInteraction: false }}
             grabCursor={true}
             style={{ width: '100%', height: '100%' }}
           >
             {banners.map(b => (
                <SwiperSlide key={b.id} className="relative w-full h-full" style={{ scrollSnapType: 'x mandatory' }}>
                   <img src={b.banner_image || b.image_url} alt={b.banner_title || b.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: '18px' }} />
                   {(b.banner_title || b.title || b.banner_subtitle || b.subtitle) && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 md:p-10 pointer-events-none" style={{ borderRadius: '18px' }}>
                         <h3 className="text-white text-lg md:text-3xl font-black mb-1 leading-tight">{b.banner_title || b.title}</h3>
                         <p className="text-white/90 font-bold text-xs md:text-sm">{b.banner_subtitle || b.subtitle}</p>
                      </div>
                   )}
                </SwiperSlide>
             ))}
           </Swiper>
         </div>
      )}

      <div className="products-slider mt-[10px]">
        <Swiper
          modules={[FreeMode]}
          slidesPerView={2}
          spaceBetween={14}
          freeMode={true}
          grabCursor={true}
          breakpoints={{
            768: { slidesPerView: 3, spaceBetween: 16 },
            1024: { slidesPerView: 5, spaceBetween: 20 }
          }}
          className="!overflow-visible !pb-4"
        >
          {products?.map((product) => (
            <SwiperSlide key={product.id}>
              <FashionProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};
