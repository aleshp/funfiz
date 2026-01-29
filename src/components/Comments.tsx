import React, { useEffect, useState } from 'react';
import { Send, Trash2, User } from 'lucide-react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

interface Comment {
  id: number;
  text: string;
  created_at: string;
  user_id: string;
  // Теперь запрашиваем и аватарку
  profiles: { full_name: string; role: string; avatar_url: string | null }; 
}

interface CommentsProps {
  lessonId: number;
  currentUserId: string | null;
  isAdmin: boolean;
}

export default function Comments({ lessonId, currentUserId, isAdmin }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [lessonId]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id, text, created_at, user_id,
        profiles ( full_name, role, avatar_url ) 
      `) // <--- Добавили avatar_url сюда
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: true });

    if (!error && data) {
        // @ts-ignore 
        setComments(data);
    }
    setLoading(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUserId) return;

    const { error } = await supabase
        .from('comments')
        .insert([{ lesson_id: lessonId, user_id: currentUserId, text: newComment }]);

    if (error) {
        toast.error('Ошибка отправки');
    } else {
        setNewComment('');
        fetchComments();
    }
  };

  const handleDelete = async (id: number) => {
      if(!confirm('Удалить комментарий?')) return;
      const { error } = await supabase.from('comments').delete().eq('id', id);
      if(!error) fetchComments();
  };

  return (
    <div className="bg-gray-50 border-t border-gray-200 flex flex-col h-full">
      <div className="p-3 bg-white border-b border-gray-200 font-bold text-gray-700 text-sm flex items-center gap-2">
        Обсуждение урока 
        <span className="bg-gray-100 text-gray-500 px-2 rounded-full text-xs">{comments.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
        {loading && <div className="text-center text-gray-400 text-xs">Загрузка...</div>}
        {!loading && comments.length === 0 && (
            <div className="text-center text-gray-400 text-sm mt-4">Вопросов пока нет.</div>
        )}
        
        {comments.map((c) => {
            const isMe = c.user_id === currentUserId;
            const isTeacher = c.profiles.role === 'teacher';
            const avatar = c.profiles.avatar_url;

            return (
                <div key={c.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                    {/* АВАТАРКА */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden border ${isTeacher ? 'border-sky-500 ring-1 ring-sky-500' : 'border-gray-300'}`}>
                        {avatar ? (
                            <img src={avatar} className="w-full h-full object-cover" alt="ava" />
                        ) : (
                            <div className={`w-full h-full flex items-center justify-center ${isTeacher ? 'bg-sky-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                                <User size={14}/>
                            </div>
                        )}
                    </div>
                    
                    {/* ТЕКСТ */}
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm group relative shadow-sm ${
                        isMe ? 'bg-sky-100 text-gray-800 rounded-tr-none' : 'bg-white border border-gray-200 text-gray-700 rounded-tl-none'
                    }`}>
                        <div className="font-bold text-[10px] mb-0.5 opacity-60 uppercase tracking-wide flex items-center gap-1">
                            {c.profiles.full_name} 
                            {isTeacher && <span className="text-sky-600 font-extrabold bg-sky-50 px-1 rounded border border-sky-100">TEACHER</span>}
                        </div>
                        <div className="leading-relaxed">{c.text}</div>

                        {(isMe || isAdmin) && (
                            <button 
                                onClick={() => handleDelete(c.id)}
                                className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow border opacity-0 group-hover:opacity-100 transition text-red-500 hover:bg-red-50 z-10"
                            >
                                <Trash2 size={10}/>
                            </button>
                        )}
                    </div>
                </div>
            );
        })}
      </div>

      <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex gap-2">
        <input 
            type="text" 
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
            placeholder="Ваш вопрос..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
        />
        <button className="bg-sky-600 text-white p-2 rounded-full hover:bg-sky-700 transition shadow-sm">
            <Send size={16} className="ml-0.5" />
        </button>
      </form>
    </div>
  );
}