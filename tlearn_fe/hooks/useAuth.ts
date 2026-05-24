import { useEffect, useState, useCallback } from 'react';
import { authApi } from '@/services/modules/auth';
import { User } from '@/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);

      const res = await authApi.getMe();

      console.log(res);
      if (res.data?.data) {
        setUser(res.data.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (
    email: string,
    password: string
  ) => {
    try {
      const res = await authApi.login({
        email,
        password,
      });

      console.log("login res", res)
      if (res.data?.user) {
        toast.success('Đăng nhập thành công!');
        // QUAN TRỌNG
        await checkAuth();
      console.log("login after checkauth")

        // window.location.replace('/subjects');


        return { success: true };
      }

      return {
        success: false,
        error: 'Sai thông tin tài khoản',
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          'Đăng nhập thất bại',
      };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);

      toast.info('Đã đăng xuất');

      window.location.replace('/login');
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    refetchAuth: checkAuth,
  };
}