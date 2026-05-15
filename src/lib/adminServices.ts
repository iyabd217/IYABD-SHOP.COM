import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  setDoc,
  serverTimestamp,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

function handleFirestoreError(error: any, operation: OperationType, path: string) {
  console.error(`Firestore Error [${operation}] at ${path}:`, error);
  throw error;
}

export const adminService = {
  // Products
  async getProducts() {
    const path = 'products';
    try {
      const q = query(collection(db, path));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async addProduct(product: any) {
    const path = 'products';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      await this.logActivity('PRODUCT_ADD', `Added product: ${product.name}`);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateProduct(id: string, product: any) {
    const path = `products/${id}`;
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, { ...product, updatedAt: serverTimestamp() });
      await this.logActivity('PRODUCT_UPDATE', `Updated product ID: ${id}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteProduct(id: string) {
    const path = `products/${id}`;
    try {
      await deleteDoc(doc(db, 'products', id));
      await this.logActivity('PRODUCT_DELETE', `Deleted product ID: ${id}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Categories
  async getCategories() {
    const path = 'categories';
    try {
      const q = query(collection(db, path));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async addCategory(category: any) {
    const path = 'categories';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...category,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...category };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateCategory(id: string, category: any) {
    const path = `categories/${id}`;
    try {
      await updateDoc(doc(db, 'categories', id), { ...category, updatedAt: serverTimestamp() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteCategory(id: string) {
    const path = `categories/${id}`;
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Banners
  async getBanners() {
    const path = 'banners';
    try {
      const q = query(collection(db, path));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async addBanner(banner: any) {
    const path = 'banners';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...banner,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...banner };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateBanner(id: string, banner: any) {
    const path = `banners/${id}`;
    try {
      await setDoc(doc(db, 'banners', id), { ...banner, updatedAt: serverTimestamp() }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteBanner(id: string) {
    const path = `banners/${id}`;
    try {
      await deleteDoc(doc(db, 'banners', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Hero Banners (New)
  async getHeroBanners(activeOnly = false) {
    const path = 'hero_banners';
    try {
      let q = query(collection(db, path), orderBy('sort_order', 'asc'));
      if (activeOnly) {
        q = query(collection(db, path), where('is_active', '==', true), orderBy('sort_order', 'asc'));
      }
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async addHeroBanner(banner: any) {
    const path = 'hero_banners';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...banner,
        created_at: serverTimestamp()
      });
      return { id: docRef.id, ...banner };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateHeroBanner(id: string, banner: any) {
    const path = `hero_banners/${id}`;
    try {
      await updateDoc(doc(db, 'hero_banners', id), { ...banner, updated_at: serverTimestamp() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteHeroBanner(id: string) {
    const path = `hero_banners/${id}`;
    try {
      await deleteDoc(doc(db, 'hero_banners', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Category Banners (New)
  async getCategoryBanners() {
    const path = 'category_banners';
    try {
      const q = query(collection(db, path), orderBy('sort_order', 'asc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async addCategoryBanner(category: any) {
    const path = 'category_banners';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...category,
        created_at: serverTimestamp()
      });
      return { id: docRef.id, ...category };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateCategoryBanner(id: string, category: any) {
    const path = `category_banners/${id}`;
    try {
      await updateDoc(doc(db, 'category_banners', id), { ...category, updated_at: serverTimestamp() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteCategoryBanner(id: string) {
    const path = `category_banners/${id}`;
    try {
      await deleteDoc(doc(db, 'category_banners', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Blogs
  async getBlogPosts() {
    const path = 'blog_posts';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async addBlogPost(post: any) {
    const path = 'blog_posts';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...post,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...post };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateBlogPost(id: string, post: any) {
    const path = `blog_posts/${id}`;
    try {
      await updateDoc(doc(db, 'blog_posts', id), { ...post, updatedAt: serverTimestamp() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteBlogPost(id: string) {
    const path = `blog_posts/${id}`;
    try {
      await deleteDoc(doc(db, 'blog_posts', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Orders
  async getOrders() {
    const path = 'orders';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async getOrdersByUserId(userId: string) {
    const path = 'orders';
    try {
      const q = query(collection(db, path), where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async updateOrder(id: string, updateData: any) {
    const path = `orders/${id}`;
    try {
      await updateDoc(doc(db, 'orders', id), { ...updateData, updatedAt: serverTimestamp() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async updateOrderStatus(orderId: string, status: string) {
    const path = `orders/${orderId}`;
    try {
      await updateDoc(doc(db, 'orders', orderId), { status, updatedAt: serverTimestamp() });
      await this.logActivity('ORDER_STATUS_SHIFT', `Changed Order #${orderId.slice(0, 8)} status to ${status.toUpperCase()}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // Courier Simulated
  async createSteadFastParcel(order: any) {
    const trackingId = `SF${Math.random().toString().slice(2, 10)}`;
    await this.updateOrder(order.id, {
        courier_name: 'SteadFast',
        tracking_id: trackingId,
        tracking_url: `https://steadfast.com.bd/t/${trackingId}`,
        courier_status: 'pending_pickup'
    });
    return { success: true, trackingId };
  },

  async createPathaoParcel(order: any) {
    const trackingId = `PAT${Math.random().toString().slice(2, 10)}`;
    await this.updateOrder(order.id, {
        courier_name: 'Pathao',
        tracking_id: trackingId,
        tracking_url: `https://pathao.com/track/${trackingId}`,
        courier_status: 'parcel_registered'
    });
    return { success: true, trackingId };
  },

  // Company Settings
  async getSupportConfig() {
    const path = 'config/support';
    try {
      const docSnap = await getDoc(doc(db, 'config', 'support'));
      if (docSnap.exists()) return docSnap.data();
      return null;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, path);
      return null;
    }
  },

  async updateSupportConfig(config: any) {
    const path = 'config/support';
    try {
      await setDoc(doc(db, 'config', 'support'), { ...config, updatedAt: serverTimestamp() }, { merge: true });
      await this.logActivity('SUPPORT_CONFIG_UPDATE', 'Updated support configuration');
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      return false;
    }
  },

  async getCompanySettings() {
    const path = 'config/general';
    try {
      const docSnap = await getDoc(doc(db, 'config', 'general'));
      if (docSnap.exists()) return docSnap.data();
      return { 
        companyName: 'IY ABD', 
        logo: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=200', 
        seo_site_title: 'IY ABD Premium' 
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return { companyName: 'IY ABD', seo_site_title: 'IY ABD Premium' };
    }
  },

  async updateCompanySettings(settings: any) {
    const path = 'config/general';
    try {
      await setDoc(doc(db, 'config', 'general'), { ...settings, updatedAt: serverTimestamp() }, { merge: true });
      await this.logActivity('SETTINGS_UPDATE', 'Updated company/site settings');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // Activity Logs
  async logActivity(action: string, details: string) {
    const path = 'activity_logs';
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, path), {
        action,
        details,
        admin_id: user?.uid || 'system',
        admin_email: user?.email || 'System',
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.error('Logging failed:', e);
    }
  },

  async getActivityLogs() {
    const path = 'activity_logs';
    try {
      const q = query(collection(db, path), orderBy('timestamp', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  // Coupons
  async getCoupons() {
    const path = 'coupons';
    try {
      const q = query(collection(db, path));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async addCoupon(couponData: any) {
    const path = 'coupons';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...couponData,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  // Analytics
  async getAnalyticsSummary() {
    try {
      const orders = await this.getOrders();
      const products = await this.getProducts();
      
      const totalRevenue = orders?.reduce((sum: number, o: any) => sum + (o.total || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const totalProducts = products?.length || 0;
      
      return {
        totalRevenue,
        totalOrders,
        totalProducts,
        recentOrders: orders?.slice(0, 5) || []
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  // Uploads
  async uploadHeroBanners(formData: FormData) {
    const res = await fetch('/api/admin/hero-banner/upload', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Hero banner upload failed');
    return await res.json();
  },

  async uploadCategoryBanners(formData: FormData) {
    const res = await fetch('/api/admin/category/upload', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Category banner upload failed');
    return await res.json();
  },

  // Flash Sales
  async getFlashSaleConfig() {
    const path = 'config/flash_sale';
    try {
      const docSnap = await getDoc(doc(db, 'config', 'flash_sale'));
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async updateFlashSaleConfig(config: any) {
    const path = 'config/flash_sale';
    try {
      await setDoc(doc(db, 'config', 'flash_sale'), { ...config, updatedAt: serverTimestamp() }, { merge: true });
      await this.logActivity('FLASH_SALE_CONFIG_UPDATE', 'Updated flash sale configuration');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async getFlashSaleProducts() {
    const path = 'flash_sales';
    try {
      const q = query(collection(db, path), orderBy('sort_order', 'asc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async addFlashSaleProduct(data: any) {
    const path = 'flash_sales';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...data,
        is_active: true,
        created_at: serverTimestamp()
      });
      await this.logActivity('FLASH_SALE_PRODUCT_ADD', `Added flash sale product ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateFlashSaleProduct(id: string, data: any) {
    const path = `flash_sales/${id}`;
    try {
      await updateDoc(doc(db, 'flash_sales', id), { ...data, updatedAt: serverTimestamp() });
      await this.logActivity('FLASH_SALE_PRODUCT_UPDATE', `Updated flash sale product ID: ${id}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteFlashSaleProduct(id: string) {
    const path = `flash_sales/${id}`;
    try {
      await deleteDoc(doc(db, 'flash_sales', id));
      await this.logActivity('FLASH_SALE_PRODUCT_DELETE', `Deleted flash sale product ID: ${id}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
};
;
