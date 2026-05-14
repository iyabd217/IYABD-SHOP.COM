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
            const reader = new FileReader();
            reader.onload = (event) => {
                setLocalSettings(prev => ({ ...prev, [field]: event.target?.result as string }));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSave = () => {
        setSettings(localSettings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="p-5 pb-32 space-y-8">
            <h1 className="text-2xl font-black text-slate-800">Upload Logo & Brand Media</h1>

            {/* Logo Section */}
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-4">
                <h3 className="font-bold text-sm uppercase">Website Logo</h3>
                <div className="flex items-center gap-6">
                    <input type="file" accept="image/*" hidden ref={logoInputRef} onChange={(e) => handleFileChange(e, 'logo')} />
                    <div onClick={() => logoInputRef.current?.click()} className="w-[160px] h-[160px] rounded-[32px] bg-[#F3F4F6] border-2 border-dashed border-[#CBD5E1] flex items-center justify-center cursor-pointer hover:border-[#2563EB] transition-all overflow-hidden shrink-0">
                        {localSettings.logo ? <img src={localSettings.logo} className="w-full h-full object-contain" /> : <Camera size={48} className="text-slate-400" />}
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
