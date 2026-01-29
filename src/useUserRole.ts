import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export function useUserRole() {
  const [role, setRole] = useState<'teacher' | 'student' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkRole();
  }, []);

  const checkRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRole(null);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (data) setRole(data.role);
    } catch (error) {
      console.error('Error checking role:', error);
    } finally {
      setLoading(false);
    }
  };

  return { role, loading, isAdmin: role === 'teacher' };
}