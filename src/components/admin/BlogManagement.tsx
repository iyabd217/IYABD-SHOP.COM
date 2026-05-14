import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Search, MoreVertical, 
  Trash2, Edit2, Globe, Eye, Calendar,
  Image as ImageIcon, Clock, Save
} from 'lucide-react';
import { adminService } from '../../lib/adminServices';
import { motion, AnimatePresence } from 'motion/react';

const BlogManagement = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'add' | 'edit'>('list');
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        image_url: '',
        slug: '',
        category: 'Lifestyle',
        author: 'Admin',
        status: 'published'
    });

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        const data = await adminService.getBlogPosts();
        setPosts(data || []);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.content) return alert('Title and Content are required');
        
        const slug = formData.slug || formData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const postData = { ...formData, slug, updated_at: new Date().toISOString() };

        try {
            if (viewMode === 'edit' && selectedPost) {
                await adminService.updateBlogPost(selectedPost.id, postData);
            } else {
                await adminService.addBlogPost({ ...postData, created_at: new Date().toISOString() });
            }
            setViewMode('list');
            fetchPosts();
        } catch (e) {
            alert('Error saving post');
        }
    };

    const deletePost = async (id: string) => {
        if (!window.confirm('Delete this article?')) return;
        await adminService.deleteBlogPost(id);
        fetchPosts();
    };

    if (loading && posts.length === 0) return <div className="p-10 text-center font-black animate-pulse">LOADING ARTICLES...</div>;

    return (
        <div className="h-full flex flex-col bg-slate-50">
            <header className="p-5 flex justify-between items-center bg-white border-b border-slate-100">
                <div className="flex flex-col">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Content Library</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{posts.length} Articles Published</p>
                </div>
                <button 
                    onClick={() => {
                        setSelectedPost(null);
                        setFormData({ title: '', excerpt: '', content: '', image_url: '', slug: '', category: 'Lifestyle', author: 'Admin', status: 'published' });
                        setViewMode('add');
                    }}
                    className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                >
                    <Plus size={20} strokeWidth={3} />
                </button>
            </header>

            <AnimatePresence mode="wait">
                {viewMode === 'list' ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-5 space-y-4 overflow-y-auto no-scrollbar"
                    >
                        {posts.length > 0 ? posts.map((post) => (
                            <div key={post.id} className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm group">
                                <div className="flex gap-4">
                                    <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0">
                                        {post.image_url ? (
                                            <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <ImageIcon size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest">{post.category}</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setSelectedPost(post); setFormData(post); setViewMode('edit'); }} className="text-slate-400 hover:text-slate-900"><Edit2 size={14} /></button>
                                                <button onClick={() => deletePost(post.id)} className="text-slate-400 hover:text-rose-600"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                        <h4 className="font-bold text-slate-800 text-sm mt-1 truncate">{post.title}</h4>
                                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{post.excerpt}</p>
                                        <div className="flex items-center gap-3 mt-2 text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                                           <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(post.created_at).toLocaleDateString()}</span>
                                           <span className="flex items-center gap-1"><Clock size={10} /> 4 min read</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center text-slate-300 font-bold opacity-40">No articles yet</div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex-1 overflow-y-auto p-6 space-y-6 bg-white"
                    >
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Article Title</label>
                            <input 
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                placeholder="Enter a catchy headline..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500/20"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Featured Image URL</label>
                            <input 
                                value={formData.image_url}
                                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                                placeholder="https://unsplash.com/..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                <select 
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800"
                                >
                                    <option>Lifestyle</option>
                                    <option>Tech</option>
                                    <option>Offers</option>
                                    <option>Company News</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                                <select 
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-bold text-emerald-600"
                                >
                                    <option value="published">Published</option>
                                    <option value="draft">Draft</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Excerpt (Short Summary)</label>
                            <textarea 
                                value={formData.excerpt}
                                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-xs font-bold text-slate-600 h-20 resize-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Content (Markdown)</label>
                            <textarea 
                                value={formData.content}
                                onChange={(e) => setFormData({...formData, content: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-5 text-sm font-medium text-slate-800 h-80 resize-none font-mono"
                            />
                        </div>

                        <div className="flex gap-3 pt-6 border-t border-slate-100">
                             <button 
                                onClick={() => setViewMode('list')}
                                className="flex-1 h-14 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                className="flex-[2] h-14 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-black/10 flex items-center justify-center gap-2"
                            >
                                <Save size={18} /> {viewMode === 'edit' ? 'Update Article' : 'Publish Article'}
                            </button>
                        </div>
                        <div className="h-10"></div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BlogManagement;
