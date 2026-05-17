import React, { createContext, useContext, useState, useEffect } from 'react';
import { cmsService } from '../lib/cmsService';

export interface SiteSettings {
    logo: string;
    siteLogo?: string;
    website_logo?: string;
    bannerDesktop: string;
    bannerMobile: string;
    bannerTitle: string;
    bannerSubtitle: string;
    companyName: string;
    brandName: string;
    contact: string;
    whatsapp: string;
    bkash: string;
    nagad: string;
    rocket: string;
    bankAccount: string;
    email: string;
    address: string;
    facebook: string;
    instagram: string;
    tiktok: string;
    youtube: string;
    linkedin: string;
    currency: string;
    timezone: string;
    language: string;
    messenger_link?: string;
    brandSlogan: string;
    brandDescription: string;
    themeColor: string;
    openingTime: string;
    closingTime: string;
    metaTitle: string;
    metaDescription: string;
    websiteKeywords: string;
    mediaLibrary: { id: string; url: string; name: string }[];
}

const defaultSettings: SiteSettings = {
    companyName: 'IYABD',
    brandName: 'IYABD Fashion',
    contact: '01719188777',
    whatsapp: '01719188777',
    bkash: '01671060679',
    nagad: '',
    rocket: '',
    bankAccount: '',
    email: 'contact@iyabd.com',
    address: 'Janata Bagh, Rayerbag, Dhaka-1236, Bangladesh',
    logo: 'https://ui-avatars.com/api/?name=IYABD&background=random',
    siteLogo: '',
    website_logo: '',
    bannerDesktop: '',
    bannerMobile: '',
    bannerTitle: 'Summer Collection',
    bannerSubtitle: 'Up to 50% OFF',
    facebook: '',
    instagram: '',
    tiktok: '',
    youtube: '',
    linkedin: '',
    currency: 'BDT',
    timezone: 'Asia/Dhaka',
    language: 'Bengali/English',
    brandSlogan: 'Fashion for all',
    brandDescription: 'Premium fashion brand.',
    themeColor: '#2563EB',
    openingTime: '09:00 AM',
    closingTime: '09:00 PM',
    metaTitle: 'IYABD - Fashion eCommerce',
    metaDescription: 'Best fashion deals.',
    websiteKeywords: 'fashion, ecommerce, clothes',
    mediaLibrary: []
};

const SettingsContext = createContext<{ 
    settings: SiteSettings; 
    setSettings: React.Dispatch<React.SetStateAction<SiteSettings>> 
}>({ 
    settings: defaultSettings, 
    setSettings: () => {} 
});

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Clear old broken caches
                localStorage.removeItem("old_logo");
                
                // First try localStorage - User said: Logo local preview na, database theke hobe
                let dbLogo = null;
                try {
                    const { supabase } = await import('../lib/supabaseClient');
                    const { data: websiteData } = await supabase.from('website_settings').select('logo_url, banner_desktop, banner_mobile, banner_title, banner_subtitle').eq('id', 1).single();
                    if (websiteData) {
                        if (websiteData.logo_url) {
                            dbLogo = websiteData.logo_url;
                            dbLogo = `${dbLogo.split('?')[0]}?v=${Date.now()}`;
                        }
                        
                        setSettings(prev => ({
                            ...prev,
                            logo: dbLogo || prev.logo,
                            siteLogo: dbLogo || prev.siteLogo,
                            website_logo: dbLogo || prev.website_logo,
                            bannerDesktop: websiteData.banner_desktop || prev.bannerDesktop,
                            bannerMobile: websiteData.banner_mobile || prev.bannerMobile,
                            bannerTitle: websiteData.banner_title || prev.bannerTitle,
                            bannerSubtitle: websiteData.banner_subtitle || prev.bannerSubtitle
                        }));
                    }
                } catch(e) {
                    console.warn("Failed to fetch logo from supabase db:", e);
                }

                // local storage ONLY as a fallback if DB fails and it's not a blob:
                let localLogo = localStorage.getItem('website_logo');
                if (localLogo?.startsWith('blob:')) localLogo = null; // Don't use expired object URLs
                
                const cmsHeader = await cmsService.getWebsiteConfig('header.json');
                const cmsFooter = await cmsService.getWebsiteConfig('footer.json');
                const cmsSocial = await cmsService.getSocialLinks();
                const cmsTheme = await cmsService.getWebsiteConfig('theme.json');
                
                let logoUrl = cmsService.getAssetUrl('website-assets', 'logos/main-logo.png');
                if (logoUrl) logoUrl += `?v=${Date.now()}`;

                try {
                    if (!dbLogo) {
                        // Try fetch from backend settings JSON
                        const res = await fetch('/api/settings/logo').catch(()=>null);
                        if (res && res.ok) {
                            const data = await res.json();
                            if (data.url && data.url !== '/default-logo.webp') {
                                dbLogo = data.url;
                            }
                        }
                    }
                    
                    if (!dbLogo) {
                        const { adminService } = await import('../lib/adminServices');
                        const compSettings = await adminService.getCompanySettings();
                        if (compSettings?.logo || compSettings?.website_logo) {
                            dbLogo = compSettings.website_logo || compSettings.logo;
                        }
                    }
                    
                    if (dbLogo && !dbLogo.startsWith('data:')) {
                        // strip existing query and add timestamp
                        dbLogo = `${dbLogo.split('?')[0]}?v=${Date.now()}`;
                    }
                } catch(e) {}

                setSettings(prev => ({
                    ...prev,
                    ...cmsHeader,
                    ...cmsFooter,
                    ...cmsSocial,
                    ...cmsTheme,
                    logo: dbLogo || localLogo || logoUrl || '/default-logo.webp',
                    siteLogo: dbLogo || localLogo || logoUrl || '/default-logo.webp',
                    website_logo: dbLogo || localLogo || logoUrl || '/default-logo.webp',
                    facebook: cmsSocial?.facebook || prev.facebook,
                    tiktok: cmsSocial?.tiktok || prev.tiktok,
                    youtube: cmsSocial?.youtube || prev.youtube,
                    whatsapp: cmsSocial?.whatsapp || prev.whatsapp,
                }) as any);
            } catch (err) {
                console.warn("CMS Settings load failed, using defaults", err);
            }
        };

        fetchSettings();
        window.addEventListener('storage', fetchSettings);
        window.addEventListener('logo-updated', fetchSettings);
        return () => {
            window.removeEventListener('storage', fetchSettings);
            window.removeEventListener('logo-updated', fetchSettings);
        };
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, setSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
