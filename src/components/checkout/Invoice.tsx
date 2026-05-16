import React from 'react';
import { formatPrice } from '../../lib/utils';
import { Mail } from 'lucide-react';
import Barcode from 'react-barcode';

export const Invoice = ({ order, orderItems, companySettings }: { order: any, orderItems: any[], companySettings: any }) => {
  return (
    <div id="invoice-section" className="invoice-wrapper" style={{ overflowX: 'hidden' }}>
      <div className="invoice-container bg-white text-black p-6 sm:p-[30px] shadow-2xl font-sans relative break-words align-top selection:bg-black selection:text-white pb-10">
      
      {/* STICKER COURIER BARCODE (Only visible if tracking_id exists) */}
      {(order?.tracking_id || order?.trackingId) && (
        <div className="mb-4 flex flex-col items-center justify-center border-b-2 border-black pb-4 text-center">
            <h2 className="text-[12px] font-black uppercase tracking-widest text-slate-800 mb-1">{order.courier_name || order.courierName || 'Courier Partner'}</h2>
            <Barcode 
              value={order.tracking_id || order.trackingId} 
              width={1.5} 
              height={40} 
              fontSize={12} 
              margin={0} 
              background="#ffffff" 
            />
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-row justify-between items-start mb-3">
        {/* LEFT SIDE: Logo & Address */}
        <div className="text-left flex flex-col items-start max-w-[50%]">
          {companySettings?.siteLogo || companySettings?.logo ? (
            <img 
              src={companySettings.siteLogo || companySettings.logo} 
              alt="Company Logo" 
              className="max-h-12 object-contain mb-1.5"
            />
          ) : (
            <div className="text-2xl font-black tracking-tighter uppercase whitespace-nowrap mb-1.5">
              IYABD
            </div>
          )}
          
          <div className="text-[9px] text-gray-800 leading-snug uppercase font-bold tracking-wide">
            <p>JANATA BAG, RAYERBAG</p>
            <p>HAJI WASIMUDDIN BHUIYAN ROAD</p>
            <p>DHAKA-1236</p>
          </div>
        </div>

        {/* RIGHT SIDE: Contact Info */}
        <div className="text-[10px] leading-tight font-bold text-right space-y-1 max-w-[50%]">
          <div className="flex justify-end items-center gap-1.5 break-words">
            <span className="text-gray-500 uppercase text-[9px] font-black tracking-widest whitespace-nowrap">WhatsApp/Call:</span>
            <span className="font-black whitespace-nowrap">01719188777</span>
          </div>
          <div className="flex justify-end items-center gap-1.5">
            <span className="text-gray-500 uppercase text-[9px] font-black tracking-widest whitespace-nowrap">bKash/Nagad:</span>
            <span className="font-black whitespace-nowrap">01671060679</span>
          </div>
          <div className="flex items-center justify-end gap-1 pt-0.5 print-hide-a6">
            <Mail className="w-3 h-3 text-red-500 flex-shrink-0" />
            <span className="break-all tracking-tight text-gray-800">moderator.iyabd@gmail.com</span>
          </div>
        </div>
      </div>

      {/* DIVIDER LINE */}
      <div className="h-[2px] bg-black w-full mb-3"></div>

      {/* CUSTOMER & ORDER INFORMATION SECTION */}
      <div className="invoice-top grid grid-cols-2 gap-[30px] mb-3">
        {/* LEFT: Customer Info */}
        <div className="customer-info-box space-y-0.5 break-words text-left" style={{ marginTop: '-8px' }}>
          <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-500 border-b border-black pb-0.5 mb-1.5 inline-block">Customer Information</h3>
          <div className="customer-info" style={{ minHeight: '90px', height: 'auto' }}>
              <p className="text-[11px] font-black uppercase break-words">{order?.customerName || 'Customer'}</p>
              <p className="text-[10px] font-bold text-gray-800 whitespace-nowrap">{order?.phone || 'N/A'}</p>
              { (order?.userEmail || order?.email) && (
                  <div className="customer-email" style={{ fontSize: '13px', color: '#666', marginTop: '3px', wordBreak: 'break-word' }}>
                      {(order?.userEmail || order?.email).split(',').map((mail: string, idx: number) => (
                          <div key={idx}>{mail.trim()}</div>
                      ))}
                  </div>
              )}
              <div className="text-[9px] font-semibold text-gray-600 leading-snug mt-1">
                 <p className="break-words max-w-[200px]">{order?.address || 'N/A'}</p>
                 {(order?.upazila || order?.district || order?.division) && (
                    <p className="text-gray-500 uppercase text-[8px] break-words">
                      {[order?.upazila, order?.district, order?.division].filter(Boolean).join(', ')}
                    </p>
                 )}
              </div>
          </div>
        </div>

        {/* RIGHT: Order Info */}
        <div className="space-y-0.5 text-right break-words flex flex-col items-end">
          <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-500 border-b border-black pb-0.5 mb-1.5 inline-block">Order Information</h3>
          <p className="text-[11px] font-black uppercase break-words">Invoice <span className="text-gray-400">#</span>{order?.id?.slice(-8) || 'N/A'}</p>
          <div className="flex justify-end gap-2 font-bold text-[9px] mt-1 text-gray-800">
            <span className="text-gray-500 uppercase text-[8px] tracking-wider whitespace-nowrap">Order Date:</span>
            <span className="whitespace-nowrap">{order?.date ? new Date(order.date).toLocaleDateString('en-GB') : 'N/A'}</span>
          </div>
          <div className="flex justify-end gap-2 font-bold text-[9px] text-gray-800">
            <span className="text-gray-500 uppercase text-[8px] tracking-wider whitespace-nowrap">Payment Method:</span>
            <span className="uppercase whitespace-nowrap">{order?.paymentMethod || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* ORDER ITEMS TABLE */}
      <div className="mb-3 w-full overflow-hidden rounded-none border border-black shadow-sm">
        <table className="w-full text-[9px] border-collapse">
          <thead>
            <tr className="bg-black text-white uppercase tracking-widest font-black text-[8px]">
              <th className="p-1.5 text-center border-r border-[#333] w-8">SL</th>
              <th className="p-1.5 text-left border-r border-[#333]">Product Name</th>
              <th className="p-1.5 text-center border-r border-[#333] w-16">Variant/Size</th>
              <th className="p-1.5 text-center border-r border-[#333] w-10">Qty</th>
              <th className="p-1.5 text-right border-r border-[#333] w-16">Unit Price</th>
              <th className="p-1.5 text-right w-16">Total Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 font-semibold border-t border-black bg-white">
            {orderItems?.map((item, i) => (
              <tr key={i}>
                <td className="p-1.5 border-r border-gray-200 text-center text-gray-500 align-top">{i + 1}</td>
                <td className="p-1.5 border-r border-gray-200 leading-snug break-words align-top text-gray-900">
                  {item.name}
                </td>
                <td className="p-1.5 border-r border-gray-200 text-gray-600 text-center align-top break-words">
                  {item.variant || item.size || 'N/A'}
                </td>
                <td className="p-1.5 border-r border-gray-200 text-center text-gray-900 align-top">{item.quantity}</td>
                <td className="p-1.5 border-r border-gray-200 text-right align-top whitespace-nowrap text-gray-800">{formatPrice(item.price)}</td>
                <td className="p-1.5 text-right text-black font-black align-top whitespace-nowrap">{formatPrice(item.price * item.quantity)}</td>
              </tr>
            ))}
            {/* Empty rows to maintain a professional look if there are few items */}
            {orderItems && orderItems.length < 3 && Array(3 - orderItems.length).fill(0).map((_, i) => (
              <tr key={`empty-${i}`} className="h-4">
                <td className="p-1 border-r border-gray-100"></td>
                <td className="p-1 border-r border-gray-100"></td>
                <td className="p-1 border-r border-gray-100"></td>
                <td className="p-1 border-r border-gray-100"></td>
                <td className="p-1 border-r border-gray-100"></td>
                <td className="p-1"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* COURIER & PRICE SUMMARY SECTION */}
      <div className="flex flex-row justify-between items-start gap-4 mb-3">
        {/* LEFT: Courier Information */}
        <div className="bg-[#fcfcfc] p-2 border-l-[2px] border-black w-1/2">
          <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1.5 pb-0.5 border-b border-gray-200 inline-block">Courier Information</h3>
          <div className="space-y-1 text-[9px] font-bold text-gray-800">
             <div className="flex justify-between items-center border-b border-dashed border-gray-200 pb-1 mt-0.5">
               <span className="text-gray-500 uppercase text-[8px] tracking-wider">Shipping Status:</span>
               <span className="text-orange-600 uppercase font-black px-1.5 py-0.5 bg-orange-50 rounded text-[8px] tracking-widest">{order?.shippingStatus || 'PROCESSING'}</span>
             </div>
             <div className="flex justify-between items-center border-b border-dashed border-gray-200 pb-1 mt-1">
               <span className="text-gray-500 uppercase text-[8px] tracking-wider">Tracking ID:</span>
               <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded tracking-widest break-all text-right max-w-[120px]">{order?.trackingId || '#WAITING'}</span>
             </div>
             <div className="flex justify-between items-center mt-1">
               <span className="text-gray-500 uppercase text-[8px] tracking-wider">Courier Name:</span>
               <span className="uppercase text-gray-900">{order?.courierName || 'PROCESSING'}</span>
             </div>
          </div>
        </div>

        {/* RIGHT: Price Summary */}
        <div className="space-y-1 font-bold text-[10px] w-1/2">
          <div className="flex justify-between text-gray-600 px-2">
            <span className="uppercase text-[8px] font-black tracking-widest">Subtotal:</span>
            <span className="text-gray-900">{formatPrice(order?.subtotal || 0)}</span>
          </div>
          <div className="flex justify-between text-gray-600 px-2 mt-0.5">
            <span className="uppercase text-[8px] font-black tracking-widest">Delivery Fee:</span>
            <span className="text-gray-900">{formatPrice(order?.deliveryFee || 0)}</span>
          </div>
          {order?.discount > 0 && (
            <div className="flex justify-between text-green-600 px-2 mt-0.5">
              <span className="uppercase text-[8px] font-black tracking-widest">Discount:</span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between items-center bg-black text-white p-2 mt-2 shadow-sm">
             <span className="text-[9px] uppercase font-black tracking-widest">Grand Total:</span>
             <span className="text-[12px] font-black whitespace-nowrap">{formatPrice(order?.total || 0)}</span>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Notes & Terms */}
      <div className="grid grid-cols-2 gap-[30px] text-[8px] font-bold leading-relaxed pt-2 border-t-[1px] border-black/10 print-hide-a6">
        {/* Left: Notes (Bengali) */}
        <div className="text-gray-800 break-words text-left">
           <h4 className="text-[9px] font-black text-black uppercase tracking-widest mb-1.5 border-b border-black/20 pb-0.5 inline-block">Invoice Notes</h4>
           <div className="space-y-0.5 text-gray-700">
             <p className="flex items-start gap-1"><span className="text-black font-black">•</span> <span>দয়া করে পণ্যটি রিসিভ করার সময় ভালো করে চেক করে নিবেন।</span></p>
             <p className="flex items-start gap-1"><span className="text-black font-black">•</span> <span>ডেলিভারি ম্যান থাকা অবস্থায় চেক করে সমস্যা থাকলে রিটার্ন করতে পারবেন।</span></p>
             <p className="flex items-start gap-1"><span className="text-black font-black">•</span> <span>পরবর্তীতে কোনো সমস্যা হলে আমাদের কাস্টমার সাপোর্টে যোগাযোগ করুন।</span></p>
           </div>
        </div>

        {/* Right: Terms & Conditions */}
        <div className="text-gray-800 text-right flex flex-col items-end">
           <h4 className="text-[9px] font-black text-black uppercase tracking-widest mb-1.5 border-b border-black/20 pb-0.5 inline-block">Terms & Conditions</h4>
           <ul className="space-y-0.5 text-gray-700 text-left">
             <li className="flex items-start gap-1"><span>1.</span> <span>Returns are accepted within 3 days (Conditions Apply).</span></li>
             <li className="flex items-start gap-1"><span>2.</span> <span>Keep this invoice safe for any warranty claims.</span></li>
             <li className="flex items-start gap-1"><span>3.</span> <span>Discount products are not applicable for returns.</span></li>
           </ul>
        </div>
      </div>

      {/* THANK YOU BUTTON / FOOTER */}
      <div className="mt-5 flex flex-col items-center print-hide-a6">
         <div className="px-5 py-1.5 bg-black text-white rounded-full font-black uppercase text-[9px] tracking-[0.2em] shadow-sm text-center whitespace-nowrap">
            THANK YOU FOR YOUR PURCHASE!
         </div>
      </div>
      </div>
    </div>
  );
};

