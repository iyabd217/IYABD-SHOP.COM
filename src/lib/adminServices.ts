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
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

  // Blogs
  async getBlogPosts() {
    const path = 'blog_posts';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
  async getCompanySettings() {
    const path = 'config/general';
    try {
      const docSnap = await getDoc(doc(db, 'config', 'general'));
      if (docSnap.exists()) return docSnap.data();
      return { companyName: 'V°ONE', logo: 'https://v-one.com/logo.png' };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
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
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
  }
};
;
