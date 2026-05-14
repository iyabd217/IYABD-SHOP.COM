import React from 'react';
import { ShieldCheck, Scale, RefreshCw, Truck, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const LegalPage = () => {
    const { policy } = useParams();
    const navigate = useNavigate();

    const policies = {
        'privacy': {
            title: 'Privacy Policy',
            icon: ShieldCheck,
            content: `We value your privacy. This policy explains how we collect and use your data to provide a better shopping experience. 
            We use secure encryption for all transactions and never sell your personal information to third parties.`
        },
        'terms': {
            title: 'Terms & Conditions',
            icon: Scale,
            content: `By using this website, you agree to comply with our usage terms. All products are subject to availability. 
            We reserve the right to cancel orders in case of pricing errors or fraudulent activity.`
        },
        'refund': {
            title: 'Refund Policy',
            icon: RefreshCw,
            content: `We offer a 7-day easy return policy for damaged or incorrect items. 
            Refunds are processed within 3-5 business days after the item is received and inspected in our warehouse.`
        },
        'shipping': {
            title: 'Shipping Policy',
            icon: Truck,
            content: `Inside Dhaka: 2-3 Business Days. Outside Dhaka: 3-5 Business Days. 
            We use reliable couriers (SteadFast/Pathao) to ensure your products reach you safely and on time.`
        }
    };

    const current = policies[policy as keyof typeof policies] || policies['privacy'];

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-6">
            <div className="max-w-2xl mx-auto">
                <button 
                  onClick={() => navigate('/')}
                  className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-10"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-black uppercase tracking-widest">Back</span>
                </button>

                <div className="bg-white rounded-[40px] p-10 shadow-xl border border-slate-100">
                    <div className="w-16 h-16 bg-slate-900 text-white rounded-[24px] flex items-center justify-center mb-8 shadow-lg">
                        <current.icon size={32} />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-6">{current.title}</h1>
                    <div className="prose prose-slate">
                        <p className="text-slate-600 font-medium leading-relaxed mb-6">
                            Last Updated: {new Date().toLocaleDateString()}
                        </p>
                        <p className="text-slate-800 font-bold leading-loose">
                            {current.content}
                        </p>
                        <div className="mt-12 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Contact for help</p>
                            <p className="text-sm font-bold text-slate-900 underline">support@iyabd.shop</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LegalPage;
