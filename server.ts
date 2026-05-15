import express from "express";
import path from "path";
import "dotenv/config";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import multer from "multer";
import sharp from "sharp";
import fs from "fs/promises";

const upload = multer({ storage: multer.memoryStorage() });

import { initializeApp as initClient } from "firebase/app";
import { getFirestore, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import firebaseConfig from "./firebase-applet-config.json" assert { type: "json" };
import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

if (!admin.apps.length) {
    admin.initializeApp({
       projectId: firebaseConfig.projectId
    });
}

const firebaseApp = initClient(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const JWT_SECRET = process.env.JWT_SECRET || "default_secret_dont_use_in_prod";

  // Middleware
  app.use(express.json());
  app.use(cookieParser());
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Storage Configuration
  const storage = multer.memoryStorage();
  const upload = multer({ storage });

  // Helper for Sharp Optimization
  const optimizeImage = async (req: any, buffer: Buffer, folder: string, width = 1200, quality = 80) => {
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
    const uploadDir = path.join(process.cwd(), "uploads", folder);
    await fs.mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);
    
    await sharp(buffer)
      .resize(width)
      .webp({ quality })
      .toFile(filepath);
      
    // Generate Full URL
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}/uploads/${folder}/${filename}`;
  };

  // Hero Banner Upload API
  app.post("/api/admin/hero-banner/upload", upload.fields([
    { name: 'banner_image', maxCount: 1 },
    { name: 'mobile_banner', maxCount: 1 },
    { name: 'desktop_banner', maxCount: 1 },
    { name: 'product_images', maxCount: 5 }
  ]), async (req: any, res) => {
    try {
      const urls: any = { product_images: [] };
      
      if (req.files.banner_image) {
        urls.banner_image = await optimizeImage(req, req.files.banner_image[0].buffer, 'banners', 1920);
      }
      if (req.files.mobile_banner) {
        urls.mobile_banner = await optimizeImage(req, req.files.mobile_banner[0].buffer, 'banners', 800);
      }
      if (req.files.desktop_banner) {
        urls.desktop_banner = await optimizeImage(req, req.files.desktop_banner[0].buffer, 'banners', 1920);
      }
      
      if (req.files.product_images) {
        urls.product_images = await Promise.all(
          req.files.product_images.map((file: any) => optimizeImage(req, file.buffer, 'products', 600))
        );
      }

      res.json(urls);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  // Category Banner Upload API
  app.post("/api/admin/category/upload", upload.fields([
    { name: 'icon', maxCount: 1 },
    { name: 'banner_image', maxCount: 1 },
    { name: 'top_banner', maxCount: 1 }
  ]), async (req: any, res) => {
    try {
      const urls: any = {};
      
      if (req.files.icon) {
        urls.icon = await optimizeImage(req, req.files.icon[0].buffer, 'categories', 200);
      }
      if (req.files.banner_image) {
        urls.banner_image = await optimizeImage(req, req.files.banner_image[0].buffer, 'categories', 800);
      }
      if (req.files.top_banner) {
        urls.top_banner = await optimizeImage(req, req.files.top_banner[0].buffer, 'category-top', 1920);
      }

      res.json(urls);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  // Banners API
  app.get("/api/hero-banners", async (req, res) => {
    try {
      const q = query(
        collection(db, "hero_banners"), 
        where("is_active", "==", true), 
        orderBy("sort_order", "asc")
      );
      const snapshot = await getDocs(q);
      const banners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(banners);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch hero banners" });
    }
  });

  app.get("/api/category-banners", async (req, res) => {
    try {
      const q = query(
        collection(db, "category_banners"), 
        where("is_active", "==", true), 
        orderBy("sort_order", "asc")
      );
      const snapshot = await getDocs(q);
      const banners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(banners);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to fetch category banners" });
    }
  });

  // Admin Credentials from Env
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin.iyabd@gmail.com";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "iyabd.admin##060";

  // API routes
  app.post("/api/banners/upload", upload.single('banner'), async (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const { type } = req.body; // 'category' | 'youtube'
    const width = type === 'category' ? 1600 : 2560;
    const height = type === 'category' ? 600 : 1440;
    
    try {
      const filename = `banner_${type}_${Date.now()}.webp`;
      const filepath = path.join(process.cwd(), 'public/uploads', filename);
      
      await fs.mkdir(path.join(process.cwd(), 'public/uploads'), { recursive: true });
      
      await sharp(req.file.buffer)
        .resize(width, height, { fit: 'cover' })
        .webp({ quality: 80 })
        .toFile(filepath);
        
      res.json({ url: `/uploads/${filename}` });
    } catch (e) {
      res.status(500).json({ error: "Processing failed" });
    }
  });

  app.post("/api/products/gallery", upload.array('images', 8), async (req: any, res) => {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: "No files uploaded" });
    
    try {
      await fs.mkdir(path.join(process.cwd(), 'public/uploads/products/gallery'), { recursive: true });
      const urls = await Promise.all(req.files.map(async (file: any) => {
        const filename = `product_gallery_${Date.now()}_${Math.floor(Math.random()*1000)}.webp`;
        const filepath = path.join(process.cwd(), 'public/uploads/products/gallery', filename);
        await sharp(file.buffer)
          .resize({ width: 1400, withoutEnlargement: true }) // HD ratio
          .webp({ quality: 85 })
          .toFile(filepath);
        return `/uploads/products/gallery/${filename}`;
      }));
        
      res.json({ urls });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Processing failed" });
    }
  });

  app.post("/api/products/thumbnail", upload.single('thumbnail'), async (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    
    try {
      const filename = `product_thumb_${Date.now()}.webp`;
      const filepath = path.join(process.cwd(), 'public/uploads', filename);
      
      await fs.mkdir(path.join(process.cwd(), 'public/uploads'), { recursive: true });
      
      await sharp(req.file.buffer)
        .resize(500, 500, { fit: 'cover' })
        .webp({ quality: 80 })
        .toFile(filepath);
        
      res.json({ url: `/uploads/${filename}` });
    } catch (e) {
      res.status(500).json({ error: "Processing failed" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "online", 
      timestamp: new Date().toISOString(),
      service: "IY ABD Premium Backend"
    });
  });

  // AI Chat Assistant
  app.post("/api/ai/chat", async (req: any, res) => {
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "Gemini API key not configured" });

    try {
      const { message, history } = req.body;

      // 1. Fetch live data (Products, Settings) to feed into the prompt
      const productsSnapshot = await getDocs(collection(db, "products"));
      const products = productsSnapshot.docs.map(doc => {
        const d = doc.data();
        return `Name: ${d.name}, Price: ${d.price}, Stock: ${d.stock}, Available Sizes: ${d.sizes?.join(', ') || 'N/A'}`;
      }).join("\n");

      // 2. Fetch AI Training from Supabase Storage
      let aiTraining: any = null;
      try {
        const { data: storageData, error } = await supabase.storage
          .from('support-system')
          .download('ai-training.json');
        
        if (storageData && !error) {
          const text = await storageData.text();
          aiTraining = JSON.parse(text);
        }
      } catch (e) {
        console.warn("Could not fetch ai-training.json from Supabase Storage", e);
      }

      let deliverySettings = aiTraining?.delivery?.time || "Standard delivery takes 2-4 business days inside Dhaka and 4-7 days outside.";
      const supportConfigSnap = await getDocs(query(collection(db, "config"), where("__name__", "==", "support")));
      let supportInfo = "";
      if (!supportConfigSnap.empty) {
        const data = supportConfigSnap.docs[0].data();
        supportInfo = `Support Phone: ${data?.phone}, Email: ${data?.emails?.[0]}`;
      }

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const systemInstruction = `You are IYABD AI Support Assistant.
You behave like a professional human customer support agent.
You speak friendly Bangla and English.
You greet users warmly.
You answer customer questions using the ecommerce database.
If user gives salam, reply properly.
Always act polite, smart and professional.

--- LIVE PRODUCT CATALOG ---
${products}
--- DELIVERY & SUPPORT INFO ---
${deliverySettings}
${supportInfo}

If you do not know the answer, say "দুঃখিত 😔\nআমি এখনো এই তথ্যটি খুঁজে পাইনি।\nআপনি চাইলে একজন live support agent এর সাথে যোগাযোগ করতে পারেন।" exactly.
Keep answers short and conversational.`;

      // Structure chat for Gemini
      const contents = history.map((msg: any) => ({
        role: msg.from === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash", 
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.3
        }
      });

      res.json({ reply: response.text });
    } catch (e) {
      console.error('Gemini Chat Error:', e);
      res.status(500).json({ error: "AI processing failed" });
    }
  });

  // AI Image Search
  app.post("/api/ai/image-search", upload.single('image'), async (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "Gemini API key not configured" });

    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY!,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const imageParts = [
        {
          inlineData: {
            data: req.file.buffer.toString("base64"),
            mimeType: req.file.mimetype
          },
        },
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...imageParts,
          { text: "Find similar fashion items in a store. Just return a JSON array of search terms like ['blue denim jacket', 'white cotton shirt']" }
        ]
      });

      const text = response.text || "";
      res.json({ result: text });
    } catch (e) {
      console.error('Gemini Error:', e);
      res.status(500).json({ error: "AI processing failed" });
    }
  });

  app.post("/api/admin/flash-sale/upload", upload.single('image'), async (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    try {
      const url = await optimizeImage(req, req.file.buffer, 'flash-sale', 1920);
      res.json({ url });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  // Admin Login Endpoint
  app.post("/api/admin/login", (req, res) => {
    const { email, password } = req.body;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = jwt.sign({ role: 'admin', email: ADMIN_EMAIL }, JWT_SECRET, { expiresIn: '1d' });
      
      // Set secure cookie
      res.cookie('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      return res.json({ success: true, message: "Admin authenticated" });
    }

    res.status(401).json({ success: false, message: "Invalid admin credentials" });
  });

  // Verify Admin Session
  app.get("/api/admin/verify", (req, res) => {
    const token = req.cookies.admin_token;

    if (!token) {
      return res.status(401).json({ isAdmin: false });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      res.json({ isAdmin: true, user: decoded });
    } catch (err) {
      res.status(401).json({ isAdmin: false });
    }
  });

  // Get Firebase Custom Token for Admin
  app.get("/api/admin/firebase-token", async (req, res) => {
    const token = req.cookies.admin_token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (decoded.role === 'admin') {
        const customToken = await admin.auth().createCustomToken("admin_system", { email: decoded.email, admin: true });
        res.json({ token: customToken });
      } else {
        res.status(403).json({ error: "Forbidden" });
      }
    } catch (err) {
      res.status(401).json({ error: "Unauthorized" });
    }
  });

  // Admin Logout
  app.post("/api/admin/logout", (req, res) => {
    res.clearCookie('admin_token');
    res.json({ success: true });
  });

  // SEO Routes
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send(`User-agent: *\nAllow: /\nSitemap: ${req.protocol}://${req.get('host')}/sitemap.xml`);
  });

  app.get("/sitemap.xml", (req, res) => {
    res.type("application/xml");
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/</loc><priority>1.0</priority></url>
  <url><loc>${baseUrl}/shop</loc><priority>0.8</priority></url>
  <url><loc>${baseUrl}/categories</loc><priority>0.7</priority></url>
</urlset>`);
  });

  // Conversion API Bridge Endpoint (Placeholder for FB CAPI / TT Event API)
  app.post("/api/tracking/event", (req, res) => {
    const { eventName, data, timestamp } = req.body;
    console.log(`[CAPI Bridge] Received ${eventName} at ${timestamp}`, data);
    
    // In a real implementation, you would:
    // 1. Fetch marketing settings (Pixel ID, Access Token) from DB
    // 2. Call Facebook Graph API / TikTok Events API via fetch
    // example: await fetch(`https://graph.facebook.com/v13.0/${pixelId}/events?access_token=${accessToken}`, ...)
    
    res.json({ success: true, message: "Event received for server-side processing" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serving compiled static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`IY ABD Premium server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
