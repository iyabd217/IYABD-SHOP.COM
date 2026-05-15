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
                
                // Convert to WebP with 0.8 quality
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Canvas toBlob failed'));
                    }
                }, 'image/webp', 0.8);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

export const storageService = {
    async uploadProductImage(productId: string, file: File | Blob, index?: number) {
        const timestamp = Date.now();
        const extension = 'webp';
        const fileName = index !== undefined ? `image_${index}_${timestamp}.${extension}` : `main_${timestamp}.${extension}`;
        const filePath = `products/${productId}/${fileName}`;
        const storageRef = ref(storage, filePath);
        
        try {
            await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(storageRef);
            return {
                url: downloadUrl,
                path: filePath
            };
        } catch (error) {
            console.error("Storage Upload Error:", error);
            throw error;
        }
    },

    async deleteFile(path: string) {
        const storageRef = ref(storage, path);
        try {
            await deleteObject(storageRef);
        } catch (error) {
            console.warn("Storage Delete Warning:", error);
        }
    }
};

export const productService = {
  async getAll() {
    // Try CMS first, then Firestore
    const cmsProducts = await cmsService.getProducts();
    if (cmsProducts && cmsProducts.length > 0) {
      return cmsProducts;
    }

    const path = 'products';
    try {
      const q = query(collection(db, path));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
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
    // Try CMS first
    cmsService.getProducts().then(cmsProducts => {
       if (cmsProducts && cmsProducts.length > 0) {
          callback(cmsProducts);
       } else {
          // Fallback to Firestore
          const path = 'products';
          onSnapshot(collection(db, path), (snapshot) => {
            const products = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
            callback(products);
          }, (error) => {
            console.error('Firestore subscribeAll error: ', error);
            callback([]); 
          });
       }
    }).catch(e => {
       console.error("CMS failed", e);
       callback([]);
    });
    
    return () => {}; // return dummy unsubscribe
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
      const docRef = await addDoc(collection(db, path), {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async update(id: string, productData: any) {
    const path = `products/${id}`;
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, {
        ...productData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async delete(id: string) {
    const path = `products/${id}`;
    try {
      await deleteDoc(doc(db, 'products', id));
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


