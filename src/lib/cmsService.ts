import { supabase } from './supabaseClient';

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
        // If file doesn't exist, log and return fallback
        if (error.message.includes('Object not found')) {
          console.warn(`CMS: File ${path} not found in bucket ${bucket}. Using fallback.`);
        } else {
          console.error(`CMS: Error fetching ${path} from ${bucket}:`, error);
        }
        return fallback;
      }

      if (!data) return fallback;
      const text = await data.text();
      return JSON.parse(text) as T;
    } catch (err) {
      console.error(`CMS: Failed to parse JSON from ${path} in ${bucket}:`, err);
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
    return this.getJSON<any[]>('product-data', 'products.json', []);
  }

  async getCategories() {
    return this.getJSON<any[]>('product-data', 'categories.json', []);
  }

  async getBanners() {
    return this.getJSON<any[]>('product-data', 'banners.json', []);
  }

  async getSocialLinks() {
    return this.getJSON<any>('website-config', 'social-links.json', {
      facebook: "https://facebook.com/iyabdshop",
      youtube: "https://youtube.com/@IYABD_01",
      tiktok: "https://tiktok.com/@iyabdshop",
      whatsapp: "01719188777"
    });
  }

  async getAiTraining() {
    return this.getJSON<any>('support-system', 'ai-training.json', {
      greetings: {
        assalamualaikum: "ওয়ালাইকুম আসসালাম 🌸 IYABD Support এ আপনাকে স্বাগতম।"
      },
      delivery: {
        time: "ঢাকার ভিতরে ১-২ দিন, ঢাকার বাইরে ২-৪ দিন।"
      }
    });
  }

  async getWebsiteConfig(fileName: string) {
    return this.getJSON<any>('website-config', fileName, {});
  }
}

export const cmsService = new CmsService();
