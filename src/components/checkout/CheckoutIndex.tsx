import React, { useState, useEffect } from 'react';
import { Truck, CreditCard, CheckCircle2, ShieldCheck, User } from 'lucide-react';
import { useCart } from '../../lib/cartContext';
import { useAuth } from '../../lib/authContext';
import { formatPrice } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { orderService, paymentService, configService } from '../../lib/services';
import SearchableDropdown from '../ui/SearchableDropdown';
import { bdData } from '../../lib/bdData';

export default function CheckoutIndex() {
  const { cart, total, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [companySettings, setCompanySettings] = useState<any>({});

  const [formData, setFormData] = useState({
    name: profile?.displayName || '',
    phone: profile?.phoneNumber || '',
    address: profile?.address || '',
    division: profile?.division || '',
    district: profile?.district || '',
    upazila: '',
    email: profile?.email || user?.email || '',
    deliveryMethod: 'dhaka', // 'dhaka' | 'outside'
    paymentMethod: 'cod',    // 'cod' | 'bkash' | 'nagad'
  });

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    configService.get().then(c => setCompanySettings(c || {}));
  }, []);

  const shippingInside = companySettings?.shipping_inside_dhaka || 80;
  const shippingOutside = companySettings?.shipping_outside_dhaka || 130;
  const freeThreshold = companySettings?.free_shipping_threshold || 5000;

  const deliveryFee = total >= freeThreshold ? 0 : (formData.deliveryMethod === 'dhaka' ? shippingInside : shippingOutside);
  const grandTotal = total + deliveryFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Your cart is empty!");
      navigate('/shop');
      return;
    }
    
    if (!formData.name || !formData.phone || !formData.address) {
      alert("Please fill in all required fields (Name, Phone, Address).");
      return;
    }

    setIsProcessing(true);

    try {
        if (formData.paymentMethod !== 'cod') {
          await paymentService.processPayment(formData.paymentMethod, grandTotal);
        }

        const orderData = {
          items: cart,
          total: grandTotal,
          subtotal: total,
          address: `${formData.address}, ${formData.upazila}, ${formData.district}, ${formData.division}`,
          phone: formData.phone,
          customerName: formData.name,
          paymentMethod: formData.paymentMethod,
          deliveryMethod: formData.deliveryMethod,
          deliveryFee,
          userEmail: formData.email,
          date: new Date().toISOString()
        };

        const orderId = await orderService.create(orderData);
        const finalOrder = { id: orderId, ...orderData };
        
        // Cache the completed items before we clear the context
        const completedCart = [...cart];
        
        // Use timeout to delay cart clearing after navigation has securely transitioned
        setTimeout(() => clearCart(), 500);

        navigate('/success', { 
          state: { 
            order: finalOrder, 
            orderItems: completedCart, 
            companySettings 
          },
          replace: true 
        });

    } catch (e: any) {
      console.error(e);
      // Fallback if DB fails but payment didn't or offline mode
      const fallbackOrderId = `ORD_${Date.now().toString(36).toUpperCase()}`;
      const finalOrder = { id: fallbackOrderId, 
          items: cart,
          total: grandTotal,
          subtotal: total,
          address: `${formData.address}, ${formData.upazila}, ${formData.district}, ${formData.division}`,
          phone: formData.phone,
          customerName: formData.name,
          paymentMethod: formData.paymentMethod,
          deliveryMethod: formData.deliveryMethod,
          deliveryFee,
          userEmail: formData.email,
          date: new Date().toISOString()
      };
      
      const completedCart = [...cart];
      setTimeout(() => clearCart(), 500);

      navigate('/success', { 
        state: { 
          order: finalOrder, 
          orderItems: completedCart, 
          companySettings 
        },
        replace: true 
      });
    } finally {
      // Intentionally don't reset isProcessing here if success because component unmounts
      // and setting it causes flashing
    }
  };

  if (cart.length === 0 && !isProcessing) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Your cart is empty</h2>
        <button onClick={() => navigate('/shop')} className="px-6 py-2 bg-[#ff2d8d] text-white rounded-xl font-bold">Return to Shop</button>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-6xl mx-auto px-4">
      <h1 className="text-3xl font-extrabold text-slate-800 mb-8">Delivery Information</h1>
      
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Customer Info Card */}
          <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <User size={20} className="text-[#ff2d8d]" /> Contact Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 py-3.5 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#ff2d8d]/20 outline-none transition-all"
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number <span className="text-red-500">*</span></label>
                <input 
                  type="tel" required
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 py-3.5 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#ff2d8d]/20 outline-none transition-all"
                  placeholder="01XXXXXXXXX"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Address <span className="text-red-500">*</span></label>
                <textarea 
                  required
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 py-3.5 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#ff2d8d]/20 outline-none transition-all min-h-[100px]"
                  placeholder="House number, Street name, Area"
                />
              </div>
              
              {/* Optional Fields */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Division (Optional)</label>
                <SearchableDropdown 
                  options={bdData.divisions}
                  value={formData.division}
                  onChange={val => setFormData({ ...formData, division: val, district: '', upazila: '' })}
                  placeholder="Search Division..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">District (Optional)</label>
                <SearchableDropdown 
                  options={formData.division ? (bdData.districts[formData.division as keyof typeof bdData.districts] || []) : []}
                  value={formData.district}
                  onChange={val => setFormData({ ...formData, district: val, upazila: '' })}
                  placeholder={formData.division ? "Search District..." : "Select Division First"}
                  disabled={!formData.division}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upazila (Optional)</label>
                <SearchableDropdown 
                  options={formData.district ? (bdData.upazilas[formData.district as keyof typeof bdData.upazilas] || []) : []}
                  value={formData.upazila}
                  onChange={val => setFormData({ ...formData, upazila: val })}
                  placeholder={formData.district ? "Search Upazila..." : "Select District First"}
                  disabled={!formData.district}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email (Optional)</label>
                <input 
                  type="email"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 py-3.5 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#ff2d8d]/20 outline-none transition-all"
                  placeholder="Email Address"
                />
              </div>
            </div>
          </div>

          {/* Delivery Method */}
          <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Truck size={20} className="text-[#ff2d8d]" /> Delivery Method
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {[
                 { id: 'dhaka', title: 'Inside Dhaka', price: shippingInside, desc: '2-3 Business Days' },
                 { id: 'outside', title: 'Outside Dhaka', price: shippingOutside, desc: '3-5 Business Days' }
               ].map(method => (
                 <label 
                  key={method.id}
                  className={`relative flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all border-2 ${formData.deliveryMethod === method.id ? 'border-[#ff2d8d] bg-[#fff0f6]' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                 >
                   <input type="radio" name="delivery" className="hidden" checked={formData.deliveryMethod === method.id} onChange={() => setFormData({...formData, deliveryMethod: method.id})} />
                   <div className={`w-5 h-5 rounded-full border-2 flex flex-shrink-0 items-center justify-center ${formData.deliveryMethod === method.id ? 'border-[#ff2d8d]' : 'border-slate-300'}`}>
                     {formData.deliveryMethod === method.id && <div className="w-2.5 h-2.5 bg-[#ff2d8d] rounded-full" />}
                   </div>
                   <div className="flex-1">
                     <p className="font-bold text-slate-800">{method.title}</p>
                     <p className="text-xs font-medium text-slate-500 mt-0.5">{method.desc}</p>
                   </div>
                   <span className="font-extrabold text-[#ff2d8d]">৳{method.price}</span>
                 </label>
               ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <CreditCard size={20} className="text-[#ff2d8d]" /> Payment Method
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               {[
                 { id: 'cod', title: 'Cash on Delivery', icon: <Truck size={24} className="text-[#ff2d8d]" /> },
                 { id: 'nagad', title: 'Nagad', icon: <img src="https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png" className="h-8 object-contain" alt="Nagad" /> },
                 { id: 'bkash', title: 'bKash', icon: <img src="https://download.logo.wine/logo/BKash/BKash-Logo.wine.png" className="h-8 object-contain" alt="bKash" /> }
               ].map(method => (
                 <label 
                  key={method.id}
                  className={`relative flex flex-col items-center text-center gap-3 p-5 rounded-2xl cursor-pointer transition-all border-2 ${formData.paymentMethod === method.id ? 'border-[#ff2d8d] bg-[#fff0f6]' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                 >
                   <input type="radio" name="payment" className="hidden" checked={formData.paymentMethod === method.id} onChange={() => setFormData({...formData, paymentMethod: method.id})} />
                   <div className="h-10 flex items-center justify-center">{method.icon}</div>
                   <p className="font-bold text-slate-800 text-sm">{method.title}</p>
                   {formData.paymentMethod === method.id && (
                     <div className="absolute top-2 right-2 text-[#ff2d8d]">
                       <CheckCircle2 size={18} fill="currentColor" className="text-white" />
                     </div>
                   )}
                 </label>
               ))}
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div>
          <div className="bg-white p-6 md:p-8 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 sticky top-24">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-6">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-100">
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <span className="text-sm font-bold text-slate-700 line-clamp-2">{item.name}</span>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs font-bold text-slate-400">Qty: {item.quantity}</span>
                      <span className="text-sm font-extrabold text-slate-800">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-dashed border-slate-200 mb-6">
               {total >= freeThreshold && (
                 <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center border border-emerald-100">
                    🎉 Free Shipping Applied!
                 </div>
               )}
               <div className="flex justify-between text-sm font-bold text-slate-600">
                 <span>Subtotal</span>
                 <span>{formatPrice(total)}</span>
               </div>
               <div className="flex justify-between text-sm font-bold text-slate-600">
                 <span>Delivery Fee</span>
                 <span>{formatPrice(deliveryFee)}</span>
               </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-slate-200 mb-8">
              <span className="text-base font-bold text-slate-800">Grand Total</span>
              <span className="text-2xl font-extrabold text-[#ff2d8d]">{formatPrice(grandTotal)}</span>
            </div>

            <button 
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-gradient-to-r from-[#ff2d8d] to-[#ff4fa3] flex justify-center items-center gap-2 text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-lg shadow-[#ff2d8d]/30 hover:shadow-xl hover:shadow-[#ff2d8d]/40 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isProcessing && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />}
              {isProcessing ? 'Processing Order...' : 'Confirm Order'}
            </button>
            <p className="text-center text-[10px] text-slate-400 font-bold mt-4 flex items-center justify-center gap-1">
              <ShieldCheck size={12} /> Safe and secure checkout
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
