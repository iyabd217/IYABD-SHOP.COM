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

async function startServer() {
  const app = express();
  const PORT = 3000;
  const JWT_SECRET = process.env.JWT_SECRET || "default_secret_dont_use_in_prod";

  // Middleware
  app.use(express.json());
  app.use(cookieParser());

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
      service: "Lumina Luxe Backend"
    });
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
    console.log(`Lumina Luxe server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
