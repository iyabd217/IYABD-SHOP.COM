import React, { useState } from 'react';
import { Building, MapPin, Save } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const CompanyDetailsSettings: React.FC = () => {
    const { settings, setSettings } = useSettings();
    const [localSettings, setLocalSettings] = useState(settings);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => setSettings(localSettings);

    return (
        <div className="p-5 pb-20 space-y-8">
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-6">
                <h3 className="font-bold text-slate-800 tracking-tight text-sm uppercase mb-4 flex items-center gap-2"><Building size={16} /> Company Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Company Name" name="companyName" value={localSettings.companyName} onChange={handleChange} />
                    <InputField label="Brand Name" name="brandName" value={localSettings.brandName} onChange={handleChange} />
                    <InputField label="Currency" name="currency" value={localSettings.currency} onChange={handleChange} />
                    <InputField label="Timezone" name="timezone" value={localSettings.timezone} onChange={handleChange} />
                </div>
            </div>

            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-6">
                <h3 className="font-bold text-slate-800 tracking-tight text-sm uppercase mb-4 flex items-center gap-2"><MapPin size={16} /> Address</h3>
                <textarea name="address" value={localSettings.address} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-800 outline-none" rows={3}/>
            </div>

            <button onClick={handleSave} className="w-full bg-[#081028] text-white rounded-[28px] py-4.5 font-black uppercase tracking-widest text-xs shadow-xl transition-all">Save Changes</button>
        </div>
    );
};

const InputField = ({ label, name, value, onChange }: any) => (
    <div>
        <label className="text-[10px] uppercase font-black text-slate-400 mb-1.5 ml-1 block opacity-70">{label}</label>
        <input type="text" name={name} value={value} onChange={onChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-black text-slate-800 outline-none"/>
    </div>
);

export default CompanyDetailsSettings;
