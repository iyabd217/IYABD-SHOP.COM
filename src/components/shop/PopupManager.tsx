import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Gift, ArrowRight } from 'lucide-react';

const PopupManager = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [type, setType] = useState<'welcome' | 'exit'>('welcome');

    useEffect(() => {
        // Welcome Popup logic
        const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
        if (!hasSeenWelcome) {
            const timer = setTimeout(() => {
                setType('welcome');
                setShowPopup(true);
                sessionStorage.setItem('hasSeenWelcome', 'true');
            }, 5000);
            return () => clearTimeout(timer);
        }

        // Exit Intent Logic
        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0) {
                const hasSeenExit = sessionStorage.getItem('hasSeenExit');
                if (!hasSeenExit) {
                    setType('exit');
                    setShowPopup(true);
                    sessionStorage.setItem('hasSeenExit', 'true');
                }
            }
        };

        document.addEventListener('mouseleave', handleMouseLeave);
        return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }, []);

    const closePopup = () => setShowPopup(false);

    return (
        <AnimatePresence>
            {showPopup && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closePopup}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-sm bg-white rounded-[40px] overflow-hidden shadow-2xl"
                    >
                        <button 
                            onClick={closePopup}
                            className="absolute top-4 right-4 w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors z-10"
                        >
                            <X size={18} />
                        </button>

                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-purple-600 text-white rounded-[32px] mx-auto flex items-center justify-center mb-6 shadow-xl shadow-purple-500/20">
                                {type === 'welcome' ? <Sparkles size={36} /> : <Gift size={36} />}
                            </div>
                            
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                                {type === 'welcome' ? 'Join the IYABD Club!' : 'Wait! Don\'t Go Yet'}
                            </h2>
                            <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">
                                {type === 'welcome' 
                                    ? 'Subscribe to our newsletter and get ৳100 off your first purchase today.'
                                    : 'Grab a special 5% discount code if you checkout in the next 10 minutes!'}
                            </p>

                            <div className="space-y-3">
                                <input 
                                    type="email" 
                                    placeholder="Enter your email" 
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-4 focus:ring-purple-500/5 transition-all"
                                />
                                <button className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center justify-center gap-2 group active:scale-95 transition-all">
                                    Claim My Discount <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button onClick={closePopup} className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors pt-2">
                                    No thanks, maybe later
                                </button>
                            </div>
                        </div>

                        <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PopupManager;
