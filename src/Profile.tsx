import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { User, Camera, ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
          navigate('/auth');
          return;
      }
      setUserId(user.id);

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, role, avatar_url')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setFullName(data.full_name);
      setRole(data.role);
      setAvatarUrl(data.avatar_url);
    } catch (error) {
      toast.error('Ошибка загрузки профиля');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('Обновляем профиль для:', user.id); // Для отладки

      const { error } = await supabase
        .from('profiles')
        .update({ 
            full_name: fullName, 
            avatar_url: avatarUrl,
            // role мы не обновляем, чтобы ученик не стал учителем сам
        })
        .eq('id', user.id);

      if (error) {
          console.error('Ошибка Supabase:', error);
          throw error;
      }
      
      toast.success('Профиль успешно обновлен!');
      
      // Небольшая задержка и обновление данных, чтобы убедиться
      setTimeout(() => getProfile(), 500);
      
    } catch (error: any) {
      toast.error('Ошибка: ' + error.message);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Выберите файл');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Загружаем файл в Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Получаем публичную ссылку
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      setAvatarUrl(data.publicUrl);
      toast.success('Фото загружено! Нажмите "Сохранить"');
    } catch (error: any) {
      toast.error('Ошибка загрузки: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="bg-sky-600 p-4 flex items-center text-white">
            <Link to="/" className="mr-4 hover:bg-sky-700 p-1 rounded-full"><ArrowLeft size={20}/></Link>
            <h2 className="text-xl font-bold">Личный кабинет</h2>
        </div>
        
        <div className="p-8 flex flex-col items-center">
            {/* Аватарка */}
            <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 bg-gray-200 flex items-center justify-center">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <User size={64} className="text-gray-400" />
                    )}
                </div>
                <label className="absolute bottom-0 right-0 bg-sky-600 text-white p-2 rounded-full cursor-pointer hover:bg-sky-700 shadow-md transition transform group-hover:scale-110">
                    <Camera size={18} />
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={uploadAvatar} 
                        className="hidden" 
                        disabled={uploading}
                    />
                </label>
            </div>
            <div className="mt-2 text-sm text-gray-500">
                {uploading ? 'Загрузка...' : 'Нажмите на камеру, чтобы сменить фото'}
            </div>

            {/* Форма */}
            <div className="w-full mt-8 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ваше имя</label>
                    <input 
                        type="text" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
                    <div className="w-full border p-2 rounded bg-gray-100 text-gray-500">
                        {role === 'teacher' ? 'Учитель' : 'Ученик'}
                    </div>
                </div>

                <button 
                    onClick={updateProfile}
                    className="w-full bg-sky-600 text-white py-2 rounded font-bold hover:bg-sky-700 transition flex items-center justify-center gap-2"
                >
                    <Save size={18}/> Сохранить изменения
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}