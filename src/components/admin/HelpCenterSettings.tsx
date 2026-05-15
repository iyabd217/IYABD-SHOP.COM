import React, { useState, useEffect } from 'react';
import { Save, Loader2, Link } from 'lucide-react';
import { configService } from '../../lib/services';

const HelpCenterSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    const [config, setConfig] = useState({
        phone: '01719188777',
        whatsapp: '8801719188777',
        messenger: 'https://www.facebook.com/iyabdshop',
        tiktokUrl: 'https://www.tiktok.com/embed/@iyabdshop',
        tiktokTitle: 'TikTok',
        tiktokUsername: '@iyabdshop',
        youtubeUrl: 'https://www.youtube.com/@IYABD_01',
        youtubeTitle: 'YouTube',
        youtubeUsername: '@IYABD_01',
    });

    useEffect(() => {
        const fetchConfig = async () => {
            const data = await configService.getSupport();
            if (data) {
                setConfig(prev => ({ ...prev, ...data }));
            }
            setLoading(false);
        };
        fetchConfig();
    }, []);

    const handleChange = (field: string, value: string) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await configService.updateSupport(config);
            setMessage({ type: 'success', text: 'Support settings updated successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update settings.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 pt-20 flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-6 pt-20 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Support Center Manager</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage contact info and social media integrations</p>
                </div>
                <div className="flex items-center gap-4">
                    {message && (
                        <span className={`text-sm font-bold ${message.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {message.text}
                        </span>
                    )}
                    <button 
                         onClick={handleSave} 
                         disabled={saving} 
                         className="flex items-center justify-center gap-2 bg-slate-900 text-white font-bold text-[14px] px-6 py-2.5 rounded-full hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Settings */}
                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex flex-col gap-4">
                    <h2 className="text-lg font-bold text-slate-800 mb-2">Primary Contact</h2>
                    <div>
                        <label className="block text-[13px] font-bold text-slate-600 uppercase tracking-wider mb-2">Phone Number</label>
                        <input 
                            type="text" 
                            className="bg-slate-50 border border-slate-200 text-slate-800 text-[15px] rounded-[16px] w-full p-4 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                            value={config.phone} 
                            onChange={(e) => handleChange('phone', e.target.value)} 
                            placeholder="e.g. 01719188777"
                        />
                    </div>
                    <div>
                        <label className="block text-[13px] font-bold text-slate-600 uppercase tracking-wider mb-2">WhatsApp Number</label>
                        <input 
                            type="text" 
                            className="bg-slate-50 border border-slate-200 text-slate-800 text-[15px] rounded-[16px] w-full p-4 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                            value={config.whatsapp} 
                            onChange={(e) => handleChange('whatsapp', e.target.value)} 
                            placeholder="e.g. 8801719188777"
                        />
                    </div>
                    <div>
                        <label className="block text-[13px] font-bold text-slate-600 uppercase tracking-wider mb-2">Messenger URL</label>
                        <input 
                            type="text" 
                            className="bg-slate-50 border border-slate-200 text-slate-800 text-[15px] rounded-[16px] w-full p-4 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                            value={config.messenger} 
                            onChange={(e) => handleChange('messenger', e.target.value)} 
                            placeholder="e.g. https://m.me/iyabdshop"
                        />
                    </div>
                </div>

                {/* TikTok Settings */}
                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex flex-col gap-4">
                    <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 15.68a6.34 6.34 0 006.32 6.32c3.55 0 6.32-2.74 6.32-6.19V8.72a8.21 8.21 0 004.36 1.27v-3.4a4.4 4.4 0 01-2.41-.9z" fill="currentColor"/></svg>
                        TikTok Configuration
                    </h2>
                    <div>
                        <label className="block text-[13px] font-bold text-slate-600 uppercase tracking-wider mb-2">Embed Code URL</label>
                        <input 
                            type="text" 
                            className="bg-slate-50 border border-slate-200 text-slate-800 text-[15px] rounded-[16px] w-full p-4 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                            value={config.tiktokUrl} 
                            onChange={(e) => handleChange('tiktokUrl', e.target.value)} 
                            placeholder="e.g. https://www.tiktok.com/embed/@iyabdshop"
                        />
                    </div>
                    <div>
                        <label className="block text-[13px] font-bold text-slate-600 uppercase tracking-wider mb-2">Card Title</label>
                        <input 
                            type="text" 
                            className="bg-slate-50 border border-slate-200 text-slate-800 text-[15px] rounded-[16px] w-full p-4 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                            value={config.tiktokTitle} 
                            onChange={(e) => handleChange('tiktokTitle', e.target.value)} 
                            placeholder="e.g. TikTok"
                        />
                    </div>
                    <div>
                        <label className="block text-[13px] font-bold text-slate-600 uppercase tracking-wider mb-2">Card Username / Description</label>
                        <input 
                            type="text" 
                            className="bg-slate-50 border border-slate-200 text-slate-800 text-[15px] rounded-[16px] w-full p-4 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                            value={config.tiktokUsername} 
                            onChange={(e) => handleChange('tiktokUsername', e.target.value)} 
                            placeholder="e.g. @iyabdshop"
                        />
                    </div>
                </div>

                {/* YouTube Settings */}
                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex flex-col gap-4">
                    <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        YouTube Configuration
                    </h2>
                    <div>
                        <label className="block text-[13px] font-bold text-slate-600 uppercase tracking-wider mb-2">Channel URL</label>
                        <input 
                            type="text" 
                            className="bg-slate-50 border border-slate-200 text-slate-800 text-[15px] rounded-[16px] w-full p-4 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                            value={config.youtubeUrl} 
                            onChange={(e) => handleChange('youtubeUrl', e.target.value)} 
                            placeholder="e.g. https://www.youtube.com/@IYABD_01"
                        />
                    </div>
                    <div>
                        <label className="block text-[13px] font-bold text-slate-600 uppercase tracking-wider mb-2">Card Title</label>
                        <input 
                            type="text" 
                            className="bg-slate-50 border border-slate-200 text-slate-800 text-[15px] rounded-[16px] w-full p-4 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                            value={config.youtubeTitle} 
                            onChange={(e) => handleChange('youtubeTitle', e.target.value)} 
                            placeholder="e.g. YouTube"
                        />
                    </div>
                    <div>
                        <label className="block text-[13px] font-bold text-slate-600 uppercase tracking-wider mb-2">Card Handle / Description</label>
                        <input 
                            type="text" 
                            className="bg-slate-50 border border-slate-200 text-slate-800 text-[15px] rounded-[16px] w-full p-4 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                            value={config.youtubeUsername} 
                            onChange={(e) => handleChange('youtubeUsername', e.target.value)} 
                            placeholder="e.g. @IYABD_01"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenterSettings;
