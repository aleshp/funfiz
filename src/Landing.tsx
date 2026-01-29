import React from 'react';
import { Link } from 'react-router-dom';
import { Atom, BookOpen, CheckCircle, ArrowRight, Zap } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      
      {/* HEADER */}
      <nav className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-light tracking-wide flex items-center gap-2">
            <div className="bg-sky-600 text-white p-1.5 rounded-lg">
                <Atom size={24} />
            </div>
            <span className="font-bold text-gray-900">FUNFIZ</span>
        </div>
        <div className="flex gap-4">
            <Link to="/auth" className="px-4 py-2 text-gray-600 hover:text-sky-600 font-medium transition">
                Войти
            </Link>
            <Link to="/auth" className="px-5 py-2 bg-sky-600 text-white rounded-full font-medium hover:bg-sky-700 transition shadow-lg shadow-sky-200">
                Начать обучение
            </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="max-w-6xl mx-auto px-6 py-20 flex flex-col-reverse lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
            <div className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Физика для школьников
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                Изучай физику <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-purple-600">
                    легко и интересно
                </span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed max-w-lg">
                Интерактивные уроки, виртуальные лаборатории и тесты для 7-11 классов. Подготовься к ЕНТ играючи!
            </p>
            <div className="flex gap-4 pt-4">
                <Link to="/auth" className="px-8 py-4 bg-sky-600 text-white rounded-lg font-bold text-lg hover:bg-sky-700 transition flex items-center gap-2 shadow-xl shadow-sky-200 hover:-translate-y-1">
                    Попробовать бесплатно <ArrowRight size={20}/>
                </Link>
            </div>
        </div>
        
        {/* Иллюстрация (абстрактная физика) */}
        <div className="flex-1 relative">
            <div className="absolute top-0 right-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -left-4 w-72 h-72 bg-sky-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            
            <div className="relative bg-white/80 backdrop-blur-sm border border-white/50 p-6 rounded-2xl shadow-2xl rotate-3 hover:rotate-0 transition duration-500">
                <div className="flex items-center gap-4 mb-4 border-b pb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <CheckCircle size={24}/>
                    </div>
                    <div>
                        <div className="font-bold text-gray-800">Ньютон заңдары</div>
                        <div className="text-sm text-green-600">Урок пройден</div>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="h-2 bg-gray-100 rounded w-full"></div>
                    <div className="h-2 bg-gray-100 rounded w-5/6"></div>
                    <div className="h-2 bg-gray-100 rounded w-4/6"></div>
                </div>
                <div className="mt-6 flex justify-between items-center">
                    <div className="text-xs text-gray-400">Прогресс</div>
                    <div className="font-bold text-sky-600">100%</div>
                </div>
            </div>
        </div>
      </header>

      {/* FEATURES */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Почему выбирают FUNFIZ?</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                        <Zap size={24}/>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Интерактивность</h3>
                    <p className="text-gray-500">Забудь про скучные учебники. Видео, симуляции и игры в каждом уроке.</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-4">
                        <BookOpen size={24}/>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Полная программа</h3>
                    <p className="text-gray-500">Все темы для 7, 8, 9, 10 и 11 классов соответствуют школьной программе.</p>
                </div>
                <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
                        <CheckCircle size={24}/>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Отслеживание</h3>
                    <p className="text-gray-500">Учитель видит твой прогресс, а ты получаешь баллы за каждое задание.</p>
                </div>
            </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
              <div className="text-xl font-bold flex items-center gap-2">
                  <Atom size={24} className="text-sky-400"/> FUNFIZ
              </div>
              <div className="text-gray-400 text-sm">
                  © 2025 Aiym Asylbekovna. Все права защищены.
              </div>
          </div>
      </footer>
    </div>
  );
}