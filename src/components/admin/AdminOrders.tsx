import React, { useState, useEffect } from 'react';
import { adminService } from '../../lib/adminServices';
import { formatPrice } from '../../lib/utils';
import { Edit3, Eye, Package, X, Save, Search, Filter, Printer, Copy, CheckSquare, Square, MoreVertical, Truck } from 'lucide-react';
import { Invoice } from '../checkout/Invoice';
import { formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const AdminOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'edit' | 'invoice' | null>(null);
    const [companySettings, setCompanySettings] = useState<any>({});
    
    // Filters & Bulk
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('ALL');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
        adminService.getCompanySettings().then(settings => setCompanySettings(settings || {}));
    }, []);

    const fetchData = () => {
        setLoading(true);
        adminService.getOrders().then(data => {
            setOrders(data || []);
            setLoading(false);
        });
    }

    const handleSaveOrder = async (orderData: any = null) => {
        const dataToSave = orderData || selectedOrder;
        if (!dataToSave) return;
        setSaving(true);
        try {
            await adminService.updateOrder(dataToSave.id, dataToSave);
            alert("Order Updated Successfully");
            fetchData();
        } catch (error) {
            console.error(error);
            alert("Failed to update order");
        } finally {
            setSaving(false);
        }
    };

    // Auto save using debounce (Removed to respect SAVE button logic as requested)
    useEffect(() => {
        if (!selectedOrder || viewMode !== 'edit') return;
        // User explicitly wants to save via the [SAVE] button
    }, [selectedOrder, viewMode]);

    const handleCourierBooking = async (type: 'steadfast' | 'pathao', orderIds: string[]) => {
        const confirmMsg = `Do you want to book ${orderIds.length} order(s) with ${type === 'steadfast' ? 'SteadFast' : 'Pathao'}?`;
        if (!window.confirm(confirmMsg)) return;

        let successCount = 0;
        for (const id of orderIds) {
            const order = orders.find(o => o.id === id);
            if (!order) continue;
            
            try {
                const res = type === 'steadfast' 
                    ? await adminService.createSteadFastParcel(order)
                    : await adminService.createPathaoParcel(order);
                
                if (res.success) {
                    successCount++;
                    if (selectedOrder && selectedOrder.id === order.id) {
                        setSelectedOrder({ ...order, tracking_id: res.trackingId, shippingStatus: 'BOOKED', courier_name: type === 'steadfast' ? 'SteadFast' : 'Pathao' });
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
        
        alert(`Successfully booked ${successCount}/${orderIds.length} orders.`);
        fetchData();
        setSelectedIds([]);
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const toggleAll = () => {
        if (selectedIds.length === filteredOrders.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredOrders.map(o => o.id));
        }
    };

    const printDocs = (type: 'A4' | 'A6' | 'STICKER', orderIds: string[] = []) => {
        document.body.classList.remove('print-a4', 'print-a6', 'print-sticker');
        
        if (type === 'A4') document.body.classList.add('print-a4');
        else if (type === 'A6') document.body.classList.add('print-a6');
        else document.body.classList.add('print-sticker');

        window.print();
        
        setTimeout(() => {
            document.body.classList.remove('print-a4', 'print-a6', 'print-sticker');
        }, 1000);
    };

    const filteredOrders = orders.filter(order => {
        let match = true;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const tracking = (order.tracking_id || order.trackingId || '').toLowerCase();
            const phone = (order.phone || '').toString().toLowerCase();
            const name = (order.customerName || order.customerDetails?.name || '').toLowerCase();
            
            if (!name.includes(query) && !phone.includes(query) && !tracking.includes(query)) {
                match = false;
            }
        }
        
        const status = order.shippingStatus || 'PENDING';
        if (statusFilter !== 'ALL' && status !== statusFilter) match = false;
        
        if (dateFilter === 'TODAY' && order.createdAt) {
            if (!isToday(order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt))) match = false;
        }
        if (dateFilter === 'YESTERDAY' && order.createdAt) {
            if (!isYesterday(order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt))) match = false;
        }
        
        return match;
    });

    const getStatusColor = (status: string) => {
        switch(status?.toUpperCase()) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'PROCESSING': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'BOOKED': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'PACKED': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'SENT': 
            case 'SHIPPED': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200';
            case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) return <div className="p-10 text-center font-bold">Loading Orders...</div>;

    return (
        <div className="p-4 sm:p-6 relative min-h-screen pb-32">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Manage Orders</h2>
                
                {/* Search & Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search name, phone, tracking..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 border rounded-xl text-sm font-medium w-full sm:w-64 focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                    </div>
                    
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="py-2 px-4 border rounded-xl text-sm font-medium bg-white focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
                    >
                        <option value="ALL">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="BOOKED">Booked</option>
                        <option value="PACKED">Packed</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>

                    <select 
                        value={dateFilter} 
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="py-2 px-4 border rounded-xl text-sm font-medium bg-white focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
                    >
                        <option value="ALL">All Time</option>
                        <option value="TODAY">Today</option>
                        <option value="YESTERDAY">Yesterday</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-0 sm:p-6 shadow-sm overflow-hidden border border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b uppercase text-[10px] text-slate-500 tracking-widest font-black bg-slate-50/50">
                                <th className="p-4 w-[40px]">
                                    <button onClick={toggleAll} className="p-1 hover:bg-slate-200 rounded text-slate-400">
                                        {selectedIds.length === filteredOrders.length && filteredOrders.length > 0 ? <CheckSquare size={18} className="text-purple-600" /> : <Square size={18} />}
                                    </button>
                                </th>
                                <th className="p-4 whitespace-nowrap">Order Info</th>
                                <th className="p-4 whitespace-nowrap">Customer</th>
                                <th className="p-4 whitespace-nowrap">Total</th>
                                <th className="p-4 whitespace-nowrap">Tracking</th>
                                <th className="p-4 whitespace-nowrap">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="font-semibold text-sm">
                            {filteredOrders.map((order: any) => {
                                const isSelected = selectedIds.includes(order.id);
                                const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt || Date.now());
                                
                                return (
                                <tr key={order.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${isSelected ? 'bg-purple-50/30' : ''}`}>
                                    <td className="p-4">
                                        <button onClick={() => toggleSelect(order.id)} className="p-1 hover:bg-slate-200 rounded">
                                            {isSelected ? <CheckSquare size={18} className="text-purple-600" /> : <Square size={18} className="text-slate-300" />}
                                        </button>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-mono text-xs uppercase text-slate-600">#{order.id.slice(-8)}</span>
                                            <span className="text-[10px] text-slate-400 mt-0.5">{formatDistanceToNow(orderDate, {addSuffix: true})}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="text-slate-900">{order.customerDetails?.name || order.customerName || 'N/A'}</span>
                                            <span className="text-xs text-slate-500">{order.phone || order.customerDetails?.phone || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-slate-900 border-l border-r border-transparent">
                                        {formatPrice(order.total || 0)}
                                    </td>
                                    <td className="p-4">
                                        {order.tracking_id || order.trackingId ? (
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase text-purple-600 tracking-wider">
                                                    {order.courier_name || order.courierName}
                                                </span>
                                                <span className="text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block w-max font-mono">
                                                    {order.tracking_id || order.trackingId}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="px-2 py-1 bg-slate-100 text-slate-400 text-[10px] font-bold rounded uppercase tracking-wider">Unbooked</span>
                                        )}
                                    </td>
                                    <td className="p-4">
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
                                         className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest outline-none border cursor-pointer appearance-none text-center ${getStatusColor(order.shippingStatus || 'PROCESSING')}`}
                                      >
                                        <option value="PENDING">PENDING</option>
                                        <option value="PROCESSING">PROCESSING</option>
                                        <option value="BOOKED">BOOKED</option>
                                        <option value="PACKED">PACKED</option>
                                        <option value="SENT">SENT</option>
                                        <option value="DELIVERED">DELIVERED</option>
                                        <option value="CANCELLED">CANCELLED</option>
                                      </select>
                                    </td>
                                    <td className="p-4 flex items-center justify-end gap-2">
                                        <button 
                                          onClick={() => { setSelectedOrder(order); setViewMode('edit'); }}
                                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border" title="Edit Full Details">
                                            <Edit3 size={16}/>
                                        </button>
                                    </td>
                                </tr>
                            )})}
                            {filteredOrders.length === 0 && (
                                <tr><td colSpan={7} className="p-12 text-center text-slate-500 font-medium">No orders found matching filters.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-slate-700 text-white rounded-2xl px-2 py-2 flex items-center gap-2 z-40 shadow-2xl overflow-x-auto max-w-[95vw] min-w-max">
                    <div className="px-4 font-black text-sm flex-shrink-0 flex items-center gap-2">
                        <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px]">{selectedIds.length}</span>
                        Selected
                    </div>
                    <div className="h-8 w-px bg-slate-700 flex-shrink-0 mx-2"></div>
                    <button onClick={() => handleCourierBooking('steadfast', selectedIds)} className="font-bold whitespace-nowrap tracking-tight text-xs bg-purple-600 hover:bg-purple-500 px-5 py-2.5 rounded-xl flex-shrink-0 transition-colors">
                        Send Steadfast
                    </button>
                    <button onClick={() => handleCourierBooking('pathao', selectedIds)} className="font-bold whitespace-nowrap tracking-tight text-xs bg-orange-600 hover:bg-orange-500 px-5 py-2.5 rounded-xl flex-shrink-0 transition-colors">
                        Send Pathao
                    </button>
                    <button onClick={() => printDocs('A4', selectedIds)} className="font-bold whitespace-nowrap tracking-tight text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl flex-shrink-0 transition-colors">
                        Print A4
                    </button>
                    <button onClick={() => printDocs('A6', selectedIds)} className="font-bold whitespace-nowrap tracking-tight text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl flex-shrink-0 transition-colors">
                        Print A6
                    </button>
                    <button onClick={() => printDocs('STICKER', selectedIds)} className="font-bold whitespace-nowrap tracking-tight text-xs bg-white text-slate-900 hover:bg-slate-200 px-5 py-2.5 rounded-xl flex-shrink-0 transition-colors flex items-center gap-2">
                        <Printer size={14} /> Sticker
                    </button>
                </div>
            )}

            {/* Edit Order Modal - Full Screen Advanced View */}
            {viewMode === 'edit' && selectedOrder && (
                <div className="fixed inset-0 sm:inset-y-0 sm:left-auto sm:right-0 w-full sm:max-w-[700px] h-[100dvh] bg-slate-50 z-[99999] sm:rounded-l-3xl shadow-2xl flex flex-col animate-in slide-in-from-right-8 duration-300 overflow-y-auto edit-modal" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <div className="order-edit-wrapper">
                        
                        {/* Header */}
                        <div className="bg-white/90 backdrop-blur-md px-4 py-4 sm:px-6 sm:py-5 border-b border-slate-200 flex items-center justify-between sticky top-0 z-[1000]">
                            <div className="flex items-center gap-4">
                                <button onClick={() => { setViewMode(null); setSelectedOrder(null); }} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600">
                                    <X size={20} />
                                </button>
                                <div>
                                    <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900">Order #{selectedOrder.id.slice(-8)}</h2>
                                    <p className="text-[10px] sm:text-xs font-semibold text-slate-500">
                                        {selectedOrder.createdAt?.toDate ? formatDistanceToNow(selectedOrder.createdAt.toDate(), {addSuffix: true}) : 'Recently'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Bar Inside Modal */}
                        <div className="order-action-bar no-scrollbar">
                            <button onClick={() => handleCourierBooking('steadfast', [selectedOrder.id])} className="action-btn">
                                <span>STEADFAST</span>
                            </button>
                            <button onClick={() => handleCourierBooking('pathao', [selectedOrder.id])} className="action-btn">
                                <span>PATHAO</span>
                            </button>
                            <button onClick={() => { /* already in edit mode */ }} className="action-btn">
                                <span>EDIT</span>
                            </button>
                            <button onClick={() => printDocs('A4', [selectedOrder.id])} className="action-btn">
                                <span>PRINT A4</span>
                            </button>
                            <button onClick={() => printDocs('A6', [selectedOrder.id])} className="action-btn">
                                <span>PRINT A6</span>
                            </button>
                            <button onClick={() => printDocs('STICKER', [selectedOrder.id])} className="action-btn">
                                <span>STICKER</span>
                            </button>
                            <button onClick={() => handleSaveOrder()} className="action-btn !bg-slate-900">
                                <span className="!text-white">{saving ? 'SAVING...' : 'SAVE'}</span>
                            </button>
                        </div>

                        <div className="order-content-area">
                            
                            {/* Status & Tracking Banner */}
                            <div className="order-card status-card mt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <label className="block text-[11px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Order Status</label>
                                    <select 
                                        value={selectedOrder.shippingStatus || 'PROCESSING'} 
                                        onChange={e => {
                                            const newOrder = { ...selectedOrder, shippingStatus: e.target.value };
                                            setSelectedOrder(newOrder);
                                            adminService.updateOrder(newOrder.id, { shippingStatus: e.target.value });
                                        }}
                                        className={`w-full sm:w-auto px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest outline-none border cursor-pointer appearance-none ${getStatusColor(selectedOrder.shippingStatus || 'PROCESSING')} hover:border-current/20`}
                                    >
                                        <option value="PENDING">PENDING</option>
                                        <option value="PROCESSING">PROCESSING</option>
                                        <option value="BOOKED">BOOKED</option>
                                        <option value="PACKED">PACKED</option>
                                        <option value="SENT">SENT</option>
                                        <option value="DELIVERED">DELIVERED</option>
                                        <option value="CANCELLED">CANCELLED</option>
                                    </select>
                                </div>

                                <div className="flex-1">
                                    <label className="block text-[11px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Courier Tracking ID</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="text" 
                                            value={selectedOrder.tracking_id || selectedOrder.trackingId || ''} 
                                            onChange={e => setSelectedOrder({ ...selectedOrder, tracking_id: e.target.value })} 
                                            className="w-full flex-1 order-input tracking-widest uppercase font-mono" 
                                            placeholder="UNBOOKED" 
                                        />
                                        {(selectedOrder.tracking_id || selectedOrder.trackingId) && (
                                            <button onClick={() => navigator.clipboard.writeText(selectedOrder.tracking_id || selectedOrder.trackingId)} className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl flex-shrink-0" title="Copy">
                                                <Copy size={18} />
                                            </button>
                                        )}
                                    </div>
                                    {(selectedOrder.courier_name || selectedOrder.courierName) && (
                                        <p className="text-[10px] font-bold text-purple-600 uppercase mt-2">
                                            Via {selectedOrder.courier_name || selectedOrder.courierName}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Customer Details */}
                            <div className="order-card space-y-4">
                                <h3 className="font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 pb-2 border-b text-sm">
                                    Customer Details
                                </h3>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Full Name</label>
                                    <input type="text" value={selectedOrder.customerDetails?.name || selectedOrder.customerName || ''} onChange={e => setSelectedOrder({ ...selectedOrder, customerName: e.target.value, customerDetails: {...selectedOrder.customerDetails, name: e.target.value} })} className="order-input font-medium" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Phone Number</label>
                                    <input type="text" value={selectedOrder.phone || selectedOrder.customerDetails?.phone || ''} onChange={e => setSelectedOrder({ ...selectedOrder, phone: e.target.value, customerDetails: {...selectedOrder.customerDetails, phone: e.target.value} })} className="order-input font-medium" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Email Address</label>
                                    <input type="text" value={selectedOrder.userEmail || selectedOrder.customerDetails?.email || selectedOrder.email || ''} onChange={e => setSelectedOrder({ ...selectedOrder, userEmail: e.target.value, customerDetails: {...selectedOrder.customerDetails, email: e.target.value} })} className="order-input font-medium" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Full Address</label>
                                    <textarea value={selectedOrder.address || selectedOrder.customerDetails?.address || ''} onChange={e => setSelectedOrder({ ...selectedOrder, address: e.target.value, customerDetails: {...selectedOrder.customerDetails, address: e.target.value} })} className="order-textarea font-medium resize-none outline-none focus:ring-2 focus:ring-purple-500" />
                                </div>
                                <div className="two-column-grid">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5">District</label>
                                        <input type="text" value={selectedOrder.district || selectedOrder.customerDetails?.district || ''} onChange={e => setSelectedOrder({ ...selectedOrder, district: e.target.value, customerDetails: {...selectedOrder.customerDetails, district: e.target.value} })} className="order-input font-medium" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Upazila</label>
                                        <input type="text" value={selectedOrder.upazila || selectedOrder.customerDetails?.upazila || ''} onChange={e => setSelectedOrder({ ...selectedOrder, upazila: e.target.value, customerDetails: {...selectedOrder.customerDetails, upazila: e.target.value} })} className="order-input font-medium" />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="order-card space-y-4">
                                <h3 className="font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 pb-2 border-b text-sm">
                                    Payment Info
                                </h3>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Payment Method</label>
                                    <select value={selectedOrder.paymentMethod || 'cash'} onChange={e => setSelectedOrder({ ...selectedOrder, paymentMethod: e.target.value })} className="order-input font-bold bg-white uppercase outline-none focus:ring-2 focus:ring-purple-500">
                                        <option value="cash">Cash on Delivery</option>
                                        <option value="bkash">bKash</option>
                                        <option value="nagad">Nagad</option>
                                        <option value="card">Credit Card</option>
                                    </select>
                                </div>
                                <div className="two-column-grid">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Subtotal</label>
                                        <input type="number" readOnly value={selectedOrder.subtotal || 0} className="order-input font-bold text-slate-600 bg-slate-100" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Delivery Fee</label>
                                        <input type="number" value={selectedOrder.deliveryFee || 0} onChange={e => {
                                            const fee = parseInt(e.target.value) || 0;
                                            const total = (selectedOrder.subtotal || 0) + fee - (selectedOrder.discount || 0);
                                            setSelectedOrder({...selectedOrder, deliveryFee: fee, total})
                                        }} className="order-input font-bold outline-none focus:ring-2 focus:ring-purple-500" />
                                    </div>
                                </div>
                                <div className="pt-3">
                                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest text-center">Total (COD Amount)</label>
                                    <input type="number" readOnly value={selectedOrder.total || 0} className="w-full h-[60px] rounded-[16px] border border-purple-200 p-3 bg-purple-50 text-purple-700 font-black text-2xl outline-none text-center" />
                                </div>
                            </div>

                            {/* Admin Notes */}
                            <div className="order-card !bg-amber-50 !border !border-amber-200/60 shadow-none space-y-3">
                                <h3 className="font-black text-amber-900 uppercase tracking-tight flex items-center gap-2 pb-2 border-b border-amber-200/50 text-sm">
                                    Admin Notes
                                </h3>
                                <textarea 
                                    value={selectedOrder.adminNotes || ''} 
                                    onChange={e => setSelectedOrder({ ...selectedOrder, adminNotes: e.target.value })} 
                                    className="order-textarea !bg-amber-50/50 !border-amber-200 outline-none focus:!bg-white focus:ring-2 focus:ring-amber-500 placeholder-amber-700/50 text-amber-900"
                                    placeholder="Add internal admin note... (visible only here)"
                                />
                            </div>

                            {/* Product Line Items */}
                            <div className="order-card">
                                <h3 className="font-black text-slate-900 uppercase tracking-tight flex items-center gap-2 pb-3 mb-4 border-b text-sm">
                                    Product Details ({selectedOrder.items?.length || 0})
                                </h3>
                                <div className="space-y-3">
                                    {selectedOrder.items?.map((item: any, i: number) => (
                                        <div key={i} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-slate-50 p-4 rounded-[16px] border border-slate-100">
                                            <div className="flex gap-4 w-full sm:w-auto">
                                                <div className="w-14 h-14 bg-white rounded-xl border border-slate-200 overflow-hidden flex-shrink-0">
                                                    {item.image || item.product_image ? (
                                                        <img src={item.image || item.product_image} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-[10px]">IMG</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 sm:min-w-[200px]">
                                                    <p className="font-bold text-[15px] text-slate-900 leading-snug line-clamp-2">{item.name}</p>
                                                    <p className="text-[11px] text-slate-500 font-semibold mt-1 truncate">ID: {item.product_id || item.id || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-none border-slate-200">
                                                <div className="w-20 flex-1 sm:flex-none">
                                                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Qty</label>
                                                    <input type="number" min="1" value={item.quantity} onChange={e => {
                                                        const newItems = selectedOrder.items.map((it: any) => ({...it}));
                                                        newItems[i].quantity = parseInt(e.target.value) || 1;
                                                        const newSubtotal = newItems.reduce((acc: number, it: any) => acc + (it.price * it.quantity), 0);
                                                        const newTotal = newSubtotal + (selectedOrder.deliveryFee || 0) - (selectedOrder.discount || 0);
                                                        setSelectedOrder({ ...selectedOrder, items: newItems, subtotal: newSubtotal, total: newTotal });
                                                    }} className="w-full h-[42px] px-3 bg-white border border-slate-200 rounded-xl font-bold text-[15px] text-center outline-none focus:ring-2 focus:ring-purple-500" />
                                                </div>
                                                <div className="w-28 flex-1 sm:flex-none">
                                                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Unit Price</label>
                                                    <input type="number" min="0" value={item.price} onChange={e => {
                                                        const newItems = selectedOrder.items.map((it: any) => ({...it}));
                                                        newItems[i].price = parseInt(e.target.value) || 0;
                                                        const newSubtotal = newItems.reduce((acc: number, it: any) => acc + (it.price * it.quantity), 0);
                                                        const newTotal = newSubtotal + (selectedOrder.deliveryFee || 0) - (selectedOrder.discount || 0);
                                                        setSelectedOrder({ ...selectedOrder, items: newItems, subtotal: newSubtotal, total: newTotal });
                                                    }} className="w-full h-[42px] px-3 bg-white border border-slate-200 rounded-xl font-bold text-[15px] text-right outline-none focus:ring-2 focus:ring-purple-500" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}
            
            {/* Hidden Print Wrapper */}
            <div className="hidden print:block print-container bg-white z-[999999]" style={{ breakInside: 'avoid' }}>
                {selectedIds.length > 0 ? (
                    selectedIds.map(id => {
                        const order = orders.find(o => o.id === id);
                        return order ? <Invoice key={id} order={order} orderItems={order.items || []} companySettings={companySettings} /> : null;
                    })
                ) : (
                    selectedOrder && <Invoice key="single" order={selectedOrder} orderItems={selectedOrder.items || []} companySettings={companySettings} />
                )}
            </div>
            
        </div>
    );
};

export default AdminOrders;
