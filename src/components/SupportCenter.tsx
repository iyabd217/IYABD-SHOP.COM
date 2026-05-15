import React, { useState, useEffect, useRef } from 'react';
import { 
  Headset, MessageCircle, Mail, Phone, 
  Send, Paperclip, Bot, MapPin, Loader2, ChevronRight, ExternalLink, CheckCheck
} from 'lucide-react';
import { useAuth } from '../lib/authContext';
import { configService } from '../lib/services';
import { cmsService } from '../lib/cmsService';

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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [fullscreenEmbed, setFullscreenEmbed] = useState<'facebook' | 'tiktok' | 'youtube' | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    const initSupport = async () => {
      const firestoreSupport = await configService.getSupport();
      const aiTraining = await cmsService.getAiTraining();
      const socialLinks = await cmsService.getSocialLinks();

      // Merge and update
      setConfig({
        ...firestoreSupport,
        socialLinks,
        aiTraining
      });

      // Update welcome message if greeting is found
      if (aiTraining?.greetings?.welcome) {
        setChat([{
          id: 'welcome',
          from: 'ai',
          text: aiTraining.greetings.welcome,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else if (aiTraining?.greetings?.assalamualaikum) {
        setChat([{
          id: 'welcome',
          from: 'ai',
          text: aiTraining.greetings.assalamualaikum,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }

      setLoading(false);
    };

    initSupport();
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

  if (isChatOpen) {
    return (
      <div className="fixed inset-0 bg-slate-50 z-[99999] flex flex-col animate-in slide-in-from-bottom-5 duration-300">
        <div className="bg-slate-900 p-5 flex items-center justify-between shadow-xl z-20 shrink-0">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center relative">
                 <Bot size={24} className="text-white" />
                 <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-[3px] border-slate-900 rounded-full"></span>
              </div>
              <div>
                 <h3 className="text-white font-bold tracking-widest text-[13px] mb-0.5">IYABD AI ASSISTANT</h3>
                 <p className="text-slate-400 font-medium text-[12px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    Online
                 </p>
              </div>
           </div>
           <button onClick={() => setIsChatOpen(false)} className="w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 md:px-10 lg:px-20 pt-8 pb-32 space-y-6">
           {chat.map((c) => (
             <div key={c.id} className={`flex ${c.from === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
                {c.from === 'ai' && (
                   <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm">
                      <Bot size={20} />
                   </div>
                )}
                <div className="max-w-[85%] md:max-w-[70%]">
                   <div className={`p-4 md:p-5 text-[15px] leading-relaxed shadow-[0_4px_16px_rgba(0,0,0,0.04)] font-medium transition-all
                      ${c.from === 'user' 
                         ? 'bg-blue-600 text-white rounded-[24px] rounded-tr-[6px]' 
                         : 'bg-white border text-slate-700 rounded-[24px] rounded-tl-[6px] whitespace-pre-line'}`}
                   >
                      {c.text}
                   </div>
                   <p className={`text-[11px] text-slate-400 font-bold mt-2 flex items-center gap-1.5 ${c.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {c.time}
                      {c.from === 'user' && <CheckCheck size={14} className="text-blue-500" />}
                   </p>
                </div>
             </div>
           ))}
           
           {isTyping && (
              <div className="flex justify-start gap-3">
                 <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <Bot size={20} />
                 </div>
                 <div className="bg-white border px-5 py-4 h-[50px] shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-[24px] rounded-tl-[6px] flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                 </div>
              </div>
           )}
           <div ref={chatBottomRef}></div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-slate-50 border-t border-slate-200">
           <div className="max-w-4xl mx-auto flex items-end gap-3 bg-white p-2 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-slate-100 relative">
              <textarea 
                 value={message}
                 onChange={(e) => setMessage(e.target.value)}
                 onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                       e.preventDefault();
                       handleSendChat();
                    }
                 }}
                 placeholder="Message IYABD Assistant..."
                 className="flex-1 bg-transparent border-none outline-none resize-none max-h-[120px] min-h-[44px] py-3 px-5 text-[15px] font-medium text-slate-700"
                 rows={1}
              />
              <button 
                 onClick={() => handleSendChat()}
                 disabled={!message.trim() || isTyping}
                 className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0 hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-300 transition-colors shadow-md"
              >
                 <Send size={20} className="ml-1" />
              </button>
           </div>
        </div>
      </div>
    );
  }

  if (fullscreenEmbed) {
    return (
      <div className="fixed inset-0 bg-white z-[99999] flex flex-col animate-in slide-in-from-bottom-5 duration-300">
         <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white z-10 shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
            <button 
               onClick={() => { setFullscreenEmbed(null); setIframeLoaded(false); }}
               className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-[12px] font-bold text-[14px] transition-colors"
            >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
               Back
            </button>
            <h2 className="font-bold text-[16px] absolute left-1/2 -translate-x-1/2">
               {fullscreenEmbed === 'facebook' && 'Facebook'}
               {fullscreenEmbed === 'tiktok' && 'TikTok'}
               {fullscreenEmbed === 'youtube' && 'YouTube'}
            </h2>
            <button 
               onClick={() => { setFullscreenEmbed(null); setIframeLoaded(false); }}
               className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
            >
               <svg className="w-5 h-5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
               </svg>
            </button>
         </div>
         <div className="flex-1 w-full bg-slate-50 relative overflow-hidden flex flex-col">
            {!iframeLoaded && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 backdrop-blur-sm z-10 space-y-3">
                  <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
               </div>
            )}
            {fullscreenEmbed === 'facebook' && (
               <iframe 
                  src={`https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fiyabdshop&tabs=timeline&width=500&height=800&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`}
                  className={`w-full h-full border-none transition-opacity duration-500 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
                  loading="lazy"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  onLoad={() => setIframeLoaded(true)}
               ></iframe>
            )}
            {fullscreenEmbed === 'tiktok' && (
               <iframe 
                  src={config?.tiktokUrl || "https://www.tiktok.com/embed/@iyabdshop"}
                  className={`w-full h-full border-none transition-opacity duration-500 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
                  loading="lazy"
                  allowFullScreen
                  onLoad={() => setIframeLoaded(true)}
               ></iframe>
            )}
            {fullscreenEmbed === 'youtube' && (
               <iframe 
                  src="https://www.youtube.com/embed?listType=search&list=IYABD_01"
                  className={`w-full h-full border-none transition-opacity duration-500 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
                  loading="lazy"
                  allowFullScreen
                  onLoad={() => setIframeLoaded(true)}
               ></iframe>
            )}
         </div>
      </div>
    );
  }

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

        {/* 3. AI Chat Assistant Button */}
        <button 
           onClick={() => setIsChatOpen(true)}
           className="w-full bg-slate-900 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden mb-8 border border-slate-100 flex items-center justify-between p-5 hover:bg-slate-800 transition-colors group text-left"
        >
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center relative">
                 <Bot size={24} className="text-white" />
                 <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-[3px] border-slate-900 rounded-full animate-pulse"></span>
              </div>
              <div>
                 <h3 className="text-white font-bold tracking-widest text-[14px] mb-1">IYABD AI ASSISTANT</h3>
                 <p className="text-slate-400 font-medium text-[12px] flex items-center gap-1.5">
                    Click to start chat
                 </p>
              </div>
           </div>
           <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <ChevronRight size={20} />
           </div>
        </button>

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
        <div className="mb-8 overflow-visible">
            <h2 className="text-[14px] font-black tracking-widest uppercase text-slate-400 mb-4 pl-2">Connect With Us</h2>
            <div className="flex flex-row justify-between items-center w-full">
               
               <button 
                  onClick={() => { setFullscreenEmbed('facebook'); setIframeLoaded(false); }}
                  className="bg-white rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-slate-100/50 hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col items-center justify-center h-[90px] outline-none group"
                  style={{ width: '31.5%' }}
               >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" alt="Facebook" className="w-8 h-8 object-contain mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-[12px] sm:text-[13px] text-slate-800">Facebook</h4>
               </button>

               <button 
                  onClick={() => { setFullscreenEmbed('tiktok'); setIframeLoaded(false); }}
                  className="bg-white rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-slate-100/50 hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col items-center justify-center h-[90px] outline-none group"
                  style={{ width: '31.5%' }}
               >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/34/Ionicons_logo-tiktok.svg" alt="TikTok" className="w-8 h-8 object-contain mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-[12px] sm:text-[13px] text-slate-800">TikTok</h4>
               </button>

               <button 
                  onClick={() => { setFullscreenEmbed('youtube'); setIframeLoaded(false); }}
                  className="bg-white rounded-[20px] shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-slate-100/50 hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col items-center justify-center h-[90px] outline-none group"
                  style={{ width: '31.5%' }}
               >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg" alt="YouTube" className="w-8 h-8 object-contain mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-[12px] sm:text-[13px] text-slate-800">YouTube</h4>
               </button>

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
