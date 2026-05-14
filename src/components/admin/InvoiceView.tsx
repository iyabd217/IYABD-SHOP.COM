import React from 'react';

interface InvoiceProps {
    order: any;
}

const InvoiceView: React.FC<InvoiceProps> = ({ order }) => {
    return (
        <div className="invoice max-w-[1000px] mx-auto bg-white p-10 border border-slate-200">
            <div className="header flex justify-between border-b-2 border-slate-900 pb-5 mb-5">
                <div>
                    <div className="logo text-4xl font-bold">IYABD</div>
                    <p>RAYARBAG, DHAKA, BANGLADESH</p>
                </div>
                <div className="text-right">
                    <p>WHATSAPP: 01719188777</p>
                    <p>BKASH/NAGAD: 01671060679</p>
                    <p>admin.iyabd@gmail.com</p>
                </div>
            </div>
            
            <div className="section mb-6">
                <h2 className="text-xl font-bold border-b border-black pb-2 mb-3">Customer Information</h2>
                <p><b>Name:</b> {order.customerName}</p>
                <p><b>Phone:</b> {order.phone}</p>
                <p><b>Address:</b> {order.address}</p>
            </div>

            <div className="section mb-6">
                <h2 className="text-xl font-bold border-b border-black pb-2 mb-3">Order Information</h2>
                <p><b>Order ID:</b> {order.id}</p>
                <p><b>Date:</b> {new Date(order.createdAt?.toDate()).toLocaleDateString()}</p>
                <p><b>Payment:</b> {order.paymentMethod}</p>
            </div>

            <div className="section mb-6">
                <h2 className="text-xl font-bold border-b border-black pb-2 mb-3">Order Items</h2>
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="border p-2 bg-slate-900 text-white text-left">SL</th>
                            <th className="border p-2 bg-slate-900 text-white text-left">Product</th>
                            <th className="border p-2 bg-slate-900 text-white text-left">Size</th>
                            <th className="border p-2 bg-slate-900 text-white text-left">Qty</th>
                            <th className="border p-2 bg-slate-900 text-white text-left">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items?.map((item: any, index: number) => (
                            <tr key={index}>
                                <td className="border p-2">{index + 1}</td>
                                <td className="border p-2">{item.name}</td>
                                <td className="border p-2">{item.size}</td>
                                <td className="border p-2">{item.quantity}</td>
                                <td className="border p-2">৳{item.price}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="total text-right text-2xl font-bold mt-5">Grand Total: ৳{order.total}</div>
            
            <button 
                className="print:hidden block w-[300px] mx-auto mt-10 p-4 bg-slate-900 text-white text-center rounded-full text-lg cursor-pointer"
                onClick={() => window.print()}
            >
                DOWNLOAD INVOICE
            </button>
        </div>
    );
};

export default InvoiceView;
