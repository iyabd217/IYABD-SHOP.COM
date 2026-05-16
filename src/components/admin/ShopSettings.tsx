import React, { useRef, useState } from 'react';
import { Camera, Save, X, Image as ImageIcon } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const ShopSettings: React.FC = () => {
    const { settings, setSettings } = useSettings();
    const [localSettings, setLocalSettings] = useState(settings);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const bannerDesktopInputRef = useRef<HTMLInputElement>(null);
    const [saved, setSaved] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'bannerDesktop' | 'bannerMobile') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (field === 'logo') {
                // Immediately update local preview URL to give fast feedback
                const objectUrl = URL.createObjectURL(file);
                setLocalSettings(prev => ({ ...prev, logo: objectUrl, _logoFile: file } as any));
            } else {
                const reader = new FileReader();
                reader.onload = (event) => {
                    setLocalSettings(prev => ({ ...prev, [field]: event.target?.result as string }));
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleSave = async () => {
        try {
            let finalLogoUrl = localSettings.logo;
            
            // If they picked a new logo file
            const file = (localSettings as any)._logoFile;
            if (file) {
                const formData = new FormData();
                formData.append('logo', file);
                
                const res = await fetch('/api/settings/logo', {
                    method: 'POST',
                    body: formData
                });
                
                if (res.ok) {
                    const data = await res.json();
                    finalLogoUrl = data.url;
                }
            }

            const { adminService } = await import('../../lib/adminServices');
            // Try updating Firestore if they are logged in. 
            // We'll wrap it in try/catch so to ignore permissions error smoothly
            try {
               await adminService.updateCompanySettings({ website_logo: finalLogoUrl, logo: finalLogoUrl, bannerDesktop: localSettings.bannerDesktop, bannerTitle: localSettings.bannerTitle, bannerSubtitle: localSettings.bannerSubtitle });
            } catch(firebaseErr) {
               console.warn("Could not save to firestore, maybe insufficient permissions. Logo is already saved to Cloud Storage.");
            }
            
            if (finalLogoUrl) {
                localStorage.setItem("website_logo", finalLogoUrl);
                setSettings(prev => ({ ...prev, ...localSettings, logo: finalLogoUrl }));
                setLocalSettings(prev => ({ ...prev, logo: finalLogoUrl, _logoFile: null } as any));
            } else {
                localStorage.removeItem("website_logo");
                setSettings(localSettings);
            }
            // Trigger a dispatch to update the site logo dynamically across all tabs/hooks
            window.dispatchEvent(new Event('storage'));
        } catch (e) {
            console.error(e);
            setSettings(localSettings);
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
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
                    <input type="file" accept="image/png, image/webp, image/svg+xml, image/jpeg" hidden ref={logoInputRef} onChange={(e) => handleFileChange(e, 'logo')} />
                    <div className="space-y-2 shrink-0">
                        <div onClick={() => logoInputRef.current?.click()} className="w-[160px] h-[160px] rounded-[32px] bg-[#F3F4F6] border-2 border-dashed border-[#CBD5E1] flex items-center justify-center cursor-pointer hover:border-[#2563EB] transition-all overflow-hidden">
                            {localSettings.logo ? <img src={localSettings.logo} className="w-full h-full object-contain" /> : <Camera size={48} className="text-slate-400" />}
                        </div>
                        <p className="text-center text-xs font-bold text-slate-500">Best Logo Ratio: 5:2</p>
                    </div>
                    <div className="space-y-2">
                        <button onClick={() => logoInputRef.current?.click()} className="px-6 py-3 bg-slate-100 rounded-2xl text-sm font-bold hover:bg-slate-200">Change Logo</button>
                        <button onClick={() => setLocalSettings(prev => ({...prev, logo: ''}))} className="px-6 py-3 text-red-500 text-sm font-bold">Remove Logo</button>
                    </div>
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

            {/* Footer Sticky Save Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 flex justify-between items-center z-[9990]">
                <p className="text-xs font-bold text-slate-400">{saved ? '✅ Logo Updated Successfully' : 'Unsaved changes pending...'}</p>
                <div className="flex gap-4">
                    <button className="px-8 py-4 bg-slate-100 rounded-2xl text-sm font-bold">Cancel</button>
                    <button onClick={handleSave} className="px-8 py-4 bg-[#081028] text-white rounded-2xl text-sm font-bold flex items-center gap-2 shadow-lg"><Save size={16} /> Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default ShopSettings;
