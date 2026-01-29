import React, { useEffect, useState } from 'react';
import { X, User, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Lesson } from '../types';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  totalLessons: number; // Общее кол-во уроков, чтобы считать %
}

interface StudentProgress {
  id: string;
  full_name: string;
  email: string;
  completed_count: number;
}

export default function StatsModal({ isOpen, onClose, courseId, totalLessons }: StatsModalProps) {
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) fetchStats();
  }, [isOpen]);

  const fetchStats = async () => {
    setLoading(true);

    // 1. Берем всех учеников (role = student)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('role', 'student');

    if (!profiles) {
        setLoading(false);
        return;
    }

    // 2. Берем весь прогресс по этому курсу
    // Нам нужно узнать, сколько уроков выполнил каждый ученик в рамках ЭТОГО курса
    // Это сложный запрос, сделаем проще: загрузим весь прогресс и отфильтруем в JS
    
    // Сначала найдем ID всех уроков этого курса
    const { data: lessons } = await supabase
        .from('lessons')
        .select('id')
        .eq('course_id', courseId);
    
    const lessonIds = lessons?.map(l => l.id) || [];

    // Теперь грузим таблицу progress для этих уроков
    const { data: progress } = await supabase
        .from('progress')
        .select('user_id, lesson_id')
        .in('lesson_id', lessonIds);

    // 3. Собираем статистику
    const stats = profiles.map(student => {
        const completed = progress?.filter(p => p.user_id === student.id).length || 0;
        return {
            ...student,
            completed_count: completed
        };
    });

    // Сортируем: кто больше сделал - тот выше
    stats.sort((a, b) => b.completed_count - a.completed_count);

    setStudents(stats);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Журнал успеваемости</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
           {loading ? (
               <div className="text-center py-10 text-gray-500">Загрузка данных...</div>
           ) : (
               <table className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                   <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-semibold">
                       <tr>
                           <th className="p-3 text-left">Ученик</th>
                           <th className="p-3 text-center">Прогресс</th>
                           <th className="p-3 text-center">Уроков</th>
                           <th className="p-3 text-center">Статус</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                       {students.length === 0 && (
                           <tr><td colSpan={4} className="p-4 text-center text-gray-400">Нет учеников</td></tr>
                       )}
                       {students.map(student => {
                           const percent = totalLessons > 0 ? Math.round((student.completed_count / totalLessons) * 100) : 0;
                           return (
                               <tr key={student.id} className="hover:bg-gray-50 transition">
                                   <td className="p-3">
                                       <div className="flex items-center gap-3">
                                           <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center text-sky-600">
                                               <User size={16}/>
                                           </div>
                                           <div>
                                               <div className="font-medium text-gray-800">{student.full_name || 'Без имени'}</div>
                                               <div className="text-xs text-gray-400">{student.email}</div>
                                           </div>
                                       </div>
                                   </td>
                                   <td className="p-3">
                                       <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[100px] mx-auto">
                                           <div className="bg-sky-600 h-2.5 rounded-full" style={{ width: `${percent}%` }}></div>
                                       </div>
                                       <div className="text-xs text-center mt-1 text-gray-500">{percent}%</div>
                                   </td>
                                   <td className="p-3 text-center font-medium text-gray-700">
                                       {student.completed_count} / {totalLessons}
                                   </td>
                                   <td className="p-3 text-center">
                                       {percent === 100 ? (
                                           <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                               <CheckCircle size={12}/> Завершен
                                           </span>
                                       ) : percent > 0 ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                                               В процессе
                                           </span>
                                       ) : (
                                            <span className="text-gray-400 text-xs">Не начал</span>
                                       )}
                                   </td>
                               </tr>
                           );
                       })}
                   </tbody>
               </table>
           )}
        </div>
      </div>
    </div>
  );
}