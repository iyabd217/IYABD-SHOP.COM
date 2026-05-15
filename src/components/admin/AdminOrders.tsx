import React, { useState, useEffect } from 'react';
import { adminService } from '../../lib/adminServices';
import { formatPrice } from '../../lib/utils';
import { Edit3, Eye, Package, X, Save } from 'lucide-react';
import { Invoice } from '../checkout/Invoice';

const AdminOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'edit' | 'invoice' | null>(null);
    const [companySettings, setCompanySettings] = useState<any>({});

    useEffect(() => {
        fetchData();
        adminService.getCompanySettings().then(settings => setCompanySettings(settings || {}));
    }, []);

    const fetchData = () => {
        setLoading(true);
        adminService.getOrders().then(orders => {
            setOrders(orders || []);
            setLoading(false);
        });
    }

    const handleSaveOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await adminService.updateOrder(selectedOrder.id, selectedOrder);
            alert("Order updated successfully!");
            setViewMode(null);
            fetchData();
        } catch (error) {
            console.error(error);
            alert("Failed to update order");
        }
    };

    const handleCourierBooking = async (type: 'steadfast' | 'pathao') => {
        if (!selectedOrder) return;
        const confirmMsg = `Do you want to book this order with ${type === 'steadfast' ? 'SteadFast' : 'Pathao'}?`;
        if (!window.confirm(confirmMsg)) return;

        try {
            const res = type === 'steadfast' 
                ? await adminService.createSteadFastParcel(selectedOrder)
                : await adminService.createPathaoParcel(selectedOrder);
            
            if (res.success) {
                alert(`Parcel created! Tracking ID: ${res.trackingId}`);
                setViewMode(null);
                fetchData();
            } else {
                alert("Booking failed. Check settings.");
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred during booking.");
        }
    };

    if (loading) return <div className="p-10 text-center font-bold">Loading Orders...</div>;

    return (
        <div className="p-6 relative">
            <h2 className="text-xl font-bold mb-6">Manage Orders</h2>
            <div className="bg-white rounded-3xl p-6 shadow-sm overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b uppercase text-[10px] text-gray-500 tracking-widest font-black">
                            <th className="p-3">Order ID</th>
                            <th className="p-3">Customer</th>
                            <th className="p-3">Phone</th>
                            <th className="p-3">Total</th>
                            <th className="p-3">Tracking</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="font-bold text-sm">
                        {orders.map((order: any) => (
                            <tr key={order.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-mono">{order.id.slice(-8)}</td>
                                <td className="p-3">
                                    <div className="flex flex-col">
                                        <span>{order.customerName || 'N/A'}</span>
                                        <span className="text-[10px] text-slate-400">{order.email}</span>
                                    </div>
                                </td>
                                <td className="p-3">{order.phone || 'N/A'}</td>
                                <td className="p-3">{formatPrice(order.total || 0)}</td>
                                <td className="p-3">
                                    {order.tracking_id ? (
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-purple-600">{order.courier_name}</span>
                                            <a href={order.tracking_url} target="_blank" rel="noreferrer" className="text-[9px] text-blue-500 hover:underline">{order.tracking_id}</a>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] text-slate-300 italic font-bold">Unbooked</span>
                                    )}
                                </td>
                                <td className="p-3">
                                  <select 
                                    value={order.shippingStatus || 'PROCESSING'} 
                                    onChange={async (e) => {
                                        const newStatus = e.target.value;
                                        try {
                                            await adminService.updateOrder(order.id, { shippingStatus: newStatus });
                                            fetchData();
                                        } catch (err) {
                                            console.error(err);
                                        }
                                    }}
                                     className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tight outline-none border-none cursor-pointer ${
                                        order.shippingStatus === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' :
                                        order.shippingStatus === 'CANCELLED' ? 'bg-rose-50 text-rose-600' :
                                        order.shippingStatus === 'SENT' ? 'bg-blue-50 text-blue-600' :
                                        'bg-amber-50 text-amber-600'
                                    }`}
                                  >
                                    <option value="PENDING">PENDING</option>
                                    <option value="PROCESSING">PROCESSING</option>
                                    <option value="PACKED">PACKED</option>
                                    <option value="SENT">SENT</option>
                                    <option value="DELIVERED">DELIVERED</option>
                                    <option value="CANCELLED">CANCELLED</option>
                                  </select>
                                </td>
                                <td className="p-3 flex justify-end gap-2">
                                    <button 
                                      onClick={() => { setSelectedOrder(order); setViewMode('edit'); }}
                                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg" title="Edit Details">
                                        <Edit3 size={16}/>
                                    </button>
                                    <button 
                                      onClick={() => { setSelectedOrder(order); setViewMode('invoice'); }}
                                      className="p-2 hover:bg-purple-50 text-purple-600 rounded-lg" title="View Invoice">
                                        <Eye size={16}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">No orders found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Layer */}
            {viewMode && selectedOrder && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                   <div className={`bg-white rounded-2xl shadow-xl w-full max-h-[90vh] overflow-y-auto relative ${viewMode === 'invoice' ? 'max-w-[850px]' : 'max-w-2xl'}`}>
                       <button onClick={() => { setViewMode(null); setSelectedOrder(null); }} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 z-10">
                           <X size={20} />
                       </button>

                       {viewMode === 'invoice' && (
                           <div className="p-6 pt-12 overflow-x-auto">
                              <div className="flex flex-wrap gap-[10px] mb-6 justify-center print:hidden">
                                 <button 
                                     onClick={async () => {
                                         if (!window.confirm('Send to Star Fast Courier?')) return;
                                         try {
                                             const trackingId = 'SF' + Math.floor(Math.random() * 1000000);
                                             await adminService.updateOrder(selectedOrder.id, {
                                                shippingStatus: 'PROCESSING',
                                                courierName: 'Star Fast',
                                                trackingId: trackingId
                                             });
                                             alert(`Parcel created! Tracking ID: ${trackingId}`);
                                             setSelectedOrder({ ...selectedOrder, shippingStatus: 'PROCESSING', courierName: 'Star Fast', trackingId: trackingId });
                                             fetchData();
                                         } catch (e) {
                                             console.error(e);
                                             alert("Booking failed.");
                                         }
                                     }}
                                     className="bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-colors h-[42px] px-[18px] rounded-[12px] font-semibold"
                                 >Star Fast Courier</button>

                                 <button 
                                     onClick={async () => {
                                         if (!selectedOrder) return;
                                         try {
                                             await adminService.updateOrder(selectedOrder.id, { shippingStatus: 'SENT' });
                                             alert("Parcel Sent successfully!");
                                             setSelectedOrder({...selectedOrder, shippingStatus: 'SENT'});
                                             fetchData();
                                         } catch (e) {
                                             alert("Failed to send parcel");
                                         }
                                     }}
                                     className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors h-[42px] px-[18px] rounded-[12px] font-semibold"
                                 >Send Parcel</button>

                                 <button 
                                     onClick={() => setViewMode('edit')}
                                     className="bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors h-[42px] px-[18px] rounded-[12px] font-semibold"
                                 >Edit Invoice</button>

                                 <button 
                                     onClick={() => {
                                         document.body.classList.remove('print-a4', 'print-a6');
                                         document.body.classList.add('print-a4');
                                         window.print();
                                     }}
                                     className="bg-slate-900 hover:bg-black text-white flex items-center justify-center transition-colors h-[42px] px-[18px] rounded-[12px] font-semibold"
                                 >Print A4</button>

                                 <button 
                                     onClick={() => {
                                         document.body.classList.remove('print-a4', 'print-a6');
                                         document.body.classList.add('print-a6');
                                         window.print();
                                     }}
                                     className="bg-slate-800 hover:bg-black text-white flex items-center justify-center transition-colors h-[42px] px-[18px] rounded-[12px] font-semibold"
                                 >Print A6</button>
                              </div>

                              <Invoice order={selectedOrder} orderItems={selectedOrder.items || []} companySettings={companySettings} />
                           </div>
                       )}

                       {viewMode === 'edit' && (
                           <form onSubmit={handleSaveOrder} className="p-6 pt-10">
                               <h2 className="text-xl font-black mb-6 uppercase tracking-widest border-b pb-2">Edit Order Details</h2>
                               
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                   {/* Customer Info */}
                                   <div className="space-y-4">
                                       <h3 className="font-bold text-gray-500 uppercase text-xs">Customer Details</h3>
                                       <div>
                                           <label className="block text-xs font-bold mb-1">Name</label>
                                           <input type="text" value={selectedOrder.customerName || ''} onChange={e => setSelectedOrder({ ...selectedOrder, customerName: e.target.value })} className="w-full p-2 border rounded font-bold text-sm" />
                                       </div>
                                       <div>
                                           <label className="block text-xs font-bold mb-1">Phone</label>
                                           <input type="text" value={selectedOrder.phone || ''} onChange={e => setSelectedOrder({ ...selectedOrder, phone: e.target.value })} className="w-full p-2 border rounded font-bold text-sm" />
                                       </div>
                                       <div>
                                           <label className="block text-xs font-bold mb-1">Email</label>
                                           <input type="text" value={selectedOrder.userEmail || selectedOrder.email || ''} onChange={e => setSelectedOrder({ ...selectedOrder, userEmail: e.target.value })} className="w-full p-2 border rounded font-bold text-sm" />
                                       </div>
                                       <div>
                                           <label className="block text-xs font-bold mb-1">Address</label>
                                           <textarea value={selectedOrder.address || ''} onChange={e => setSelectedOrder({ ...selectedOrder, address: e.target.value })} className="w-full p-2 border rounded font-bold text-sm min-h-[80px]" />
                                       </div>
                                       <div className="grid grid-cols-2 gap-2">
                                           <div>
                                               <label className="block text-xs font-bold mb-1">District</label>
                                               <input type="text" value={selectedOrder.district || ''} onChange={e => setSelectedOrder({ ...selectedOrder, district: e.target.value })} className="w-full p-2 border rounded font-bold text-sm" />
                                           </div>
                                           <div>
                                               <label className="block text-xs font-bold mb-1">Upazila</label>
                                               <input type="text" value={selectedOrder.upazila || ''} onChange={e => setSelectedOrder({ ...selectedOrder, upazila: e.target.value })} className="w-full p-2 border rounded font-bold text-sm" />
                                           </div>
                                       </div>
                                   </div>

                                   {/* Courier Info */}
                                   <div className="space-y-4">
                                       <h3 className="font-bold text-gray-500 uppercase text-xs">Courier Details</h3>
                                       <div>
                                           <label className="block text-xs font-bold mb-1">Shipping Status</label>
                                           <select value={selectedOrder.shippingStatus || 'PROCESSING'} onChange={e => setSelectedOrder({ ...selectedOrder, shippingStatus: e.target.value })} className="w-full p-2 border rounded font-bold text-sm bg-white">
                                               <option value="PROCESSING">PROCESSING</option>
                                               <option value="SHIPPED">SHIPPED</option>
                                               <option value="DELIVERED">DELIVERED</option>
                                               <option value="CANCELLED">CANCELLED</option>
                                           </select>
                                       </div>
                                       <div>
                                           <label className="block text-xs font-bold mb-1">Tracking ID</label>
                                           <input type="text" value={selectedOrder.trackingId || ''} onChange={e => setSelectedOrder({ ...selectedOrder, trackingId: e.target.value })} className="w-full p-2 border rounded font-bold text-sm uppercase" placeholder="#WAITING" />
                                       </div>
                                       <div>
                                           <label className="block text-xs font-bold mb-1">Courier Name</label>
                                           <input type="text" value={selectedOrder.courierName || ''} onChange={e => setSelectedOrder({ ...selectedOrder, courierName: e.target.value })} className="w-full p-2 border rounded font-bold text-sm uppercase" placeholder="PROCESSING" />
                                       </div>
                                       <div>
                                           <label className="block text-xs font-bold mb-1">Payment Method</label>
                                           <select value={selectedOrder.paymentMethod || 'cash'} onChange={e => setSelectedOrder({ ...selectedOrder, paymentMethod: e.target.value })} className="w-full p-2 border rounded font-bold text-sm bg-white uppercase">
                                               <option value="cash">Cash on Delivery</option>
                                               <option value="bkash">bKash</option>
                                               <option value="nagad">Nagad</option>
                                           </select>
                                       </div>
                                   </div>
                               </div>

                               <div className="mb-6 space-y-4">
                                  <h3 className="font-bold text-gray-500 uppercase text-xs border-b pb-1">Product Details</h3>
                                  {selectedOrder.items?.map((item: any, i: number) => (
                                      <div key={i} className="flex flex-wrap gap-4 items-center bg-gray-50 p-3 rounded border">
                                          <div className="flex-1 min-w-[200px]">
                                              <label className="block text-[10px] font-bold mb-1">Product Name</label>
                                              <input type="text" value={item.name} readOnly disabled className="w-full p-1.5 border rounded text-xs bg-gray-100" />
                                          </div>
                                          <div className="w-24">
                                              <label className="block text-[10px] font-bold mb-1">Qty</label>
                                              <input type="number" min="1" value={item.quantity} onChange={e => {
                                                  const newItems = selectedOrder.items.map((it: any) => ({...it}));
                                                  newItems[i].quantity = parseInt(e.target.value) || 1;
                                                  const newTotal = newItems.reduce((acc: number, it: any) => acc + (it.price * it.quantity), 0) + (selectedOrder.deliveryFee || 0) - (selectedOrder.discount || 0);
                                                  setSelectedOrder({ ...selectedOrder, items: newItems, total: newTotal, subtotal: newTotal - (selectedOrder.deliveryFee || 0) + (selectedOrder.discount || 0) });
                                              }} className="w-full p-1.5 border rounded font-bold text-xs" />
                                          </div>
                                          <div className="w-32">
                                              <label className="block text-[10px] font-bold mb-1">Unit Price</label>
                                              <input type="number" min="0" value={item.price} onChange={e => {
                                                  const newItems = selectedOrder.items.map((it: any) => ({...it}));
                                                  newItems[i].price = parseInt(e.target.value) || 0;
                                                  const newTotal = newItems.reduce((acc: number, it: any) => acc + (it.price * it.quantity), 0) + (selectedOrder.deliveryFee || 0) - (selectedOrder.discount || 0);
                                                  setSelectedOrder({ ...selectedOrder, items: newItems, total: newTotal, subtotal: newTotal - (selectedOrder.deliveryFee || 0) + (selectedOrder.discount || 0)  });
                                              }} className="w-full p-1.5 border rounded font-bold text-xs" />
                                          </div>
                                      </div>
                                  ))}
                               </div>
                               
                               <div className="flex justify-end pt-4 border-t gap-3">
                                   <button type="button" onClick={() => setViewMode(null)} className="px-6 py-2 rounded-lg font-bold border hover:bg-gray-50">Cancel</button>
                                   <button type="submit" className="px-6 py-2 rounded-lg font-bold bg-black text-white flex items-center gap-2"><Save size={16}/> Save Updates</button>
                               </div>
                           </form>
                       )}
                   </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
