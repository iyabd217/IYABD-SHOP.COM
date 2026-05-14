/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FB_PIXEL_ID: string
  readonly VITE_GA_MEASUREMENT_ID: string
  readonly VITE_TIKTOK_PIXEL_ID: string
  readonly VITE_GSC_VERIFICATION_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  fbq: any;
  _fbq: any;
  gtag: any;
  ttq: any;
  dataLayer: any[];
  TiktokAnalyticsObject: any;
}
