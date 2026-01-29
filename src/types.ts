export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'teacher' | 'student';
}

export interface Course {
  id: number;
  title: string;
  description: string | null;
  teacher_id: string;
  created_at: string;
  // Добавим поле для подсчета учеников позже, пока опционально
  students_count?: number; 
}

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  category: 'zert' | 'inter' | 'test';
  content_link: string | null;
  created_at: string;
  quiz_data?: any;
}