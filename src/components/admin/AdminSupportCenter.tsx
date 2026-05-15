import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Save, Phone, Mail, Facebook, Youtube, Instagram, MapPin, Ticket, Bot, User, ArrowRight, Loader2, Plus, Trash2 } from 'lucide-react';
import { adminService } from '../../lib/adminServices';
import toast from 'react-hot-toast';

export const AdminSupportCenter = ({ setActiveTab }: any) => {
    const [activeTabName, setActiveTabName] = useState<'settings' | 'live-chat'>('settings');
    const [selectedChat, setSelectedChat] = useState<any>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [settings, setSettings] = useState({
        phone: '',
        whatsapp: '',
        messenger: '',
        emails: [''],
        social: {
            facebook: '',
            tiktok: '',
            youtube: '',
            instagram: ''
        },
        address: {
            text: '',
            mapUrl: ''
        }
    });

    useEffect(() => {
        const loadSettings = async () => {
            const data = await adminService.getSupportConfig();
            if (data) {
                setSettings({
                    phone: data.phone || '',
                    whatsapp: data.whatsapp || '',
                    messenger: data.messenger || '',
                    emails: data.emails?.length ? data.emails : [''],
                    social: {
                        facebook: data.social?.facebook || '',
                        tiktok: data.social?.tiktok || '',
                        youtube: data.social?.youtube || '',
                        instagram: data.social?.instagram || ''
                    },
                    address: {
                        text: data.address?.text || '',
                        mapUrl: data.address?.mapUrl || ''
                    }
                });
            }
            setLoading(false);
        };
        loadSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        const success = await adminService.updateSupportConfig({
            ...settings,
            emails: settings.emails.filter(e => e.trim() !== '')
        });
        if (success) {
            toast.success("Support settings saved securely");
        } else {
            toast.error("Failed to save settings");
        }
        setSaving(false);
    };

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Messenger / Support Center</h2>
                    <p className="text-slate-500 text-sm mt-1 font-medium">Control customer support, AI settings, and live chats.</p>
                </div>
                
                <div className="flex bg-slate-100/80 p-1 rounded-xl">
                    <button 
                        onClick={() => setActiveTabName('settings')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTabName === 'settings' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Support Settings
                    </button>
                    <button 
                        onClick={() => setActiveTabName('live-chat')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTabName === 'live-chat' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Live Chat <span className="flex items-center justify-center bg-purple-600 text-white rounded-full w-5 h-5 text-[10px]">3</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="animate-spin text-purple-600" size={32} />
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    {activeTabName === 'settings' ? (
                        <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                            
                            {/* Quick Support Controls */}
                            <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6 sm:p-8">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                   <Phone className="text-blue-500" size={20} /> Quick Support Controls
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Support Phone Number</label>
                                        <input type="text" value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-sm font-medium focus:border-purple-500 outline-none transition-all" placeholder="+8801XXXXXXXXX" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">WhatsApp Number</label>
                                        <input type="text" value={settings.whatsapp} onChange={e => setSettings({...settings, whatsapp: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-sm font-medium focus:border-purple-500 outline-none transition-all" placeholder="8801XXXXXXXXX" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Messenger URL</label>
                                        <input type="text" value={settings.messenger} onChange={e => setSettings({...settings, messenger: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-sm font-medium focus:border-purple-500 outline-none transition-all" placeholder="https://m.me/yourpage" />
                                    </div>
                                </div>
                            </div>

                            {/* Email Support */}
                            <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6 sm:p-8">
                                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                   <Mail className="text-rose-500" size={20} /> Support Emails
                                </h3>
                                <div className="space-y-4">
                                    {settings.emails.map((email, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input 
                                                type="email" 
                                                value={email} 
                                                onChange={e => {
                                                    const newEmails = [...settings.emails];
                                                    newEmails[idx] = e.target.value;
                                                    setSettings({...settings, emails: newEmails});
                                                }} 
                                                className="flex-1 bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-sm font-medium focus:border-purple-500 outline-none transition-all" 
                                                placeholder="support@iyabd.com" 
                                            />
                                            {settings.emails.length > 1 && (
                                                <button onClick={() => {
                                                    setSettings({...settings, emails: settings.emails.filter((_, i) => i !== idx)});
                                                }} className="bg-rose-50 text-rose-600 w-12 rounded-2xl flex items-center justify-center hover:bg-rose-100 transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button onClick={() => setSettings({...settings, emails: [...settings.emails, '']})} className="text-sm font-bold text-purple-600 flex items-center gap-2 hover:bg-purple-50 px-4 py-2 rounded-xl transition-all">
                                        <Plus size={16} /> Add another email
                                    </button>
                                </div>
                            </div>

                            {/* Social Media Links */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6 sm:p-8">
                                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <Facebook className="text-blue-600" size={20} /> Social Media Links
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Facebook</label>
                                            <input type="text" value={settings.social.facebook} onChange={e => setSettings({...settings, social: {...settings.social, facebook: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm font-medium focus:border-purple-500 outline-none transition-all" placeholder="https://facebook.com/..." />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">TikTok</label>
                                            <input type="text" value={settings.social.tiktok} onChange={e => setSettings({...settings, social: {...settings.social, tiktok: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm font-medium focus:border-purple-500 outline-none transition-all" placeholder="https://tiktok.com/..." />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">YouTube</label>
                                            <input type="text" value={settings.social.youtube} onChange={e => setSettings({...settings, social: {...settings.social, youtube: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm font-medium focus:border-purple-500 outline-none transition-all" placeholder="https://youtube.com/..." />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Instagram</label>
                                            <input type="text" value={settings.social.instagram} onChange={e => setSettings({...settings, social: {...settings.social, instagram: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-sm font-medium focus:border-purple-500 outline-none transition-all" placeholder="https://instagram.com/..." />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6 sm:p-8">
                                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <MapPin className="text-emerald-500" size={20} /> Address Settings
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Company Address</label>
                                            <textarea value={settings.address.text} onChange={e => setSettings({...settings, address: {...settings.address, text: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-sm font-medium focus:border-purple-500 outline-none transition-all min-h-[100px] resize-y" placeholder="House 123, Road 4..."></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Google Map Embed URL</label>
                                            <input type="text" value={settings.address.mapUrl} onChange={e => setSettings({...settings, address: {...settings.address, mapUrl: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-sm font-medium focus:border-purple-500 outline-none transition-all" placeholder="https://www.google.com/maps/embed?pb=..." />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleSave} disabled={saving} className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold px-10 py-4 rounded-2xl flex items-center justify-center gap-2 hover:from-purple-700 hover:to-indigo-700 transition-all active:scale-[0.98] shadow-lg shadow-purple-600/30">
                                {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                Save Support Settings
                            </button>

                        </motion.div>
                    ) : (
                        <motion.div key="live-chat" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
                            {/* Left pane: lists */}
                            <div className="lg:col-span-1 space-y-4 flex flex-col h-full">
                                <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-4 flex-1 overflow-hidden flex flex-col">
                                    <h3 className="text-[13px] font-black text-slate-800 tracking-wide mb-4">Live Customer Messages</h3>
                                    <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                                        {[1, 2, 3].map((i) => (
                                            <button key={i} onClick={() => setSelectedChat(i)} className={`w-full text-left p-3 rounded-xl transition-all ${selectedChat === i ? 'bg-purple-50 border border-purple-100 shadow-sm' : 'hover:bg-slate-50 border border-transparent'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white flex items-center justify-center shrink-0 shadow-md">
                                                        <User size={18} />
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-sm font-bold text-slate-800 truncate">Customer #{i}00{i}</h4>
                                                            <span className="text-[10px] font-medium text-slate-400">10m ago</span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 truncate mt-0.5">I need help with my order...</p>
                                                    </div>
                                                    {i === 1 && (
                                                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Main pane: chat conversation */}
                            <div className="lg:col-span-2 flex flex-col h-full">
                                <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
                                    {selectedChat ? (
                                        <>
                                            <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 text-white flex items-center justify-center shadow-md border-2 border-white">
                                                        <User size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-800 text-lg leading-tight">Customer #{selectedChat}00{selectedChat}</h3>
                                                        <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Online
                                                        </p>
                                                    </div>
                                                </div>
                                                <button className="text-xs font-bold text-purple-600 bg-purple-50 px-4 py-2 rounded-xl hover:bg-purple-100 transition-colors">Resolve Chat</button>
                                            </div>
                                            <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50/50">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
                                                        <User size={14} className="text-white" />
                                                    </div>
                                                    <div className="bg-white border text-slate-700 border-slate-200 p-4 rounded-2xl rounded-tl-sm shadow-sm max-w-[80%] text-sm font-medium">
                                                        Hello, can you check on order #ORD-8482?
                                                        <span className="block text-[10px] text-slate-400 mt-2">10:42 AM</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-3">
                                                    <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-4 rounded-2xl rounded-tr-sm shadow-md shadow-purple-600/20 max-w-[80%] text-sm font-medium border border-purple-500">
                                                        Hi! Let me check the status for you.
                                                        <span className="block text-[10px] text-white/70 mt-2">10:45 AM &bull; Read</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-white border-t border-slate-100">
                                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-[16px] px-2 py-1 focus-within:border-purple-400 focus-within:ring-2 ring-purple-100 transition-all">
                                                    <button className="w-10 h-10 text-slate-400 hover:text-purple-600 rounded-xl flex items-center justify-center transition-colors">
                                                        <Plus size={20} />
                                                    </button>
                                                    <input type="text" placeholder="Type a reply..." className="flex-1 bg-transparent px-2 py-3 text-sm focus:outline-none font-medium" />
                                                    <button className="w-10 h-10 bg-purple-600 text-white rounded-[12px] flex items-center justify-center hover:bg-purple-700 active:scale-95 transition-all shadow-sm">
                                                        <MessageCircle size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                                            <MessageCircle size={64} className="mb-4 opacity-20" />
                                            <h3 className="font-bold text-lg text-slate-600">No Chat Selected</h3>
                                            <p className="text-sm font-medium mt-1">Select a customer from the left to start chatting</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
};
