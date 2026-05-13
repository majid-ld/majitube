'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  username?: string;
  avatar_url?: string;
  parent_id?: string;
}

export default function CommentsSection({ videoId }: { videoId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const fetchComments = async () => {
    const res = await fetch(`/api/videos/${videoId}/comments`);
    if (res.ok) {
      const data = await res.json();
      setComments(data.comments || []);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    
    try {
      const res = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      });
      if (res.ok) {
        setNewComment('');
        fetchComments();
      } else if (res.status === 401) {
        alert('Please login to comment');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentId: string) => {
    if (!replyContent.trim()) return;
    
    try {
      const res = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent, parentId })
      });
      if (res.ok) {
        setReplyContent('');
        setReplyingTo(null);
        fetchComments();
      } else if (res.status === 401) {
        alert('Please login to reply');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const rootComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId);

  return (
    <div className="mt-12 pt-10 border-t border-white/5 font-inter">
      <div className="flex items-center gap-3 mb-8">
        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Discussion</h3>
        <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-black text-neutral-500">{comments.length}</span>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-4 mb-12 group">
        <div className="w-10 h-10 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-violet-400 text-xl">account_circle</span>
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all font-medium placeholder-neutral-600"
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="absolute right-2 top-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-0 disabled:scale-90 text-white w-9 h-9 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-violet-600/20"
          >
            <span className="material-symbols-outlined text-xl">send</span>
          </button>
        </div>
      </form>

      <div className="space-y-8">
        {rootComments.map((comment) => (
          <div key={comment.id} className="flex gap-4 group">
            <Link href={`/${comment.username || comment.user_id}`} className="shrink-0">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden group-hover:border-violet-500/30 transition-colors">
                {comment.avatar_url ? (
                  <img src={comment.avatar_url} alt={comment.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-neutral-600">person</span>
                )}
              </div>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <Link href={`/${comment.username || comment.user_id}`} className="font-bold text-white text-sm tracking-tight hover:text-violet-400 transition-colors">
                  @{comment.username || 'Anonymous'}
                </Link>
                <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-neutral-400 leading-relaxed font-medium">{comment.content}</p>
              
              <div className="mt-2">
                <button 
                  onClick={() => { setReplyingTo(replyingTo === comment.id ? null : comment.id); setReplyContent(''); }}
                  className="text-xs font-bold text-neutral-500 hover:text-white transition-colors"
                >
                  REPLY
                </button>
              </div>
              
              {replyingTo === comment.id && (
                <div className="mt-4 flex gap-3">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-violet-500/50 transition-all placeholder-neutral-600"
                  />
                  <button
                    onClick={() => handleReplySubmit(comment.id)}
                    disabled={!replyContent.trim()}
                    className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-4 rounded-xl text-xs font-bold transition-all"
                  >
                    Reply
                  </button>
                </div>
              )}

              {getReplies(comment.id).length > 0 && (
                <div className="mt-4 space-y-4 pl-4 border-l-2 border-white/5">
                  {getReplies(comment.id).map(reply => (
                    <div key={reply.id} className="flex gap-3 group/reply">
                      <Link href={`/${reply.username || reply.user_id}`} className="shrink-0">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover/reply:border-violet-500/30 transition-colors">
                          {reply.avatar_url ? (
                            <img src={reply.avatar_url} alt={reply.username} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-neutral-600 text-sm">person</span>
                          )}
                        </div>
                      </Link>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <Link href={`/${reply.username || reply.user_id}`} className="font-bold text-white text-xs tracking-tight hover:text-violet-400 transition-colors">
                            @{reply.username || 'Anonymous'}
                          </Link>
                          <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">
                            {new Date(reply.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 leading-relaxed font-medium">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="text-center py-12 glass-card rounded-3xl border-white/5">
            <span className="material-symbols-outlined text-neutral-700 text-4xl mb-3">forum</span>
            <p className="text-neutral-500 text-xs font-black uppercase tracking-[0.2em]">Silence is gold. Be the first to break it.</p>
          </div>
        )}
      </div>
    </div>
  );
}

