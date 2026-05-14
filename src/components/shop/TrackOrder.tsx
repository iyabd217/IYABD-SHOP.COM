import React, { useState } from 'react';
import { 
  Search, Truck, Package, Clock, CheckCircle2, 
  AlertCircle, ChevronRight, MapPin, Calendar, 
  ArrowLeft, Phone, ExternalLink
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { adminService } from '../../lib/adminServices';
import { formatPrice } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const TrackOrder = () => {
    const [orderId, setOrderId] = useState('');
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId) return;
        
        setLoading(true);
        setError('');
        setOrder(null);

        try {
            // In a real system, we'd have a public endpoint for this.
            // For now, we simulate by fetching all orders and finding the one.
            const allOrders = await adminService.getOrders();
            const foundOrder = (allOrders as any[]).find(o => 
                o.id === orderId || 
                o.id.slice(-8) === orderId || 
                o.tracking_id === orderId
            );

            if (foundOrder) {
                setOrder(foundOrder);
            } else {
                setError('Order not found. Please check your Order ID or Tracking ID.');
            }
        } catch (e) {
            setError('Could not fetch order details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const statusSteps = [
        { id: 'PROCESSING', label: 'Confirmed', icon: CheckCircle2, color: 'text-emerald-500' },
        { id: 'SHIPPED', label: 'In Transit', icon: Truck, color: 'text-blue-500' },
        { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Package, color: 'text-amber-500' },
        { id: 'DELIVERED', label: 'Delivered', icon: CheckCircle2, color: 'text-emerald-600' }
    ];

    const currentStepIndex = statusSteps.findIndex(s => s.id === (order?.shippingStatus || 'PROCESSING'));

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/50 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-100/50 rounded-full blur-[80px] pointer-events-none" />

            <div className="max-w-xl mx-auto px-6 py-12 relative z-10">
                <button 
                  onClick={() => navigate('/')}
                  className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-10"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-black uppercase tracking-widest">Back to Store</span>
                </button>

                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-[32px] shadow-xl mb-6 relative overflow-hidden">
                        <Truck size={36} className="text-slate-900 relative z-10" />
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 opacity-50" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-3">Track Your Order</h1>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto">Enter your Order ID or Tracking Number to see live delivery updates.</p>
                </div>

                <form onSubmit={handleTrack} className="mb-10">
                    <div className="relative group">
                        <input 
                            type="text" 
                            placeholder="Order ID / Tracking ID" 
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            className="w-full bg-white border-2 border-slate-100 rounded-[28px] px-8 py-5 text-lg font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:border-slate-900 focus:ring-8 focus:ring-slate-900/5 transition-all shadow-lg"
                        />
                        <button 
                            type="submit"
                            disabled={loading || !orderId}
                            className="absolute right-3 top-3 bottom-3 bg-slate-900 text-white rounded-[22px] px-8 font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : 'Track'}
                        </button>
                    </div>
                    {error && (
                        <p className="mt-4 text-center text-rose-500 text-xs font-bold bg-rose-50 p-3 rounded-xl border border-rose-100">
                           {error}
                        </p>
                    )}
                </form>

                <AnimatePresence mode="wait">
                    {order && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-6"
                        >
                            {/* Status Timeline */}
                            <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                                <div className="flex justify-between items-center mb-10">
                                    <div className="flex flex-col">
                                         <span className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] mb-1">Status</span>
                                         <span className={`text-xl font-black uppercase tracking-tight ${order.shippingStatus === 'CANCELLED' ? 'text-rose-500' : 'text-slate-900'}`}>
                                            {order.shippingStatus.replace('_', ' ')}
                                         </span>
                                    </div>
                                    <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 text-right">
                                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Order ID</p>
                                         <p className="text-xs font-mono font-bold text-slate-800">#{order.id.slice(-8).toUpperCase()}</p>
                                    </div>
                                </div>

                                <div className="relative flex justify-between items-center px-2">
                                    <div className="absolute left-8 right-8 h-1 bg-slate-100 top-5 z-0" />
                                    <div 
                                        className="absolute left-8 h-1 bg-emerald-500 top-5 z-0 transition-all duration-1000" 
                                        style={{ width: `${Math.max(0, (currentStepIndex / (statusSteps.length - 1)) * 100)}%` }}
                                    />
                                    
                                    {statusSteps.map((step, idx) => {
                                        const isCompleted = idx <= currentStepIndex;
                                        const isActive = idx === currentStepIndex;

                                        return (
                                            <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-4 ring-white' : 'bg-white text-slate-300 border-2 border-slate-100'}`}>
                                                    <step.icon size={18} strokeWidth={isActive ? 3 : 2} />
                                                </div>
                                                <span className={`text-[9px] font-black uppercase tracking-widest text-center whitespace-nowrap ${isCompleted ? 'text-slate-900' : 'text-slate-300'}`}>
                                                    {step.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Shipment Info Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                                        <Truck size={20} />
                                    </div>
                                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Courier</p>
                                    <p className="text-sm font-black text-slate-800">{order.courier_name || 'Processing'}</p>
                                    {order.tracking_id && (
                                        <p className="text-[10px] font-mono font-bold text-blue-500 mt-1">{order.tracking_id}</p>
                                    )}
                                </div>
                                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                                        <MapPin size={20} />
                                    </div>
                                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Destination</p>
                                    <p className="text-sm font-black text-slate-800 line-clamp-1">{order.district || 'Dhaka'}</p>
                                    <p className="text-[10px] font-bold text-slate-500 mt-1">{order.upazila || '...'}</p>
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-[32px] p-6 text-white overflow-hidden relative">
                                <div className="relative z-10 flex justify-between items-center">
                                    <div>
                                        <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-1">Expected Delivery</p>
                                        <p className="text-lg font-black tracking-tight underline decoration-purple-500 underline-offset-4 decoration-2">2 - 4 business days</p>
                                    </div>
                                    <Link to="/help" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all">
                                        <Phone size={18} />
                                    </Link>
                                </div>
                            </div>

                            {order.tracking_url && (
                                <a 
                                    href={order.tracking_url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="w-full h-16 bg-white border-2 border-slate-900 rounded-[24px] flex items-center justify-center gap-3 text-slate-900 font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-sm group"
                                >
                                    Live Courier Tracking <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </a>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TrackOrder;
