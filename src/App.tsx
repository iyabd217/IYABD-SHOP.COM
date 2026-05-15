import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Routes, Route, Link, useLocation, useParams, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { 
  ShoppingCart, User, Menu, X, Search, ChevronRight, ChevronLeft, Github, Instagram, Twitter, 
  Camera, Mic, ArrowLeft, ArrowRight, Star, Plus, Home as HomeIcon, MessageCircle, 
  LayoutGrid, ShieldCheck, Zap, Globe, BarChart3, Facebook as FacebookIcon, Heart, 
  CreditCard, Truck, Clock, MapPin, Bell, LogOut, Phone, Mail, ChevronDown, 
  CheckCircle2, Ticket, Sparkles, AlertCircle, Check, Package, RotateCcw,
  LayoutDashboard, ListTree, Image as ImageIcon, ShoppingBag, Users, 
  MessageSquare, Settings as SettingsIcon, Save, Trash2, Edit3, PlusCircle,
  Copy, Share2, HelpCircle, Eye, EyeOff, Filter, TrendingUp, TrendingDown, Calendar, PlayCircle,
  ShoppingBasket, Zap as DealsIcon, MessageSquare as MessengerIcon, Headset, PackageX
} from 'lucide-react';

// Swiper Imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode, Navigation, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';
import 'swiper/css/effect-fade';
import { productService, configService, orderService, paymentService, supportService, flashSaleService } from './lib/services';
import { adminService } from './lib/adminServices';
import { cmsService } from './lib/cmsService';
import { Sidebar } from './components/admin/Sidebar';
import { formatPrice, translations, optimizeImg } from './lib/utils';
import { CartProvider, useCart } from './lib/cartContext';
import { WishlistProvider, useWishlist } from './lib/wishlistContext';
import { AuthProvider, useAuth } from './lib/authContext';
import { useSettings } from './context/SettingsContext';
import { trackingService } from './lib/tracking';
import TrackingScripts from './components/common/TrackingScripts';
import PopupManager from './components/shop/PopupManager';
import { FashionSectionGroup } from './components/FashionSections';
import { ManageCategoryBanners } from './components/admin/ManageCategoryBanners';
import SupportCenter from './components/SupportCenter';
import { ProfessionalCategoryPage } from './components/shop/CategoriesPage';

// --- SEO & Performance Utilities ---

export const Meta = ({ title, description, image, type = 'website' }: { title?: string; description?: string; image?: string; type?: string }) => {
  const [settings, setSettings] = useState<any>(null);
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await adminService.getCompanySettings();
        if (data) setSettings(data);
      } catch (e) {
        console.warn("Failed to fetch settings, using defaults");
      }
    };
    fetchSettings();
  }, []);

  const siteName = settings?.seo_site_title || "IY ABD Premium";
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defDesc = settings?.seo_site_description || "Premium curated marketplace for high-end lifestyle goods and musical instruments.";
  const ogImg = image || settings?.og_image_url;
  const keywords = settings?.seo_keywords;
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || defDesc} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defDesc} />
      {ogImg && <meta property="og:image" content={ogImg} />}
      <meta property="og:type" content={type} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defDesc} />
      {ogImg && <meta name="twitter:image" content={ogImg} />}
      <link rel="canonical" href={window.location.href} />
    </Helmet>
  );
};

const ProductSchema = ({ product }: any) => {
  const schema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.image || product.images?.[0],
    "description": product.description,
    "sku": product.id,
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "USD",
      "price": product.price * (1 - (product.discount || 0) / 100),
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating || "4.8",
      "reviewCount": product.reviewCount || "120"
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

import CheckoutIndex from './components/checkout/CheckoutIndex';
import OrderSuccess from './components/checkout/OrderSuccess';

// --- Lazy Load Pages ---
const Admin = lazy(() => import('./components/admin/AdminDashboard'));
const AdminLogin = lazy(() => import('./components/AdminLogin'));
const TrackOrder = lazy(() => import('./components/shop/TrackOrder'));
const LegalPage = lazy(() => import('./components/shop/LegalPage'));

// Directly use the synchronously imported or defined components
const Home = (props: any) => <HomePage {...props} />;
const Shop = (props: any) => <ShopPage {...props} />;
const ProductDetail = (props: any) => <ProductDetailPage {...props} />;
const Cart = (props: any) => <CartPage {...props} />;
const Success = OrderSuccess;
const Checkout = CheckoutIndex;
const Profile = (props: any) => <ProfilePage {...props} />;
const Wishlist = (props: any) => <WishlistPage {...props} />;
const Support = (props: any) => <SupportCenter {...props} />;
const Blog = (props: any) => <BlogPage {...props} />;
const Categories = (props: any) => <ProfessionalCategoryPage {...props} />;


// --- Security: Protected Route ---
const ProtectedRoute = ({ children, user }: { children: any; user: any }) => {
  if (!user) return <Navigate to="/" replace />;
  return children;
};

const AdminProtectedRoute = ({ children, isAdmin }: { children: any; isAdmin: boolean }) => {
  if (!isAdmin) return <Navigate to="/admin-secure-login" replace />;
  return children;
};

// --- Loading Component ---
const PageLoader = () => {
  const [showReload, setShowReload] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowReload(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 min-h-screen z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a]">
       {/* Background gradient */}
       <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/40 via-[#1E1B4B] to-black opacity-80"></div>
       <div className="relative z-10 flex flex-col items-center justify-center">
         {/* IYABD Logo */}
         <motion.div 
           animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
           transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
           className="w-24 h-24 mb-6 rounded-[24px] bg-white shadow-[0_0_40px_rgba(147,51,234,0.3)] flex items-center justify-center overflow-hidden"
         >
           <img 
             src={cmsService.getAssetUrl('website-assets', 'logos/logo.png')} 
             alt="IYABD" 
             className="w-full h-full object-contain"
             onError={(e) => {
               e.currentTarget.style.display = 'none';
               e.currentTarget.parentElement!.innerHTML = '<span class="text-indigo-600 text-3xl font-black uppercase tracking-tighter">IY</span>';
             }}
           />
         </motion.div>
         {/* Custom Spinner */}
         <div className="w-12 h-12 border-4 border-purple-900 border-t-purple-400 rounded-full animate-spin mb-4"></div>
         <h2 className="text-white text-sm font-bold uppercase tracking-[0.2em] mb-2">Loading Your Store...</h2>
         <p className="text-purple-300/50 text-[10px] uppercase tracking-widest">IYABD Premium Experience</p>
         
         {/* Emergency Fallback Button */}
         <AnimatePresence>
           {showReload && (
             <motion.button 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               onClick={() => window.location.reload()}
               className="mt-8 px-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95"
             >
               Reload App
             </motion.button>
           )}
         </AnimatePresence>
       </div>
    </div>
  );
};

// --- Components ---

const DEMO_HERO_BANNERS = [
  {
    id: 'demo-1',
    title: "PREMIUM GUITAR COLLECTION",
    subtitle: "Experience The Soul of Music With Our Curated Range",
    banner_image: "https://images.unsplash.com/photo-1550985543-f47f38aee65e?q=80&w=2070",
    button_text: "SHOP NOW",
    redirect_url: "/shop?category=Music"
  },
  {
    id: 'demo-2',
    title: "LUXURY TIMEPIECES",
    subtitle: "Exquisite Watches For The Modern Connoisseur",
    banner_image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=2070",
    button_text: "EXPLORE",
    redirect_url: "/shop?category=Accessories"
  },
  {
    id: 'demo-3',
    title: "HIGH-FIDELITY AUDIO",
    subtitle: "Professional Gear For Pristine Sound",
    banner_image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070",
    button_text: "BUY NOW",
    redirect_url: "/shop?filter=trending"
  }
];

const DEMO_CATEGORIES = [
  { id: 'fashion', category_name: "Fashion", banner_image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1975", icon: "👕" },
  { id: 'electronics', category_name: "Electronics", banner_image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1964", icon: "💻" },
  { id: 'shoes', category_name: "Shoes", banner_image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1964", icon: "👟" },
  { id: 'watch', category_name: "Watch", banner_image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1964", icon: "⌚" },
  { id: 'women-fashion', category_name: "Women Fashion", banner_image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1964", icon: "👗" },
  { id: 'accessories', category_name: "Accessories", banner_image: "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?q=80&w=1964", icon: "🎒" }
];

const DEMO_PRODUCTS = [
  ...[
    { id: 'polo1', name: "Premium Cotton Polo", price: 890, oldPrice: 1120, rating: 4.8, image: "https://images.unsplash.com/photo-1593998066526-65fcab3021a2?w=800", isDemo: true },
    { id: 'polo2', name: "Classic Navy Polo", price: 950, oldPrice: 1300, rating: 4.7, image: "https://images.unsplash.com/photo-1618517351616-38fb9c1585bc?w=800", isDemo: true },
    { id: 'polo3', name: "Striped Summer Polo", price: 750, oldPrice: 900, rating: 4.5, image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800", isDemo: true },
    { id: 'polo4', name: "Athletic Fit Polo", price: 1050, oldPrice: 1500, rating: 4.9, image: "https://images.unsplash.com/photo-1593998066526-65fcab3021a2?w=800", isDemo: true },
    { id: 'polo5', name: "Vintage Wash Polo", price: 820, oldPrice: 1000, rating: 4.6, image: "https://images.unsplash.com/photo-1618517351616-38fb9c1585bc?w=800", isDemo: true },
    { id: 'polo6', name: "Business Casual Polo", price: 1200, oldPrice: 1600, rating: 4.8, image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800", isDemo: true },
  ].map(p => ({ ...p, category: "polo-shirt" })),
  ...[
    { id: 'shirt1', name: "Oxford Button-Down", price: 1450, oldPrice: 1800, rating: 4.9, image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800", isDemo: true },
    { id: 'shirt2', name: "Silk Blend Dress Shirt", price: 2100, oldPrice: 2800, rating: 5.0, image: "https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800", isDemo: true },
    { id: 'shirt3', name: "Linen Summer Shirt", price: 1250, oldPrice: 1600, rating: 4.7, image: "https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=800", isDemo: true },
    { id: 'shirt4', name: "Premium Check Shirt", price: 1350, oldPrice: 1700, rating: 4.6, image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800", isDemo: true },
    { id: 'shirt5', name: "Slim Fit Executive Shirt", price: 1800, oldPrice: 2400, rating: 4.9, image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800", isDemo: true },
    { id: 'shirt6', name: "Casual Denim Shirt", price: 1600, oldPrice: 2000, rating: 4.8, image: "https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800", isDemo: true },
  ].map(p => ({ ...p, category: "premium-shirt" })),
  ...[
    { id: 'tshirt1', name: "Heavyweight Cotton T-Shirt", price: 450, oldPrice: 600, rating: 4.8, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800", variants: [{color: "White", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800", price: 450, stock: 100}, {color: "Black", image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800", price: 470, stock: 50}, {color: "Blue", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800", price: 490, stock: 30}], isDemo: true },
    { id: 'tshirt2', name: "Graphic Print T-Shirt", price: 550, oldPrice: 750, rating: 4.7, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800", isDemo: true },
    { id: 'tshirt3', name: "Essential V-Neck Tee", price: 400, oldPrice: 550, rating: 4.6, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800", isDemo: true },
    { id: 'tshirt4', name: "Oversized Streetwear Tee", price: 650, oldPrice: 900, rating: 4.9, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800", isDemo: true },
    { id: 'tshirt5', name: "Crew Neck Basic T-Shirt", price: 350, oldPrice: 500, rating: 4.5, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800", isDemo: true },
    { id: 'tshirt6', name: "Premium Modal Blend Tee", price: 750, oldPrice: 1000, rating: 4.8, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800", isDemo: true },
  ].map(p => ({ ...p, category: "tshirt" })),
  ...[
    { id: 'punj1', name: "Premium Silk Panjabi", price: 3500, oldPrice: 4800, rating: 4.9, image: "https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=800", isDemo: true },
    { id: 'punj2', name: "Classic Cotton Panjabi", price: 1800, oldPrice: 2500, rating: 4.7, image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800", isDemo: true },
    { id: 'punj3', name: "Embroidered Festival Panjabi", price: 4200, oldPrice: 5500, rating: 5.0, image: "https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800", isDemo: true },
    { id: 'punj4', name: "Designer Linen Panjabi", price: 2800, oldPrice: 3800, rating: 4.8, image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800", isDemo: true },
    { id: 'punj5', name: "Casual Striped Panjabi", price: 1500, oldPrice: 2000, rating: 4.6, image: "https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=800", isDemo: true },
    { id: 'punj6', name: "Exclusive Wedding Panjabi", price: 6500, oldPrice: 8500, rating: 4.9, image: "https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800", isDemo: true },
  ].map(p => ({ ...p, category: "punjabi" })),
  ...[
    { id: 'wom1', name: "Elegant Summer Dress", price: 2100, oldPrice: 2900, rating: 4.8, image: "https://images.unsplash.com/photo-1515347619362-e67417b189ff?w=800", isDemo: true },
    { id: 'wom2', name: "Chic Casual Blouse", price: 1200, oldPrice: 1600, rating: 4.7, image: "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=800", isDemo: true },
    { id: 'wom3', name: "Premium Anarkali Suit", price: 5500, oldPrice: 7500, rating: 4.9, image: "https://images.unsplash.com/photo-1583391733958-65e2be10ef09?w=800", isDemo: true },
    { id: 'wom4', name: "Designer Tops & Trousers", price: 2800, oldPrice: 3800, rating: 4.8, image: "https://images.unsplash.com/photo-1515347619362-e67417b189ff?w=800", isDemo: true },
    { id: 'wom5', name: "Floral Maxi Skirt", price: 1500, oldPrice: 2100, rating: 4.6, image: "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=800", isDemo: true },
    { id: 'wom6', name: "Traditional Kurti", price: 1800, oldPrice: 2500, rating: 4.8, image: "https://images.unsplash.com/photo-1583391733958-65e2be10ef09?w=800", isDemo: true },
  ].map(p => ({ ...p, category: "women-fashion" })),
  ...[
    { id: 'hood1', name: "Essential Fleece Hoodie", price: 1100, oldPrice: 1500, rating: 4.8, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800", isDemo: true },
    { id: 'hood2', name: "Oversized Zip-Up Hoodie", price: 1350, oldPrice: 1800, rating: 4.7, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800", isDemo: true },
    { id: 'hood3', name: "Premium Knit Sweater", price: 1800, oldPrice: 2400, rating: 4.9, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800", isDemo: true },
    { id: 'hood4', name: "Graphic Pullover Hoodie", price: 1250, oldPrice: 1600, rating: 4.8, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800", isDemo: true },
    { id: 'hood5', name: "Streetwear Crop Top", price: 850, oldPrice: 1200, rating: 4.6, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800", isDemo: true },
    { id: 'hood6', name: "Winter Thermal Top", price: 950, oldPrice: 1300, rating: 4.7, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800", isDemo: true },
  ].map(p => ({ ...p, category: "tops-hoodies" }))
].map(p => ({
  ...p,
  discount: p.oldPrice ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0,
}));

const BottomNav = () => {
  const { cart } = useCart();
  const { user } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();

  if (location.pathname.startsWith('/product/') || location.pathname.startsWith('/admin')) {
    return null;
  }

  const navItems: { label: string; icon: any; path?: string; isSupport?: boolean; isAction?: boolean; action?: () => void }[] = [
    { label: 'Home', icon: HomeIcon, path: '/' },
    { label: 'Category', icon: LayoutGrid, path: '/categories' },
    { label: 'Deals', icon: DealsIcon, path: '/flash-sale' },
    { label: 'Support', icon: Headset, path: '/support', isSupport: true },
    { label: 'Account', icon: User, path: user ? '/profile' : '/auth' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full z-[999] bg-[rgba(255,255,255,0.96)] backdrop-blur-[18px] border-t border-[#eee] flex items-center justify-around h-[72px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = !item.isAction && (location.pathname === item.path || (item.path === '/categories' && location.pathname === '/shop' && location.search.includes('category')));
        
        return (
          <div key={item.label} className="relative flex-1 max-w-[100px]">
            {item.isAction ? (
              <button 
                onClick={item.action}
                className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-primary transition-all active:scale-95"
              >
                <item.icon size={22} className="text-[#00B2FF]" />
                <span className="text-[10px] font-bold tracking-tight mt-1">{item.label}</span>
              </button>
            ) : (
              <Link 
                to={item.path!} 
                className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${isActive ? (item.isSupport ? 'text-purple-600' : 'text-primary') : 'text-slate-400'}`}
              >
                <div className="relative">
                  <item.icon 
                    size={isActive ? 24 : 22} 
                    className={`transition-all duration-300 ${isActive ? 'scale-110' : ''}`} 
                    strokeWidth={isActive ? 2.5 : 2} 
                  />
                  {isActive && item.isSupport && (
                    <motion.div 
                      layoutId="nav-active-glow-support"
                      className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-20 blur-md rounded-full -z-10 animate-pulse"
                    />
                  )}
                  {isActive && !item.isSupport && (
                    <motion.div 
                      layoutId="nav-active-glow"
                      className="absolute -inset-2 bg-primary/20 blur-md rounded-full -z-10"
                    />
                  )}
                  {/* Notification Dot for Support */}
                  {item.isSupport && !isActive && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
                <span className={`text-[10px] font-bold tracking-tight mt-1 transition-all ${isActive ? (item.isSupport ? 'text-purple-600 drop-shadow-[0_0_5px_rgba(147,51,234,0.5)]' : 'text-primary') : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
};
// --- Shared Components ---

const ProductCard = ({ product }: any) => {
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);
  
  const isInWishlist = wishlist.some(item => item.id === product.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    const finalPrice = product.price * (1 - (product.discount || 0) / 100);
    addToCart({
      id: product.id,
      name: product.name,
      price: finalPrice,
      quantity: 1,
      image: product.image
    });
    setTimeout(() => setIsAdding(false), 1000);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <Link to={`/product/${product.id}`} className="marketplace-card group block overflow-hidden hover:-translate-y-[3px] hover:shadow-lg transition-all duration-300" style={{ transition: '0.3s ease' }}>
      <div className="aspect-square bg-slate-50 relative">
        <img 
          src={optimizeImg(product.image, { width: 400 })} 
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-lg">
            -{product.discount}%
          </div>
        )}
        <button 
          onClick={toggleWishlist}
          className={`absolute top-2 right-2 p-1.5 rounded-full shadow-sm transition-all active:scale-75 ${isInWishlist ? 'bg-red-500 text-white' : 'bg-white/80 backdrop-blur-sm text-slate-400 hover:text-red-500'}`}
        >
          <Heart size={16} fill={isInWishlist ? "currentColor" : "none"} />
        </button>
      </div>
      
      <div className="p-3">
        <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 mb-1 h-10 leading-tight">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5">
            <Star size={10} fill="#FFC107" className="text-[#FFC107]" />
            <span className="text-[10px] font-bold text-slate-600">{product.rating || '5.0'}</span>
          </div>
          <span className="text-[10px] text-slate-400">|</span>
          <span className="text-[10px] text-slate-400">
            {product.sold ? (product.sold >= 1000 ? `${(product.sold / 1000).toFixed(1)}k` : product.sold) : '0'} sold
          </span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-end gap-2">
            <span className="text-[#7c3aed] font-extrabold text-sm md:text-base leading-none">
              {formatPrice(product.price * (1 - (product.discount || 0) / 100))}
            </span>
            {product.discount > 0 && (
              <span className="text-[10px] text-slate-400 line-through leading-none mb-0.5">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <button 
            onClick={handleAdd}
            className="w-full h-8 mt-3 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-bold tracking-wider uppercase hover:bg-slate-800 transition-all active:scale-95"
          >
            {isAdding ? "Added!" : "Add To Cart"}
          </button>
        </div>
      </div>
    </Link>
  );
};

const CountdownTimer = ({ targetDate, dark }: { targetDate?: string, dark?: boolean }) => {
    const [timeLeft, setTimeLeft] = useState<{h:number, m:number, s:number}>({h:0, m:0, s:0});

    useEffect(() => {
        if (!targetDate) return;
        const tick = () => {
            const now = new Date().getTime();
            const end = new Date(targetDate).getTime();
            const diff = end - now;
            if (diff <= 0) {
                setTimeLeft({h:0, m:0, s:0});
                return;
            }
            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft({h, m, s});
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <div className="flex gap-1.5 md:gap-2">
            {[timeLeft.h, timeLeft.m, timeLeft.s].map((val, i) => (
                <div key={i} className="flex flex-col items-center">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center text-sm md:text-lg font-black shadow-lg ${dark ? 'bg-white text-red-600' : 'bg-red-900 text-white shadow-red-200'}`}>
                        {val.toString().padStart(2, '0')}
                    </div>
                </div>
            ))}
        </div>
    );
};

const FlashSaleSection = () => {
  const [config, setConfig] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const unsubConfig = flashSaleService.subscribeConfig(setConfig);
    const unsubProducts = flashSaleService.subscribeProducts(setProducts);
    return () => { unsubConfig(); unsubProducts(); };
  }, []);

  const demoProducts = [
    { id: 'f1', title: "Premium Watch FX", discount_percent: 45, old_price: 2500, sale_price: 1375, product_image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", product_id: "demo" },
    { id: 'f2', title: "E-Sport Sneakers", discount_percent: 30, old_price: 4500, sale_price: 3150, product_image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", product_id: "demo" },
    { id: 'f3', title: "Sleek Headphones", discount_percent: 50, old_price: 1800, sale_price: 900, product_image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", product_id: "demo" },
    { id: 'f4', title: "Smart Drone X", discount_percent: 25, old_price: 12000, sale_price: 9000, product_image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500", product_id: "demo" },
  ];

  const displayProducts = products?.length > 0 ? products : demoProducts;

  if (config && !config.is_active && (!products || products.length === 0)) return null;

  return (
    <section className="mb-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-[#ffe8e9] rounded-[40px] p-6 md:p-10 relative overflow-hidden group shadow-2xl shadow-red-100"
      >
        {/* Banner Link Overlay */}
        <Link to="/flash-sale" className="absolute inset-0 z-0 bg-gradient-to-r from-[#ffe8e9] via-transparent to-transparent opacity-90" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Banner Left Info */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-red-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-4 animate-pulse">
                    <Zap size={14} fill="currentColor" /> Flash Sale
                </div>
                <h2 className="text-[16px] md:text-[18px] font-semibold text-red-900 leading-[1.2] mb-6 tracking-normal">Flash Sale Deals</h2>
                
                <CountdownTimer targetDate={config?.end_time} />
                
                <Link 
                    to="/flash-sale"
                    className="mt-8 bg-red-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95"
                >
                    View All Offers
                </Link>
            </div>

            {/* Slider Content */}
            <div className="lg:col-span-8 w-full group/slider">
                <Swiper
                    modules={[Autoplay]}
                    slidesPerView={2.2}
                    spaceBetween={16}
                    loop={true}
                    autoplay={{ delay: 2000, disableOnInteraction: false }}
                    grabCursor={true}
                    breakpoints={{
                      640: { slidesPerView: 3.2, spaceBetween: 20 },
                      1024: { slidesPerView: 3.5, spaceBetween: 24 }
                    }}
                    className="!overflow-visible"
                >
                    {displayProducts.map((p) => (
                        <SwiperSlide key={p.id}>
                            <Link 
                                to={`/product/${p.product_id}`}
                                className="block rounded-[30px] bg-white p-3 shadow-xl shadow-red-900/5 group/card transition-all"
                            >
                                <div className="aspect-[4/5] rounded-[24px] overflow-hidden bg-slate-50 mb-3 relative">
                                    <img src={p.product_image} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700" alt="" />
                                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                                        -{p.discount_percent}%
                                    </div>
                                </div>
                                <div className="px-1 text-center">
                                    <h4 className="text-[11px] font-black text-slate-800 line-clamp-1 mb-1">{p.title}</h4>
                                    <div className="flex items-center justify-center gap-1.5">
                                        <span className="text-red-500 font-extrabold text-sm">{formatPrice(p.sale_price)}</span>
                                        <span className="text-[9px] text-slate-300 line-through font-bold">{formatPrice(p.old_price)}</span>
                                    </div>
                                </div>
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
      </motion.div>
    </section>
  )
}


const SectionHeader = ({ title, path = "/shop" }: { title: string, path?: string }) => (
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-xl font-bold text-slate-800">{title}</h2>
    <Link to={path} className="text-primary text-xs font-bold hover:underline transition-all">
      View All
    </Link>
  </div>
);

const PromoBanner = ({ title, desc, gradient, image }: { title: string, desc: string, gradient: string, image: string }) => (
  <div className={`w-full rounded-3xl p-6 mb-12 flex items-center justify-between overflow-hidden relative shadow-sm ${gradient}`}>
    <div className="relative z-10 max-w-[60%]">
      <h3 className="text-white text-xl font-bold mb-2">{title}</h3>
      <p className="text-white/80 text-xs mb-4 leading-relaxed">{desc}</p>
      <Link to="/shop" className="bg-white text-slate-900 px-5 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider inline-block shadow-lg">
        Claim Offer
      </Link>
    </div>
    <img 
      src={image} 
      className="absolute -right-4 -bottom-4 w-40 h-40 object-contain rotate-12 opacity-90 drop-shadow-2xl" 
      alt="Promo"
    />
  </div>
);

const CategorySection = ({ title, category, excludeId, sort }: { title: string, category: string, excludeId?: string, sort?: string }) => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    productService.list({ category: category !== 'all' ? category : undefined, limit: 12 }).then(data => {
      let finalData = data;
      if (!data || data.length === 0) {
        // Fallback to demo data
        const fallback = DEMO_PRODUCTS.filter(p => 
          category === 'all' ||
          p.category?.toLowerCase() === category?.toLowerCase() || 
          category === 'deals' || 
          category === 'new'
        );
        finalData = fallback.length > 0 ? fallback : DEMO_PRODUCTS;
      }
      
      if (excludeId) {
        finalData = finalData.filter(p => p.id !== excludeId);
      }
      if (sort === 'random') {
        finalData = [...finalData].sort(() => 0.5 - Math.random());
      }
      
      setProducts(finalData.slice(0, 6)); // ensure 6 items max normally, maybe 10 for scroll? let's stick to 6 for standard section
    });
  }, [category, excludeId, sort]);

  if (!products || products.length === 0) return null;

  return (
    <section className="mb-12 px-4">
      <SectionHeader title={title} />
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
        {products?.map((p) => (
          <div key={p.id} className="flex-shrink-0 w-[170px] snap-start">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
};

const FeaturedProductHeader = ({ product }: any) => {
  return (
    <section className="mb-14 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto bg-gradient-to-br from-slate-900 via-slate-900 to-black rounded-[32px] md:rounded-[48px] overflow-hidden flex flex-col md:flex-row items-center relative gap-8 p-8 md:p-20 shadow-2xl">
        <div className="relative z-10 flex-1 text-center md:text-left">
           <motion.span 
             initial={{ opacity: 0, y: 10 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4 block"
           >
             Hand-Selected Masterpiece
           </motion.span>
           <motion.h2 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             viewport={{ once: true }}
             className="text-4xl md:text-7xl font-black text-white mb-6 leading-[0.95] tracking-tighter uppercase italic"
           >
             {product.name.split(' ').slice(0, 2).join(' ')}<br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">{product.name.split(' ').slice(2).join(' ')}</span>
           </motion.h2>
           <motion.p 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             transition={{ delay: 0.3 }}
             viewport={{ once: true }}
             className="text-white/50 text-sm md:text-base mb-10 max-w-md mx-auto md:mx-0 leading-relaxed font-medium"
           >
             The ultimate expression of craftsmanship. This signature series instrument redefines tonal excellence. 100% inspected and guaranteed to satisfy the most demanding musicians.
           </motion.p>
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.5 }}
             viewport={{ once: true }}
             className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start items-center"
           >
             <Link to={`/product/${product.id}`} className="bg-white text-black h-16 px-12 rounded-2xl flex items-center justify-center font-black uppercase tracking-widest text-[11px] hover:bg-primary hover:text-white transition-all shadow-2xl active:scale-95 group">
               Shop the Collection <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
             </Link>
             <div className="flex flex-col items-center md:items-start leading-none gap-1">
               <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Premium Price</span>
               <span className="text-3xl font-black text-white italic">{formatPrice(product.price)}</span>
             </div>
           </motion.div>
        </div>
        <div className="flex-1 relative w-full h-[300px] md:h-[600px] flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
            whileInView={{ scale: 1, opacity: 1, rotate: 12 }}
            transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.2 }}
            viewport={{ once: true }}
            className="w-full h-full relative"
          >
             <img 
               src={product.image} 
               className="w-full h-full object-contain drop-shadow-[0_50px_50px_rgba(255,255,255,0.2)] z-10 relative"
               alt={product.name}
             />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/5 blur-[100px] rounded-full -z-10" />
          </motion.div>
        </div>
        
        {/* Abstract Background Accents */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      </div>
    </section>
  )
}

const HomePage = () => {
  const [siteConfig, setSiteConfig] = useState<any>(null);

  useEffect(() => {
    configService.get().then(c => setSiteConfig(c));
  }, []);

  return (
    <div className="space-y-0 pb-24">
      <Meta 
        title="Premium Marketplace" 
        description="MarketOne - Your daily destination for premium curated essentials."
      />
      
      {/* Hero Banner Section */}
      <div className="mt-0 pt-0">
        <HeroSlider />
      </div>
      
      {/* Premium Category Section */}
      <div className="-mt-8">
        <CategorySlider />
      </div>
      
      {/* Flash Sale Section */}
      <FlashSaleSection />

      <FashionSectionGroup title="Polo Shirt" slug="polo-shirt" />
      <FashionSectionGroup title="Premium Shirt" slug="premium-shirt" />
      <FashionSectionGroup title="T-Shirt" slug="tshirt" />
      <FashionSectionGroup title="Punjabi" slug="punjabi" />
      <FashionSectionGroup title="Women Fashion" slug="women-fashion" />
      <FashionSectionGroup title="Tops & Hoodies" slug="tops-hoodies" />

      {/* Latest Trends / Blog Promo */}
      <div className="mb-10 marketplace-card bg-white p-8">
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-xl font-extrabold text-slate-800">Latest Trends</h2>
           <Link to="/blog" className="text-primary text-xs font-bold uppercase tracking-widest">See All</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="relative aspect-[21/9] rounded-2xl overflow-hidden group">
              <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                 <div>
                    <h3 className="text-white font-bold text-lg mb-1">Tech Trends 2024</h3>
                    <p className="text-white/80 text-xs font-medium">Explore the gadgets shaping our future.</p>
                 </div>
              </div>
           </div>
           <div className="flex flex-col gap-4">
              {[
                { title: 'Summer Collection Guide', path: '/blog', img: 'https://images.unsplash.com/photo-1445205170230-053b83016050' },
                { title: 'Minimalist Home Decor', path: '/blog', img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38' }
              ].map((b, i) => (
                <div key={i} className="flex gap-4 items-center group">
                   <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                      <img src={b.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                   </div>
                   <h4 className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">{b.title}</h4>
                </div>
              ))}
           </div>
        </div>
      </div>

      <CategorySection title="Trending Now" category="trending" />
    </div>
  );
};


const YouTubePromoSlider = () => {
  const [banners, setBanners] = useState<any[]>([]);
  
  useEffect(() => {
    cmsService.getBanners().then(cmsBanners => {
        if (cmsBanners && cmsBanners.length > 0) {
            setBanners(cmsBanners.filter((b: any) => b.status && b.type === 'YouTube Style'));
        } else {
            adminService.getBanners().then(all => {
              const promoBanners = all.filter((b: any) => b.status && b.type === 'YouTube Style');
              setBanners(promoBanners);
            });
        }
    });
  }, []);

  if (banners.length === 0) return null;

  return (
    <section className="mb-10 px-4">
      <div className="relative w-full aspect-[21/9] md:aspect-[2560/1440] rounded-[48px] overflow-hidden shadow-2xl border-4 border-white">
        <AnimatePresence mode="wait">
          {banners.map((banner, idx) => (
            <motion.div 
              key={banner.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <img 
                src={optimizeImg(banner.image_url, { width: 2560, height: 1440 })} 
                className="w-full h-full object-cover"
                alt={banner.title}
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-center p-12">
                 <div className="max-w-2xl">
                    <h2 className="text-white text-3xl md:text-6xl font-black tracking-tighter mb-4 drop-shadow-2xl">
                      {banner.title}
                    </h2>
                    <Link to={banner.link} className="bg-white text-black px-10 py-4 rounded-full font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:scale-105 transition-transform inline-block">
                      Watch & Shop
                    </Link>
                 </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
};const HeroSlider = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
        const fetchBanners = async () => {
            try {
                const res = await fetch('/api/hero-banners');
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    setBanners(data);
                } else {
                    console.log("No hero banners found, using demo data");
                    setBanners(DEMO_HERO_BANNERS);
                }
            } catch (e) {
                console.error(e);
                setBanners([]);
            } finally {
                setLoading(false);
            }
        };
    fetchBanners();
  }, []);

  if (loading) return <div className="h-[220px] md:h-[420px] w-full bg-slate-100 animate-pulse rounded-[24px] md:rounded-[32px] mt-2 mb-8 px-4"></div>;
  if (banners.length === 0) return null;

  return (
    <section className="relative w-full px-2 sm:px-0 mt-0 mb-8">
      <div className="max-w-7xl mx-auto overflow-hidden rounded-[28px] md:rounded-[32px] shadow-2xl">
        <Swiper
          modules={[Autoplay, Pagination, EffectFade]}
          effect="fade"
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          speed={1200}
          loop={true}
          grabCursor={true}
          centeredSlides={true}
          pagination={{ 
            clickable: true, 
            dynamicBullets: true 
          }}
          className="hero-swiper h-[220px] md:h-[420px]"
        >
          {banners.map((banner, index) => (
            <SwiperSlide key={banner.id || index}>
              <div className="relative w-full h-full overflow-hidden group">
                <picture>
                  <source 
                    media="(max-width: 640px)" 
                    srcSet={banner.mobile_banner || banner.banner_image || banner.banner_url || banner.image} 
                  />
                  <img 
                    src={banner.desktop_banner || banner.banner_image || banner.banner_url || banner.image} 
                    alt={banner.title || "Hero Banner"}
                    className={`w-full h-full object-cover transform transition-transform duration-[8s] ease-in-out ${index % 2 === 0 ? 'hover:translate-x-[-2%] scale-110' : 'hover:translate-x-[2%] scale-110'}`}
                    referrerPolicy="no-referrer"
                  />
                </picture>
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute inset-0 flex items-center p-8 sm:p-20">
                  <div className="max-w-3xl w-full flex flex-col md:flex-row items-center md:items-end justify-between gap-10 text-center md:text-left">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                      className="flex-1"
                    >
                      <h2 className="text-white text-4xl sm:text-7xl font-black leading-none mb-4 drop-shadow-2xl uppercase tracking-tighter italic">
                        {banner.title}
                      </h2>
                      <p className="text-white/90 text-lg sm:text-xl font-medium mb-8 drop-shadow-lg">
                        {banner.subtitle}
                      </p>
                      <div className="flex flex-col sm:flex-row items-center gap-6 justify-center md:justify-start">
                        <Link 
                          to={banner.redirect_url || "/shop"}
                          className="bg-white text-black px-10 py-5 rounded-[20px] text-xs sm:text-sm font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-2xl inline-flex items-center gap-3 active:scale-95"
                        >
                          {banner.button_text || "Shop Now"}
                          <ArrowRight size={18} />
                        </Link>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};
;

const CategorySlider = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCats = async () => {
            try {
                const data = await adminService.getCategories();
                const activeCats = data?.filter((c: any) => c.is_active && !c.parent_id) || [];
                if (Array.isArray(activeCats) && activeCats.length > 0) {
                    setCategories(activeCats);
                } else {
                    console.log("No categories found, using demo data");
                    setCategories(DEMO_CATEGORIES);
                }
            } catch (e) {
                console.error(e);
                setCategories(DEMO_CATEGORIES);
            } finally {
                setLoading(false);
            }
        };
        fetchCats();
    }, []);

    return (
        <section className="mb-10 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[22px] font-black text-slate-900 tracking-tighter uppercase leading-none">category spotlight</h2>
                    <Link to="/shop" className="text-primary text-[10px] font-black uppercase tracking-widest border-b-2 border-primary/20 pb-0.5 transition-all hover:border-primary">all categories</Link>
                </div>
                
                <Swiper
                    modules={[FreeMode, Autoplay]}
                    slidesPerView="auto"
                    spaceBetween={14}
                    loop={true}
                    grabCursor={true}
                    freeMode={true}
                    autoplay={{ delay: 2000, disableOnInteraction: false }}
                    speed={1000}
                    className="category-swiper !overflow-visible"
                >
                    {categories.map((cat, i) => (
                        <SwiperSlide key={cat.id || i} className="!w-[110px] md:!w-[180px]">
                            <Link 
                                to={`/shop?category=${cat.id}`}
                                className="flex flex-col items-center group active:scale-95 transition-transform"
                            >
                                <div className="w-full h-[150px] md:h-[240px] bg-white rounded-[22px] md:rounded-[32px] shadow-sm border border-slate-50 relative overflow-hidden group-hover:shadow-xl transition-all duration-500">
                                    <img 
                                        src={cat.banner_image || cat.image_url || cat.banner_url || "https://images.unsplash.com/photo-1555529733-0e670560f8e1?q=80&w=3164&auto=format&fit=crop"} 
                                        className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700" 
                                        alt={cat.category_name || cat.name} 
                                    />
                                    
                                    {/* Floating Icon */}
                                    <div className="absolute top-2 left-2 md:top-3 md:left-3 w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur-md rounded-xl md:rounded-2xl shadow-lg flex items-center justify-center transform -rotate-6 group-hover:rotate-0 transition-transform">
                                        {cat.icon?.includes('http') ? (
                                            <img src={cat.icon} className="w-5 h-5 md:w-6 md:h-6 object-contain" alt="" />
                                        ) : (
                                            <span className="text-xs md:text-sm">{cat.icon || '📦'}</span>
                                        )}
                                    </div>
                    
                                    {/* Info Overlay */}
                                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end min-h-[60%]">
                                        <h3 className="text-white text-[10px] md:text-xs font-black uppercase tracking-widest text-center drop-shadow-md">
                                            {cat.category_name || cat.name}
                                        </h3>
                                    </div>
                                </div>
                            </Link>
                        </SwiperSlide>
                    ))}

                    {/* Empty fallback / Loader */}
                    {loading && categories.length === 0 && (
                        [1,2,3,4,5,6].map(i => (
                            <SwiperSlide key={i} className="!w-[110px] md:!w-[180px]">
                                <div className="w-full h-[150px] md:h-[240px] bg-slate-100 rounded-3xl animate-pulse"></div>
                            </SwiperSlide>
                        ))
                    )}
                </Swiper>
            </div>
        </section>
    );
};

const ShopPage = () => {
  const navigate = useNavigate();
  const { categoryId, subcategoryId } = useParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCat, setActiveCat] = useState('All');
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const q = searchParams.get('search') || '';
  const catQuery = categoryId || searchParams.get('category');
  
  // Filters & Sorting
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [minDiscount, setMinDiscount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (catQuery) setActiveCat(catQuery);
  }, [catQuery]);

  useEffect(() => {
    setLoading(true);
    adminService.getCategories().then(cData => setCategories(cData || [])).catch(e => console.error(e));
    
    const unsubscribe = productService.subscribeAll((pData) => {
      setProducts(pData || []);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCat = activeCat === 'All' || p.category_id === activeCat || p.category === activeCat;
    const matchesSubcat = !subcategoryId || p.subcategory_id === subcategoryId || p.subcategory === subcategoryId;
    const searchLow = q.toLowerCase();
    const matchesSearch = !q || 
      p.name.toLowerCase().includes(searchLow) || 
      (p.sku && p.sku.toLowerCase().includes(searchLow)) ||
      (p.description && p.description.toLowerCase().includes(searchLow));
    
    // Additional filters
    const finalPrice = p.price * (1 - (p.discount || 0) / 100);
    const matchesPrice = finalPrice >= priceRange.min && finalPrice <= priceRange.max;
    const matchesDiscount = (p.discount || 0) >= minDiscount;

    return matchesCat && matchesSubcat && matchesSearch && matchesPrice && matchesDiscount;
  });

  // Sorting logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.price * (1 - (a.discount || 0) / 100);
    const priceB = b.price * (1 - (b.discount || 0) / 100);

    if (sortBy === 'price-low') return priceA - priceB;
    if (sortBy === 'price-high') return priceB - priceA;
    if (sortBy === 'discount') return (b.discount || 0) - (a.discount || 0);
    if (sortBy === 'newest') return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    return 0;
  });

  const activeCategoryData = categories.find(c => c.id === activeCat) || 
                             { id: activeCat, name: activeCat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()), description: `Premium ${activeCat.replace('-', ' ')} collection at best prices.`, banner_url: null };

  return (
    <div className="py-2 min-h-[60vh] pb-24">
      <Meta title={q ? `Search results for "${q}"` : (activeCategoryData?.name || "Browse Our Collection")} />
      
      {/* Category Specific Top Banner */}
      {activeCat !== 'All' && activeCategoryData?.banner_url && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full aspect-video md:aspect-[16/5] rounded-[32px] overflow-hidden mb-8 shadow-xl border border-slate-100"
        >
          <img 
            src={optimizeImg(activeCategoryData.banner_url, { width: 1600, height: 600 })} 
            className="w-full h-full object-cover" 
            alt={activeCategoryData.name} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6 md:p-12">
            <div className="max-w-xl">
              <span className="inline-block px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg mb-3 shadow-lg">
                Exclusive Collection
              </span>
              <h1 className="text-white text-3xl md:text-5xl font-black tracking-tighter mb-2 drop-shadow-xl uppercase leading-none">
                {activeCategoryData.name}
              </h1>
              <p className="text-white/70 text-xs md:text-sm font-medium max-w-sm line-clamp-2">
                {activeCategoryData.description || 'Discover our latest premium essentials tailored for your unique style.'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header & Filter Controls */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl py-4 -mx-4 px-4 mb-6 border-b border-slate-50">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 overflow-x-auto no-scrollbar scrollbar-hide flex gap-2">
            <button 
              onClick={() => setActiveCat('All')}
              className={`px-6 py-2.5 rounded-2xl text-[10px] uppercase tracking-widest font-black whitespace-nowrap transition-all border-2 ${activeCat === 'All' ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
            >
              All Items
            </button>
            {Array.isArray(categories) && categories.map((cat) => (
              <button 
                key={cat.id} 
                onClick={() => setActiveCat(cat.id)}
                className={`px-6 py-2.5 rounded-2xl text-[10px] uppercase tracking-widest font-black whitespace-nowrap transition-all border-2 ${activeCat === cat.id ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-2xl border-2 transition-all shrink-0 ${showFilters ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}
          >
            <Filter size={20} />
          </button>
        </div>

        {/* Expandable Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-slate-50/50 rounded-3xl mt-4 border border-slate-100"
            >
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sort By */}
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-4 flex items-center gap-2">
                    <BarChart3 size={14} /> Sort By
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'newest', label: 'Newest' },
                      { id: 'price-low', label: 'Price: Low-High' },
                      { id: 'price-high', label: 'Price: High-Low' },
                      { id: 'discount', label: 'Top Discount' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setSortBy(opt.id)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all ${sortBy === opt.id ? 'bg-primary text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-4 flex items-center gap-2">
                    <CreditCard size={14} /> Price Range
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">MIN</span>
                      <input 
                        type="number" 
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-9 py-2 text-xs font-black" 
                      />
                    </div>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">MAX</span>
                      <input 
                        type="number" 
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-9 py-2 text-xs font-black" 
                      />
                    </div>
                  </div>
                </div>

                {/* Discount Filter */}
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-4 flex items-center gap-2">
                    <Ticket size={14} /> Minimum Discount
                  </h4>
                  <div className="flex gap-2">
                    {[0, 10, 25, 50].map(disc => (
                      <button
                        key={disc}
                        onClick={() => setMinDiscount(disc)}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-black tracking-tight transition-all ${minDiscount === disc ? 'bg-red-500 text-white shadow-md shadow-red-200' : 'bg-white text-slate-500 border border-slate-200'}`}
                      >
                        {disc === 0 ? 'Any' : `${disc}%+`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {Array(8).fill(0).map((_, i) => (
             <div key={i} className="animate-pulse flex flex-col gap-3">
               <div className="aspect-square bg-slate-100 rounded-3xl" />
               <div className="h-4 bg-slate-100 rounded w-3/4 mx-auto" />
               <div className="h-3 bg-slate-100 rounded w-1/2 mx-auto" />
             </div>
          ))}
        </div>
      ) : sortedProducts.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sortedProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-[40px] border border-slate-100 shadow-sm">
           <PackageX size={80} className="mx-auto text-slate-200 mb-6 drop-shadow-sm" />
           <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">No Products Available</h3>
           <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">It looks like we don't have any products here right now. Explore other categories or adjust your filters.</p>
           <div className="flex justify-center gap-4 mt-8">
             <Link 
               to="/categories"
               className="px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all shadow-xl shadow-purple-600/30"
             >
               Explore Other Categories
             </Link>
             <button 
               onClick={() => { setPriceRange({ min: 0, max: 100000 }); setMinDiscount(0); setSortBy('newest'); setActiveCat('All'); navigate('/shop'); }}
               className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all"
             >
               Clear Filters
             </button>
           </div>
        </div>
      )}
    </div>
  );
};

// --- Authentication UI Components ---

const AuthModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { loginWithEmail, registerWithEmail } = useAuth();
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login State
  const [loginForm, setLoginForm] = useState({ email: '', password: '', rememberMe: true });

  // Register State
  const [regForm, setRegForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    division: '', district: '', area: '', street: ''
  });

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const divisions = ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'];
  const districtsMap: Record<string, string[]> = {
    'Dhaka': ['Dhaka City', 'Gazipur', 'Narayanganj', 'Tangail', 'Manikganj'],
    'Chattogram': ['Chattogram City', 'Cox\'s Bazar', 'Cumilla', 'Feni', 'Noakhali'],
    'Rajshahi': ['Rajshahi City', 'Bogura', 'Pabna', 'Sirajganj', 'Naogaon'],
    'Khulna': ['Khulna City', 'Jashore', 'Kushtia', 'Satkhira', 'Bagerhat'],
    'Barishal': ['Barishal City', 'Bhola', 'Patuakhali', 'Pirojpur'],
    'Sylhet': ['Sylhet City', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
    'Rangpur': ['Rangpur City', 'Dinajpur', 'Gaibandha', 'Kurigram', 'Nilphamari'],
    'Mymensingh': ['Mymensingh City', 'Jamalpur', 'Netrokona', 'Sherpur']
  };

  const validateEmail = (e: string) => /^[^\s@]+@gmail\.com$/.test(e);
  const validatePhone = (p: string) => /^(01)[3-9]\d{8}$/.test(p);
  const validatePassword = (pw: string) => pw.length >= 8;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(loginForm.email, loginForm.password);
      onClose();
    } catch (err: any) {
      console.error("Login Error:", err.code, err.message);
      if (err.message === 'Invalid login credentials' || err.code === 'invalid_credentials' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Login method disabled. Please enable "Email/Password" in Firebase Console.');
      } else if (err.code === 'auth/user-not-found') {
        setError('Account not found. Please register first.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Authentication failed. Check your connection or config.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Field Validations
    if (!regForm.name.trim()) { setError('Please enter your full name'); return; }
    if (!validateEmail(regForm.email)) { setError('Only valid @gmail.com addresses are accepted'); return; }
    if (!validatePhone(regForm.phone)) { setError('Invalid Bangladesh mobile number (01XXXXXXXXX)'); return; }
    if (!validatePassword(regForm.password)) { setError('Password must be at least 8 characters long'); return; }
    if (regForm.password !== regForm.confirmPassword) { setError('Passwords do not match'); return; }
    if (!regForm.division || !regForm.district || !regForm.area.trim() || !regForm.street.trim()) {
      setError('Please provide your complete shipping address');
      return;
    }

    setLoading(true);
    try {
      await registerWithEmail({
        email: regForm.email,
        password: regForm.password,
        name: regForm.name,
        phone: regForm.phone,
        address: `${regForm.street}, ${regForm.area}, ${regForm.district}, ${regForm.division}`,
        division: regForm.division,
        district: regForm.district,
        area: regForm.area,
        street: regForm.street
      });
      setSuccess('Account created successfully!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Registration Error:", err.code, err.message);
      if (err.message === 'User already registered' || err.code === 'user_already_exists' || err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Try logging in.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Registration disabled. Please enable "Email/Password" in Firebase Console.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger one.');
      } else {
        setError(err.message || 'Registration failed. Try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isRegFormValid = regForm.name.trim() && 
                        validateEmail(regForm.email) && 
                        validatePhone(regForm.phone) && 
                        validatePassword(regForm.password) && 
                        regForm.password === regForm.confirmPassword &&
                        regForm.division && 
                        regForm.district && 
                        regForm.area.trim() && 
                        regForm.street.trim();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="bg-white w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] overflow-hidden relative z-10 shadow-2xl h-full sm:h-auto max-h-[95vh] flex flex-col"
          >
            <div className="p-8 sm:p-10 flex flex-col h-full">
               <div className="flex justify-between items-center mb-8">
                  <div className="text-left">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      {view === 'login' ? 'Welcome Back!' : view === 'register' ? 'Join Community' : 'Reset Password'}
                    </h2>
                    <p className="text-xs font-bold text-slate-400 mt-1">
                      {view === 'login' ? 'Enter credentials' : view === 'register' ? 'Create profile' : 'Recover account'}
                    </p>
                  </div>
                  <button onClick={onClose} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"><X size={20}/></button>
               </div>

               {view !== 'forgot' && (
                 <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-8 border border-slate-100">
                    <button 
                      onClick={() => setView('login')}
                      className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${view === 'login' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}
                    >
                      LOGIN
                    </button>
                    <button 
                      onClick={() => setView('register')}
                      className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${view === 'register' ? 'bg-white text-primary shadow-sm' : 'text-slate-400'}`}
                    >
                      REGISTER
                    </button>
                 </div>
               )}

               <div className="flex-1 overflow-y-auto no-scrollbar pb-10 pr-1">
                 {error && (
                   <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-4 bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-red-100 flex items-center gap-3 shadow-sm"
                   >
                     <div className="w-6 h-6 bg-red-500 text-white rounded-lg flex items-center justify-center flex-shrink-0">!</div>
                     {error}
                   </motion.div>
                 )}

                 {success && (
                   <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-4 bg-green-50 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-green-100 flex items-center gap-3 shadow-sm"
                   >
                     <CheckCircle2 size={16} />
                     {success}
                   </motion.div>
                 )}

                 {view === 'login' ? (
                   <form onSubmit={handleLogin} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gmail Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input 
                            type="email" 
                            required
                            placeholder="example@gmail.com"
                            value={loginForm.email}
                            onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 py-4 pl-12 pr-4 rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-primary/10 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                        <div className="relative">
                          <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input 
                            type={showLoginPassword ? 'text' : 'password'} 
                            required
                            placeholder="••••••••"
                            value={loginForm.password}
                            onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 py-4 pl-12 pr-12 rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-primary/10 transition-all"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                          >
                            {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between px-1">
                        <label className="flex items-center gap-2 cursor-pointer group">
                           <div className={`w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center ${loginForm.rememberMe ? 'bg-primary border-primary' : 'border-slate-200 group-hover:border-primary/50'}`}>
                              {loginForm.rememberMe && <Check size={12} className="text-white" />}
                           </div>
                           <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={loginForm.rememberMe}
                            onChange={e => setLoginForm({...loginForm, rememberMe: e.target.checked})}
                           />
                           <span className="text-xs font-bold text-slate-500">Remember Me</span>
                        </label>
                        <button 
                          type="button"
                          onClick={() => setView('forgot')}
                          className="text-xs font-black text-primary hover:underline"
                        >
                          Forgot Password?
                        </button>
                      </div>

                      <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-5 bg-primary text-white rounded-[20px] font-black shadow-xl shadow-primary/20 active:scale-[0.98] disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-3"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : view === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
                      </button>

                      <div className="grid grid-cols-2 gap-4 mt-6">
                        {/* Social login buttons removed per security requirements */}
                      </div>
                   </form>
                 ) : view === 'register' ? (
                   <form onSubmit={handleRegister} className="space-y-5">
                      <div className="space-y-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                            <input 
                              type="text" 
                              required
                              placeholder="John Doe"
                              value={regForm.name}
                              onChange={e => setRegForm({...regForm, name: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-100 py-4 px-4 rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-primary/10 transition-all"
                            />
                         </div>

                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile</label>
                                <input 
                                  type="tel" 
                                  required
                                  placeholder="01XXXXXXXXX"
                                  value={regForm.phone}
                                  onChange={e => setRegForm({...regForm, phone: e.target.value})}
                                  className="w-full bg-slate-50 border border-slate-100 py-4 px-4 rounded-2xl text-sm font-bold outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gmail</label>
                                <input 
                                  type="email" 
                                  required
                                  placeholder="example@gmail.com"
                                  value={regForm.email}
                                  onChange={e => setRegForm({...regForm, email: e.target.value})}
                                  className="w-full bg-slate-50 border border-slate-100 py-4 px-4 rounded-2xl text-sm font-bold outline-none"
                                />
                            </div>
                         </div>

                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative">
                                  <input 
                                    type={showRegPassword ? 'text' : 'password'} 
                                    required
                                    placeholder="8+ chars"
                                    value={regForm.password}
                                    onChange={e => setRegForm({...regForm, password: e.target.value})}
                                    className={`w-full bg-slate-50 border py-4 px-4 pr-10 rounded-2xl text-sm font-bold outline-none transition-all ${regForm.password ? (validatePassword(regForm.password) ? 'border-green-200 focus:ring-green-100' : 'border-red-200 focus:ring-red-100') : 'border-slate-100 focus:ring-primary/10'}`}
                                  />
                                  <button 
                                    type="button"
                                    onClick={() => setShowRegPassword(!showRegPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                  >
                                    {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                  </button>
                                </div>
                                {regForm.password && (
                                  <p className={`text-[9px] font-black uppercase tracking-widest ml-1 ${validatePassword(regForm.password) ? 'text-green-500' : 'text-red-500'}`}>
                                    {validatePassword(regForm.password) ? 'Password is valid ✓' : 'Minimum 8 characters required'}
                                  </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm</label>
                                <div className="relative">
                                  <input 
                                    type={showConfirmPassword ? 'text' : 'password'} 
                                    required
                                    placeholder="Repeat"
                                    value={regForm.confirmPassword}
                                    onChange={e => setRegForm({...regForm, confirmPassword: e.target.value})}
                                    className={`w-full bg-slate-50 border py-4 px-4 pr-10 rounded-2xl text-sm font-bold outline-none transition-all ${regForm.confirmPassword ? (regForm.password === regForm.confirmPassword ? 'border-green-200 focus:ring-green-100' : 'border-red-200 focus:ring-red-100') : 'border-slate-100 focus:ring-primary/10'}`}
                                  />
                                  <button 
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                  >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                  </button>
                                </div>
                                {regForm.confirmPassword && (
                                  <p className={`text-[9px] font-black uppercase tracking-widest ml-1 ${regForm.password === regForm.confirmPassword ? 'text-green-500' : 'text-red-500'}`}>
                                    {regForm.password === regForm.confirmPassword ? 'Passwords match ✓' : 'Passwords do not match'}
                                  </p>
                                )}
                            </div>
                         </div>
                         
                         <div className="pt-4 border-t border-slate-100">
                           <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                             <MapPin size={12} /> Delivery Address
                           </p>
                           <div className="grid grid-cols-2 gap-4 mb-4">
                              <select 
                                required
                                value={regForm.division}
                                onChange={e => setRegForm({...regForm, division: e.target.value, district: '', area: ''})}
                                className="w-full bg-slate-50 border border-slate-100 py-4 px-4 rounded-2xl text-sm font-bold appearance-none"
                              >
                                <option value="">Division</option>
                                {divisions.map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                              <select 
                                required
                                disabled={!regForm.division}
                                value={regForm.district}
                                onChange={e => setRegForm({...regForm, district: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-100 py-4 px-4 rounded-2xl text-sm font-bold appearance-none disabled:opacity-50"
                              >
                                <option value="">District</option>
                                {regForm.division && districtsMap[regForm.division].map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                           </div>
                           <div className="grid grid-cols-2 gap-4 mb-4">
                              <input 
                                type="text" 
                                required
                                placeholder="Area"
                                value={regForm.area}
                                onChange={e => setRegForm({...regForm, area: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-100 py-4 px-4 rounded-2xl text-sm font-bold"
                              />
                              <input 
                                type="text" 
                                required
                                placeholder="Street"
                                value={regForm.street}
                                onChange={e => setRegForm({...regForm, street: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-100 py-4 px-4 rounded-2xl text-sm font-bold"
                              />
                           </div>
                         </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-5 bg-primary text-white rounded-[20px] font-black shadow-xl shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50"
                      >
                         {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'CREATE ACCOUNT'}
                      </button>
                   </form>
                 ) : (
                   <div className="space-y-6 text-center">
                      <div className="w-20 h-20 bg-primary/10 text-primary rounded-[28px] flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck size={40} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block text-left">Gmail Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input 
                            type="email" 
                            required
                            placeholder="example@gmail.com"
                            className="w-full bg-slate-50 border border-slate-100 py-4 pl-12 pr-4 rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-primary/10 transition-all"
                          />
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => {
                          setLoading(true);
                          setTimeout(() => {
                            setSuccess('Reset link sent to your Gmail!');
                            setLoading(false);
                          }, 1500);
                        }}
                        disabled={loading}
                        className="w-full py-5 bg-slate-900 text-white rounded-[20px] font-black shadow-xl"
                      >
                         {loading ? 'SENDING...' : 'RECOVER ACCOUNT'}
                      </button>

                      <button 
                        onClick={() => setView('login')}
                        className="text-xs font-black text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        Back to Login
                      </button>
                   </div>
                 )}
               </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Protected by <span className="text-primary">Marketplace Secure Auth</span>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Layout Component
const Layout = ({ children, user }: { children: any, user: any }) => {
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lang, setLang] = useState<'en' | 'bn'>((localStorage.getItem('lang') as any) || 'en');
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { settings, setSettings } = useSettings();
  const [isSearching, setIsSearching] = useState(false);

  const handleImageSearch = async (file: File) => {
    setIsSearching(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/ai/image-search', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.result) {
        // Redirect to shop with AI result keywords
        navigate(`/shop?search=${encodeURIComponent(data.result.split(',')[0])}`);
      }
    } catch (e) {
      console.error('Image Search Error:', e);
    } finally {
      setIsSearching(false);
    }
  };

  const t = translations[lang] as any;

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return <div className="min-h-screen bg-slate-100">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TrackingScripts />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      
      {/* TOP HEADER */}
      <header className="custom-header border-b border-slate-50">
        {/* LEFT SIDE */}
        <div className="header-left">
            <button onClick={() => setIsMenuOpen(true)} className="menu-btn hover:text-primary transition-colors">
               <Menu size={24} strokeWidth={2} />
            </button>

            <Link to="/">
              <img
                 src={settings.logo}
                 alt="logo"
                 className="site-logo"
              />
            </Link>
        </div>

        {/* SEARCH */}
        <div className="header-search">
            <input
               type="text"
               placeholder="Search product..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && navigate(`/shop?search=${searchTerm}`)}
            />

            <button className="search-camera text-slate-400 hover:text-primary transition-colors" onClick={() => fileInputRef.current?.click()}>
               <Camera size={20} strokeWidth={2} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageSearch(file);
              }}
            />
        </div>

        {/* RIGHT */}
        <div className="header-right">
            <Link to="/wishlist" className="icon-box text-slate-800 hover:text-primary transition-colors">
                <Heart size={24} strokeWidth={2} />
                <span className="wishlist-count">
                   {wishlist.length || 0}
                </span>
            </Link>

            <Link to="/cart" className="icon-box text-slate-800 hover:text-primary transition-colors">
                <ShoppingBag size={24} strokeWidth={2} />
                <span className="cart-count">
                   {cart.reduce((a:any,c:any)=>a+c.quantity,0) || 0}
                </span>
            </Link>
        </div>
      </header>

      {/* Side Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-white z-[101] shadow-2xl p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Hello, {user ? 'Member' : 'Guest'}</h3>
                    <p className="text-xs text-slate-400">Welcome to {settings.companyName}</p>
                  </div>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-xl hover:bg-slate-50">
                  <X size={20} />
                </button>
              </div>
              <div className="flex flex-col gap-1 overflow-y-auto pr-2">
                {[
                  { label: 'Home', path: '/', icon: HomeIcon },
                  { label: 'Shop Categories', path: '/shop', icon: LayoutGrid },
                  { label: 'Flash Deals', path: '/shop?filter=flash', icon: Zap },
                  { label: 'My Orders', path: user ? '/profile' : '/cart', icon: ShoppingBag },
                  { label: 'My Wishlist', path: '/wishlist', icon: Heart },
                  { label: 'Customer Support', path: '/support', icon: MessageCircle },
                  { label: 'Blog & Trends', path: '/blog', icon: Sparkles },
                  { label: 'Admin Login', path: '/admin', icon: ShieldCheck },
                ].map((item) => (
                  <Link 
                    key={item.label}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-primary/5 hover:text-primary transition-all font-bold text-slate-600 text-sm"
                  >
                    <item.icon size={20} />
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="mt-auto pt-6 border-t border-slate-100 space-y-6">
                <div className="flex gap-4">
                  <Instagram size={20} className="text-slate-400 hover:text-primary cursor-pointer" />
                  <FacebookIcon size={20} className="text-slate-400 hover:text-[#1877F2] cursor-pointer" />
                  <Twitter size={20} className="text-slate-400 hover:text-primary cursor-pointer" />
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Download App</p>
                   <p className="text-xs font-bold text-slate-600">Get better experience on Mobile</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="pt-4 pb-24 px-4 max-w-7xl mx-auto">
        {children}
      </main>

      <BottomNav />
    </div>
  );
};

// Admin Page
const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState<any[]>([]);
  const [siteConfig, setSiteConfig] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, c] = await Promise.all([
          adminService.getProducts(),
          configService.get()
        ]);
        setProducts(p || []);
        setSiteConfig(c || { heroTitle: 'Curated Luxe Essentials', heroSubtitle: 'Premium living for the modern dwell.' });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: ListTree },
    { id: 'category-banners', label: 'Category Banners', icon: ImageIcon },
    { id: 'banners', label: 'Banners & Logo', icon: ImageIcon },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'marketing', label: 'SEO & Performance', icon: Globe },
    { id: 'settings', label: 'Store Settings', icon: SettingsIcon },
  ];

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await configService.update(siteConfig);
      alert('Configuration updated successfully');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="pt-40 text-center font-light uppercase tracking-widest text-xs">Loading Control Center...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50 pt-20">
      {/* Admin Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-end mb-12">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2 capitalize">{activeTab}</h1>
              <p className="text-sm text-slate-400 font-medium">Configure and manage your premium marketplace assets.</p>
            </div>
            <button className="px-6 py-3 bg-primary text-white text-[10px] uppercase font-bold rounded-2xl flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95">
              <PlusCircle size={14} /> Global Action
            </button>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-6"
              >
                {[
                  { label: 'Total Revenue', value: '৳ 1,24,592', trend: '+12.5%', icon: BarChart3 },
                  { label: 'Active Orders', value: '42', trend: '+5', icon: ShoppingBag },
                  { label: 'Total Customers', value: '1,204', trend: '+89', icon: Users },
                  { label: 'Conversion', value: '4.2%', trend: '+0.4%', icon: Zap }
                ].map((stat, i) => (
                  <div key={i} className="marketplace-card p-6 bg-white overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                       <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-primary/10 transition-colors">
                          <stat.icon size={18} className="text-slate-600 group-hover:text-primary" />
                       </div>
                       <span className="text-[10px] text-green-500 font-bold bg-green-50 px-2 py-0.5 rounded-lg">{stat.trend}</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">{stat.label}</p>
                    <h3 className="text-2xl font-extrabold text-slate-800">{stat.value}</h3>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'products' && (
              <motion.div 
                key="products"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="marketplace-card bg-white overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-50 bg-slate-50/50">
                        <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400">Product</th>
                        <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400">Category</th>
                        <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400">Price</th>
                        <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400">Status</th>
                        <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {products?.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 flex items-center gap-4">
                            <img src={p.image} className="w-10 h-10 object-cover rounded-xl shadow-sm border border-slate-100" />
                            <span className="text-xs font-bold text-slate-700">{p.name}</span>
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-slate-400">{p.category}</td>
                          <td className="px-6 py-4 text-xs font-extrabold text-slate-900">{formatPrice(p.price)}</td>
                          <td className="px-6 py-4">
                            <span className="bg-green-100 text-green-600 text-[9px] font-bold px-2 py-0.5 rounded-lg uppercase">Active</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-3">
                              <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-primary transition-colors hover:bg-primary/10 rounded-lg"><Edit3 size={14} /></button>
                              <button className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'categories' && (
              <motion.div 
                key="categories"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {[
                  { name: 'Fashion', count: 124, icon: '👕', color: 'bg-blue-50 text-blue-600' },
                  { name: 'Electronics', count: 85, icon: '📱', color: 'bg-purple-50 text-purple-600' },
                  { name: 'Home Living', count: 56, icon: '🏠', color: 'bg-green-50 text-green-600' },
                  { name: 'Beauty', count: 92, icon: '💄', color: 'bg-pink-50 text-pink-600' },
                  { name: 'Sports', count: 43, icon: '⚽', color: 'bg-orange-50 text-orange-600' },
                  { name: 'Grocery', count: 156, icon: '🍎', color: 'bg-teal-50 text-teal-600' },
                ].map((cat, i) => (
                  <div key={i} className="marketplace-card p-6 bg-white flex items-center gap-6 group hover:border-primary transition-all">
                     <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center text-2xl shadow-sm`}>
                        {cat.icon}
                     </div>
                     <div className="flex-1">
                        <h4 className="font-bold text-slate-800 mb-0.5">{cat.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cat.count} Products</p>
                     </div>
                     <button className="p-2 text-slate-300 hover:text-primary"><ChevronRight size={20}/></button>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'category-banners' && (
              <motion.div 
                key="category-banners"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <ManageCategoryBanners />
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div 
                key="orders"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="marketplace-card bg-white overflow-hidden shadow-xl"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-50 bg-slate-50/50">
                        <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400">Order ID</th>
                        <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400">Customer</th>
                        <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400">Date</th>
                        <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400">Total</th>
                        <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[
                        { id: '#MK-9821', user: 'Rahat Ahmed', date: '2 mins ago', total: '৳ 4,500', status: 'Pending', color: 'bg-yellow-100 text-yellow-600' },
                        { id: '#MK-9820', user: 'Nabila Karim', date: '1 hour ago', total: '৳ 12,800', status: 'Shipped', color: 'bg-blue-100 text-blue-600' },
                        { id: '#MK-9819', user: 'Zayan Kabir', date: '3 hours ago', total: '৳ 2,400', status: 'Completed', color: 'bg-green-100 text-green-600' },
                        { id: '#MK-9818', user: 'Maria Sultana', date: '5 hours ago', total: '৳ 850', status: 'Cancelled', color: 'bg-red-100 text-red-600' },
                      ].map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 text-xs font-bold text-slate-700">{order.id}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                               <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-bold">{order.user[0]}</div>
                               <span className="text-xs font-bold text-slate-600">{order.user}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-slate-400">{order.date}</td>
                          <td className="px-6 py-4 text-xs font-extrabold text-slate-900">{order.total}</td>
                          <td className="px-6 py-4">
                            <span className={`${order.color} text-[9px] font-extrabold px-2 py-0.5 rounded-lg uppercase`}>{order.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'banners' && siteConfig && (
              <motion.div 
                key="banners"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <form onSubmit={handleSaveConfig} className="marketplace-card p-10 bg-white space-y-10">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 mb-8 flex items-center gap-3">
                       <ShieldCheck size={20} className="text-primary" /> Core Brand Assets
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="space-y-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company Logo Tag</label>
                          <input 
                            type="text" 
                            className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 ring-primary/20 transition-all text-sm font-bold text-slate-700"
                            value={siteConfig.siteName || 'MarketOne'}
                            onChange={e => setSiteConfig({...siteConfig, siteName: e.target.value})}
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload Custom Logo</label>
                          <div className="w-full h-14 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 hover:border-primary/30 transition-all cursor-pointer">
                             <Plus size={20} />
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-slate-50">
                    <h3 className="text-sm font-extrabold text-slate-800 mb-8">Promotion & Hero Assets</h3>
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hero Title</label>
                          <input 
                            type="text" 
                            className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 ring-primary/20 transition-all text-sm font-bold text-slate-700"
                            value={siteConfig.heroTitle || ''}
                            onChange={e => setSiteConfig({...siteConfig, heroTitle: e.target.value})}
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hero Subtitle</label>
                          <input 
                            type="text" 
                            className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 ring-primary/20 transition-all text-sm font-bold text-slate-700"
                            value={siteConfig.heroSubtitle || ''}
                            onChange={e => setSiteConfig({...siteConfig, heroSubtitle: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Featured Asset URL (Main Slider)</label>
                          <input 
                            type="text" 
                            className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 ring-primary/20 transition-all text-sm font-bold text-slate-700"
                            placeholder="https://images.unsplash.com/..."
                          />
                          <p className="text-[9px] font-bold text-slate-400">Dimensions: 1200x600 recommended for best results.</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-slate-50">
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center gap-3 px-10 py-4 bg-primary text-white text-[11px] font-extrabold uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {isSaving ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Save size={14}/></motion.div> : <Save size={14}/>}
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === 'marketing' && (
              <motion.div 
                key="marketing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="marketplace-card p-10 bg-white border-l-8 border-l-primary shadow-2xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                       <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-extrabold text-slate-800">Advanced Site Optimization</h3>
                        <p className="text-xs font-bold text-slate-400">Your site is performing at peak efficiency.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-slate-50 rounded-2xl relative overflow-hidden group">
                      <Zap size={20} className="mb-4 text-primary" />
                      <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Load Performance</p>
                      <p className="text-lg font-extrabold text-slate-800">98 / 100</p>
                      <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-150" />
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl relative overflow-hidden group">
                      <Globe size={20} className="mb-4 text-primary" />
                      <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">SEO Visibility</p>
                      <p className="text-lg font-extrabold text-slate-800">Healthy +</p>
                      <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-150" />
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl relative overflow-hidden group">
                      <BarChart3 size={20} className="mb-4 text-primary" />
                      <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Tracking Status</p>
                      <p className="text-lg font-extrabold text-slate-800">Active</p>
                      <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-150" />
                    </div>
                  </div>
                </div>

                <div className="marketplace-card p-10 bg-white space-y-8">
                  <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-3"><SettingsIcon size={18} /> Dynamic Meta Assets</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Homepage SEO Title</label>
                      <input type="text" className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold text-sm text-slate-700 outline-none" defaultValue="MarketOne | Premium Modern Marketplace" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Meta Description (160 chars)</label>
                      <textarea className="w-full px-5 py-4 bg-slate-50 rounded-2xl font-bold text-sm text-slate-700 h-24 outline-none" defaultValue="Discover a curated marketplace balancing modern design with seamless commerce. Shop the latest in gadgets, fashion, and living." />
                    </div>
                  </div>
                  <button className="px-10 py-4 bg-primary text-white text-[11px] font-extrabold rounded-2xl shadow-lg shadow-primary/10 active:scale-95 transition-all">
                    Update Global Meta
                  </button>
                </div>
              </motion.div>
            )}

            {(activeTab === 'customers' || activeTab === 'reviews' || activeTab === 'settings') && (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="marketplace-card p-20 bg-white flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 shadow-inner">
                  {activeTab === 'customers' && <Users size={40} strokeWidth={1}/>}
                  {activeTab === 'reviews' && <MessageSquare size={40} strokeWidth={1}/>}
                  {activeTab === 'settings' && <SettingsIcon size={40} strokeWidth={1}/>}
                </div>
                <div>
                    <h3 className="text-xl font-extrabold text-slate-800 mb-2 capitalize">{activeTab} Dashboard</h3>
                    <p className="text-slate-400 text-sm font-bold max-w-sm">The {activeTab} control unit is ready for your high-performance workflow.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
// Product Detail Page
const ProductDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'reviews'>('details');
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('Charcoal');
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);

    const fetchProduct = async () => {
      setLoading(true);
      let data = null;
      let hasError = false;
      try {
        if (id) {
           data = await productService.getById(id);
        }
      } catch (err) {
        console.error("Fetch API error:", err);
        hasError = true;
      }
      
      // Fallback to demo products if not found in db
      if (!data) {
        const demoMatch = DEMO_PRODUCTS.find(p => p.id === id);
        if (demoMatch) {
            data = demoMatch;
        } else if (!hasError) {
            // Generate a dummy but beautiful product structure
            data = {
              id: id || 'test-vone',
              name: 'Premium Edition Fashion Product',
              price: 185,
              discount: 10,
              category: 'Fashion',
              rating: 4.8,
              reviewCount: 124,
              description: 'A sculptural exploration of form and void. Designed for the modern dwelling, this piece balances minimalist aesthetics with functional integrity. Crafted from premium materials to ensure longevity and a timeless presence.',
              images: [
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1200',
                'https://images.unsplash.com/photo-1518131394553-855bc7f0c55d?auto=format&fit=crop&q=80&w=1200'
              ],
              colors: ['Charcoal', 'Bone', 'Sage'],
              sizes: ['S', 'M', 'L', 'XL'],
            };
        }
      }

      if (!data) {
        // Absolute fallback failure
        setLoading(false);
        navigate('/');
        return;
      }
      
      // Map data into expected structure if it's from DB
      try {
        // Fetch all products for related / other sections
        try {
          const productsResponse = await productService.getAll();
          let all = [...(productsResponse || [])];
          if (all.length === 0) {
            all = DEMO_PRODUCTS;
          }
          setAllProducts(all);
        } catch (err) {
          setAllProducts(DEMO_PRODUCTS);
        }

        let pImages = ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1200'];
        if (data?.gallery?.length > 0) {
          pImages = data.gallery;
        } else if (data?.gallery_images?.length > 0) {
          pImages = data.gallery_images;
        } else if (data?.image) {
          // Replace to get higher res WebP via auto=format
          pImages = [data.image.replace(/\?w=\d+/, '?auto=format&fit=crop&q=80&w=1200')];
        } else if (data?.images?.length > 0) {
          pImages = data.images;
        }

        const formattedProduct = {
          id: data.id,
          name: data.name || data.title,
          price: data.price ? Number(data.price) : 0,
          discount: data.discount || 0,
          category: data.category || 'Fashion',
          rating: data.rating || 4.5,
          reviewCount: data.reviewCount || 10,
          description: data.description || 'Premium quality fashion strictly designed for modern aesthetics and supreme comfort.',
          images: pImages,
          variants: data.variants || [],
          colors: data.colors || ['Black', 'White', 'Navy'],
          sizes: data.sizes || ['S', 'M', 'L', 'XL'],
          specs: data.specs || {
            fabric: '100% Organic Cotton',
            gsm: '250 GSM',
            origin: '-',
            fit: 'Standard Fit'
          }
        };
        
        setProduct(formattedProduct);
        if (formattedProduct.variants && formattedProduct.variants.length > 0) {
          setSelectedVariant(formattedProduct.variants[0]);
          setSelectedColor(formattedProduct.variants[0].color);
        }
        
        // Add to recently viewed
        const recent = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
        const filtered = recent.filter((p: any) => p.id !== formattedProduct.id);
        const updated = [formattedProduct, ...filtered].slice(0, 10);
        localStorage.setItem('recently_viewed', JSON.stringify(updated));
        
        // Tracking
        trackingService.trackProductView({
          id: formattedProduct.id,
          name: formattedProduct.name,
          price: formattedProduct.price * (1 - (formattedProduct.discount || 0) / 100),
          category: formattedProduct.category
        });
      } catch (err) {
        console.error("Format product error", err);
        setLoading(false);
        navigate('/');
        return;
      }
      
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    const basePrice = selectedVariant?.price || product.price || 0;
    const discount = selectedVariant?.discount || product.discount || 0;
    const finalPrice = basePrice * (1 - discount / 100);
    addToCart({
      id: product.id + (selectedVariant ? `-${selectedVariant.color}` : ''),
      name: `${product.name} ${selectedVariant ? `(${selectedVariant.color})` : ''}`,
      price: finalPrice,
      quantity: qty,
      image: selectedVariant?.image || product?.images?.[0] || product?.image,
      color: selectedColor,
      size: selectedSize
    });
    trackingService.trackAddToCart({
      id: product.id,
      name: product.name,
      price: finalPrice,
      quantity: qty
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const currentCategory = product?.category;
  const relatedProducts = allProducts.filter(
    item => item.category === currentCategory && item.id !== product?.id
  );
  
  const otherProducts = allProducts.filter(
    item => item.category !== currentCategory && item.id !== product?.id
  );

  if (loading || !product) {
    return (
      <div className="pb-32 bg-white pt-[80px] px-4 md:px-6 lg:px-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 min-h-screen">
        {/* Gallery Skeleton */}
        <div className="space-y-4">
          <div className="aspect-[4/5] md:aspect-square bg-slate-100 animate-pulse md:rounded-[32px] rounded-2xl w-full" />
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-shrink-0 w-20 h-20 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        </div>
        {/* Content Skeleton */}
        <div className="flex flex-col mt-6 md:mt-0 space-y-6">
          <div className="space-y-3">
            <div className="h-6 bg-slate-100 animate-pulse rounded-full w-24" />
            <div className="h-10 bg-slate-100 animate-pulse rounded-2xl w-3/4" />
            <div className="h-10 bg-slate-100 animate-pulse rounded-2xl w-1/3" />
            <div className="h-24 bg-slate-100 animate-pulse rounded-2xl w-full mt-6" />
          </div>
          <div className="grid grid-cols-2 gap-8 pt-6">
             <div className="space-y-3">
               <div className="h-4 bg-slate-100 animate-pulse rounded-full w-16" />
               <div className="flex gap-2"><div className="h-10 w-10 bg-slate-100 animate-pulse rounded-xl" /><div className="h-10 w-10 bg-slate-100 animate-pulse rounded-xl" /></div>
             </div>
             <div className="space-y-3">
               <div className="h-4 bg-slate-100 animate-pulse rounded-full w-16" />
               <div className="flex gap-2"><div className="h-10 w-10 bg-slate-100 animate-pulse rounded-xl" /><div className="h-10 w-10 bg-slate-100 animate-pulse rounded-xl" /></div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-[110px] bg-white">
      <Meta 
        title={product?.name || 'Product'} 
        description={product?.description} 
        image={product?.images?.[0] || product?.image} 
        type="product"
      />
      <ProductSchema product={product} />
      
      {/* FIXED PREMIUM TOP HEADER */}
      <div className="fixed top-0 left-0 right-0 h-[70px] z-[999] bg-white/95 backdrop-blur-[14px] border-b border-slate-100 flex items-center justify-between px-4 transition-all shadow-[0_4px_14px_rgba(0,0,0,0.02)]">
         <button 
           onClick={() => navigate(-1)} 
           className="w-[42px] h-[42px] rounded-2xl bg-white border border-slate-100 shadow-[0_4px_14px_rgba(0,0,0,0.04)] flex items-center justify-center text-slate-700 hover:text-primary transition-all active:scale-95"
         >
            <ArrowLeft size={20} strokeWidth={2.5} />
         </button>
         <h2 className="font-extrabold text-sm text-slate-800 tracking-tight truncate max-w-[200px]">{product.name}</h2>
         <div className="w-[42px] h-[42px]" /> {/* Empty space for centering */}
      </div>
      
      {/* Added pt-[80px] to account for fixed header */}
      <div className="pt-[80px] px-0 md:px-6 lg:px-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-0 md:gap-10">
        
        {/* Gallery */}
        <div className="space-y-4 px-4 md:px-0">
          <div className="aspect-[4/5] md:aspect-square bg-slate-50 md:rounded-[32px] overflow-hidden relative group cursor-grab active:cursor-grabbing">
            <AnimatePresence mode="wait">
              <motion.img 
                key={selectedImage}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, { offset }) => {
                  const padding = 50;
                  if (offset.x < -padding && selectedImage < (product?.images?.length || 0) - 1) {
                    setSelectedImage(selectedImage + 1);
                  } else if (offset.x > padding && selectedImage > 0) {
                    setSelectedImage(selectedImage - 1);
                  }
                }}
                src={selectedVariant ? selectedVariant.image : (product?.images?.[selectedImage] || product?.image)} 
                className="w-full h-full object-cover touch-pan-y"
                alt={product?.name || "Product"}
              />
            </AnimatePresence>
            {((selectedVariant?.discount || product?.discount) > 0) && (
              <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-xl shadow-lg ring-4 ring-red-500/10 backdrop-blur-sm pointer-events-none">
                SAVE {selectedVariant?.discount || product.discount}%
              </div>
            )}
            
            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1 z-10 pointer-events-none">
               {(!product?.variants?.length) && (product?.images || []).map((_: any, i: number) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all ${selectedImage === i ? 'w-4 bg-primary' : 'w-1.5 bg-black/20'}`} />
               ))}
            </div>
          </div>
          {(product?.variants?.length > 0) ? (
            <div className="flex gap-[10px] overflow-x-auto pb-[5px] scroll-smooth scrollbar-hide px-1 mt-4">
               {product.variants.map((variant: any, i: number) => (
                 <button 
                   key={i} 
                   onClick={() => {
                     setSelectedVariant(variant);
                     setSelectedColor(variant.color);
                   }}
                   className={`flex-shrink-0 w-[60px] h-[60px] md:w-[80px] md:h-[80px] rounded-[12px] overflow-hidden border-2 transition-all duration-300 ${selectedVariant?.color === variant.color ? 'border-[#7c3aed] scale-105 shadow-lg shadow-[#7c3aed]/10' : 'border-transparent opacity-70 hover:opacity-100 hover:border-slate-200'}`}
                 >
                   <img src={variant.image} className="w-full h-full object-cover" alt={`Variant ${variant.color}`} loading="lazy" />
                 </button>
               ))}
            </div>
          ) : (product?.images?.length || 0) > 1 && (
            <div className="flex gap-[10px] overflow-x-auto pb-[5px] scroll-smooth scrollbar-hide px-1 mt-4">
               {(product?.images || []).map((img: string, i: number) => (
                 <button 
                   key={i} 
                   onClick={() => setSelectedImage(i)}
                   className={`flex-shrink-0 w-[60px] h-[60px] md:w-[80px] md:h-[80px] rounded-[12px] overflow-hidden border-2 transition-all duration-300 ${selectedImage === i ? 'border-[#7c3aed] scale-105 shadow-lg shadow-[#7c3aed]/10' : 'border-transparent opacity-70 hover:opacity-100 hover:border-slate-200'}`}
                 >
                   <img src={img} className="w-full h-full object-cover" alt={`Thumb ${i}`} loading="lazy" />
                 </button>
               ))}
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex flex-col px-4 md:px-0 mt-6 md:mt-0">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{product.category}</span>
              <div className="flex items-center gap-1 ml-auto bg-slate-50 px-2 py-1 rounded-lg">
                <Star size={12} fill="#FFC107" className="text-[#FFC107]" />
                <span className="text-xs font-bold text-slate-700">{product.rating}</span>
                <span className="text-[10px] text-slate-400">({product.reviewCount} Reviews)</span>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2 leading-tight">{product.name}</h1>
            <div className="flex items-center gap-4 mb-6">
              <p className="text-3xl font-black text-primary">
                {formatPrice((Number(selectedVariant?.price) || product.price) * (1 - (Number(selectedVariant?.discount) || product.discount || 0) / 100))}
              </p>
              {(Number(selectedVariant?.discount) > 0 || product.discount > 0) && (
                <p className="text-lg font-bold text-slate-300 line-through">
                  {formatPrice(Number(selectedVariant?.price) || product.price)}
                </p>
              )}
            </div>
            
            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
              {product.description}
            </p>
          </div>
          
          <div className="space-y-8">
            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {(!product?.variants || product.variants.length === 0) && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Color Variants</label>
                  <div className="flex gap-3 mt-4">
                    {(Array.isArray(product?.colors) ? product.colors : ['Charcoal']).map((color: string) => (
                      <button 
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 h-10 rounded-xl text-xs font-bold transition-all border ${selectedColor === color ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-600 hover:border-primary/50'}`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Select Size</label>
                <div className="flex gap-2">
                  {(Array.isArray(product?.sizes) ? product.sizes : ['M']).map((size: string) => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-10 h-10 rounded-xl text-xs font-bold transition-all border ${selectedSize === size ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-110' : 'bg-white text-slate-600 border-slate-200 hover:border-primary/30'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quantity</label>
              <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
                <button 
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-10 flex items-center justify-center text-slate-600 bg-white shadow-sm border border-slate-100 rounded-lg transition-all active:scale-95"
                >
                  <motion.span whileTap={{ scale: 0.8 }}>-</motion.span>
                </button>
                <span className="w-12 text-center text-sm font-bold text-slate-800">{qty}</span>
                <button 
                  onClick={() => setQty(qty + 1)}
                  className="w-10 h-10 flex items-center justify-center text-slate-600 bg-white shadow-sm border border-slate-100 rounded-lg transition-all active:scale-95"
                >
                  <motion.span whileTap={{ scale: 0.8 }}>+</motion.span>
                </button>
              </div>
            </div>

            {/* Premium Fabric Details Box */}
            <div className="bg-white rounded-[24px] p-[18px] shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-slate-100">
               <h3 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                 <Star size={16} fill="currentColor" className="text-[#7c3aed]" />
                 Fabric & Material Details
               </h3>
               <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                 {[
                   { label: 'Fabric Type', val: product.specs?.fabric || product.fabric_type || 'Premium Cotton' },
                   { label: 'GSM', val: product.specs?.gsm || product.gsm || '250 GSM' },
                   { label: 'Material', val: product.specs?.material || product.material || '100% Organic' },
                   { label: 'Fit Type', val: product.specs?.fit || product.fit_type || 'Regular Fit' },
                   { label: 'Wash', val: product.specs?.wash || product.wash_instruction || 'Machine Wash' },
                   { label: 'Stretch', val: product.specs?.stretch || product.stretch_type || 'Medium Stretch' },
                   { label: 'Country', val: product.specs?.country || product.country || 'Imported' },
                   { label: 'Stitch', val: product.specs?.stitch || 'Double Needled' }
                 ].map((spec, i) => (
                   <div key={i} className="flex flex-col gap-1">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{spec.label}</span>
                     <span className="text-[13px] font-semibold text-slate-700">{spec.val}</span>
                   </div>
                 ))}
               </div>
            </div>

          </div>
        </div>
      </div>

      {/* Info Tabs */}
      <div className="mt-12 px-4 md:px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="flex gap-6 border-b border-slate-100 mb-8 overflow-x-auto scrollbar-hide">
          {['details', 'specs', 'reviews'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`text-xs font-extrabold uppercase tracking-widest pb-3 transition-all relative border-b-2 ${activeTab === tab ? 'text-primary border-primary' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="min-h-[200px]">
          <AnimatePresence mode="wait">
            {activeTab === 'details' && (
              <motion.div 
                key="details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-slate-500 text-sm font-medium leading-relaxed"
              >
                {product.description}
              </motion.div>
            )}
            {activeTab === 'specs' && (
              <motion.div 
                key="specs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {Object.entries(product?.specs || {}).map(([key, val]) => (
                  <div key={key} className="bg-slate-50/50 p-5 rounded-[20px] border border-slate-100">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{key}</p>
                    <p className="text-sm font-bold text-slate-800">{val as string}</p>
                  </div>
                ))}
              </motion.div>
            )}
            {activeTab === 'reviews' && (
              <motion.div 
                key="reviews"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ProductReviews productId={product.id} productName={product.name} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* OTHER CATEGORY PRODUCTS */}
      {otherProducts.length > 0 && (
      <div className="mt-8 mb-24 px-4 md:px-6 lg:px-10 max-w-7xl mx-auto">
        <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 mb-6">Explore More Products</h2>
        <div className="flex gap-3 overflow-x-auto pb-6 scroll-smooth scrollbar-hide snap-x" style={{ scrollBehavior: 'smooth' }}>
          {otherProducts.map((p: any) => (
            <div key={p.id} className="flex-shrink-0 w-[140px] md:w-[220px] snap-start mb-2 group">
               <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Mobile Sticky Buttons Fixed Bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[999] bg-white/60 backdrop-blur-[18px] border-t border-white/50 px-4 pt-3 pb-6 flex gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] min-h-[90px]">
        <button 
          onClick={() => {
            const isInWishlist = wishlist.some(item => item.id === product.id);
            if (isInWishlist) removeFromWishlist(product.id);
            else addToWishlist({ ...product, image: product?.images?.[0] || product?.image });
          }}
          className={`w-[56px] h-[54px] rounded-[18px] flex items-center justify-center transition-all bg-white shadow-sm border border-slate-100 active:scale-95 ${wishlist.some(item => item.id === product.id) ? 'text-red-500' : 'text-slate-500 hover:text-[#7c3aed]'}`}
        >
           <Heart size={24} strokeWidth={2} fill={wishlist.some(item => item.id === product.id) ? "currentColor" : "none"} />
        </button>
        <button 
          onClick={handleAdd}
          className="flex-1 bg-[#111827] text-white text-[13px] font-extrabold rounded-[18px] h-[54px] flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
        >
          <ShoppingCart size={16} strokeWidth={2.5} />
          {added ? 'Added' : 'Add To Cart'}
        </button>
        <Link 
          to="/checkout"
          onClick={handleAdd}
          className="flex-[1.2] bg-gradient-to-br from-[#7c3aed] to-[#9333ea] text-white text-[13px] font-extrabold rounded-[18px] h-[54px] flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(124,58,237,0.3)] active:scale-95 transition-all"
        >
          Buy Now
        </Link>
      </div>

      {/* Desktop Sticky Area */}
      <div className="hidden md:flex fixed bottom-6 left-0 right-0 z-[999] items-center justify-center pointer-events-none">
          <div className="bg-white/80 backdrop-blur-[18px] px-4 py-3 rounded-[24px] shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-white/50 flex items-center gap-4 pointer-events-auto">
             <div className="flex items-center gap-3">
                 <img src={product?.images?.[0] || product?.image} className="w-12 h-12 rounded-[12px] object-cover" />
                 <div>
                    <h4 className="text-[11px] font-extrabold text-slate-800 line-clamp-1 max-w-[150px]">{product?.name}</h4>
                    <p className="text-[12px] font-black text-primary">{formatPrice((product?.price || 0) * (1 - (product?.discount || 0) / 100))}</p>
                 </div>
             </div>
             <div className="w-[1px] h-8 bg-slate-100 mx-2" />
             <button onClick={() => {
                const isInWishlist = wishlist.some(item => item.id === product.id);
                if (isInWishlist) removeFromWishlist(product.id);
                else addToWishlist({ ...product, image: product?.images?.[0] || product?.image });
              }} className={`w-[48px] h-[48px] rounded-xl flex items-center justify-center transition-colors bg-white shadow-sm border border-slate-100 ${wishlist.some(item => item.id === product.id) ? 'text-red-500' : 'text-slate-400 hover:text-[#7c3aed]'}`}>
                <Heart size={20} fill={wishlist.some(item => item.id === product.id) ? "currentColor" : "none"} />
             </button>
             <button onClick={handleAdd} className="bg-[#111827] text-white px-6 h-[48px] rounded-[14px] text-[13px] font-extrabold active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg">
                <ShoppingCart size={16} strokeWidth={2.5} />
                {added ? 'Added' : 'Add To Cart'}
             </button>
             <Link to="/checkout" onClick={handleAdd} className="bg-gradient-to-br from-[#7c3aed] to-[#9333ea] text-white px-8 h-[48px] rounded-[14px] text-[13px] font-extrabold active:scale-95 shadow-[0_8px_20px_rgba(124,58,237,0.3)] transition-all flex items-center justify-center">
                Buy Now
             </Link>
          </div>
      </div>
    </div>
  );
};

// Cart Page
const CartPage = () => {
  const { cart, total, removeFromCart, updateQuantity, saveForLater, savedForLater, moveToCart, removeFromSaved } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const applyCoupon = async () => {
    if (couponCode.toUpperCase() === 'SAVE10') {
      setCouponDiscount(total * 0.1);
      setCouponApplied(true);
      trackingService.trackApplyCoupon(couponCode, total * 0.1);
    } else {
      alert('Invalid or Expired Coupon');
    }
  };

  const grandTotal = total - couponDiscount;

  return (
    <div className="py-6 min-h-screen">
      <Meta title="My Shopping Cart" />
      <div className="flex items-center gap-3 mb-8">
        <Link to="/" className="w-10 h-10 flex items-center justify-center bg-white rounded-xl border border-slate-100 text-slate-600 shadow-sm">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-extrabold text-slate-800">My Cart</h1>
        <span className="text-slate-400 text-xs font-bold ml-auto">{cart.length} ITEMS</span>
      </div>
      
      {cart.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm mb-12">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <ShoppingBag size={40} />
          </div>
          <p className="text-slate-500 font-bold mb-8">Your cart is empty</p>
          <Link to="/shop" className="px-8 py-3 bg-primary text-white text-xs font-bold rounded-2xl shadow-lg shadow-primary/20 inline-block active:scale-95 transition-all">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4 mb-12">
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="marketplace-card flex gap-4 p-4 bg-white relative group">
                <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-center gap-1">
                  <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{item.name}</h3>
                  <p className="text-xs font-bold text-primary">{formatPrice(item.price)}</p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center bg-slate-50 rounded-lg p-0.5">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">-</button>
                      <span className="w-8 text-center text-[11px] font-bold text-slate-800">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">+</button>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => saveForLater(item)} className="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors">Save for later</button>
                       <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="marketplace-card p-6 bg-white space-y-6 shadow-xl overflow-hidden relative">
            {/* Coupon Section */}
            <div className="relative">
              <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Promo Code</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter code (SAVE10)" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 ring-primary/20"
                />
                <button 
                  onClick={applyCoupon}
                  disabled={couponApplied}
                  className={`px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${couponApplied ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white active:scale-95'}`}
                >
                  {couponApplied ? 'Applied' : 'Apply'}
                </button>
              </div>
            </div>

            <div className="space-y-3 pb-4 border-b border-slate-50">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-medium">Subtotal</span>
                <span className="text-slate-800 font-bold">{formatPrice(total)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-500 font-medium">Discount</span>
                  <span className="text-emerald-600 font-bold">-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-medium">Shipping</span>
                <span className="text-green-500 font-bold">FREE</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base font-bold text-slate-800">Total</span>
              <span className="text-xl font-extrabold text-primary">{formatPrice(grandTotal)}</span>
            </div>
            <Link 
              to="/checkout"
              state={{ discount: couponDiscount, code: couponCode }}
              onClick={() => trackingService.trackInitiateCheckout(grandTotal, cart)}
              className="w-full bg-primary text-white py-4 rounded-2xl text-sm font-bold flex items-center justify-center shadow-lg shadow-primary/20 active:scale-95 transition-all group"
            >
              Checkout Securely <ChevronRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      )}

      {/* Saved for Later Section */}
      {savedForLater.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center gap-2">
            <Clock size={20} className="text-primary" /> Saved for later
          </h2>
          <div className="space-y-3">
             {savedForLater.map((item) => (
               <div key={item.id} className="marketplace-card flex gap-4 p-4 bg-slate-50/50 relative border-dashed">
                  <div className="w-16 h-16 bg-white rounded-xl overflow-hidden flex-shrink-0 opacity-60">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-xs font-bold text-slate-500 line-clamp-1">{item.name}</h3>
                    <p className="text-xs font-bold text-slate-400 mt-1">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                     <button onClick={() => moveToCart(item)} className="px-4 py-2 bg-white text-primary text-[10px] font-bold rounded-xl shadow-sm border border-slate-100">Move to Cart</button>
                     <button onClick={() => removeFromSaved(item.id)} className="text-slate-300 hover:text-red-500"><X size={16}/></button>
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Checkout Page
const CheckoutPage = () => {
  const { cart, total, clearCart } = useCart();
  const { user, profile, updateAddress } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState(profile?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [phone, setPhone] = useState(profile?.phoneNumber || '');
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'FIRST10') {
      setDiscount(total * 0.1);
      alert('Coupon Applied: 10% Discount');
    } else {
      alert('Invalid Coupon');
    }
  };

  const shipping = 60; // Standard shipping in BD
  const grandTotal = total - discount + shipping;

  const handlePlaceOrder = async () => {
    if (!address || !phone) {
      alert('Please complete all details');
      return;
    }

    setIsProcessing(true);
    
    // Simulate Payment Gateway for online payments
    if (paymentMethod !== 'cod') {
      await paymentService.processPayment(paymentMethod, grandTotal);
    }

    const orderId = await orderService.create({
      userId: user?.id || 'guest',
      items: cart,
      total: grandTotal,
      address,
      phone,
      paymentMethod,
      discount,
      shipping,
      userEmail: user?.email || 'guest@example.com'
    });

    if (orderId) {
      navigate('/success');
    }
    setIsProcessing(false);
  };

  if (cart.length === 0) return <Navigate to="/shop" />;

  return (
    <div className="py-6 max-w-4xl mx-auto px-4">
      <Meta title="Checkout" />
      <h1 className="text-2xl font-extrabold text-slate-800 mb-8">Secure Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Step 1: Delivery */}
          <div className={`marketplace-card p-6 bg-white transition-all ${step === 1 ? 'ring-2 ring-primary' : 'opacity-60'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">1</div>
              <h2 className="text-lg font-bold text-slate-800">Delivery Address</h2>
            </div>
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Phone Number</label>
                  <input 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 ring-primary/10 text-sm font-bold"
                    placeholder="Enter mobile number"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Detailed Address</label>
                  <textarea 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 ring-primary/10 text-sm font-bold h-32"
                    placeholder="House, Road, Area, City"
                  />
                </div>
                <button 
                  onClick={() => {
                    updateAddress(address);
                    setStep(2);
                  }}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold active:scale-95 transition-all shadow-lg shadow-primary/20"
                >
                  Confirm & Continue
                </button>
              </div>
            )}
            {step > 1 && (
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                <p className="text-xs font-bold text-slate-600 line-clamp-1">{address}</p>
                <button onClick={() => setStep(1)} className="text-xs font-bold text-primary">Edit</button>
              </div>
            )}
          </div>

          {/* Step 2: Payment */}
          <div className={`marketplace-card p-6 bg-white transition-all ${step === 2 ? 'ring-2 ring-primary' : 'opacity-60'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">2</div>
              <h2 className="text-lg font-bold text-slate-800">Payment Method</h2>
            </div>
            {step === 2 && (
              <div className="space-y-4">
                {[
                  { id: 'cod', name: 'Cash on Delivery', icon: <Truck size={20} /> },
                  { id: 'bkash', name: 'bKash Payment', icon: <div className="text-[10px] font-bold">bKash</div> },
                  { id: 'nagad', name: 'Nagad Payment', icon: <div className="text-[10px] font-bold">Nagad</div> },
                  { id: 'card', name: 'Debit / Credit Card', icon: <CreditCard size={20} /> },
                ].map((method) => (
                  <button 
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${paymentMethod === method.id ? 'border-primary bg-primary/5' : 'border-slate-50 hover:border-slate-100'}`}
                  >
                    <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${paymentMethod === method.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {method.icon}
                    </div>
                    <span className="font-bold text-slate-700">{method.name}</span>
                    {paymentMethod === method.id && <CheckCircle2 className="ml-auto text-primary" size={20} />}
                  </button>
                ))}
                
                <div className="pt-6">
                   <button 
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Zap size={18}/></motion.div>
                    ) : (
                      <ShieldCheck size={20} />
                    )}
                    {isProcessing ? 'Processing...' : 'Place Order'}
                  </button>
                  <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4 flex items-center justify-center gap-1">
                    <ShieldCheck size={12} /> Secure 256-bit SSL encrypted payment
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="marketplace-card p-6 bg-white sticky top-24">
            <h3 className="text-sm font-extrabold text-slate-800 mb-6 uppercase tracking-widest">Order Summary</h3>
            <div className="space-y-4 mb-6">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 overflow-hidden flex-shrink-0">
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs font-bold text-slate-600 line-clamp-1">{item.name} <span className="text-slate-300">x{item.quantity}</span></span>
                  </div>
                  <span className="text-xs font-bold text-slate-800">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pb-4 border-b border-slate-50 mb-4">
               <div className="flex justify-between text-xs font-bold">
                 <span className="text-slate-400">Subtotal</span>
                 <span className="text-slate-800">{formatPrice(total)}</span>
               </div>
               <div className="flex justify-between text-xs font-bold">
                 <span className="text-slate-400">Shipping</span>
                 <span className="text-slate-800">{formatPrice(shipping)}</span>
               </div>
               {discount > 0 && (
                 <div className="flex justify-between text-xs font-bold text-green-500">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                 </div>
               )}
            </div>

            <div className="flex justify-between items-center mb-8">
              <span className="text-sm font-bold text-slate-800">Total</span>
              <span className="text-2xl font-extrabold text-primary">{formatPrice(grandTotal)}</span>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Promo Code</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="FIRST10"
                  className="flex-1 px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold outline-none ring-1 ring-slate-100"
                />
                <button onClick={applyCoupon} className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold">Apply</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Success Page
const SuccessPage = () => {
  const { cart, total, clearCart } = useCart();
  
  useEffect(() => {
    if (cart.length > 0) {
      const orderId = `ORD-${Date.now()}`;
      trackingService.trackPurchase(orderId, cart, total);
      clearCart();
    }
  }, []);

  return (
    <div className="py-20 text-center px-4">
      <Meta title="Order Successful" />
      <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/20">
        <ShieldCheck size={40} />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Payment Successful!</h1>
      <p className="text-slate-500 text-sm mb-12 max-w-sm mx-auto">
        Thank you for your order. We've received your payment and will start processing your delivery immediately.
      </p>
      <div className="flex flex-col gap-3">
        <Link to="/" className="px-10 py-4 bg-primary text-white text-sm font-bold rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all">
          Continue Shopping
        </Link>
        <Link to="/profile" className="px-10 py-4 bg-white text-slate-600 text-sm font-bold rounded-2xl border border-slate-100 active:scale-95 transition-all">
          View My Orders
        </Link>
      </div>
    </div>
  );
};

// --- Profile Sub-Pages ---

const SubPageHeader = ({ title, onBack }: { title: string, onBack: () => void }) => (
  <div className="flex items-center gap-4 px-4 py-6 bg-white border-b border-slate-100 mb-6 sticky top-0 z-30">
    <button onClick={onBack} className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center active:scale-90 transition-all">
      <ArrowLeft size={20} />
    </button>
    <h1 className="text-xl font-black text-slate-800">{title}</h1>
  </div>
);

const CouponsSubPage = ({ onBack }: { onBack: () => void }) => {
  const coupons = [
    { code: 'WELCOMENEW', discount: '৳100 OFF', desc: 'On orders over ৳1000', expiry: 'Exp. 24 May 2024', type: 'cash' },
    { code: 'FREESHIP', discount: 'FREE SHIPPING', desc: 'No minimum spend', expiry: 'Exp. 30 May 2024', type: 'ship' },
    { code: 'EXPIRED20', discount: '20% OFF', desc: 'Beauty products', expiry: 'Expired 10 May', type: 'expired' },
  ];

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 bg-slate-50 z-[100] flex flex-col overflow-y-auto">
      <SubPageHeader title="My Coupons" onBack={onBack} />
      <div className="px-4 space-y-4 pb-12">
        {coupons.map((c, i) => (
          <div key={i} className={`relative marketplace-card overflow-hidden flex ${c.type === 'expired' ? 'grayscale opacity-60' : ''}`}>
             <div className={`w-3 ${c.type === 'ship' ? 'bg-amber-400' : c.type === 'expired' ? 'bg-slate-300' : 'bg-primary'}`} />
             <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-800">{c.discount}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{c.desc}</p>
                </div>
                <div className="mt-4 flex justify-between items-center">
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{c.expiry}</p>
                   <span className="text-xs font-black text-primary border-2 border-primary/20 bg-primary/5 px-3 py-1 rounded-lg">{c.code}</span>
                </div>
             </div>
             {/* Punch holes */}
             <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-slate-50 rounded-full" />
             <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-slate-50 rounded-full" />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const OrdersListSubPage = ({ title, orders, onBack }: { title: string, orders: any[], onBack: () => void }) => {
  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 bg-slate-50 z-[100] flex flex-col overflow-y-auto">
      <SubPageHeader title={title} onBack={onBack} />
      <div className="px-4 space-y-4 pb-12">
        {orders.length === 0 ? (
          <div className="py-20 text-center text-slate-300">
             <Package size={64} className="mx-auto mb-4 opacity-20" />
             <p className="font-bold">No orders found</p>
          </div>
        ) : (
          orders.map((o, i) => (
            <div key={i} className="marketplace-card bg-white p-6 group">
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-sm font-black text-slate-800">#{o.id.slice(0, 8)}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new String(o.createdAt?.toDate?.() || new Date()).split('G')[0]}</p>
                  </div>
                  <span className="bg-primary/10 text-primary text-[9px] font-black px-2 py-1 rounded-md uppercase">{o.status}</span>
               </div>
               <div className="flex gap-3 mb-4">
                  {o.items?.map((item: any, idx: number) => (
                    <div key={idx} className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                      <img src={item.image} className="w-full h-full object-cover" alt="" />
                    </div>
                  ))}
               </div>
               <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                  <p className="text-sm font-black text-slate-800">৳{o.total}</p>
                  <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Track Order</button>
               </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

const RequestsSubPage = ({ onBack }: { onBack: () => void }) => {
  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 bg-slate-50 z-[100] flex flex-col overflow-y-auto">
      <SubPageHeader title="Support Tickets" onBack={onBack} />
      <div className="px-4 pb-12">
        <button className="w-full py-5 bg-white border-2 border-dashed border-slate-200 rounded-[32px] mb-8 text-slate-400 font-black flex items-center justify-center gap-3 active:scale-95 transition-all">
           <PlusCircle size={20} />
           Submit New Request
        </button>

        <div className="space-y-4">
           {[
             { id: 'TKT-991', subject: 'Refund Request Delayed', status: 'Ongoing', date: 'May 12' },
             { id: 'TKT-842', subject: 'Defective Product Received', status: 'Resolved', date: 'May 05' },
           ].map((t, i) => (
             <div key={i} className="marketplace-card bg-white p-6">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{t.id}</span>
                   <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${t.status === 'Ongoing' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>{t.status}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-2">{t.subject}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{t.date}</p>
             </div>
           ))}
        </div>
      </div>
    </motion.div>
  );
};

const RefundSubPage = ({ onBack }: { onBack: () => void }) => {
  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 bg-slate-50 z-[100] flex flex-col overflow-y-auto">
      <SubPageHeader title="Refund Center" onBack={onBack} />
      <div className="px-4 pb-12">
        <div className="marketplace-card bg-white p-6 text-center py-12">
           <RotateCcw size={48} className="mx-auto text-slate-100 mb-4" />
           <h3 className="text-lg font-black text-slate-800 mb-2">No Refund Requests</h3>
           <p className="text-sm font-bold text-slate-400 max-w-[200px] mx-auto">Items under return process will appear here.</p>
        </div>
      </div>
    </motion.div>
  );
};

const SettingsSubPage = ({ logout, onBack }: { logout: () => void, onBack: () => void }) => {
  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 bg-slate-50 z-[100] flex flex-col overflow-y-auto">
      <SubPageHeader title="App Settings" onBack={onBack} />
      <div className="px-4 space-y-4 pb-12">
        <div className="marketplace-card bg-white overflow-hidden divide-y divide-slate-50">
           <button className="w-full p-5 text-left flex justify-between items-center group">
              <span className="text-sm font-bold text-slate-700">Push Notifications</span>
              <div className="w-10 h-6 bg-primary rounded-full relative p-1">
                 <div className="absolute right-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
           </button>
           <button className="w-full p-5 text-left flex justify-between items-center group">
              <span className="text-sm font-bold text-slate-700">Theme</span>
              <span className="text-xs font-bold text-slate-400">Light Mode</span>
           </button>
           <button className="w-full p-5 text-left flex justify-between items-center group">
              <span className="text-sm font-bold text-slate-700">Language</span>
              <span className="text-xs font-bold text-slate-400">English (US)</span>
           </button>
           <button className="w-full p-5 text-left flex justify-between items-center group">
              <span className="text-sm font-bold text-slate-700">Privacy Policy</span>
              <ChevronRight size={18} className="text-slate-300" />
           </button>
           <button className="w-full p-5 text-left flex justify-between items-center group">
              <span className="text-sm font-bold text-slate-700">Terms of Service</span>
              <ChevronRight size={18} className="text-slate-300" />
           </button>
        </div>

        <button 
          onClick={logout}
          className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-black active:scale-95 transition-all mt-8"
        >
          Sign Out
        </button>
      </div>
    </motion.div>
  );
};

const EditProfileSubPage = ({ profile, onBack, onUpdate }: { profile: any, onBack: () => void, onUpdate: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    phoneNumber: profile?.phoneNumber || '',
    address: profile?.address || '',
    division: profile?.division || '',
    district: profile?.district || '',
    area: profile?.area || '',
    street: profile?.street || ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const divisions = ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'];
  const districtsMap: Record<string, string[]> = {
    'Dhaka': ['Dhaka City', 'Gazipur', 'Narayanganj', 'Tangail', 'Manikganj'],
    'Chattogram': ['Chattogram City', 'Cox\'s Bazar', 'Cumilla', 'Feni', 'Noakhali'],
    'Rajshahi': ['Rajshahi City', 'Bogura', 'Pabna', 'Sirajganj', 'Naogaon'],
    'Khulna': ['Khulna City', 'Jashore', 'Kushtia', 'Satkhira', 'Bagerhat'],
    'Barishal': ['Barishal City', 'Bhola', 'Patuakhali', 'Pirojpur'],
    'Sylhet': ['Sylhet City', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
    'Rangpur': ['Rangpur City', 'Dinajpur', 'Gaibandha', 'Kurigram', 'Nilphamari'],
    'Mymensingh': ['Mymensingh City', 'Jamalpur', 'Netrokona', 'Sherpur']
  };

  const handleSave = () => {
    const fullAddress = `${formData.street}, ${formData.area}, ${formData.district}, ${formData.division}`;
    onUpdate({ ...formData, address: fullAddress });
    setIsEditing(false);
  };

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 bg-white z-[100] flex flex-col overflow-y-auto no-scrollbar">
      <SubPageHeader title="Customer Profile" onBack={onBack} />
      
      <div className="px-6 pb-20">
        {/* Profile Header */}
        <div className="flex flex-col items-center gap-4 mb-10 mt-6">
          <div className="relative">
            <div className="w-28 h-28 rounded-[40px] bg-primary/5 flex items-center justify-center text-primary text-4xl font-black border-8 border-slate-50 shadow-xl overflow-hidden">
               {profile?.photoURL ? <img src={profile.photoURL} className="w-full h-full object-cover" /> : (formData.displayName?.[0] || 'U')}
            </div>
            <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-lg active:scale-90 transition-all">
               <Camera size={18} />
            </button>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-black text-slate-900">{formData.displayName || 'Marketplace User'}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Verified Member</p>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 gap-6">
           <div className="space-y-6">
              <div className="flex justify-between items-center px-1">
                 <h4 className="text-sm font-black text-slate-900">Personal Information</h4>
                 <button 
                  onClick={() => setIsEditing(!isEditing)} 
                  className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 bg-primary/5 px-3 py-1.5 rounded-lg"
                 >
                    {isEditing ? 'Cancel Edit' : 'Edit Profile'} <Edit3 size={12} />
                 </button>
              </div>

              <div className="marketplace-card bg-slate-50 p-6 space-y-6 border border-slate-100">
                 <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                       {isEditing ? (
                         <input 
                           type="text" 
                           value={formData.displayName} 
                           onChange={e => setFormData({...formData, displayName: e.target.value})}
                           className="w-full bg-white border border-slate-200 p-4 rounded-2xl font-bold outline-none focus:ring-2 ring-primary/10 shadow-sm"
                         />
                       ) : (
                         <p className="text-sm font-black text-slate-700 ml-1">{formData.displayName || 'Not Provided'}</p>
                       )}
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                       {isEditing ? (
                         <input 
                           type="tel" 
                           value={formData.phoneNumber} 
                           onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                           className="w-full bg-white border border-slate-200 p-4 rounded-2xl font-bold outline-none focus:ring-2 ring-primary/10 shadow-sm"
                         />
                       ) : (
                         <p className="text-sm font-black text-slate-700 ml-1">{formData.phoneNumber || 'Not Provided'}</p>
                       )}
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gmail Address</label>
                       <p className="text-sm font-black text-slate-700 ml-1 opacity-60">{profile?.email || 'user@gmail.com'}</p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Membership Date</label>
                       <p className="text-sm font-black text-slate-700 ml-1">{profile?.registrationDate || 'May 2024'}</p>
                    </div>
                 </div>
              </div>

              <div className="flex justify-between items-center px-1 pt-4">
                 <h4 className="text-sm font-black text-slate-900">Shipping Address</h4>
              </div>

              <div className="marketplace-card bg-slate-50 p-6 space-y-6 border border-slate-100">
                 {isEditing ? (
                   <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Division</label>
                           <select 
                             value={formData.division}
                             onChange={e => setFormData({...formData, division: e.target.value, district: '', area: ''})}
                             className="w-full bg-white border border-slate-200 p-4 rounded-2xl font-bold outline-none appearance-none shadow-sm"
                           >
                             <option value="">Select</option>
                             {divisions.map(d => <option key={d} value={d}>{d}</option>)}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">District</label>
                           <select 
                             disabled={!formData.division}
                             value={formData.district}
                             onChange={e => setFormData({...formData, district: e.target.value})}
                             className="w-full bg-white border border-slate-200 p-4 rounded-2xl font-bold outline-none appearance-none shadow-sm disabled:opacity-50"
                           >
                             <option value="">Select</option>
                             {formData.division && districtsMap[formData.division].map(d => <option key={d} value={d}>{d}</option>)}
                           </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Area</label>
                           <input type="text" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})} className="w-full bg-white border border-slate-200 p-4 rounded-2xl font-bold shadow-sm outline-none" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Street</label>
                           <input type="text" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full bg-white border border-slate-200 p-4 rounded-2xl font-bold shadow-sm outline-none" />
                        </div>
                      </div>
                   </div>
                 ) : (
                   <div className="flex gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm flex-shrink-0">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-700 leading-relaxed">{formData.address || 'Address not set'}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Default Delivery Address</p>
                      </div>
                   </div>
                 )}
              </div>

              {isEditing && (
                <button 
                  onClick={handleSave}
                  className="w-full py-5 bg-primary text-white rounded-[24px] font-black shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
                >
                  Confirm Updates
                </button>
              )}

              <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
                 <button 
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                 >
                    <ShieldCheck size={20} />
                    Change Security Password
                 </button>
                 
                 <AnimatePresence>
                   {showPasswordChange && (
                     <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-4 px-1"
                     >
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                           <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold outline-none" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Secure Password</label>
                           <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold outline-none" />
                        </div>
                        <button className="w-full py-4 bg-primary/10 text-primary rounded-2xl font-black text-xs uppercase tracking-widest">Update Password</button>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

const CoinsSubPage = ({ coins, onBack }: { coins: number, onBack: () => void }) => {
  const history = [
    { id: 'O-7842', title: 'Purchase Reward', amount: '+550', date: 'May 12, 2024', type: 'earn', source: 'Order #7842' },
    { id: 'C-001', title: 'Daily Check-in', amount: '+10', date: 'May 11, 2024', type: 'earn', source: 'System' },
    { id: 'R-992', title: 'Discount Redemption', amount: '-1000', date: 'May 08, 2024', type: 'spend', source: 'Coupon Exchange' },
    { id: 'O-7621', title: 'Purchase Reward', amount: '+420', date: 'May 05, 2024', type: 'earn', source: 'Order #7621' },
    { id: 'G-122', title: 'Lucky Spin Win', amount: '+50', date: 'May 02, 2024', type: 'earn', source: 'Game Zone' },
  ];

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 bg-white z-[100] flex flex-col overflow-y-auto no-scrollbar">
      <SubPageHeader title="IYABD Coins Ledger" onBack={onBack} />
      
      <div className="px-6 pt-6 pb-20">
        <div className="marketplace-card bg-slate-900 p-8 rounded-[40px] text-center mb-10 relative overflow-hidden shadow-2xl shadow-slate-900/20">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent" />
           <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em] mb-6 relative z-10">Total Asset Balance</p>
           <div className="flex items-center justify-center gap-5 mb-4 relative z-10">
              <div className="w-16 h-16 bg-amber-400 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.4)] ring-4 ring-white/10">
                <Sparkles size={32} className="text-amber-900" />
              </div>
              <h2 className="text-6xl font-black text-white tracking-tighter">{coins.toLocaleString()}</h2>
           </div>
           <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full mt-6 backdrop-blur-sm relative z-10">
             <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
             <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">Est. Value: ৳{(coins / 10).toFixed(2)}</p>
           </div>
        </div>

        <div className="flex items-center justify-between mb-6 px-1">
           <h3 className="text-lg font-black text-slate-800">Transaction History</h3>
           <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
             <Filter size={18} />
           </div>
        </div>

        <div className="space-y-4 mb-10">
          {history.map((h, i) => (
            <div key={i} className="marketplace-card bg-white p-6 flex items-center justify-between border border-slate-50 hover:border-primary/10 transition-all">
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${h.type === 'earn' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                  {h.type === 'earn' ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800 mb-1">{h.title}</h4>
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase">{h.date}</p>
                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                    <p className="text-[10px] font-black text-primary uppercase">{h.source}</p>
                  </div>
                </div>
              </div>
              <p className={`text-base font-black ${h.type === 'earn' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {h.type === 'earn' ? '+' : '-'}{h.amount.replace('+', '').replace('-', '')}
              </p>
            </div>
          ))}
        </div>

        <div className="marketplace-card bg-primary p-8 rounded-[40px] text-white flex flex-col gap-6 shadow-2xl shadow-primary/30 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
           <div className="relative z-10">
             <h3 className="text-2xl font-black mb-2">Redeem Coins</h3>
             <p className="text-xs font-bold text-white/70 leading-relaxed">Exchange your hard-earned coins for exclusive shopping vouchers and instant discounts on your next order.</p>
           </div>
           <button className="bg-white text-primary w-full py-5 rounded-[24px] font-black text-sm uppercase tracking-widest active:scale-95 transition-all shadow-xl relative z-10">
             Open Rewards Shop
           </button>
        </div>
      </div>
    </motion.div>
  );
};

const RewardsSubPage = ({ onBack }: { onBack: () => void }) => {
  const tasks = [
    { title: 'Daily Check-in', reward: '10 Coins', icon: Calendar, color: 'bg-blue-50 text-blue-500', done: true },
    { title: 'Watch Video Ad', reward: '50 Coins', icon: PlayCircle, color: 'bg-purple-50 text-purple-500', done: false },
    { title: 'Follow on Facebook', reward: '100 Coins', icon: Users, color: 'bg-indigo-50 text-indigo-500', done: false },
    { title: 'Share with Friends', reward: '200 Coins', icon: Share2, color: 'bg-emerald-50 text-emerald-500', done: false },
  ];

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 bg-white z-[100] flex flex-col overflow-y-auto no-scrollbar">
      <SubPageHeader title="Rewards Program" onBack={onBack} />
      
      <div className="px-6 pt-6 pb-20">
        {/* Referral Section */}
        <div className="marketplace-card bg-emerald-600 p-8 rounded-[40px] text-white overflow-hidden relative mb-10 shadow-2xl shadow-emerald-600/20">
           <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-3xl opacity-50" />
           <div className="relative z-10">
              <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] mb-4">Referral Invitation</p>
              <h2 className="text-4xl font-black mb-4 tracking-tight leading-[1.1]">Invite Friends & Get Free Coins</h2>
              <div className="flex items-center gap-4 bg-black/10 p-4 rounded-3xl backdrop-blur-md mb-6 border border-white/10">
                 <div className="flex-1">
                    <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Your Referral Code</p>
                    <p className="text-xl font-black tracking-widest">IYABD-SALEH</p>
                 </div>
                 <button className="w-12 h-12 bg-white text-emerald-600 rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all">
                    <Copy size={20} />
                 </button>
              </div>
              <button className="w-full py-5 bg-white text-emerald-600 rounded-[24px] font-black text-sm uppercase tracking-widest active:scale-95 transition-all shadow-xl">
                 Share Now
              </button>
           </div>
        </div>

        {/* Daily Tasks */}
        <div className="mb-10">
           <div className="flex justify-between items-center mb-6 px-1">
              <h3 className="text-lg font-black text-slate-800">Earn Daily Coins</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resets in 12h 45m</p>
           </div>
           
           <div className="grid grid-cols-1 gap-4">
              {tasks.map((task, i) => (
                <div key={i} className="marketplace-card bg-white p-5 flex items-center justify-between border border-slate-50 group hover:border-primary/10 transition-all">
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${task.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                         <task.icon size={22} />
                      </div>
                      <div>
                         <h4 className="text-sm font-black text-slate-800 mb-1">{task.title}</h4>
                         <p className="text-[10px] font-black text-primary uppercase tracking-widest">{task.reward}</p>
                      </div>
                   </div>
                   {task.done ? (
                     <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                        <Check size={20} />
                     </div>
                   ) : (
                     <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">
                        Collect
                     </button>
                   )}
                </div>
              ))}
           </div>
        </div>

        {/* Spin Wheel Teaser */}
        <div className="marketplace-card bg-slate-50 p-8 rounded-[40px] text-center border-2 border-dashed border-slate-200">
           <Zap size={40} className="mx-auto text-slate-200 mb-6 animate-bounce" />
           <h3 className="text-xl font-black text-slate-800 mb-2">Lucky Spin Wheel</h3>
           <p className="text-xs font-bold text-slate-400 mb-8 max-w-[200px] mx-auto">Try your luck today and win up to 5,000 extra coins!</p>
           <button onClick={() => window.location.href = '#games'} className="bg-primary text-white px-10 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all">
              Play Game Zone
           </button>
        </div>
      </div>
    </motion.div>
  );
};

const AddressSubPage = ({ profile, onUpdateAddress, onBack }: { profile: any, onUpdateAddress: (a: string) => void, onBack: () => void }) => {
  const [addresses, setAddresses] = useState([
    { id: 1, type: 'Home', address: profile?.address || '123 Main St, Dhaka', isDefault: true },
    { id: 2, type: 'Office', address: '456 Business Rd, Chittagong', isDefault: false },
  ]);

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 bg-slate-50 z-[100] flex flex-col overflow-y-auto">
      <SubPageHeader title="My Addresses" onBack={onBack} />
      <div className="px-4 space-y-4">
        {addresses.map((addr) => (
          <div key={addr.id} className={`marketplace-card bg-white p-6 border-2 transition-all ${addr.isDefault ? 'border-primary shadow-lg shadow-primary/5' : 'border-slate-50'}`}>
             <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${addr.isDefault ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <MapPin size={16} />
                   </div>
                   <h3 className="text-sm font-black text-slate-800">{addr.type}</h3>
                </div>
                {addr.isDefault && <span className="bg-primary/10 text-primary text-[9px] font-black px-2 py-1 rounded-md uppercase">Default</span>}
             </div>
             <p className="text-sm font-bold text-slate-500 mb-4">{addr.address}</p>
             <div className="flex gap-4 pt-4 border-t border-slate-50">
                <button className="flex-1 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">Edit</button>
                <div className="w-[1px] bg-slate-100" />
                <button className="flex-1 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors">Delete</button>
             </div>
          </div>
        ))}
        
        <button className="w-full flex items-center justify-center gap-3 py-6 border-2 border-dashed border-slate-200 rounded-[32px] text-slate-400 font-black hover:border-primary hover:text-primary transition-all">
           <Plus size={20} />
           <span className="text-sm uppercase tracking-widest">Add New Address</span>
        </button>
      </div>
    </motion.div>
  );
};

const GamesSubPage = ({ onBack }: { onBack: () => void }) => {
  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 bg-slate-50 z-[100] flex flex-col overflow-y-auto">
      <SubPageHeader title="Play & Earn" onBack={onBack} />
      <div className="px-4">
        <div className="marketplace-card bg-purple-600 p-8 rounded-[40px] text-white overflow-hidden relative mb-8">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
           <Sparkles className="absolute left-8 top-8 opacity-20" size={100} />
           <div className="relative z-10">
              <h2 className="text-4xl font-black mb-2">Game Zone</h2>
              <p className="text-purple-100 font-bold opacity-80 uppercase tracking-widest text-[10px]">Play Mini Games to win free coins</p>
           </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-12">
           {[
             { name: 'Lucky Spin', desc: 'Win up to 5000 Coins', icon: '🎡', color: 'bg-amber-500' },
             { name: 'Daily Bounty', desc: 'Collect daily gift', icon: '🎁', color: 'bg-green-500' },
             { name: 'Product Quiz', desc: 'Test your knowledge', icon: '📚', color: 'bg-blue-500' },
             { name: 'Coupon Hunt', desc: 'Find hidden discounts', icon: '🔍', color: 'bg-rose-500' },
           ].map((g, i) => (
             <button key={i} className="marketplace-card bg-white p-6 flex items-center justify-between group">
                <div className="flex items-center gap-5">
                   <div className={`w-14 h-14 ${g.color} rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-black/5`}>
                      {g.icon}
                   </div>
                   <div className="text-left">
                      <h3 className="text-lg font-black text-slate-800">{g.name}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{g.desc}</p>
                   </div>
                </div>
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all">
                  <ChevronRight size={20} />
                </div>
             </button>
           ))}
        </div>
      </div>
    </motion.div>
  );
};

// --- Product Review Components ---

const ReviewLightbox = ({ images, initialIndex, onClose }: { images: string[], initialIndex: number, onClose: () => void }) => {
  const [index, setIndex] = useState(initialIndex);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 bg-black/95 z-[200] flex flex-col items-center justify-center p-4"
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all z-50"
      >
        <X size={24} />
      </button>

      <div className="relative w-full max-w-4xl aspect-[4/3] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.img 
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            src={images[index]} 
            className="max-w-full max-h-full object-contain shadow-2xl"
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button 
              onClick={() => setIndex((index - 1 + images.length) % images.length)}
              className="absolute left-4 w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => setIndex((index + 1) % images.length)}
              className="absolute right-4 w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      <div className="mt-8 flex gap-3 overflow-x-auto">
        {images.map((img, i) => (
          <button 
            key={i} 
            onClick={() => setIndex(i)}
            className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${index === i ? 'border-primary' : 'border-transparent opacity-40'}`}
          >
            <img src={img} className="w-full h-full object-cover" alt="" />
          </button>
        ))}
      </div>
    </motion.div>
  );
};

const ReviewForm = ({ productId, productName, onClose, onSubmit }: { productId: string, productName: string, onClose: () => void, onSubmit: (data: any) => void }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const { user, profile } = useAuth();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = [...images];
      for (let i = 0; i < files.length; i++) {
        if (newImages.length >= 2) break;
        // In real app, upload to storage. Here, convert to object URL.
        const url = URL.createObjectURL(files[i]);
        newImages.push(url);
      }
      setImages(newImages);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    onSubmit({
      productId,
      userId: user.id,
      userName: profile?.displayName || user.email?.split('@')[0] || 'User',
      userPhoto: profile?.photoURL || '',
      rating,
      comment,
      images,
      isVerified: true, // Simulated verification for demo
      createdAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <motion.div 
        initial={{ y: '100%' }} 
        animate={{ y: 0 }} 
        exit={{ y: '100%' }}
        className="bg-white w-full max-w-lg rounded-t-[40px] sm:rounded-[40px] overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-slate-800">Write a Review</h2>
            <button onClick={onClose} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:text-red-500 transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-8">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Tap stars to rate</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform active:scale-90"
                  >
                    <Star 
                      size={40} 
                      fill={(hoverRating || rating) >= star ? "#FFC107" : "none"} 
                      className={(hoverRating || rating) >= star ? "text-[#FFC107]" : "text-slate-100"} 
                    />
                  </button>
                ))}
              </div>
              <p className="text-lg font-black text-slate-800 mt-4 h-6">
                {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
              </p>
            </div>

            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tell us more</label>
                  <textarea 
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    required
                    placeholder="What did you like or dislike about this product?"
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl font-bold outline-none focus:ring-2 ring-primary/10 transition-all min-h-[120px]"
                  />
               </div>

               <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Upload Photos (Max 2)</label>
                 <div className="flex gap-4">
                    {images.map((img, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-100">
                        <img src={img} className="w-full h-full object-cover" alt="" />
                        <button 
                          type="button"
                          onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center active:scale-90 transition-all"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {images.length < 2 && (
                      <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 hover:border-primary hover:text-primary transition-all cursor-pointer">
                        <Camera size={24} />
                        <span className="text-[8px] font-black uppercase mt-1">Add Photo</span>
                        <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                 </div>
               </div>
            </div>

            <button 
              type="submit"
              disabled={!comment.trim()}
              className="w-full py-5 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
            >
              Submit Review
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ReviewSummary = ({ rating, total, breakdown }: { rating: number, total: number, breakdown: number[] }) => {
  return (
    <div className="marketplace-card bg-white p-8 mb-8 border border-slate-50">
       <div className="flex flex-col md:flex-row gap-10">
          <div className="flex flex-col items-center justify-center text-center px-6 border-r border-slate-50">
             <h3 className="text-6xl font-black text-slate-900 mb-2">{rating.toFixed(1)}</h3>
             <div className="flex gap-1 mb-3">
               {[1, 2, 3, 4, 5].map(s => (
                 <Star key={s} size={16} fill={s <= Math.round(rating) ? "#FFC107" : "none"} className={s <= Math.round(rating) ? "text-[#FFC107]" : "text-slate-100"} />
               ))}
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Based on {total} Reviews</p>
          </div>

          <div className="flex-1 space-y-3">
             {breakdown.slice().reverse().map((count, i) => {
               const starLabel = 5 - i;
               const percentage = total > 0 ? (count / total) * 100 : 0;
               return (
                 <div key={i} className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-slate-600 w-4">{starLabel}</span>
                    <Star size={10} fill="#FFC107" className="text-[#FFC107]" />
                    <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden">
                       <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${percentage}%` }} 
                        className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.2)]" 
                       />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 w-8 text-right px-1">{count}</span>
                 </div>
               );
             })}
          </div>
       </div>
    </div>
  );
};

const ReviewCard = ({ review, onImageClick }: any) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="marketplace-card bg-white p-6 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/40 transition-all"
    >
       <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center text-primary text-xl font-bold border border-slate-50">
             {review.userPhoto ? <img src={review.userPhoto} className="w-full h-full object-cover" alt="" /> : review.userName[0]}
          </div>
          <div className="flex-1">
             <div className="flex justify-between items-start">
                <div>
                   <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                     {review.userName}
                     {review.isVerified && (
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-500 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                          <CheckCircle2 size={8} /> Verified Purchase
                        </span>
                     )}
                   </h4>
                   <div className="flex gap-1 mt-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={10} fill={s <= review.rating ? "#FFC107" : "none"} className={s <= review.rating ? "text-[#FFC107]" : "text-slate-100"} />
                      ))}
                   </div>
                </div>
                <span className="text-[10px] font-black text-slate-300 uppercase">{review.createdAt}</span>
             </div>
          </div>
       </div>

       <p className="text-slate-600 text-sm leading-relaxed mb-6 font-bold">{review.comment}</p>

       {review.images && review.images.length > 0 && (
          <div className="flex gap-3">
             {review.images.map((img: string, i: number) => (
                <button 
                  key={i} 
                  onClick={() => onImageClick(review.images, i)}
                  className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-50 relative group active:scale-95 transition-all"
                >
                   <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </button>
             ))}
          </div>
       )}
    </motion.div>
  );
};

const ProductReviews = ({ productId, productName }: any) => {
  const [reviews, setReviews] = useState<any[]>([
    { 
      id: 1, 
      userName: 'Elena Rodriguez', 
      userPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 
      rating: 5, 
      comment: 'The architectural form of this piece is absolute perfection. It commands attention in the room but maintains a minimalist quietness. The material quality exceeded my expectations. Highly recommend for any modern dwelling.', 
      images: [
        'https://images.unsplash.com/photo-1518131394553-855bc7f0c55d?w=800',
        'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800'
      ], 
      isVerified: true, 
      createdAt: '2 days ago' 
    },
    { 
      id: 2, 
      userName: 'Marcus Thompson', 
      userPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 
      rating: 4, 
      comment: 'Beautiful sculptured piece. The "Bone" color is slightly warmer than it appeared on my screen, but I actually prefer it. It adds a lovely texture to my living space. Delivery was prompt and packaging was very secure.', 
      images: [], 
      isVerified: true, 
      createdAt: '1 week ago' 
    },
    { 
      id: 3, 
      userName: 'Sarah Jin', 
      rating: 5, 
      comment: 'I bought two of these to flank my hallway. They look like expensive gallery pieces. The craftsmanship is solid and the finish is smooth with no visible seams. A masterclass in minimalist design.', 
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'
      ], 
      isVerified: true, 
      createdAt: '2 weeks ago' 
    }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [lightbox, setLightbox] = useState<{ images: string[], index: number } | null>(null);

  const stats = {
    average: 4.8,
    total: 124,
    breakdown: [2, 4, 8, 25, 85] // 1s, 2s, 3s, 4s, 5s
  };

  const handleAddReview = (data: any) => {
    setReviews([ { id: Date.now(), ...data }, ...reviews]);
  };

  return (
    <div className="pb-12">
      <AnimatePresence>
        {showForm && (
          <ReviewForm 
            productId={productId} 
            productName={productName} 
            onClose={() => setShowForm(false)} 
            onSubmit={handleAddReview} 
          />
        )}
        {lightbox && (
          <ReviewLightbox 
            images={lightbox.images} 
            initialIndex={lightbox.index} 
            onClose={() => setLightbox(null)} 
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
         <div>
            <h2 className="text-xl font-black text-slate-800 mb-1">Customer Reviews</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Feedback from verified owners</p>
         </div>
         <button 
           onClick={() => setShowForm(true)}
           className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs shadow-xl shadow-primary/10 active:scale-[0.98] transition-all flex items-center gap-3"
         >
           <PlusCircle size={18} />
           Write A Review
         </button>
      </div>

      <ReviewSummary rating={stats.average} total={stats.total} breakdown={stats.breakdown} />

      <div className="grid grid-cols-1 gap-6">
         {reviews.map(review => (
            <ReviewCard 
              key={review.id} 
              review={review} 
              onImageClick={(images, index) => setLightbox({ images, index })} 
            />
         ))}
      </div>
      
      <div className="mt-12 text-center">
         <button className="px-8 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs hover:bg-slate-100 transition-all active:scale-95">Load More Reviews</button>
      </div>
    </div>
  );
};

// Profile Page
const ProfilePage = () => {
  const { user, profile, logout, updateProfile, updateAddress } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const { wishlist } = useWishlist();
  const [subPage, setSubPage] = useState<string | null>(null);
  
  // Simulation for Demo
  const coins = profile?.coins || 1250;
  const recentProducts = JSON.parse(localStorage.getItem('recently_viewed') || '[]');

  useEffect(() => {
    if (user) {
      adminService.getOrdersByUserId(user.id).then(res => setOrders(res || []));
    }
  }, [user]);

  if (!user) return <Navigate to="/auth" />;

  const orderCounts = {
    pay: orders.filter(o => o.status === 'unpaid').length,
    ship: orders.filter(o => o.status === 'processing').length,
    receive: orders.filter(o => o.status === 'shipped').length,
    review: orders.filter(o => o.status === 'delivered').length,
    returns: orders.filter(o => o.status === 'returned').length
  };

  const menuItems = [
    { icon: Heart, label: 'My Wishlist', path: 'wishlist', badge: wishlist.length, color: 'text-rose-500' },
    { icon: Ticket, label: 'My Coupons', path: 'coupons', badge: 2, color: 'text-amber-500' },
    { icon: MapPin, label: 'Addresses', path: 'address', color: 'text-blue-500' },
    { icon: MessageCircle, label: 'Requests', path: 'requests', color: 'text-indigo-500' },
    { icon: Share2, label: 'Refer & Earn', path: 'refer', color: 'text-emerald-500' },
    { icon: RotateCcw, label: 'Refund Center', path: 'refunds', color: 'text-orange-500' },
    { icon: LayoutGrid, label: 'Games', path: 'games', color: 'text-violet-500' },
    { icon: ShoppingBag, label: 'Buy Any 3', path: 'bundle', color: 'text-pink-500' },
    { icon: Globe, label: 'Pickup Points', path: 'pickup', color: 'text-cyan-500' },
    { icon: Users, label: 'My Affiliates', path: 'affiliates', color: 'text-slate-600' },
    { icon: HelpCircle, label: 'Help Center', path: 'help', color: 'text-blue-400' },
    { icon: Phone, label: 'Support', path: 'support', color: 'text-green-500' },
    { icon: Star, label: 'My Reviews', path: 'reviews', color: 'text-yellow-500' },
    { icon: CreditCard, label: 'Payments', path: 'payments', color: 'text-slate-800' },
    { icon: SettingsIcon, label: 'Settings', path: 'settings', color: 'text-slate-400' },
  ];

  return (
    <>
        <AnimatePresence>
        {subPage === 'profile' && <EditProfileSubPage profile={profile} onBack={() => setSubPage(null)} onUpdate={updateProfile} />}
        {subPage === 'coins' && <CoinsSubPage coins={coins} onBack={() => setSubPage(null)} />}
        {subPage === 'rewards' && <RewardsSubPage onBack={() => setSubPage(null)} />}
        {subPage === 'address' && <AddressSubPage profile={profile} onUpdateAddress={updateAddress} onBack={() => setSubPage(null)} />}
        {subPage === 'requests' && <RequestsSubPage onBack={() => setSubPage(null)} />}
        {subPage === 'coupons' && <CouponsSubPage onBack={() => setSubPage(null)} />}
        {subPage === 'refunds' && <RefundSubPage onBack={() => setSubPage(null)} />}
        {subPage === 'games' && <GamesSubPage onBack={() => setSubPage(null)} />}
        {subPage === 'settings' && <SettingsSubPage logout={logout} onBack={() => setSubPage(null)} />}
        {subPage === 'orders-pay' && <OrdersListSubPage title="To Pay" orders={orders.filter(o => o.status === 'unpaid')} onBack={() => setSubPage(null)} />}
        {subPage === 'orders-ship' && <OrdersListSubPage title="To Ship" orders={orders.filter(o => o.status === 'processing')} onBack={() => setSubPage(null)} />}
        {subPage === 'orders-receive' && <OrdersListSubPage title="To Receive" orders={orders.filter(o => o.status === 'shipped')} onBack={() => setSubPage(null)} />}
        {subPage === 'orders-review' && <OrdersListSubPage title="To Review" orders={orders.filter(o => o.status === 'delivered')} onBack={() => setSubPage(null)} />}
        {subPage === 'orders-returns' && <OrdersListSubPage title="Returns" orders={orders.filter(o => o.status === 'returned')} onBack={() => setSubPage(null)} />}
      </AnimatePresence>

      <div className="py-6 min-h-screen pb-32">
        <Meta title="My Account" />
        
        {/* 1. Header & Profile Card */}
        <div className="px-4 mb-6">
          <div className="marketplace-card bg-white p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
            
            <div className="flex items-center gap-5 relative z-10">
              <div className="relative">
                <div className="w-20 h-20 rounded-[28px] overflow-hidden border-4 border-slate-50 shadow-sm bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    profile?.displayName?.[0] || user.email?.[0] || 'U'
                  )}
                </div>
                <button onClick={() => setSubPage('profile')} className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary text-white rounded-xl flex items-center justify-center border-4 border-white shadow-sm ring-2 ring-primary/10 active:scale-90 transition-all">
                  <Camera size={12} />
                </button>
              </div>
              
              <div className="flex-1">
                <h2 className="text-xl font-extrabold text-slate-800 leading-tight mb-1">{profile?.displayName || 'Marketplace User'}</h2>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Mail size={12} />
                    <span className="text-[10px] font-bold tracking-tight">{user.email}</span>
                  </div>
                  {profile?.phoneNumber && (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Phone size={12} />
                      <span className="text-[10px] font-bold tracking-tight">{profile.phoneNumber}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 bg-primary/5 text-primary px-2.5 py-1 rounded-lg">
                  <Sparkles size={12} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Premium Member</span>
                </div>
              </div>
              
              <button 
                onClick={() => setSubPage('profile')}
                className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center self-start hover:text-primary transition-colors active:scale-95 transition-all text-slate-300"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            
            <div className="mt-6 pt-5 border-t border-slate-100 flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Member Since</p>
                <p className="text-xs font-bold text-slate-600">
                  {profile?.registrationDate?.seconds 
                    ? new Date(profile.registrationDate.seconds * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                    : 'May 2024'}
                </p>
              </div>
              <button onClick={() => setSubPage('profile')} className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">View Profile</button>
            </div>
          </div>
        </div>

        {/* 2. IYABD Coins & Rewards System */}
        <div className="px-4 mb-8">
          <div className="grid grid-cols-2 gap-4">
            {/* Coins System */}
            <button onClick={() => setSubPage('coins')} className="marketplace-card bg-slate-900 p-5 relative overflow-hidden text-left active:scale-[0.98] transition-all">
               <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/5 rounded-full" />
               <div className="flex items-center gap-3 mb-3">
                 <div className="w-8 h-8 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg shadow-amber-400/20">
                   <Sparkles size={16} className="text-amber-900" />
                 </div>
                 <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">IYABD Coins</span>
               </div>
               <p className="text-2xl font-black text-white ml-1">{coins.toLocaleString()}</p>
               <div className="mt-3 text-[9px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                  Use for discount <ChevronRight size={10} />
               </div>
            </button>
            
            {/* Rewards System */}
            <button onClick={() => setSubPage('rewards')} className="marketplace-card bg-white border border-slate-100 p-5 text-left active:scale-[0.98] transition-all">
               <div className="flex items-center gap-3 mb-3">
                 <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                   <Ticket size={16} className="text-emerald-500" />
                 </div>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rewards</span>
               </div>
               <p className="text-2xl font-black text-slate-800 ml-1">Refer & Earn</p>
               <div className="mt-3 text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                  Invite Friends <Plus size={10} />
               </div>
            </button>
          </div>
        </div>

        {/* 3. My Orders Section */}
        <div className="px-4 mb-8">
          <div className="marketplace-card bg-white p-6 shadow-xl shadow-slate-200/40">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-slate-800">My Orders</h3>
                <Link to="/orders" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  View All <ChevronRight size={14} />
                </Link>
             </div>
             
             <div className="flex justify-between items-center px-1">
               {[
                 { icon: CreditCard, label: 'To Pay', count: orderCounts.pay, page: 'orders-pay' },
                 { icon: Package, label: 'To Ship', count: orderCounts.ship, page: 'orders-ship' },
                 { icon: Truck, label: 'To Receive', count: orderCounts.receive, page: 'orders-receive' },
                 { icon: MessageCircle, label: 'To Review', count: orderCounts.review, page: 'orders-review' },
                 { icon: RotateCcw, label: 'Returns', count: orderCounts.returns, page: 'orders-returns' },
               ].map((item, i) => (
                 <button key={i} onClick={() => setSubPage(item.page)} className="flex flex-col items-center gap-2 relative group">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-300 active:scale-90">
                      <item.icon size={22} strokeWidth={1.8} />
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{item.label}</span>
                    {item.count > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm ring-2 ring-primary/5 animate-pulse">
                        {item.count}
                      </span>
                    )}
                 </button>
               ))}
             </div>
          </div>
        </div>

        {/* 4. Menu Items - Expanded */}
        <div className="px-4 mb-8">
          <div className="marketplace-card bg-white overflow-hidden divide-y divide-slate-50">
             {menuItems.map((item, i) => (
               <button 
                key={i} 
                onClick={() => {
                  if(item.path === 'wishlist') window.location.href = '/wishlist';
                  else if(item.path === 'support') window.location.href = '/support';
                  else setSubPage(item.path);
                }} 
                className="w-full flex items-center gap-4 p-5 hover:bg-slate-50 transition-all group text-left active:bg-slate-100"
               >
                  <div className={`w-10 h-10 ${item.color.replace('text', 'bg').replace('500', '50')} rounded-xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                    <item.icon size={18} />
                  </div>
                  <span className="flex-1 text-sm font-bold text-slate-700 leading-none">{item.label}</span>
                  <div className="flex items-center gap-3">
                    {item.badge && (
                      <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </div>
               </button>
             ))}
          </div>
        </div>

        {/* 5. Recently Viewed */}
        {recentProducts.length > 0 && (
          <div className="px-4 mb-8">
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-sm font-bold text-slate-800">Recently Viewed</h3>
               <button onClick={() => { localStorage.removeItem('recently_viewed'); window.location.reload(); }} className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Clear All</button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
               {recentProducts.map((p: any) => (
                 <Link key={p.id} to={`/product/${p.id}`} className="min-w-[140px] bg-white p-3 rounded-2xl border border-slate-100 flex flex-col gap-2 snap-center hover:border-primary/20 transition-all shadow-sm">
                    <div className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                      <img src={p.image} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="" />
                    </div>
                    <h4 className="text-[11px] font-bold text-slate-700 line-clamp-1">{p.name}</h4>
                    <p className="text-xs font-black text-primary">৳{p.price}</p>
                 </Link>
               ))}
            </div>
          </div>
        )}

        {/* 6. Logout Button */}
        <div className="px-4">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 text-red-500 rounded-3xl font-extrabold text-sm border border-red-100 hover:bg-red-100 transition-all active:scale-[0.98] shadow-sm"
          >
            <LogOut size={20} />
            Logout Account
          </button>
          <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-8 mb-4">IYABD Marketplace v1.4.2</p>
        </div>
      </div>
    </>
  );
};


// Wishlist Page
const WishlistPage = () => {
  const { wishlist, removeFromWishlist } = useWishlist();

  return (
    <div className="py-6 min-h-screen">
      <Meta title="My Wishlist" />
      <div className="flex items-center gap-3 mb-8 px-4">
        <Link to="/" className="w-10 h-10 flex items-center justify-center bg-white rounded-xl border border-slate-100 text-slate-600 shadow-sm">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-extrabold text-slate-800">My Wishlist</h1>
        <span className="text-slate-400 text-xs font-bold ml-auto">{wishlist.length} ITEMS</span>
      </div>

      {wishlist.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm mx-4">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <Heart size={40} />
          </div>
          <p className="text-slate-500 font-bold mb-8">Save items you love here</p>
          <Link to="/shop" className="px-8 py-3 bg-primary text-white text-xs font-bold rounded-2xl shadow-lg shadow-primary/20 inline-block active:scale-95 transition-all">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
          {wishlist.map(item => (
            <div key={item.id} className="marketplace-card bg-white p-4 relative group">
              <button 
                onClick={() => removeFromWishlist(item.id)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur shadow-sm flex items-center justify-center text-red-500 active:scale-75 transition-all z-10"
              >
                <X size={16} />
              </button>
              <Link to={`/product/${item.id}`}>
                <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden mb-4">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <h3 className="text-xs font-bold text-slate-800 line-clamp-1 mb-1">{item.name}</h3>
                <p className="text-xs font-extrabold text-primary">{formatPrice(item.price)}</p>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Support is now a separate component
// Imported at the top

// Blog Page
const BlogPage = () => {
  const blogs = [
    { title: 'Best Gadgets 2024', desc: 'Discover top tech for the year ahead.', date: 'May 12, 2024', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c' },
    { title: 'Fashion Trends BD', desc: 'Summer styles curated for local weather.', date: 'May 10, 2024', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050' },
    { title: 'Home Decor Tips', desc: 'Minimalist living room guides.', date: 'May 08, 2024', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38' },
    { title: 'Healthy Living', desc: 'Eat fresh with our grocery collection.', date: 'May 05, 2024', image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713' },
  ];

  return (
    <div className="py-6 max-w-6xl mx-auto px-4">
      <Meta title="Blog & Trends" />
      <h1 className="text-3xl font-extrabold text-slate-800 mb-8">Latest Trends</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {blogs.map((blog, i) => (
          <div key={i} className="marketplace-card bg-white overflow-hidden group">
            <div className="aspect-[21/9] overflow-hidden">
               <img src={blog.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
            </div>
            <div className="p-8">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3">{blog.date}</p>
              <h2 className="text-xl font-extrabold text-slate-800 mb-2">{blog.title}</h2>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{blog.desc}</p>
              <button className="mt-6 flex items-center gap-2 text-xs font-bold text-slate-800 border-b-2 border-slate-100 pb-1 group-hover:border-primary transition-all">
                Read Publication <ChevronRight size={14}/>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Flash Sale Page
const FlashSalePage = () => {
    const [config, setConfig] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    
    useEffect(() => {
        const unsubConfig = flashSaleService.subscribeConfig(setConfig);
        const unsubProducts = flashSaleService.subscribeProducts(setProducts);
        return () => { unsubConfig(); unsubProducts(); };
    }, []);

    const demoProducts = [
        { id: 'dp1', title: "Nike Red Shoes", discount_percent: 45, old_price: 2500, sale_price: 1375, product_image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800", product_id: "demo" },
        { id: 'dp2', title: "Premium Sneakers", discount_percent: 35, old_price: 3200, sale_price: 2100, product_image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800", product_id: "demo" },
        { id: 'dp3', title: "E-Sport Sneakers", discount_percent: 30, old_price: 4500, sale_price: 3150, product_image: "https://images.unsplash.com/photo-1542219170-2c8ef645d576?w=800", product_id: "demo" },
        { id: 'dp4', title: "Modern Watch X", discount_percent: 50, old_price: 6000, sale_price: 3000, product_image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800", product_id: "demo" }
    ];

    const displayProducts = products?.length > 0 ? products : demoProducts;

    return (
        <div className="min-h-screen bg-[#FDFBFB] pb-24">
            <Meta title="Flash Sale - Elite Deals" />
            
            {/* Banner Section */}
            <div className="relative h-[250px] md:h-[500px] overflow-hidden">
                <img 
                    src={config?.banner_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920'} 
                    className="w-full h-full object-cover"
                    alt="Flash Sale Banner"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-20">
                    <motion.div 
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="max-w-4xl"
                    >
                        <div className="bg-red-600 text-white text-[10px] md:text-sm font-black px-5 py-2 rounded-full uppercase tracking-[0.2em] inline-flex items-center gap-3 mb-6 shadow-xl shadow-red-900/40">
                            <Zap size={18} fill="white" className="animate-pulse" /> Limited Time Event
                        </div>
                        <h1 className="text-4xl md:text-8xl font-black text-white mb-8 leading-[0.9] italic uppercase tracking-tighter shadow-sm">Mega Flash Sale</h1>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            <span className="text-white/60 font-black uppercase tracking-widest text-xs">Sale Ends In:</span>
                            <CountdownTimer targetDate={config?.end_time} dark />
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16 px-4">
                    <div>
                        <h2 className="text-4xl font-black text-slate-800 tracking-tight">Curated Discounts</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">Priority inventory at liquidation prices</p>
                    </div>
                    <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 font-bold text-xs text-slate-500">
                        {displayProducts.length} Items Found
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
                    {displayProducts.map((product) => (
                        <Link 
                            key={product.id} 
                            to={product.product_id ? `/product/${product.product_id}` : '#'}
                            className="group flex flex-col"
                        >
                            <div className="relative aspect-[3/4] bg-white rounded-[40px] overflow-hidden shadow-sm border border-slate-50 mb-6 transition-all group-hover:shadow-2xl group-hover:shadow-red-900/10 group-hover:-translate-y-2">
                                <img src={product.product_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={product?.title || 'Product'} />
                                <div className="absolute top-6 left-6 bg-red-500 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-xl shadow-red-900/20">
                                    -{product.discount_percent}%
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                                    <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Quick View</button>
                                </div>
                            </div>
                            <div className="px-4">
                                <h3 className="text-lg font-black text-slate-800 line-clamp-1 mb-2 group-hover:text-primary transition-colors">{product?.title || 'Product'}</h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-red-500 font-extrabold text-2xl tracking-tighter">{formatPrice(product.sale_price)}</span>
                                    <span className="text-sm text-slate-300 line-through font-bold">{formatPrice(product.old_price)}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};


const LayoutWrapper = ({ children }: { children: any }) => {
  const { user } = useAuth();
  return <Layout user={user}>{children}</Layout>;
};

const AppRoutes = () => {
  const { isAdmin } = useAuth();
  
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/category/:categoryId" element={<Shop />} />
        <Route path="/category/:categoryId/:subcategoryId" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/flash-sale" element={<FlashSalePage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/support" element={<Support />} />
        <Route path="/auth" element={<div className="py-20 text-center px-4 min-h-screen flex items-center justify-center"><AuthModal isOpen={true} onClose={() => window.history.back()} /></div>} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/policy/:policy" element={<LegalPage />} />
        <Route path="/admin-secure-login" element={<AdminLogin />} />
        <Route 
          path="/admin/*" 
          element={
            <AdminProtectedRoute isAdmin={isAdmin}>
              <Admin />
            </AdminProtectedRoute>
          } 
        />
        <Route path="/success" element={<Success />} />
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <HelmetProvider>
        <AuthProvider>
          <CartProvider>
            <PopupManager />
            <WishlistProvider>
              <LayoutWrapper>
                <Suspense fallback={null}>
                   <AppRoutes />
                </Suspense>
              </LayoutWrapper>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
    </HelmetProvider>
  );
}



