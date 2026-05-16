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

export function handleFirestoreError(error: any, operation: OperationType, path: string) {
  if (error && error.code === 'permission-denied') {
    console.warn(`Firestore Warning [${operation}] at ${path}: Insufficient permissions. Check rules or auth.`);
  } else {
    console.error(`Firestore Error [${operation}] at ${path}:`, error.message || error);
  }
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
    let oldOrder = null;
    try {
      const orderRef = doc(db, 'orders', id);
      const snapshot = await getDoc(orderRef);
      if (snapshot.exists()) {
          oldOrder = { id: snapshot.id, ...snapshot.data() };
      }
      await updateDoc(orderRef, { ...updateData, updatedAt: serverTimestamp() });

      // Auto Email System for Customer Orders
      if (oldOrder && updateData.shippingStatus && oldOrder.shippingStatus !== updateData.shippingStatus) {
         await this.sendOrderStatusEmail(oldOrder, updateData.shippingStatus);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async sendOrderStatusEmail(order: any, newStatus: string) {
      if (!order || !order.customerDetails || !order.customerDetails.email) return;

      const email = order.customerDetails.email;
      let subject = '';
      let message = '';
      const orderId = order.id.slice(-6).toUpperCase();

      if (newStatus === 'PROCESSING') {
          subject = `Your Order #${orderId} is Confirmed`;
          message = `Hello ${order.customerDetails.name},\n\nYour order #${orderId} has been confirmed. Our team is processing your parcel quickly.\nTotal: ৳${order.total}\n\nThank you for shopping with us!`;
      } else if (newStatus === 'SENT' || newStatus === 'SHIPPED') {
          subject = `Your Order #${orderId} is on its way`;
          message = `Hello ${order.customerDetails.name},\n\nYour order #${orderId} has been handed over to the courier.\nCourier: ${order.courierName || 'Standard'}\nTracking: ${order.trackingId || 'N/A'}\n\nExpected delivery inside Dhaka: 1-2 days, Outside: 2-4 days.`;
      } else if (newStatus === 'DELIVERED') {
          subject = `Your Order #${orderId} has been Delivered`;
          message = `Hello ${order.customerDetails.name},\n\nYour order #${orderId} has been successfully delivered. We hope you enjoy our product!\n\nPlease leave us a review.`;
      } else if (newStatus === 'CANCELLED') {
          subject = `Your Order #${orderId} has been Cancelled`;
          message = `Hello ${order.customerDetails.name},\n\nUnfortunately, your order #${orderId} has been cancelled.\nIf you have already paid, refund process will be initiated shortly.\nPlease contact support for more details.`;
      }

      if (subject && message) {
          try {
              await fetch('/api/email/send', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      to: email,
                      subject: subject,
                      html: `<div style="font-family:sans-serif;color:#333;"><p>${message.replace(/\n/g, '<br/>')}</p></div>`,
                      text: message
                  })
              });
          } catch(e) {
              console.error("Failed to send order email:", e);
          }
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

  // Courier API Integrations
  async createSteadFastParcel(order: any) {
    const settings = await this.getCompanySettings();
    const apiKey = settings?.steadfast_api_key;
    const secretKey = settings?.steadfast_secret_key;
    
    // Check if API configured
    if (!apiKey || !secretKey) {
        alert("Steadfast API is not fully configured in Courier Settings. Using simulated mode.");
    }
    
    const payload = {
        invoice: order.id,
        recipient_name: order.customerName || order.customerDetails?.name || 'Unknown',
        recipient_phone: order.phone || order.customerDetails?.phone || '',
        recipient_address: order.address || order.customerDetails?.address || 'Unknown Address',
        cod_amount: order.total || 0,
        note: `Products: ${order.items?.map((i: any) => `${i.name} (Qty: ${i.quantity})`).join(', ') || 'N/A'}`
    };

    try {
        const response = await fetch('/api/courier/steadfast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apiKey,
                secretKey,
                baseUrl: settings?.steadfast_base_url,
                payload
            })
        });
        
        const data = await response.json();
        
        const trackingId = data?.consignment?.tracking_code || `SF${Math.random().toString().slice(2, 10)}`;
        
        await this.updateOrder(order.id, {
            courier_name: 'SteadFast',
            tracking_id: trackingId,
            tracking_url: `https://steadfast.com.bd/t/${trackingId}`,
            courier_status: 'pending_pickup',
            shippingStatus: 'BOOKED'
        });
        
        return { success: true, trackingId, data };
    } catch(e) {
        console.error("Steadfast Error", e);
        return { success: false, error: "Steadfast integration failed" };
    }
  },

  async createPathaoParcel(order: any) {
    const settings = await this.getCompanySettings();
    if (!settings?.pathao_client_id) {
       alert("Pathao Courier is not fully configured. Using simulated mode.");
    }
    
    try {
        const response = await fetch('/api/courier/pathao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                settings,
                orderId: order.id
            })
        });
        
        const data = await response.json();
        
        const trackingId = data.tracking_number || `PAT${Math.random().toString().slice(2, 10)}`;
        
        await this.updateOrder(order.id, {
            courier_name: 'Pathao',
            tracking_id: trackingId,
            tracking_url: `https://pathao.com/track/${trackingId}`,
            courier_status: 'parcel_registered',
            shippingStatus: 'BOOKED'
        });
        return { success: true, trackingId };
    } catch(e) {
        console.error("Pathao Error", e);
        return { success: false, error: "Pathao integration failed" };
    }
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
