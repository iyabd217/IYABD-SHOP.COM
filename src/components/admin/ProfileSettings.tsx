import React, { useState } from 'react';
import { User, Mail, Save, Check, Phone, MapPin, Globe } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const ProfileSettings: React.FC = () => {
    const { settings, setSettings } = useSettings();
    const [localSettings, setLocalSettings] = useState(settings);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSettings(localSettings);
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="p-5 pb-20 space-y-8">
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-6">
                <h3 className="font-bold text-slate-800 tracking-tight text-sm uppercase mb-4 flex items-center gap-2"><User size={16} /> Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Full Name" name="companyName" value={localSettings.companyName} onChange={handleChange} />
                    <InputField label="Email Address" name="email" value={localSettings.email} onChange={handleChange} />
                    <InputField label="Contact Number" name="contact" value={localSettings.contact} onChange={handleChange} />
                    <InputField label="WhatsApp Number" name="whatsapp" value={localSettings.whatsapp} onChange={handleChange} />
                </div>
            </div>

            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-6">
                 <h3 className="font-bold text-slate-800 tracking-tight text-sm uppercase mb-4 flex items-center gap-2"><Globe size={16} /> Social Media</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Facebook" name="facebook" value={localSettings.facebook} onChange={handleChange} />
                    <InputField label="Instagram" name="instagram" value={localSettings.instagram} onChange={handleChange} />
                    <InputField label="YouTube" name="youtube" value={localSettings.youtube} onChange={handleChange} />
                    <InputField label="TikTok" name="tiktok" value={localSettings.tiktok} onChange={handleChange} />
                 </div>
            </div>

            <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[#081028] text-white rounded-[28px] py-4.5 font-black uppercase tracking-widest text-xs shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
            >
                {saving ? 'Saving...' : saved ? 'Updated!' : 'Save Profile Changes'}
            </button>
        </div>
    );
};

const InputField = ({ label, name, value, onChange }: any) => (
    <div>
        <label className="text-[10px] uppercase font-black text-slate-400 mb-1.5 ml-1 block opacity-70">{label}</label>
        <input 
            type="text" 
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-black text-slate-800 outline-none"
        />
    </div>
);

export default ProfileSettings;
