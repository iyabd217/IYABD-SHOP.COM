import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, AlertCircle, Mail, Megaphone, FileText, List as ListIcon, Trash2, CheckCircle } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, getDocs, addDoc } from 'firebase/firestore';

import { handleFirestoreError, OperationType } from '../../lib/adminServices';

export default function CustomerMessagesManager({ activeTab }: { activeTab: string }) {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true);
            try {
                const q = query(collection(db, 'customer-emails'), orderBy('time', 'desc'));
                const snap = await getDocs(q);
                setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (err) {
                console.error("Failed to load messages", err);
                handleFirestoreError(err, OperationType.LIST, 'customer-emails');
            }
            setLoading(false);
        };
        if (['all-messages', 'failed-emails', 'order-emails'].includes(activeTab)) {
            fetchMessages();
        } else {
            setLoading(false);
        }
    }, [activeTab]);

    const ManualSend = () => {
        const [form, setForm] = useState({ to: '', subject: '', message: '' });
        const [sending, setSending] = useState(false);

        const handleSend = async (e: React.FormEvent) => {
            e.preventDefault();
            setSending(true);
            try {
                await fetch('/api/email/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: form.to,
                        subject: form.subject,
                        html: `<div style="font-family:sans-serif;color:#333;"><p>${form.message.replace(/\n/g, '<br/>')}</p></div>`,
                    })
                });
                setForm({ to: '', subject: '', message: '' });
                alert('Email sent successfully!');
            } catch (err) {
                alert('Error sending email. Check console.');
                console.error(err);
            }
            setSending(false);
        };

        return (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3"><Send className="text-primary"/> Send Custom Email</h3>
                <form onSubmit={handleSend} className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">To Email</label>
                        <input required type="email" value={form.to} onChange={e => setForm({...form, to: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3" placeholder="customer@example.com"/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Subject</label>
                        <input required type="text" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3" placeholder="Special Offer for You"/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Message</label>
                        <textarea required value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 h-32" placeholder="Write your message..."></textarea>
                    </div>
                    <button disabled={sending} className="bg-primary text-white font-bold py-3 px-8 rounded-xl w-full flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all">
                        {sending ? 'Sending...' : 'Send Message'} <Send size={18}/>
                    </button>
                </form>
            </div>
        );
    };

    const MessageList = ({ filter }: { filter?: 'sent' | 'failed' | 'order' }) => {
        let displayData = messages;
        if (filter === 'failed') displayData = messages.filter(m => m.status === 'failed');
        if (filter === 'sent') displayData = messages.filter(m => m.status === 'sent');
        // Simple order filter logic: subject includes 'Order'
        if (filter === 'order') displayData = messages.filter(m => String(m.subject).toLowerCase().includes('order'));

        return (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">To</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Subject</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {displayData.map((m, i) => (
                            <tr key={m.id || i} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                    {m.status === 'sent' ? (
                                        <span className="bg-green-100 text-green-700 px-3 py-1 border-white border text-xs font-bold rounded-lg flex inline-flex items-center gap-1"><CheckCircle size={14}/> Sent</span>
                                    ) : (
                                        <span className="bg-red-100 text-red-700 px-3 py-1 border-white border text-xs font-bold rounded-lg flex inline-flex items-center gap-1"><AlertCircle size={14}/> Failed</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm font-semibold text-slate-700">{Array.isArray(m.to) ? m.to.join(', ') : m.to}</td>
                                <td className="px-6 py-4 text-sm text-slate-600">{m.subject}</td>
                                <td className="px-6 py-4 text-xs text-slate-400">
                                    {m.time?.toDate ? m.time.toDate().toLocaleString() : new Date(m.time).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                        {displayData.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-slate-500">No messages found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    if (loading) return <div className="p-10 text-center animate-pulse">Loading Messages...</div>;

    switch (activeTab) {
        case 'manual-send': return <ManualSend />;
        case 'failed-emails': return <MessageList filter="failed" />;
        case 'order-emails': return <MessageList filter="order" />;
        case 'campaigns': return (
            <div className="p-10 bg-white border border-slate-100 rounded-3xl text-center">
                <Megaphone className="mx-auto text-slate-300 mb-4" size={48} />
                <h2 className="text-2xl font-bold text-slate-800">Campaigns Manager</h2>
                <p className="text-slate-500">Feature coming soon. Connects with Supabase marketing bucket.</p>
            </div>
        );
        case 'templates': return (
            <div className="p-10 bg-white border border-slate-100 rounded-3xl text-center">
                <FileText className="mx-auto text-slate-300 mb-4" size={48} />
                <h2 className="text-2xl font-bold text-slate-800">Email Templates</h2>
                <p className="text-slate-500">Edit templates for Order Confirm, Shipping, and Cancel.</p>
            </div>
        );
        case 'all-messages':
        default:
            return <MessageList />;
    }
}
