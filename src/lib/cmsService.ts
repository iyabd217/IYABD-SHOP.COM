import { supabase } from './supabaseClient';
import { STORAGE_BUCKETS } from './supabaseStorage';

class CmsService {
  /**
   * Fetches a JSON file from a specific Supabase storage bucket and path.
   */
  async getJSON<T>(bucket: string, path: string, fallback: T): Promise<T> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);

      if (error) {
        return fallback;
      }

      if (!data) return fallback;
      const text = await data.text();
      return JSON.parse(text) as T;
    } catch (err) {
      return fallback;
    }
  }

  /**
   * Fetches data from a Supabase table.
   */
  async getTableData<T>(table: string, fallback: T): Promise<T> {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*');
      
      if (error) throw error;
      if (data && data.length > 0) return data as unknown as T;
      return fallback;
    } catch (err) {
      console.warn(`CMS: Failed to fetch from table [${table}]:`, err);
      return fallback;
    }
  }

  /**
   * Helper to get a public URL for an asset
   */
  getAssetUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  /**
   * Specific wrappers for the requested structure
   */
  async getProducts() {
    // Try table first
    const tableData = await this.getTableData<any[]>('products', []);
    if (tableData.length > 0) return tableData;
    return this.getJSON<any[]>(STORAGE_BUCKETS.productData, 'products.json', []);
  }

  async getCategories() {
    const tableData = await this.getTableData<any[]>('categories', []);
    if (tableData.length > 0) return tableData;
    return this.getJSON<any[]>(STORAGE_BUCKETS.productData, 'categories.json', []);
  }

  async getBanners() {
    const tableData = await this.getTableData<any[]>('banners', []);
    if (tableData.length > 0) return tableData;
    return this.getJSON<any[]>(STORAGE_BUCKETS.productData, 'banners.json', []);
  }

  async getSocialLinks() {
    return this.getJSON<any>(STORAGE_BUCKETS.websiteConfig, 'social-links.json', {
      facebook: "https://facebook.com/iyabdshop",
      youtube: "https://youtube.com/@IYABD_01",
      tiktok: "https://tiktok.com/@iyabdshop",
      whatsapp: "01719188777"
    });
  }

  async getAiTraining() {
    const tableData = await this.getTableData<any[]>('ai_training', []);
    if (tableData.length > 0) return tableData;
    return this.getJSON<any>(STORAGE_BUCKETS.supportSystem, 'ai-training.json', {
      greetings: {
        assalamualaikum: "ওয়ালাইকুম আসসালাম 🌸 IYABD Support এ আপনাকে স্বাগতম।"
      },
      delivery: {
        time: "ঢাকার ভিতরে ১-২ দিন, ঢাকার বাইরে ২-৪ দিন।"
      }
    });
  }

  async getWebsiteConfig(fileName: string) {
    return this.getJSON<any>(STORAGE_BUCKETS.websiteConfig, fileName, {});
  }
}

export const cmsService = new CmsService();
