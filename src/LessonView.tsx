import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { Lesson } from './types';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export default function LessonView() {
  const { id } = useParams<{ id: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchLesson();
  }, [id]);

  const fetchLesson = async () => {
    const { data } = await supabase.from('lessons').select('*').eq('id', id).single();
    setLesson(data);
    setLoading(false);
  };

  // Хелпер для получения embed ссылки YouTube
  const getYoutubeEmbed = (url: string) => {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  if (loading) return <div className="p-10 text-center">Загрузка урока...</div>;
  if (!lesson) return <div className="p-10 text-center text-red-500">Урок не найден</div>;

  const youtubeUrl = lesson.content_link ? getYoutubeEmbed(lesson.content_link) : null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-5xl mx-auto p-6">
        <Link to={`/course/${lesson.course_id}`} className="flex items-center gap-2 text-sky-600 mb-6 hover:underline">
           <ArrowLeft size={18} /> Вернуться к курсу
        </Link>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{lesson.title}</h1>
            <div className="h-1 w-20 bg-sky-500 mb-6 rounded-full"></div>

            {!lesson.content_link ? (
                <div className="p-10 bg-gray-100 text-center text-gray-500 rounded border border-dashed border-gray-300">
                    В этом уроке пока нет материалов.
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Если это YouTube, показываем плеер */}
                    {youtubeUrl ? (
                        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-lg">
                            <iframe 
                                src={youtubeUrl} 
                                title="YouTube video player" 
                                className="w-full h-full"
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                            ></iframe>
                        </div>
                    ) : (
                        // Если другая ссылка (например PhET или статья)
                        <div className="p-6 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-blue-900 text-lg mb-1">Материал урока</h3>
                                <p className="text-blue-700 text-sm break-all">{lesson.content_link}</p>
                            </div>
                            <a 
                                href={lesson.content_link} 
                                target="_blank" 
                                rel="noreferrer"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition whitespace-nowrap"
                            >
                                <ExternalLink size={16}/> Открыть
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}