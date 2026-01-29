import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student'); // 'student' или 'teacher'
  const [isLogin, setIsLogin] = useState(true); // Переключатель Вход / Регистрация
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // ЛОГИКА ВХОДА
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/'); // Перекидываем на главную
      } else {
        // ЛОГИКА РЕГИСТРАЦИИ
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password 
        });
        if (error) throw error;

        // Если регистрация успешна, сохраняем роль и имя в таблицу profiles
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ 
                id: data.user.id, 
                email: email, 
                full_name: fullName, 
                role: role 
            }]);
          if (profileError) throw profileError;
        }
        alert('Регистрация успешна! Теперь войдите.');
        setIsLogin(true);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {isLogin ? 'Вход в FUNFIZ' : 'Регистрация'}
        </h2>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">ФИО</label>
              <input 
                type="text" 
                className="w-full border p-2 rounded mt-1"
                placeholder="Айгүл Асанова"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              className="w-full border p-2 rounded mt-1"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Пароль</label>
            <input 
              type="password" 
              className="w-full border p-2 rounded mt-1"
              placeholder="******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Кто вы?</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="role" 
                    checked={role === 'student'} 
                    onChange={() => setRole('student')}
                  />
                  Ученик
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="role" 
                    checked={role === 'teacher'} 
                    onChange={() => setRole('teacher')}
                  />
                  Учитель
                </label>
              </div>
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full bg-cyan-600 text-white py-2 rounded hover:bg-cyan-700 transition"
          >
            {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'} 
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-cyan-600 font-medium ml-1 hover:underline"
          >
            {isLogin ? 'Создать' : 'Войти'}
          </button>
        </p>
      </div>
    </div>
  );
}