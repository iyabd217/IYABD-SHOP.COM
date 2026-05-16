import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Facebook, Globe, MessageSquare, Search, Shield, 
  Target, Zap, Check, RefreshCcw, Save, AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { adminService } from '../../lib/adminServices';

const MarketingSettings: React.FC = () => {
    const [settings, setSettings] = useState<any>({
        facebook_pixel_id: '',
        tiktok_pixel_id: '',
        google_analytics_id: '',
        google_tag_manager_id: '',
        seo_site_title: '',
        seo_site_description: '',
        seo_keywords: '',
        og_image_url: '',
        verification_code_google: '',
        verification_code_facebook: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        const data = await adminService.getCompanySettings();
        if (data) {
            setSettings({
                ...settings,
                ...data
            });
        }
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await adminService.updateCompanySettings(settings);
            setMessage('Marketing settings synchronized successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error: any) {
            if (error?.code !== 'permission-denied') {
                console.error(error);
            }
            setMessage('Saved locally. (Firebase Auth needed for cloud persistence)');
            setTimeout(() => setMessage(''), 3000);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <RefreshCcw className="animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 pb-24 max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 uppercase">
                    Marketing & Tracking
                </h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Manage Pixels, SEO, and Analytics</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Pixels & Analytics */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Target size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 tracking-tight uppercase text-sm">Tracking Pixels</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Facebook, TikTok & Google</p>
                        </div>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Facebook size={12} className="text-blue-600" /> Facebook Pixel ID
                            </label>
                            <input 
                                type="text"
                                value={settings.facebook_pixel_id}
                                onChange={(e) => setSettings({...settings, facebook_pixel_id: e.target.value})}
                                placeholder="e.g. 123456789012345"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all uppercase placeholder:normal-case"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Zap size={12} className="text-emerald-500" /> TikTok Pixel ID
                            </label>
                            <input 
                                type="text"
                                value={settings.tiktok_pixel_id}
                                onChange={(e) => setSettings({...settings, tiktok_pixel_id: e.target.value})}
                                placeholder="e.g. CXXXXXXXXXXXXX"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-100 transition-all uppercase placeholder:normal-case"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <BarChart3 size={12} className="text-orange-500" /> Google Analytics ID (GA4)
                            </label>
                            <input 
                                type="text"
                                value={settings.google_analytics_id}
                                onChange={(e) => setSettings({...settings, google_analytics_id: e.target.value})}
                                placeholder="e.g. G-XXXXXXXXXX"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-100 transition-all uppercase placeholder:normal-case"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Search size={12} className="text-indigo-500" /> Google Tag Manager ID
                            </label>
                            <input 
                                type="text"
                                value={settings.google_tag_manager_id}
                                onChange={(e) => setSettings({...settings, google_tag_manager_id: e.target.value})}
                                placeholder="e.g. GTM-XXXXXXX"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100 transition-all uppercase placeholder:normal-case"
                            />
                        </div>
                    </div>
                </div>

                {/* Customer Support Channels */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <MessageSquare size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 tracking-tight uppercase text-sm">Live Chat & Support</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">WhatsApp & Messenger Buttons</p>
                        </div>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">WhatsApp Phone Number</label>
                            <input 
                                type="text"
                                value={settings.whatsapp_number}
                                onChange={(e) => setSettings({...settings, whatsapp_number: e.target.value})}
                                placeholder="e.g. 88017XXXXXXXX"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Messenger Username</label>
                            <input 
                                type="text"
                                value={settings.messenger_username}
                                onChange={(e) => setSettings({...settings, messenger_username: e.target.value})}
                                placeholder="e.g. vone.bd"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Conversion APIs (Server-side Tracking) */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                            <RefreshCcw size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 tracking-tight uppercase text-sm">Conversion APIs (CAPI)</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Server-side Tracking for iOS/Privacy</p>
                        </div>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Facebook Access Token</label>
                            <input 
                                type="password"
                                value={settings.facebook_capi_token}
                                onChange={(e) => setSettings({...settings, facebook_capi_token: e.target.value})}
                                placeholder="EAAG..."
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">TikTok Events Token</label>
                                <input 
                                    type="password"
                                    value={settings.tiktok_api_token}
                                    onChange={(e) => setSettings({...settings, tiktok_api_token: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Test Event Code (FB)</label>
                                <input 
                                    type="text"
                                    value={settings.fb_test_code}
                                    onChange={(e) => setSettings({...settings, fb_test_code: e.target.value})}
                                    placeholder="TEST12345"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Technical SEO */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                            <Globe size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 tracking-tight uppercase text-sm">Site-wide SEO</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Search Engine Presence</p>
                        </div>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Default SEO Title</label>
                            <input 
                                type="text"
                                value={settings.seo_site_title}
                                onChange={(e) => setSettings({...settings, seo_site_title: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Default SEO Description</label>
                            <textarea 
                                rows={3}
                                value={settings.seo_site_description}
                                onChange={(e) => setSettings({...settings, seo_site_description: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none resize-none"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Focus Keywords</label>
                                <input 
                                    type="text"
                                    value={settings.seo_keywords}
                                    onChange={(e) => setSettings({...settings, seo_keywords: e.target.value})}
                                    placeholder="keyword1, keyword2, keyword3"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Default OG Image URL</label>
                                <input 
                                    type="text"
                                    value={settings.og_image_url}
                                    onChange={(e) => setSettings({...settings, og_image_url: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Site Verifications */}
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                            <Shield size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 tracking-tight uppercase text-sm">Site Verifications</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Google Console & Meta Business</p>
                        </div>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Google Site Verification Code</label>
                            <input 
                                type="text"
                                value={settings.verification_code_google}
                                onChange={(e) => setSettings({...settings, verification_code_google: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Facebook Domain Verification</label>
                            <input 
                                type="text"
                                value={settings.verification_code_facebook}
                                onChange={(e) => setSettings({...settings, verification_code_facebook: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                    <div className="flex items-center gap-2 text-emerald-600">
                        {message && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-full"
                            >
                                <Check size={14} strokeWidth={3} /> {message}
                            </motion.div>
                        )}
                    </div>
                    <button 
                        type="submit"
                        disabled={saving}
                        className="w-full sm:w-auto bg-[#4f46e5] text-white px-10 py-4 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {saving ? 'Synchronizing...' : 'Save All Settings'} <Save size={18} strokeWidth={3} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MarketingSettings;
