import React, { createContext, useContext, useState, useEffect } from 'react';
import { cmsService } from '../lib/cmsService';

export interface SiteSettings {
    logo: string;
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
                const cmsHeader = await cmsService.getWebsiteConfig('header.json');
                const cmsFooter = await cmsService.getWebsiteConfig('footer.json');
                const cmsSocial = await cmsService.getSocialLinks();
                const cmsTheme = await cmsService.getWebsiteConfig('theme.json');
                
                const logoUrl = cmsService.getAssetUrl('website-assets', 'logos/logo.png');

                setSettings(prev => ({
                    ...prev,
                    ...cmsHeader,
                    ...cmsFooter,
                    ...cmsSocial,
                    ...cmsTheme,
                    logo: logoUrl || prev.logo,
                    facebook: cmsSocial?.facebook || prev.facebook,
                    tiktok: cmsSocial?.tiktok || prev.tiktok,
                    youtube: cmsSocial?.youtube || prev.youtube,
                    whatsapp: cmsSocial?.whatsapp || prev.whatsapp,
                }));
            } catch (err) {
                console.warn("CMS Settings load failed, using defaults", err);
            }
        };

        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, setSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
