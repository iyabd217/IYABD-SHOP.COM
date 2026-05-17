import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query, 
  where, 
  setDoc,
  serverTimestamp,
  getDocFromServer,
  limit
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, auth, storage } from './firebase';
import { cmsService } from './cmsService';
import { adminFetch } from './utils';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
const testConnection = async () => {
  try {
    await getDocFromServer(doc(db, '_connection_test', 'test'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or internet connection.");
    }
  }
};
testConnection();

// Utilities for Image Optimization
export const optimizeImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Target dimensions (e.g., max 1200px)
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 1200;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx?.drawImage(img, 0, 0, width, height);
                
                // Convert to JPEG with 0.8 quality
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Canvas toBlob failed'));
                    }
                }, 'image/jpeg', 0.8);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

export const storageService = {
    async uploadProductImage(productId: string, file: File | Blob, index?: number) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('productId', productId);
        
        try {
            const response = await adminFetch('/api/upload/product', {
                method: 'POST',
                body: formData
            });

            const contentType = response.headers.get('content-type');
            
            if (response.ok && contentType && contentType.includes('application/json')) {
                const data = await response.json();
                if (data.success) {
                    return {
                        url: data.url,
                        path: data.path
                    };
                }
                throw new Error(data.message || 'Server reported upload failure');
            } else {
                const text = await response.text();
                console.error(`Upload failed [${response.status}]:`, text.slice(0, 500));
                
                if (text.startsWith('<!doctype') || text.startsWith('<html')) {
                    throw new Error(`Server returned HTML instead of JSON. This usually means a 404 or 500 error occurred. Status: ${response.status}`);
                }
                
                throw new Error(text || 'Unknown upload error');
            }
        } catch (error: any) {
            console.error("Product upload service error:", error);
            throw error;
        }
    },

    async uploadBannerImage(file: File | Blob) {
        const timestamp = Date.now();
        const fileName = `banner_${timestamp}.jpeg`;
        try {
            const { supabase } = await import('./supabaseClient');
            const { STORAGE_BUCKETS } = await import('./supabaseStorage');
            const { error } = await supabase.storage.from(STORAGE_BUCKETS.banners).upload(fileName, file, { upsert: true });
            if (error) throw error;
            const { data: publicData } = supabase.storage.from(STORAGE_BUCKETS.banners).getPublicUrl(fileName);
            return publicData.publicUrl;
        } catch(e) { throw e; }
    },

    async uploadCategoryImage(file: File | Blob) {
        const timestamp = Date.now();
        const fileName = `category_${timestamp}.jpeg`;
        try {
            const { supabase } = await import('./supabaseClient');
            const { STORAGE_BUCKETS } = await import('./supabaseStorage');
            const { error } = await supabase.storage.from(STORAGE_BUCKETS.categories).upload(fileName, file, { upsert: true });
            if (error) throw error;
            const { data: publicData } = supabase.storage.from(STORAGE_BUCKETS.categories).getPublicUrl(fileName);
            return publicData.publicUrl;
        } catch(e) { throw e; }
    },

    async uploadBrandImage(file: File | Blob) {
        const timestamp = Date.now();
        const fileName = `brand_${timestamp}.jpeg`;
        try {
            const { supabase } = await import('./supabaseClient');
            const { STORAGE_BUCKETS } = await import('./supabaseStorage');
            const { error } = await supabase.storage.from(STORAGE_BUCKETS.brands).upload(fileName, file, { upsert: true });
            if (error) throw error;
            const { data: publicData } = supabase.storage.from(STORAGE_BUCKETS.brands).getPublicUrl(fileName);
            return publicData.publicUrl;
        } catch(e) { throw e; }
    },

    async deleteFile(path: string, bucketName: string = 'products') {
        try {
            const { supabase } = await import('./supabaseClient');
            await supabase.storage.from(bucketName).remove([path]);
        } catch (error) {
            console.warn("Storage Delete Warning:", error);
        }
    }
};

export const productService = {
  async getAll() {
    const path = 'products';
    try {
      const q = query(collection(db, path));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      
      // Fallback to CMS if Firestore is empty
      if (docs.length === 0) {
        const cmsProducts = await cmsService.getProducts();
        if (cmsProducts && cmsProducts.length > 0) return cmsProducts;
      }
      return docs;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async getById(id: string) {
    const path = `products/${id}`;
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...(docSnap.data() as any) };
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async list(options: { category?: string; limit?: number } = {}) {
    const path = 'products';
    try {
      let q = collection(db, path) as any;
      if (options.category) {
        q = query(q, where('category', '==', options.category));
      }
      if (options.limit) {
        q = query(q, limit(options.limit));
      }
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  subscribe(options: { category?: string; limit?: number } = {}, callback: (products: any[]) => void) {
    const path = 'products';
    let q = collection(db, path) as any;
    if (options.category) {
      q = query(q, where('category', '==', options.category));
    }
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    }, (error) => {
      console.error('Firestore subscribe error: ', error);
      callback([]); // Return empty array to stop loading
    });
  },
  
  subscribeAll(callback: (products: any[]) => void) {
    const path = 'products';
    return onSnapshot(collection(db, path), (snapshot) => {
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      if (products.length === 0) {
        cmsService.getProducts().then(cmsProducts => {
           if (cmsProducts && cmsProducts.length > 0) callback(cmsProducts);
           else callback([]);
        });
      } else {
        callback(products);
      }
    }, (error) => {
      console.error('Firestore subscribeAll error: ', error);
      callback([]); 
    });
  },
  
  async getByCategory(category: string) {
    const path = 'products';
    try {
      const q = query(collection(db, path), where('category', '==', category));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async create(productData: any) {
    const path = 'products';
    try {
      // 1. Sync with Firebase first (for real-time frontend support)
      console.log("[Service] Syncing with Firebase...");
      const docRef = await addDoc(collection(db, path), {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      const firebaseId = docRef.id;
      console.log("[Service] Firebase sync successful, id:", firebaseId);

      // 2. Prepare data for Supabase (matching supabase_schema.sql exactly)
      const supabaseData = this.mapProductDataForSupabase(firebaseId, productData);

      console.log("[Service] Sending to Supabase /create:", JSON.stringify(supabaseData, null, 2));

      // 3. Save to Supabase via backend API
      const response = await adminFetch('/api/admin/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supabaseData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Supabase API Create Error (Raw):", errorText);
        let errorData;
        try { errorData = JSON.parse(errorText); } catch(e) { errorData = { message: errorText }; }
        throw new Error(errorData.message || `Backend Error (${response.status})`);
      }
      
      console.log("[Service] Supabase sync successful");
      return firebaseId;
    } catch (error: any) {
      console.error("[Service] Product Create ERROR:", error);
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  },

  async update(id: string, productData: any) {
    const path = `products/${id}`;
    try {
      // 1. Update Firebase
      console.log(`[Service] Updating Firebase for ${id}...`);
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, {
        ...productData,
        updatedAt: serverTimestamp()
      });
      console.log("[Service] Firebase update successful");

      // 2. Prepare data for Supabase
      const supabaseData = this.mapProductDataForSupabase(id, productData);

      console.log(`[Service] Sending to Supabase /update/${id}:`, JSON.stringify(supabaseData, null, 2));

      // 3. Update Supabase via backend API
      const response = await adminFetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supabaseData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try { errorData = JSON.parse(errorText); } catch(e) { errorData = { message: errorText }; }
        console.error("Supabase API Update Error (Full):", errorData);
        throw new Error(errorData.message || `Backend Error (${response.status}): ${errorText.slice(0, 100)}`);
      }
      
      console.log("[Service] Supabase update successful");
      return true;
    } catch (error: any) {
      console.error("[Service] Product Update CRITICAL ERROR:", error);
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  },

  // Helper to map data correctly for Supabase (matching database schema)
  mapProductDataForSupabase(id: string, productData: any) {
    // Handle tags: convert comma-separated string to array if needed
    let tagsList = productData.tags || [];
    if (typeof tagsList === 'string' && tagsList.trim()) {
      tagsList = tagsList.split(',').map((t: string) => t.trim()).filter(Boolean);
    } else if (typeof tagsList === 'string') {
      tagsList = [];
    }

    // IMPORTANT: Postgres columns are lowercase unless quoted. 
    // The schema file uses camelCase without quotes, so we MUST map to lowercase keys
    // to match what Postgres actually creates in the database.
    return {
      id,
      name: productData.name,
      slug: productData.slug,
      sku: productData.sku,
      description: productData.description,
      price: productData.price !== undefined ? parseFloat(productData.price || 0) : undefined,
      discountprice: productData.discountPrice !== undefined ? (productData.discountPrice ? parseFloat(productData.discountPrice) : null) : undefined,
      tax: productData.tax !== undefined ? parseFloat(productData.tax || 0) : undefined,
      category: productData.category || productData.category_id,
      subcategory: productData.subCategory,
      brand: productData.brand,
      tags: tagsList,
      stock: productData.stock !== undefined ? parseInt(productData.stock || 0) : undefined,
      lowstockalert: productData.lowStockAlert !== undefined ? parseInt(productData.lowStockAlert || 5) : undefined,
      status: productData.status || 'active',
      video_url: productData.video_url || '',
      featured: productData.featured !== undefined ? !!productData.featured : undefined,
      bestseller: productData.bestSeller !== undefined ? !!productData.bestSeller : undefined,
      newarrival: productData.newArrival !== undefined ? !!productData.newArrival : undefined,
      image: productData.image || productData.main_image,
      gallery: productData.gallery || productData.gallery_images || [],
      variants: productData.variants || [],
      sizes: productData.sizes || [],
      colors: productData.colors || [],
      weight: productData.weight || '',
      dimensions: productData.dimensions || null,
      shippingclass: productData.shippingClass || 'Standard',
      metatitle: productData.metaTitle || '',
      metadescription: productData.metaDescription || '',
      keywords: productData.keywords || '',
      fabric_type: productData.fabric_type || '',
      gsm: productData.gsm || '',
      fit_type: productData.fit_type || '',
      wash_instruction: productData.wash_instruction || '',
      material: productData.material || '',
      stretch_type: productData.stretch_type || '',
      country: productData.country || '',
      stitch_quality: productData.stitch_quality || '',
      rating: productData.rating !== undefined ? parseFloat(productData.rating || 5.0) : undefined,
      sold: productData.sold !== undefined ? parseInt(productData.sold || 0) : undefined,
      updated_at: new Date().toISOString()
    };
  },

  async delete(id: string) {
    const path = `products/${id}`;
    try {
      // 1. Delete from Firebase
      await deleteDoc(doc(db, 'products', id));
      
      // 2. Delete from Supabase via backend API
      const response = await adminFetch(`/api/admin/products/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Supabase API Delete Error:", errorData);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
};

export const brandService = {
  async getAll() {
    const path = 'brands';
    try {
      const q = query(collection(db, path));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },
  async create(name: string, logo?: string) {
    const path = 'brands';
    try {
      const docRef = await addDoc(collection(db, path), {
        name,
        logo: logo || '',
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }
};

export const categoryService = {
  async getAll() {
    // Try CMS first
    const cmsCategories = await cmsService.getCategories();
    if (cmsCategories && cmsCategories.length > 0) {
      return cmsCategories;
    }

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
  async create(name: string, image?: string) {
    const path = 'categories';
    try {
      const docRef = await addDoc(collection(db, path), {
        name,
        image: image || '',
        createdAt: serverTimestamp()
      });

      // Sync with Supabase table
      try {
        const { supabase } = await import('./supabaseClient');
        const { error: syncError } = await supabase.from('categories').insert([{
          name,
          banner_image: image || '',
          slug: name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
          created_at: new Date().toISOString()
        }]);
        if (syncError) console.warn("Supabase Sync Warning:", syncError.message);
      } catch (e) {
        console.warn("Supabase Sync Failed:", e);
      }

      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }
};

export const bannerService = {
  async getAll() {
    // Try CMS first
    const cmsBanners = await cmsService.getBanners();
    if (cmsBanners && cmsBanners.length > 0) {
      return cmsBanners;
    }

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
  async update(type: string, data: any) {
    const path = `banners/${type}`;
    try {
        await setDoc(doc(db, 'banners', type), { ...data, updatedAt: serverTimestamp() }, { merge: true });

        // Sync with Supabase table
        try {
            const { supabase } = await import('./supabaseClient');
            const { error: syncError } = await supabase.from('banners').upsert({
                title: data.title || type,
                banner_url: data.banner_url || data.image_url || data.image,
                type: data.type || type,
                is_active: true,
                created_at: new Date().toISOString()
            });
            if (syncError) {
                console.warn("Supabase Sync Warning:", syncError.message);
                if (syncError.message.includes('row-level security policy')) {
                    console.warn("Please add an INSERT/UPDATE policy for the 'banners' table in Supabase.");
                }
            }
        } catch (e) {
            console.warn("Supabase Sync Failed:", e);
        }
    } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }
};

export const orderService = {
  async create(orderData: any) {
    const path = 'orders';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...orderData,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },
  async getByUserId(userId: string) {
    const path = 'orders';
    try {
      const q = query(collection(db, path), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  }
};

export const paymentService = {
  async processPayment(method: string, amount: number) {
    console.log(`Processing ${method} payment for ৳${amount}`);
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true, transactionId: `TXN_${Date.now()}` }), 2000);
    });
  }
};

export const supportService = {
  async sendMessage(message: string, userId?: string) {
    const path = 'support_messages';
    try {
        await addDoc(collection(db, path), {
            userId: userId || 'guest',
            message,
            read: false,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
    }
  }
};

export const configService = {
  async get() {
    const path = 'config/general';
    try {
      const docSnap = await getDoc(doc(db, 'config', 'general'));
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return { 
        heroTitle: 'IY ABD Premium Gear', 
        heroSubtitle: 'Elevate your performance with our curated collection of musical instruments and luxury goods.' 
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },
  async update(config: any) {
    const path = 'config/general';
    try {
      await setDoc(doc(db, 'config', 'general'), config, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },
  async getSupport() {
    const path = 'config/support';
    try {
      const docSnap = await getDoc(doc(db, 'config', 'support'));
      if (docSnap.exists()) return docSnap.data();
      return null;
    } catch (error) {
      console.warn("Could not fetch support config", error);
      return null;
    }
  },
  async updateSupport(config: any) {
    const path = 'config/support';
    try {
      await setDoc(doc(db, 'config', 'support'), config, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }
};

export const flashSaleService = {
  async getConfig() {
    const path = 'config/flash_sale';
    try {
      const docSnap = await getDoc(doc(db, 'config', 'flash_sale'));
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },
  
  subscribeConfig(callback: (config: any) => void) {
    const path = 'config/flash_sale';
    return onSnapshot(doc(db, 'config', 'flash_sale'), (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : null);
    }, (error) => {
      console.error('Firestore subscribeConfig error: ', error);
      callback(null);
    });
  },

  async getProducts() {
    const path = 'flash_sales';
    try {
      const q = query(collection(db, path), where('is_active', '==', true));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  subscribeProducts(callback: (products: any[]) => void) {
    const path = 'flash_sales';
    const q = query(collection(db, path), where('is_active', '==', true));
    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      callback(products);
    }, (error) => {
      console.error('Firestore subscribeProducts error: ', error);
      callback([]);
    });
  }
};


