import React, { useState, useEffect, useRef } from 'react';
import { 
  Headset, MessageCircle, Mail, Phone, 
  Send, Paperclip, Bot, MapPin, Loader2, ChevronRight, ExternalLink, CheckCheck
} from 'lucide-react';
import { useAuth } from '../lib/authContext';
import { configService } from '../lib/services';

export default function SupportCenter() {
  const { user } = useAuth();
  
  // Chat state
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chat, setChat] = useState<{id: string, from: 'user' | 'ai', text: string, time: string}[]>([
    {
       id: 'welcome',
       from: 'ai',
       text: 'হ্যালো! আমি IYABD AI ASSISTANT।\nকীভাবে সাহায্য করতে পারি?',
       time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  
  // Support Config
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeEmbed, setActiveEmbed] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    configService.getSupport().then(data => {
        setConfig(data);
        setLoading(false);
    });
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, isTyping]);

  const handleSendChat = async (textOverride?: string) => {
    const textToSend = textOverride || message;
    if (!textToSend.trim()) return;
    
    const newMsg = {
      id: Date.now().toString(),
      from: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChat(prev => [...prev, newMsg]);
    setMessage('');
    setIsTyping(true);
    
    try {
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: textToSend,
                history: chat.slice(-10)
            })
        });
        const data = await response.json();
        
        setChat(prev => [...prev, {
            id: Date.now().toString(),
            from: 'ai',
            text: data.reply || "দুঃখিত 😔\nআমি এখনো এই তথ্যটি খুঁজে পাইনি।\nআপনি চাইলে একজন live support agent এর সাথে যোগাযোগ করতে পারেন।",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
    } catch (error) {
        setChat(prev => [...prev, {
            id: Date.now().toString(),
            from: 'ai',
            text: "দুঃখিত 😔\nআমি এখনো এই তথ্যটি খুঁজে পাইনি।\nআপনি চাইলে একজন live support agent এর সাথে যোগাযোগ করতে পারেন。",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
    }
    setIsTyping(false);
  };

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  const phone = config?.phone || '01719188777';
  const whatsapp = config?.whatsapp || '8801719188777';
  const messengerUrl = config?.messenger || 'https://www.facebook.com/iyabdshop';

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-24 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* 1. Green Status Banner */}
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-4 mb-8 shadow-sm">
           <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
             <Headset size={20} className="animate-pulse" />
           </div>
           <div>
              <h2 className="text-emerald-800 font-bold text-[15px]">We're here to help you 24/7.</h2>
              <p className="text-emerald-600/80 text-[13px] font-medium leading-tight">Our support team is online</p>
           </div>
        </div>

        {/* 2. Quick Support Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
           {/* Call Support */}
           <a href={`tel:${phone}`} className="bg-white p-[18px] rounded-[20px] shadow-[0_4px_14px_rgba(0,0,0,0.06)] hover:shadow-lg transition-all flex items-center gap-4 group">
              <div className="flex-shrink-0 flex items-center justify-center bg-white rounded-[18px] w-[58px] h-[58px] shadow-[0_6px_18px_rgba(0,0,0,0.06)] group-hover:scale-105 transition-transform duration-300">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/6/6c/Phone_icon.png" alt="Call" className="w-[30px] h-[30px] object-contain opacity-80 group-hover:opacity-100 transition-opacity" style={{ filter: "brightness(0) saturate(100%) invert(35%) sepia(87%) saturate(1637%) hue-rotate(200deg) brightness(101%) contrast(98%)" }} />
              </div>
              <div className="flex-1">
                 <h3 className="font-bold text-[15px]">Call Support</h3>
                 <p className="text-slate-500 font-medium text-[13px] mt-0.5">{phone}</p>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
           </a>

           {/* Messenger */}
           <a href={messengerUrl} target="_blank" rel="noreferrer" className="bg-white p-[18px] rounded-[20px] shadow-[0_4px_14px_rgba(0,0,0,0.06)] hover:shadow-lg transition-all flex items-center gap-4 group">
              <div className="flex-shrink-0 flex items-center justify-center bg-white rounded-[18px] w-[58px] h-[58px] shadow-[0_6px_18px_rgba(0,0,0,0.06)] group-hover:scale-105 transition-transform duration-300">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg" alt="Messenger" className="w-[36px] h-[36px] object-contain" />
              </div>
              <div className="flex-1">
                 <h3 className="font-bold text-[15px]">Messenger</h3>
                 <p className="text-slate-500 font-medium text-[13px] mt-0.5">Live Facebook chat</p>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
           </a>

           {/* WhatsApp */}
           <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="bg-white p-[18px] rounded-[20px] shadow-[0_4px_14px_rgba(0,0,0,0.06)] hover:shadow-lg transition-all flex items-center gap-4 group">
              <div className="flex-shrink-0 flex items-center justify-center bg-white rounded-[18px] w-[58px] h-[58px] shadow-[0_6px_18px_rgba(0,0,0,0.06)] group-hover:scale-105 transition-transform duration-300">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-[34px] h-[34px] object-contain" />
              </div>
              <div className="flex-1">
                 <h3 className="font-bold text-[15px]">WhatsApp</h3>
                 <p className="text-slate-500 font-medium text-[13px] mt-0.5">Quick responses</p>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:text-green-500 transition-colors" />
           </a>

           {/* Email Support */}
           <a href="#emails" className="bg-white p-[18px] rounded-[20px] shadow-[0_4px_14px_rgba(0,0,0,0.06)] hover:shadow-lg transition-all flex items-center gap-4 group">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                 <Mail size={24} />
              </div>
              <div className="flex-1">
                 <h3 className="font-bold text-[15px]">Email Support</h3>
                 <p className="text-slate-500 font-medium text-[13px] mt-0.5">Send us detailed queries</p>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:text-rose-500 transition-colors" />
           </a>
        </div>

        {/* 3. AI Chat Assistant */}
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden mb-8 border border-slate-100">
           {/* Header */}
           <div className="bg-slate-900 p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center relative">
                 <Bot size={24} className="text-white" />
                 <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-[3px] border-slate-900 rounded-full"></span>
              </div>
              <div>
                 <h3 className="text-white font-bold tracking-widest text-[13px] mb-0.5">IYABD AI ASSISTANT</h3>
                 <p className="text-slate-400 font-medium text-[12px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    Always here for you
                 </p>
              </div>
           </div>

           {/* Chat Body */}
           <div className="h-[350px] overflow-y-auto p-5 bg-slate-50 space-y-4">
               {chat.map((c) => (
                 <div key={c.id} className={`flex ${c.from === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
                    {c.from === 'ai' && (
                       <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm">
                          <Bot size={16} />
                       </div>
                    )}
                    <div className="max-w-[75%]">
                       <div className={`p-4 text-[14px] leading-relaxed shadow-[0_2px_12px_rgba(0,0,0,0.04)] font-medium transition-all
                          ${c.from === 'user' 
                             ? 'bg-blue-600 text-white rounded-[20px] rounded-tr-[4px]' 
                             : 'bg-white border border-slate-100 text-slate-700 rounded-[20px] rounded-tl-[4px] whitespace-pre-line'}`}
                       >
                          {c.text}
                       </div>
                       <p className={`text-[10px] text-slate-400 font-bold mt-1.5 flex items-center gap-1 ${c.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                          {c.time}
                          {c.from === 'user' && <CheckCheck size={14} className="text-blue-500" />}
                       </p>
                    </div>
                 </div>
               ))}
               
               {isTyping && (
                  <div className="flex justify-start gap-3">
                     <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm">
                        <Bot size={16} />
                     </div>
                     <div className="bg-white border border-slate-100 px-4 py-3 h-[42px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-[20px] rounded-tl-[4px] flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                     </div>
                  </div>
               )}
               <div ref={chatBottomRef} />
           </div>

           {/* Chat Input */}
           <div className="p-4 bg-white border-t border-slate-50">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-[24px] p-1.5 px-2 focus-within:border-blue-300 focus-within:ring-2 ring-blue-50 transition-all">
                 <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
                    <Paperclip size={18} />
                 </button>
                 <input 
                    type="text" 
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                    placeholder="আপনার প্রশ্ন লিখুন..."
                    className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium h-10 px-2"
                 />
                 <button 
                    onClick={() => handleSendChat()}
                    disabled={!message.trim() || isTyping}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                       message.trim() && !isTyping 
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/30' 
                          : 'bg-slate-200 text-slate-400'
                    }`}
                 >
                    <Send size={16} className={message.trim() && !isTyping ? 'ml-0.5' : ''} />
                 </button>
              </div>
           </div>
        </div>

        {/* 4. Email Support Accounts */}
        <div id="emails" className="mb-8">
           <h2 className="text-[14px] font-black tracking-widest uppercase text-slate-400 mb-4 pl-2">Email Support</h2>
           <div className="space-y-3">
              {[
                  { title: 'Admin Email', email: 'Moderator.iyabd@gmail.com', glowClass: 'hover:shadow-[0_8px_24px_rgba(234,67,53,0.12)] hover:border-red-100' },
                  { title: 'Moderator Email', email: 'admin.iyabd.gmail.com', glowClass: 'hover:shadow-[0_8px_24px_rgba(251,188,4,0.12)] hover:border-orange-100' },
                  { title: 'Help Desk', email: 'help.iyabd@gmail.com', glowClass: 'hover:shadow-[0_8px_24px_rgba(52,168,83,0.12)] hover:border-emerald-100' }
              ].map(item => (
                 <div key={item.email} className={`bg-white p-4 rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center gap-4 transition-all duration-300 ${item.glowClass}`}>
                    <div className="flex-shrink-0 flex items-center justify-center bg-white rounded-[14px] w-[52px] h-[52px] p-[10px] shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-slate-50">
                       <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" alt="Gmail" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                       <h4 className="font-bold text-[15px] mb-0.5">{item.title}</h4>
                       <p className="text-slate-500 text-[13px] font-medium truncate">{item.email}</p>
                    </div>
                    <a href={`mailto:${item.email}`} className="px-5 py-2.5 bg-[#0B1023] text-white rounded-[12px] text-[13px] font-semibold hover:bg-black transition-colors whitespace-nowrap shadow-sm">
                       Send Mail
                    </a>
                 </div>
              ))}
           </div>
        </div>

        {/* 5. Connect With Us */}
        <div className="mb-8">
           <h2 className="text-[14px] font-black tracking-widest uppercase text-slate-400 mb-4 pl-2">Connect With Us</h2>
           <div className="space-y-3">
              <a href="https://www.facebook.com/iyabdshop" target="_blank" rel="noreferrer" className="flex items-center gap-4 bg-white p-4 rounded-[16px] border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow group">
                 <div className="w-12 h-12 bg-[#1877F2]/10 text-[#1877F2] rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                 </div>
                 <div className="flex-1">
                    <h4 className="font-bold text-[15px]">Facebook Page</h4>
                    <p className="text-slate-500 font-medium text-[13px]">@iyabdshop</p>
                 </div>
                 <ExternalLink size={18} className="text-slate-300 group-hover:text-[#1877F2] transition-colors" />
              </a>

              <div className="bg-white rounded-[16px] border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-300 group">
                 <button 
                    onClick={() => {
                       setActiveEmbed(activeEmbed === 'tiktok' ? null : 'tiktok');
                       setIframeLoaded(false);
                    }}
                    className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors text-left outline-none"
                 >
                    <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shrink-0">
                       <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 15.68a6.34 6.34 0 006.32 6.32c3.55 0 6.32-2.74 6.32-6.19V8.72a8.21 8.21 0 004.36 1.27v-3.4a4.4 4.4 0 01-2.41-.9z"/></svg>
                    </div>
                    <div className="flex-1">
                       <h4 className="font-bold text-[15px]">{config?.tiktokTitle || 'TikTok'}</h4>
                       <p className="text-slate-500 font-medium text-[13px]">{config?.tiktokUsername || '@iyabdshop'}</p>
                    </div>
                    <ChevronRight size={18} className={`text-slate-300 transition-transform duration-300 ${activeEmbed === 'tiktok' ? 'rotate-90 text-black' : 'group-hover:text-black'}`} />
                 </button>
                 
                 {activeEmbed === 'tiktok' && (
                    <div className="border-t border-slate-100 bg-slate-50 relative w-full h-[500px] sm:h-[600px] overflow-hidden">
                       {!iframeLoaded && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-sm z-10 space-y-3">
                             <Loader2 className="w-8 h-8 text-black animate-spin" />
                             <p className="text-sm font-medium text-slate-500 animate-pulse">Loading amazing videos...</p>
                          </div>
                       )}
                       <iframe 
                          src={config?.tiktokUrl || "https://www.tiktok.com/embed/@iyabdshop"}
                          className={`w-full h-full transition-opacity duration-500 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
                          frameBorder="0"
                          loading="lazy"
                          allowFullScreen
                          onLoad={() => setIframeLoaded(true)}
                       ></iframe>
                    </div>
                 )}
              </div>

              <a href="https://www.youtube.com/@IYABD_01" target="_blank" rel="noreferrer" className="flex items-center gap-4 bg-white p-4 rounded-[16px] border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow group">
                 <div className="w-12 h-12 bg-[#FF0000]/10 text-[#FF0000] rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                 </div>
                 <div className="flex-1">
                    <h4 className="font-bold text-[15px]">YouTube</h4>
                    <p className="text-slate-500 font-medium text-[13px]">@IYABD_01</p>
                 </div>
                 <ExternalLink size={18} className="text-slate-300 group-hover:text-[#FF0000] transition-colors" />
              </a>
           </div>
        </div>

        {/* 6. Office Address */}
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden relative mb-8">
           <div className="p-6 pb-20">
              <h3 className="font-black text-slate-800 text-[18px] flex items-center gap-2 mb-3">
                 <MapPin className="text-blue-600" />
                 Our Office
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed max-w-[80%]">
                 Rayarbag, Haji Wasimuddin Bhuiyan Road,<br/>
                 Ward No. 60,<br/>
                 Dhaka South City Corporation,<br/>
                 Dhaka-1236, Bangladesh
              </p>
           </div>
           
           <a 
              href="https://goo.gl/maps/1" 
              target="_blank" 
              rel="noreferrer"
              className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all"
           >
              <ExternalLink size={24} />
           </a>
        </div>

      </div>
    </div>
  );
}
