  import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Printer, Package, ChevronLeft, Download } from 'lucide-react';
import { Invoice } from './Invoice';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export default function OrderSuccess(props: { order?: any, orderItems?: any[], companySettings?: any }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [readyToPrint, setReadyToPrint] = useState(false);
  
  // Read from location state if available (when navigating via router), otherwise try props
  const order = location.state?.order || props.order;
  const orderItems = location.state?.orderItems || props.orderItems || [];
  const companySettings = location.state?.companySettings || props.companySettings || {};

  useEffect(() => {
    // Adding a short delay guarantees fonts and components are fully mounted 
    // before print rendering begins.
    const timer = setTimeout(() => {
        setReadyToPrint(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const downloadInvoice = async () => {
    try {
      const invoiceElement = document.getElementById("invoice-section");
      if (!invoiceElement) {
        alert("Invoice section not found");
        return;
      }
      
      setIsGenerating(true);

      setTimeout(async () => {
        try {
          const dataUrl = await toPng(invoiceElement, { 
            quality: 1.0,
            pixelRatio: 2,
            backgroundColor: '#ffffff'
          });
          
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });
          
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (invoiceElement.offsetHeight * pdfWidth) / invoiceElement.offsetWidth;
          
          pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`invoice-${order?.id?.slice(-8) || Date.now()}.pdf`);
        } catch (error) {
          console.error("PDF DOWNLOAD ERROR:", error);
          alert("Failed to download PDF");
        } finally {
          setIsGenerating(false);
        }
      }, 500);
    } catch (error) {
      console.error("Outer PDF DOWNLOAD ERROR:", error);
      alert("Failed to initiate PDF download");
      setIsGenerating(false);
    }
  };

  const continueShopping = () => {
    navigate("/");
  };

  if (!order) {
    return (
      <div className="py-20 text-center w-full bg-[#f1f5f9] min-h-screen">
        <h2 className="text-2xl font-bold mb-4">No recent order details found.</h2>
        <Link to="/" className="text-blue-500 underline flex items-center justify-center gap-2">
          <ChevronLeft size={18} /> Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f1f5f9] print:bg-white min-h-screen py-6 sm:py-10 print:py-0 font-sans">
        {/* SUCCESS MESSAGE & CONTROLS */}
        <div className="max-w-[800px] mx-auto px-4 mb-8 print:hidden flex flex-col items-center gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm w-full text-center border border-green-100 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mb-2">Order Confirmed!</h2>
              <p className="font-bold text-gray-500">Your order has been placed successfully and is being processed.</p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 w-full">
               <button 
                 type="button"
                 onClick={downloadInvoice} 
                 disabled={isGenerating || !readyToPrint}
                 style={{ touchAction: 'manipulation' }}
                 className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#ff2d8d] hover:bg-[#e61e7a] text-white px-6 py-3 rounded-xl font-black uppercase text-[11px] sm:text-[12px] tracking-widest shadow-md active:scale-95 transition-all duration-300 hover:-translate-y-[2px] text-center disabled:opacity-50"
               >
                   {isGenerating ? (
                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
                   ) : <Download size={18} className="flex-shrink-0" />}
                   {isGenerating ? 'Generating...' : 'Download PDF'}
               </button>
               <button 
                 type="button"
                 onClick={() => window.print()} 
                 style={{ touchAction: 'manipulation' }}
                 className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-black uppercase text-[11px] sm:text-[12px] tracking-widest shadow-md active:scale-95 transition-all duration-300 hover:-translate-y-[2px] text-center"
               >
                   <Printer size={18} className="flex-shrink-0" /> Print
               </button>
               <button type="button" onClick={continueShopping} style={{ touchAction: 'manipulation' }} className="w-full sm:w-auto px-6 py-3 bg-white text-black font-black uppercase text-[11px] sm:text-[12px] tracking-widest rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-all duration-300 hover:-translate-y-[2px] text-center flex items-center justify-center gap-2">
                 <Package size={18} className="flex-shrink-0" /> Continue Shopping
               </button>
            </div>
        </div>
        
        {/* INVOICE PREVIEW CONTAINER */}
        <div className="w-full flex justify-center print:flex print:justify-center overflow-hidden print:p-0">
            <Invoice order={order} orderItems={orderItems} companySettings={companySettings} />
        </div>
    </div>
  );
};

