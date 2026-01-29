import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { supabase } from './supabaseClient';

import CourseList from './CourseList';
import CourseEditor from './CourseEditor';
import Auth from './Auth';
import LessonView from './LessonView';
import Profile from './Profile';
import Landing from './Landing'; // <--- Импорт

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Проверяем, есть ли сессия при загрузке
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Слушаем изменения (вход/выход)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null; // Или красивый спиннер

  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="min-h-screen bg-[#f8f9fa]">
        <Routes>
          {/* Если есть сессия - показываем Курсы, иначе - Лендинг */}
          <Route path="/" element={session ? <CourseList /> : <Landing />} />
          
          <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/" />} />
          
          {/* Защищенные маршруты (только для залогиненных) */}
          <Route path="/profile" element={session ? <Profile /> : <Navigate to="/auth" />} />
          <Route path="/course/:id" element={session ? <CourseEditor /> : <Navigate to="/auth" />} />
          <Route path="/lesson/:id" element={session ? <LessonView /> : <Navigate to="/auth" />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;