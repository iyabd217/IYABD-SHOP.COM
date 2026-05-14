import React, { useState } from 'react';
import { useCart } from '../../lib/cartContext';
import { orderService } from '../../lib/services';
import { motion } from 'motion/react';
import { Truck, CreditCard, ChevronRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
    const { cart, total, clearCart } = useCart();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
    const [delivery, setDelivery] = useState<{ type: string, charge: number } | null>(null);
    const [payment, setPayment] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        const orderData = {
            items: cart,
            total: total + (delivery?.charge || 0),
            customerName: customerInfo.name,
            phone: customerInfo.phone,
            address: customerInfo.address,
            deliveryType: delivery?.type,
            deliveryCharge: delivery?.charge,
            paymentMethod: payment,
            createdAt: new Date()
        };
        
        try {
            const orderId = await orderService.create(orderData);
            clearCart();
            setLoading(false);
            navigate('/success', { state: { order: { ...orderData, id: orderId } } });
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto py-20 px-4">
            <h1 className="text-3xl font-black mb-8">Checkout</h1>
            
            {step === 1 && (
                <div className="space-y-4">
                    <input className="w-full p-4 border rounded-2xl" placeholder="Name" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
                    <input className="w-full p-4 border rounded-2xl" placeholder="Phone" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />
                    <textarea className="w-full p-4 border rounded-2xl" placeholder="Address" value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} />
                    <button 
                        disabled={!customerInfo.name || !customerInfo.phone || !customerInfo.address}
                        onClick={() => setStep(2)}
                        className="w-full py-4 bg-black text-white rounded-2xl font-bold disabled:opacity-50"
                    >
                        Continue
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6">
                    <div>
                        <h3 className="font-bold mb-2">Delivery Area</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setDelivery({type: 'Inside Dhaka', charge: 70})} className={`p-4 border rounded-2xl ${delivery?.type === 'Inside Dhaka' ? 'border-primary bg-primary/10' : ''}`}>Inside Dhaka (৳70)</button>
                            <button onClick={() => setDelivery({type: 'Outside Dhaka', charge: 130})} className={`p-4 border rounded-2xl ${delivery?.type === 'Outside Dhaka' ? 'border-primary bg-primary/10' : ''}`}>Outside Dhaka (৳130)</button>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold mb-2">Payment</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {['COD', 'bKash', 'Nagad'].map(m => (
                                <button key={m} onClick={() => setPayment(m)} className={`p-4 border rounded-2xl ${payment === m ? 'border-primary bg-primary/10' : ''}`}>{m}</button>
                            ))}
                        </div>
                    </div>

                    <button 
                        disabled={!delivery || !payment || loading}
                        onClick={handleConfirm}
                        className="w-full py-4 bg-black text-white rounded-2xl font-bold disabled:opacity-50"
                    >
                        {loading ? 'Confirming...' : 'Confirm Order'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Checkout;
