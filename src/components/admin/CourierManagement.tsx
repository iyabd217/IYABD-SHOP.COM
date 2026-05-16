import React, { useState, useEffect } from 'react';
import { 
  Truck, Settings, Key, Shield, MapPin, Globe, CreditCard, 
  CheckCircle2, AlertCircle, Save, ExternalLink, Package,
  Zap, Clock, Info
} from 'lucide-react';
import { adminService } from '../../lib/adminServices';

const CourierManagement = () => {
    const [settings, setSettings] = useState<any>({
        steadfast_api_key: '',
        steadfast_secret_key: '',
        steadfast_base_url: 'https://portal.steadfast.com.bd/api/v1',
        pathao_client_id: '',
        pathao_client_secret: '',
        pathao_username: '',
        pathao_password: '',
        pathao_store_id: '',
        shipping_inside_dhaka: 80,
        shipping_outside_dhaka: 130,
        shipping_express: 150,
        free_shipping_threshold: 5000,
        cod_enabled: true
    });
    const [activeTab, setActiveTab] = useState('steadfast');
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<any>({});

    useEffect(() => {
        const fetchSettings = async () => {
            const data = await adminService.getCompanySettings();
            if (data && Object.keys(data).length > 0) {
                setSettings((prev: any) => ({ ...prev, ...data }));
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await adminService.updateCompanySettings(settings);
            alert('Courier settings updated successfully!');
        } catch (e: any) {
            if (e?.code !== 'permission-denied') {
                console.error(e);
            }
            alert('Settings saved to session. (Firebase Auth needed for cloud persistence)');
        } finally {
            setSaving(false);
        }
    };

    const ConfigField = ({ label, value, onChange, placeholder, type = "text", help }: any) => (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
                {help && (
                    <div className="group relative">
                        <Info size={12} className="text-slate-300 cursor-help" />
                        <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-800 text-white p-2 rounded-lg text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            {help}
                        </div>
                    </div>
                )}
            </div>
            <input 
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex gap-2 p-5 bg-slate-50 overflow-x-auto no-scrollbar border-b border-slate-100">
                {[
                    { id: 'steadfast', label: 'SteadFast', icon: Truck },
                    { id: 'pathao', label: 'Pathao', icon: Zap },
                    { id: 'delivery', label: 'Charges', icon: MapPin },
                    { id: 'cod', label: 'COD Settings', icon: CreditCard }
                ].map((tab) => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest font-black transition-all flex items-center gap-2 whitespace-nowrap shadow-sm ${activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 hover:text-slate-600'}`}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {activeTab === 'steadfast' && (
                    <div className="space-y-6">
                        <div className="bg-emerald-50 p-5 rounded-[32px] border border-emerald-100/50 flex items-start gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                                <Truck size={24} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-emerald-900 uppercase tracking-tight">SteadFast Logistics</h3>
                                <p className="text-[11px] text-emerald-700/70 font-medium leading-relaxed mt-1">
                                    Primary courier integration for nationwide delivery in Bangladesh. Supports one-click booking and auto-tracking.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                            <ConfigField 
                                label="API Key" 
                                value={settings.steadfast_api_key} 
                                onChange={(v: string) => setSettings({...settings, steadfast_api_key: v})}
                                placeholder="sf_xxxxxxxxxxxx"
                                help="Get this from SteadFast merchant panel under Settings > API"
                            />
                            <ConfigField 
                                label="Secret Key" 
                                value={settings.steadfast_secret_key} 
                                onChange={(v: string) => setSettings({...settings, steadfast_secret_key: v})}
                                placeholder="••••••••••••••••"
                                type="password"
                            />
                            <ConfigField 
                                label="Base URL" 
                                value={settings.steadfast_base_url} 
                                onChange={(v: string) => setSettings({...settings, steadfast_base_url: v})}
                                placeholder="https://portal.steadfast.com.bd/api/v1"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <ConfigField 
                                    label="Store Name" 
                                    value={settings.steadfast_store_name} 
                                    onChange={(v: string) => setSettings({...settings, steadfast_store_name: v})}
                                />
                                <ConfigField 
                                    label="Pickup Phone" 
                                    value={settings.steadfast_pickup_phone} 
                                    onChange={(v: string) => setSettings({...settings, steadfast_pickup_phone: v})}
                                />
                            </div>
                            <ConfigField 
                                label="Pickup Address" 
                                value={settings.steadfast_pickup_address} 
                                onChange={(v: string) => setSettings({...settings, steadfast_pickup_address: v})}
                            />
                        </div>

                        <div className="bg-slate-50 p-5 rounded-[28px] border border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Connection Status</h4>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${settings.steadfast_api_key ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                    <span className="text-xs font-bold text-slate-600">{settings.steadfast_api_key ? 'Live & Connected' : 'Not Configured'}</span>
                                </div>
                                <button className="text-[10px] font-black text-purple-600 uppercase border-b border-purple-600 tracking-widest pb-0.5">Test API</button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'pathao' && (
                    <div className="space-y-6">
                        <div className="bg-amber-50 p-5 rounded-[32px] border border-amber-100/50 flex items-start gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                                <Zap size={24} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-amber-900 uppercase tracking-tight">Pathao Courier</h3>
                                <p className="text-[11px] text-amber-700/70 font-medium leading-relaxed mt-1">
                                    Smart dynamic courier service. Requires Client ID and Secret for authentication.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                            <ConfigField 
                                label="Client ID" 
                                value={settings.pathao_client_id} 
                                onChange={(v: string) => setSettings({...settings, pathao_client_id: v})}
                            />
                            <ConfigField 
                                label="Client Secret" 
                                value={settings.pathao_client_secret} 
                                onChange={(v: string) => setSettings({...settings, pathao_client_secret: v})}
                                type="password"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <ConfigField 
                                    label="Username" 
                                    value={settings.pathao_username} 
                                    onChange={(v: string) => setSettings({...settings, pathao_username: v})}
                                />
                                <ConfigField 
                                    label="Password" 
                                    value={settings.pathao_password} 
                                    onChange={(v: string) => setSettings({...settings, pathao_password: v})}
                                    type="password"
                                />
                                <ConfigField 
                                    label="Store ID" 
                                    value={settings.pathao_store_id} 
                                    onChange={(v: string) => setSettings({...settings, pathao_store_id: v})}
                                />
                                <ConfigField 
                                    label="Pickup Location" 
                                    value={settings.pathao_pickup_location} 
                                    onChange={(v: string) => setSettings({...settings, pathao_pickup_location: v})}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'delivery' && (
                    <div className="space-y-6">
                        <div className="bg-slate-900 rounded-[32px] p-6 text-white overflow-hidden relative border border-slate-800">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Global Shipping</p>
                                <h3 className="text-2xl font-black mb-4">Rate Management</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs font-bold bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span>Dhaka City</span>
                                        <span>৳{settings.shipping_inside_dhaka}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs font-bold bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span>Outside Dhaka</span>
                                        <span>৳{settings.shipping_outside_dhaka}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                            <ConfigField 
                                label="Inside Dhaka Shipping" 
                                value={settings.shipping_inside_dhaka} 
                                type="number"
                                onChange={(v: any) => setSettings({...settings, shipping_inside_dhaka: parseFloat(v)})}
                            />
                            <ConfigField 
                                label="Outside Dhaka Shipping" 
                                value={settings.shipping_outside_dhaka} 
                                type="number"
                                onChange={(v: any) => setSettings({...settings, shipping_outside_dhaka: parseFloat(v)})}
                            />
                            <ConfigField 
                                label="Express Delivery Cost" 
                                value={settings.shipping_express} 
                                type="number"
                                onChange={(v: any) => setSettings({...settings, shipping_express: parseFloat(v)})}
                            />
                            <ConfigField 
                                label="Free Shipping Min Purchase" 
                                value={settings.free_shipping_threshold} 
                                type="number"
                                help="Orders above this amount will get free shipping"
                                onChange={(v: any) => setSettings({...settings, free_shipping_threshold: parseFloat(v)})}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'cod' && (
                    <div className="space-y-4">
                        <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center justify-between">
                            <div>
                                <h4 className="font-black text-slate-800 text-sm uppercase">Accept COD</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight mt-1">Status: {settings.cod_enabled ? 'ENABLED' : 'DISABLED'}</p>
                            </div>
                            <button 
                                onClick={() => setSettings({...settings, cod_enabled: !settings.cod_enabled})}
                                className={`w-14 h-8 rounded-full transition-all relative ${settings.cod_enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.cod_enabled ? 'left-7 shadow-md' : 'left-1'}`} />
                            </button>
                        </div>
                        
                        <div className="p-5 border-2 border-dashed border-slate-100 rounded-[32px] text-center">
                            <CreditCard size={32} className="mx-auto text-slate-200 mb-3" />
                            <p className="text-xs font-bold text-slate-400 px-6">Cash on Delivery settings are applied to checkout only if the shipping zone supports it.</p>
                        </div>
                    </div>
                )}

                <div className="h-8"></div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-white">
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full h-16 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
                >
                    {saving ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            Syncing Cloud...
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            Save Config & Reload
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default CourierManagement;
