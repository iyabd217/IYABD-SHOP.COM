import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, AlertCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '../lib/authContext';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await adminLogin(email, password);
    if (success) {
      navigate('/admin');
    } else {
      setError('Invalid admin credentials. Access denied.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[80vh] bg-slate-950 rounded-[40px] flex items-center justify-center p-4 sm:p-10 selection:bg-primary selection:text-white relative overflow-hidden pb-[90px]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <button onClick={() => navigate('/')} className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors">
          ← Back Home
        </button>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-3xl mb-6 border border-primary/20 backdrop-blur-xl">
             <ShieldCheck className="text-primary" size={32} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-2 uppercase">Systems Protocol</h1>
          <p className="text-slate-500 text-sm font-bold tracking-widest uppercase opacity-60">Admin Access Restricted</p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Secure Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@protocol.sec"
                  className="w-full bg-black/40 border border-white/10 py-4 pl-12 pr-4 rounded-2xl text-sm font-bold text-white outline-none focus:ring-2 ring-primary/20 transition-all placeholder:text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Auth Secret</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-black/40 border border-white/10 py-4 pl-12 pr-12 rounded-2xl text-sm font-bold text-white outline-none focus:ring-2 ring-primary/20 transition-all placeholder:text-slate-700 font-mono"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl"
              >
                <AlertCircle className="text-red-500 shrink-0" size={18} />
                <p className="text-xs font-bold text-red-500 uppercase tracking-wider">{error}</p>
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="uppercase tracking-[0.2em]">Initialize Access</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">Encrypted Session Protocol v2.4.0</p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
