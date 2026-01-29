import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  Settings, 
  Plus, 
  FlaskConical, 
  Gamepad2, 
  FileCheck, 
  Trash2, 
  PlayCircle, 
  CheckCircle, 
  BarChart2, 
  Paperclip, 
  Loader2, 
  FileQuestion, 
  Users 
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { Lesson, Course } from './types';
import toast from 'react-hot-toast';
import Modal from './components/Modal';
import LessonPlayer from './components/LessonPlayer';
import StatsModal from './components/StatsModal';
import QuizBuilder from './components/QuizBuilder';
import StudentManager from './components/StudentManager';
import { useUserRole } from './useUserRole';

export default function CourseEditor() {
  const { id } = useParams<{ id: string }>();
  
  // Данные
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { isAdmin } = useUserRole();

  // Состояния Модальных окон
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false); // <--- Управление учениками

  // Состояния для создания урока
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonLink, setNewLessonLink] = useState('');
  const [activeCategory, setActiveCategory] = useState<'zert' | 'inter' | 'test'>('zert');
  const [uploadingFile, setUploadingFile] = useState(false);

  // Состояния для редактирования
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editLink, setEditLink] = useState('');
  
  // Состояния для редактирования теста
  const [editingQuizLesson, setEditingQuizLesson] = useState<Lesson | null>(null);

  // Состояние просмотра урока
  const [viewingLesson, setViewingLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    
    // 1. Загружаем курс
    const { data: courseData } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();
    setCourse(courseData);

    // 2. Загружаем уроки
    const { data: lessonsData } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', id)
      .order('created_at', { ascending: true });
    setLessons(lessonsData || []);

    // 3. Загружаем прогресс (если есть юзер)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: progressData } = await supabase
          .from('progress')
          .select('lesson_id')
          .eq('user_id', user.id);
        
        if (progressData) {
          setCompletedLessonIds(progressData.map(p => p.lesson_id));
        }
    }
    setLoading(false);
  };

  // --- ОБРАБОТЧИКИ ---

  const handleCompleteLesson = async (lessonId: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('progress')
        .insert([{ user_id: user.id, lesson_id: lessonId }]);

      if (!error) {
          toast.success('Молодец! Урок пройден 🎉');
          setCompletedLessonIds([...completedLessonIds, lessonId]);
      } else { 
          toast('Урок уже был пройден'); 
      }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      setUploadingFile(true);
      
      try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}.${fileExt}`;
          const filePath = `${id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('course_materials')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
            .from('course_materials')
            .getPublicUrl(filePath);
          
          setNewLessonLink(data.publicUrl);
          toast.success('Файл загружен! Ссылка создана.');
      } catch (error: any) {
          toast.error('Ошибка загрузки: ' + error.message);
      } finally {
          setUploadingFile(false);
      }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim() || !id) return;
    try {
        const { error } = await supabase.from('lessons').insert([{ 
            course_id: parseInt(id), 
            title: newLessonTitle, 
            category: activeCategory, 
            content_link: newLessonLink.trim() || null 
        }]);

        if (error) throw error;
        toast.success('Задание добавлено');
        setIsAddModalOpen(false);
        fetchData();
    } catch (error) { 
        toast.error('Ошибка создания'); 
    }
  };

  const handleUpdateLesson = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingLesson) return;
      try {
          const { error } = await supabase
            .from('lessons')
            .update({ content_link: editLink })
            .eq('id', editingLesson.id);

          if (error) throw error;
          toast.success('Сохранено');
          setIsEditModalOpen(false);
          fetchData();
      } catch (error) { 
          toast.error('Ошибка сохранения'); 
      }
  };

  const handleSaveQuiz = async (questions: any[]) => {
      if (!editingQuizLesson) return;
      try {
          const { error } = await supabase
            .from('lessons')
            .update({ quiz_data: questions })
            .eq('id', editingQuizLesson.id);

          if (error) throw error;
          toast.success('Тест сохранен!');
          setIsQuizModalOpen(false);
          fetchData();
      } catch (error: any) {
          toast.error('Ошибка: ' + error.message);
      }
  };

  const deleteLesson = async (lessonId: number) => {
      if(!confirm('Точно удалить?')) return;
      const { error } = await supabase.from('lessons').delete().eq('id', lessonId);
      if(!error) { 
          toast.success('Удалено'); 
          fetchData(); 
      }
  };

  // --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ОТКРЫТИЯ ОКОН ---

  const openAddModal = (category: 'zert' | 'inter' | 'test') => {
      setActiveCategory(category);
      setNewLessonTitle('');
      setNewLessonLink('');
      setIsAddModalOpen(true);
  };

  const openEditModal = (lesson: Lesson) => {
      setEditingLesson(lesson);
      setEditLink(lesson.content_link || '');
      setIsEditModalOpen(true);
  };

  const openQuizModal = (lesson: Lesson) => {
      setEditingQuizLesson(lesson);
      setIsQuizModalOpen(true);
  };

  // --- КОМПОНЕНТ СЕКЦИИ ---
  const Section = ({ title, icon: Icon, items, category, color }: any) => (
    <div className="mb-8">
      <div className={`flex items-center gap-2 mb-4 pb-2 border-b-2 ${color}`}>
        <Icon size={24} className="text-gray-700" />
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        {isAdmin && (
            <button 
                onClick={() => openAddModal(category)} 
                className="ml-auto text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full flex items-center gap-1 transition text-gray-600"
            >
             <Plus size={14}/> Добавить
            </button>
        )}
      </div>
      
      <div className="grid gap-3">
        {items.length === 0 && <p className="text-gray-400 italic text-sm">Пока пусто</p>}
        {items.map((item: Lesson) => {
            const isCompleted = completedLessonIds.includes(item.id);
            const hasQuiz = item.quiz_data && Array.isArray(item.quiz_data) && item.quiz_data.length > 0;
            
            return (
            <div key={item.id} className={`p-4 border rounded-lg shadow-sm transition flex justify-between items-center group ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:shadow-md'}`}>
                <div className="flex flex-col flex-1">
                    <button 
                        onClick={() => setViewingLesson(item)} 
                        className="font-medium text-lg flex items-center gap-2 text-left w-full outline-none focus:underline"
                    >
                        {isCompleted ? <CheckCircle size={20} className="text-green-500 shrink-0" /> : <PlayCircle size={20} className="text-sky-500 shrink-0"/>}
                        <span className={isCompleted ? 'text-green-800' : 'text-sky-700 hover:text-sky-900'}>{item.title}</span>
                    </button>
                    {item.content_link && !isCompleted && !hasQuiz && <span className="text-xs text-gray-400 truncate max-w-xs mt-1 ml-7">Нажмите, чтобы начать</span>}
                    {hasQuiz && <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded w-fit ml-7 mt-1 font-bold">ТЕСТ</span>}
                </div>
                
                {isAdmin && (
                    <div className="flex gap-2">
                        {/* Кнопка Теста */}
                        <button 
                            onClick={() => openQuizModal(item)} 
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition"
                            title="Конструктор теста"
                        >
                            <FileQuestion size={20} />
                        </button>

                        {/* Кнопка Настройки */}
                        <button 
                            onClick={() => openEditModal(item)} 
                            className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded transition"
                        >
                            <Settings size={20} />
                        </button>
                        
                        {/* Кнопка Удалить */}
                        <button 
                            onClick={() => deleteLesson(item.id)} 
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                )}
            </div>
            );
        })}
      </div>
    </div>
  );

  const labs = lessons.filter(l => l.category === 'zert');
  const interactive = lessons.filter(l => l.category === 'inter');
  const tests = lessons.filter(l => l.category === 'test');

  if (loading) return <div className="p-6 text-gray-500">Загрузка...</div>;
  if (!course) return <div className="p-6 text-red-500">Курс не найден</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      
      {/* Плеер урока */}
      <LessonPlayer 
         lesson={viewingLesson} 
         onClose={() => setViewingLesson(null)} 
         onComplete={handleCompleteLesson} 
         isCompleted={viewingLesson ? completedLessonIds.includes(viewingLesson.id) : false} 
      />
      
      {/* Окна статистики и управления */}
      <StatsModal 
        isOpen={isStatsOpen} 
        onClose={() => setIsStatsOpen(false)} 
        courseId={id || ''} 
        totalLessons={lessons.length} 
      />
      
      <Modal isOpen={isStudentsModalOpen} onClose={() => setIsStudentsModalOpen(false)} title="Управление учениками">
          <StudentManager courseId={id || ''} />
      </Modal>

      {/* Конструктор тестов */}
      <Modal isOpen={isQuizModalOpen} onClose={() => setIsQuizModalOpen(false)} title="Конструктор теста">
          <div className="max-h-[70vh] overflow-y-auto pr-2">
             <QuizBuilder 
                initialData={editingQuizLesson?.quiz_data} 
                onSave={handleSaveQuiz} 
             />
          </div>
      </Modal>

      {/* Окно создания урока */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Добавить задание">
          <form onSubmit={handleAddLesson} className="flex flex-col gap-4">
            <div>
                <label className="block text-sm font-medium mb-1">Название *</label>
                <input 
                    autoFocus 
                    type="text" 
                    className="w-full border p-2 rounded" 
                    value={newLessonTitle} 
                    onChange={(e) => setNewLessonTitle(e.target.value)} 
                    required 
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium mb-1">Ссылка на материал</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        className="w-full border p-2 rounded text-sm" 
                        placeholder="https://... или загрузите файл ->" 
                        value={newLessonLink} 
                        onChange={(e) => setNewLessonLink(e.target.value)} 
                    />
                    
                    <label className={`bg-gray-100 border border-gray-300 text-gray-700 px-3 rounded flex items-center justify-center cursor-pointer hover:bg-gray-200 transition ${uploadingFile ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {uploadingFile ? <Loader2 size={20} className="animate-spin"/> : <Paperclip size={20}/>}
                        <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploadingFile} />
                    </label>
                </div>
            </div>

            <button disabled={uploadingFile} className="bg-sky-600 text-white py-2 rounded disabled:opacity-50">Добавить</button>
        </form>
      </Modal>

      {/* Окно редактирования ссылки */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Редактировать ссылку">
          <form onSubmit={handleUpdateLesson} className="flex flex-col gap-4">
             <div>
                <input 
                    type="text" 
                    className="w-full border p-2 rounded" 
                    value={editLink} 
                    onChange={(e) => setEditLink(e.target.value)} 
                />
             </div>
             <button className="bg-green-600 text-white py-2 rounded">Сохранить</button>
          </form>
      </Modal>

      {/* --- ЗАГОЛОВОК И КНОПКИ --- */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
            <div>
                <Link to="/" className="text-sky-600 text-sm hover:underline">« Все курсы</Link>
                <h1 className="text-3xl font-bold text-gray-900 mt-2">{course.title}</h1>
                <p className="text-gray-500 text-sm mt-1">{isAdmin ? 'Панель управления учителя' : 'Учебные материалы'}</p>
            </div>

            {isAdmin && (
                <div className="flex gap-2 mt-6">
                    <button 
                        onClick={() => setIsStudentsModalOpen(true)}
                        className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50 transition"
                    >
                        <Users size={20} className="text-sky-600"/> 
                        <span>Ученики</span>
                    </button>

                    <button 
                        onClick={() => setIsStatsOpen(true)}
                        className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50 transition"
                    >
                        <BarChart2 size={20} className="text-green-600"/> 
                        <span>Успеваемость</span>
                    </button>
                </div>
            )}
        </div>
      </div>

      <Section title="Зертханалық жұмыстар" icon={FlaskConical} items={labs} category="zert" color="border-purple-500"/>
      <Section title="Интерактивті тапсырмалар" icon={Gamepad2} items={interactive} category="inter" color="border-orange-500"/>
      <Section title="Бақылау тесттері" icon={FileCheck} items={tests} category="test" color="border-green-500"/>
    </div>
  );
}