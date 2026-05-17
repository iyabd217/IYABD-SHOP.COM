import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  return `৳ ${price.toLocaleString('en-IN')}`;
}

/**
 * Advanced Image Optimization Helper
 * Handles Cloudinary auto-transformations if available
 * Fallbacks to Unsplash optimization or raw URLs
 */
export const optimizeImg = (url: string, options: { width?: number; height?: number; crop?: boolean; webp?: boolean } = {}) => {
  if (!url) return '';
  
  const { width = 800, height, crop = true, webp = true } = options;

  // Cloudinary Detection & Transformation
  // Expected format: res.cloudinary.com/cloud-name/image/upload/v12345/image-id.jpg
  if (url.includes('cloudinary.com')) {
    const parts = url.split('/upload/');
    if (parts.length === 2) {
      const transforms = [
        `w_${width}`,
        height ? `h_${height}` : '',
        crop ? 'c_fill,g_auto' : '',
        webp ? 'f_webp' : 'f_auto',
        'q_auto'
      ].filter(Boolean).join(',');
      return `${parts[0]}/upload/${transforms}/${parts[1]}`;
    }
  }

  // Unsplash Optimization
  if (url.includes('unsplash.com')) {
    const baseUrl = url.split('?')[0];
    let params = `?auto=format&q=80&w=${width}`;
    if (height) params += `&h=${height}`;
    if (crop) params += `&fit=crop`;
    return `${baseUrl}${params}`;
  }

  return url;
};

export async function adminFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('admin_token');
  console.log(`[adminFetch] ${options.method || 'GET'} ${url}`, { 
    hasToken: !!token,
    body: options.body ? (options.body.toString().length > 100 ? options.body.toString().slice(0, 100) + '...' : options.body) : 'no body'
  });
  
  const headers = new Headers(options.headers || {});
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });
}

export const translations = {
  en: {
    shop: "Shop",
    categories: "Categories",
    search_placeholder: "Search essentials...",
    cart: "Cart",
    checkout: "Checkout",
    new_arrivals: "New Arrivals",
    featured: "Featured Products",
    add_to_cart: "Add to Cart",
    home: "Home",
    profile: "Profile"
  },
  bn: {
    shop: "দোকান",
    categories: "ক্যাটাগরি",
    search_placeholder: "পণ্য খুঁজুন...",
    cart: "কার্ট",
    checkout: "চেকআউট",
    new_arrivals: "নতুন পণ্য",
    featured: "বিশেষ পণ্য",
    add_to_cart: "কার্টে যোগ করুন",
    home: "হোম",
    profile: "প্রোফাইল"
  }
};
