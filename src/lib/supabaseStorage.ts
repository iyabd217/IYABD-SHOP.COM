import { supabase } from './supabaseClient';

export const STORAGE_BUCKETS = {
  products: 'products',
  productData: 'product-data',
  banners: 'banners',
  categories: 'categories',
  brands: 'brands',
  thumbnails: 'taumbnails',
  customers: 'customers',
  customerAuth: 'customer-auth',
  customerUploads: 'customer-uploads',
  orders: 'orders',
  cart: 'cart',
  wishlist: 'wishlist',
  supportSystem: 'support-system',
  socialMedia: 'social-media',
  flashSale: 'flash-sale',
  coupons: 'coupons',
  emailTemplates: 'email-templates',
  smsTemplates: 'sms-templates',
  aiTraining: 'ai-training',
  siteSettings: 'site-settings',
  websiteConfig: 'website-config',
  telegramConfig: 'telegram-config',
  websiteAssets: 'website-assets',
  logos: 'logos'
};

export const supabaseStorageService = {
  /**
   * Uploads a file to a specific bucket
   */
  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
      });

    if (error) {
      console.error(`Error uploading to ${bucket}/${path}:`, error);
      throw error;
    }
    return data;
  },

  /**
   * Gets a public URL for a file
   */
  getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Lists files in a bucket/path
   */
  async listFiles(bucket: string, path: string = '') {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path);
      
    if (error) {
      console.error(`Error listing files in ${bucket}/${path}:`, error);
      throw error;
    }
    return data;
  },

  /**
   * Downloads a JSON file and parses it
   */
  async fetchJson<T>(bucket: string, path: string, fallback: T): Promise<T> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);

      if (error || !data) {
        return fallback;
      }

      const text = await data.text();
      return JSON.parse(text) as T;
    } catch (err) {
      console.error(`Failed to fetch JSON from ${bucket}/${path}:`, err);
      return fallback;
    }
  }
};
