import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Truck, CreditCard, ChevronRight } from 'lucide-react';
import { useCart } from '../../lib/cartContext';
import { useAuth } from '../../lib/authContext';

export default function CheckoutForm({ onOrderConfirm }: { onOrderConfirm: (data: any) => void }) {
  const { cart } = useCart();
  const { profile } = useAuth();
  
  const [formData, setFormData] = useState({
    name: profile?.displayName || '',
    phone: '',
    address: profile?.address || '',
    division: profile?.division || '',
    district: profile?.district || '',
    area: profile?.area || '',
    deliveryMethod: 'dhaka',
    paymentMethod: 'cod'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOrderConfirm(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Basic Info */}
      <div className="marketplace-card p-6 border-none shadow-sm">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 block">Delivery Information</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <input type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-slate-50 p-4 rounded-xl text-sm font-bold w-full" required />
           <input type="tel" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-slate-50 p-4 rounded-xl text-sm font-bold w-full" required />
           <input type="text" placeholder="Full Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="bg-slate-50 p-4 rounded-xl text-sm font-bold w-full col-span-full" required />
        </div>
      </div>

      {/* Delivery & Payment */}
      <div className="marketplace-card p-6 border-none shadow-sm">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 block">Delivery & Payment</label>
        <div className="space-y-4">
            <select value={formData.deliveryMethod} onChange={e => setFormData({...formData, deliveryMethod: e.target.value})} className="bg-slate-50 p-4 rounded-xl text-sm font-bold w-full">
                <option value="dhaka">Inside Dhaka (৳70)</option>
                <option value="outside">Outside Dhaka (৳130)</option>
            </select>
            <select value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="bg-slate-50 p-4 rounded-xl text-sm font-bold w-full">
                <option value="cod">Cash on Delivery</option>
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
            </select>
        </div>
      </div>

      <button type="submit" className="w-full bg-gradient-to-r from-[#ff2d8d] to-[#ff4fa3] text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20">
        Confirm Order
      </button>
    </form>
  );
};
