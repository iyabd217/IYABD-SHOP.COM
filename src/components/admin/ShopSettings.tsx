import React, { useRef, useState } from 'react';
import { Camera, Save, X, Image as ImageIcon } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import toast from 'react-hot-toast';
import { adminFetch } from '../../lib/utils';

const ShopSettings: React.FC = () => {
    const { settings, setSettings } = useSettings();
    const [localSettings, setLocalSettings] = useState(settings);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const bannerDesktopInputRef = useRef<HTMLInputElement>(null);
    const [saved, setSaved] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'bannerDesktop' | 'bannerMobile') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (field === 'logo') {
                if (file.size > 2 * 1024 * 1024) {
                    toast.error("Maximum File Size 2MB");
                    return;
                }
                const validTypes = ['image/png', 'image/webp', 'image/svg+xml'];
                if (!validTypes.includes(file.type)) {
                    toast.error("Only PNG, WEBP, SVG Allowed");
                    return;
                }
                
                const objectUrl = URL.createObjectURL(file);
                const img = new Image();
                img.onload = () => {
                    if (img.width < 500 || img.height < 200) {
                        toast.error("Please Upload Proper Website Logo\nRecommended Size 500×200 PX");
                        URL.revokeObjectURL(objectUrl);
                        return;
                    }
                    setLocalSettings(prev => ({ ...prev, logo: objectUrl, _logoFile: file } as any));
                };
                img.src = objectUrl;
            } else {
                const objectUrl = URL.createObjectURL(file);
                setLocalSettings(prev => ({ ...prev, [field]: objectUrl, [`_${field}File`]: file } as any));
            }
        }
    };

    const handleRemoveLogo = async () => {
        try {
            setLoading(true);
            
            // Delete DB URL via server API
            try {
                const response = await fetch('/api/admin/website-settings/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ logo_url: '' }),
                    credentials: 'include'
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || "DB update failed");
                }
            } catch (err: any) {
                console.warn("DB update failed:", err);
            }

            // Clear Firestore if possible
            const { adminService } = await import('../../lib/adminServices');
            try {
               await adminService.updateCompanySettings({ website_logo: '', logo: '' });
            } catch(e) {}

            localStorage.removeItem("website_logo");
            setLocalSettings(prev => ({ ...prev, logo: '', _logoFile: null } as any));
            setSettings(prev => ({ ...prev, logo: '' }));
            
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new Event('logo-updated'));
            toast.success("Logo Removed Successfully");
        } catch (e) {
            toast.error("Remove Failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (loading) return;
        
        try {
            setLoading(true);
            setSaved(false);

            const logoFile = (localSettings as any)._logoFile;
            const bannerDesktopFile = (localSettings as any)._bannerDesktopFile;
            const bannerMobileFile = (localSettings as any)._bannerMobileFile;

            let updatedUrls: any = {};

            // 1. Upload files first
            if (logoFile || bannerDesktopFile || bannerMobileFile) {
                const formData = new FormData();
                if (logoFile) formData.append('logo', logoFile);
                if (bannerDesktopFile) formData.append('banner_desktop', bannerDesktopFile);
                if (bannerMobileFile) formData.append('banner_mobile', bannerMobileFile);

                const uploadRes = await adminFetch('/api/admin/website-media/upload', {
                    method: 'POST',
                    body: formData
                });

                const contentType = uploadRes.headers.get('content-type');

                if (uploadRes.ok && contentType?.includes('application/json')) {
                    updatedUrls = await uploadRes.json();
                } else {
                    const text = await uploadRes.text();
                    console.error(`Media upload failed with status ${uploadRes.status}:`, text.slice(0, 500));
                    
                    if (text.startsWith('<!doctype') || text.startsWith('<html')) {
                        throw new Error(`Server returned HTML instead of JSON (error ${uploadRes.status}). Please check server logs.`);
                    }
                    throw new Error(`Media upload failed (${uploadRes.status}): ${text || 'Unknown error'}`);
                }
            }

            // 2. Build final DB payload (Aligned with requested schema)
            const dbPayload: any = {
                website_name: localSettings.companyName || 'IYABD',
                contact_email: localSettings.email,
                contact_phone: localSettings.contact,
                address: localSettings.address,
                whatsapp: localSettings.whatsapp,
                bkash: localSettings.bkash,
                banner_title: localSettings.bannerTitle,
                banner_subtitle: localSettings.bannerSubtitle,
                updated_at: new Date().toISOString()
            };

            if (updatedUrls.logo_url) dbPayload.logo_url = updatedUrls.logo_url;
            if (updatedUrls.banner_desktop) dbPayload.banner_desktop = updatedUrls.banner_desktop;
            if (updatedUrls.banner_mobile) dbPayload.banner_mobile = updatedUrls.banner_mobile;

            // 3. Save to Supabase DB via server API
            const settingsResponse = await adminFetch('/api/admin/website-settings/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dbPayload)
            });

            if (!settingsResponse.ok) {
                const errData = await settingsResponse.json();
                throw new Error(errData.error || "Settings update failed");
            }

            // 5. Update local state and global settings
            const finalLogo = updatedUrls.logo_url || settings.logo;
            const logoWithCache = finalLogo.includes('?') ? `${finalLogo.split('?')[0]}?v=${Date.now()}` : `${finalLogo}?v=${Date.now()}`;
            
            const newSettings = {
                ...settings,
                logo: logoWithCache,
                siteLogo: logoWithCache,
                website_logo: logoWithCache,
                bannerDesktop: updatedUrls.banner_desktop || settings.bannerDesktop,
                bannerMobile: updatedUrls.banner_mobile || settings.bannerMobile,
                bannerTitle: dbPayload.banner_title,
                bannerSubtitle: dbPayload.banner_subtitle
            } as any;

            setLocalSettings(newSettings);
            setSettings(newSettings);

            if (updatedUrls.logo_url) {
                localStorage.setItem("website_logo", logoWithCache);
                window.dispatchEvent(new Event("logo-updated"));
            }

            toast.success("✅ Settings Saved Successfully");
            setSaved(true);
            
            // Re-trigger global refresh
            window.dispatchEvent(new Event('storage'));
            
            setTimeout(() => setSaved(false), 3000);

        } catch (error: any) {
            console.error("Save Error:", error);
            toast.error(error.message || "Save Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-5 pb-32 space-y-8">
            <h1 className="text-2xl font-black text-slate-800">Upload Logo & Brand Media</h1>

            {/* Logo Section */}
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-4">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-sm uppercase">Website Logo</h3>
                    <div className="text-right text-xs text-slate-500 font-medium">
                        <p>Recommended Size: <span className="font-bold text-slate-700">500 × 200 PX</span></p>
                        <p>Format: <span className="font-bold text-slate-700">PNG / WEBP / SVG</span></p>
                        <p>Max Size: <span className="font-bold text-slate-700">2MB</span></p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <input type="file" accept="image/png, image/webp, image/svg+xml" hidden ref={logoInputRef} onChange={(e) => handleFileChange(e, 'logo')} />
                    <div className="space-y-2 shrink-0">
                        <div onClick={() => logoInputRef.current?.click()} className="logo-upload-box cursor-pointer hover:border-[#2563EB] transition-all">
                            {localSettings.logo ? <img src={localSettings.logo} className="logo-preview" /> : <Camera size={24} className="text-slate-400" />}
                        </div>
                        <p className="text-center text-xs font-bold text-slate-500">Best Logo Ratio: 5:2</p>
                    </div>
                    <div className="space-y-2">
                        <button onClick={() => logoInputRef.current?.click()} className="px-6 py-3 bg-slate-100 rounded-2xl text-sm font-bold hover:bg-slate-200">Change Logo</button>
                        <button onClick={handleRemoveLogo} disabled={loading} className="px-6 py-3 text-red-500 text-sm font-bold disabled:opacity-50">Remove Logo</button>
                    </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                    <button 
                        onClick={() => {
                            setLocalSettings(settings);
                        }}
                        className="px-6 flex items-center justify-center bg-[#F1F3F9] text-[#111827] h-[56px] rounded-[18px] font-bold"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={loading}
                        className={`save-btn ${saved ? 'saved' : ''}`}
                    >
                        {loading ? 'Saving...' : saved ? '✔ Saved' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Banner Section */}
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-6">
                <h3 className="font-bold text-sm uppercase">Homepage Banner (1920x800px)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <input type="file" accept="image/*" hidden ref={bannerDesktopInputRef} onChange={(e) => handleFileChange(e, 'bannerDesktop')} />
                        <div onClick={() => bannerDesktopInputRef.current?.click()} className="w-full h-[220px] rounded-[28px] bg-[#F8FAFC] border-2 border-dashed border-[#CBD5E1] flex items-center justify-center cursor-pointer hover:border-[#2563EB] transition-all overflow-hidden">
                            {localSettings.bannerDesktop ? <img src={localSettings.bannerDesktop} className="w-full h-full object-cover" /> : <div className="text-center"><Camera size={48} className="mx-auto text-slate-400"/><p className="text-xs mt-2 font-bold">Upload Desktop Banner</p></div>}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <input type="text" name="bannerTitle" value={localSettings.bannerTitle} onChange={(e) => setLocalSettings(p => ({...p, bannerTitle: e.target.value}))} placeholder="Banner Title" className="w-full h-[56px] bg-[#F8FAFC] rounded-2xl px-4 text-sm font-bold outline-none" />
                        <input type="text" name="bannerSubtitle" value={localSettings.bannerSubtitle} onChange={(e) => setLocalSettings(p => ({...p, bannerSubtitle: e.target.value}))} placeholder="Banner Subtitle" className="w-full h-[56px] bg-[#F8FAFC] rounded-2xl px-4 text-sm font-bold outline-none" />
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ShopSettings;
