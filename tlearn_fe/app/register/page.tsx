'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  UserRound,
  Lock,
  UserPlus,
} from 'lucide-react';

import { toast } from '@/lib/toast';
import { inviteApi } from '@/services/modules/invite';
import { authApi } from '@/services/modules/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const invitedEmail = searchParams.get('email') || '';
  const inviteToken = searchParams.get('inviteToken') || '';
  const returnUrl = searchParams.get('returnUrl');

  const isInviteRegister = useMemo(() => {
    return Boolean(inviteToken);
  }, [inviteToken]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(invitedEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!fullName.trim()) {
      toast.error('Vui lòng nhập họ tên');
      return false;
    }

    if (!isInviteRegister && !email.trim()) {
      toast.error('Vui lòng nhập email');
      return false;
    }

    if (!password.trim()) {
      toast.error('Vui lòng nhập mật khẩu');
      return false;
    }

    if (password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return false;
    }

    return true;
  };

  const handleRegisterWithInvitation = async () => {
    const res = await inviteApi.acceptInvitationWithRegistration({
      token: inviteToken,
      fullName: fullName.trim(),
      password,
    });

    if (res.data?.isSuccess) {
      toast.success('Đăng ký và tham gia lời mời thành công');

      router.push(
        `/login?returnUrl=${encodeURIComponent(returnUrl || '/subjects')}`
      );

      return;
    }

    toast.error(
      res.data?.error ||
        'Không thể đăng ký bằng lời mời. Vui lòng thử lại.'
    );
  };

  const handleNormalRegister = async () => {
    await authApi.register({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
    });

    toast.success('Đăng ký tài khoản thành công');

    router.push('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isInviteRegister) {
        await handleRegisterWithInvitation();
      } else {
        await handleNormalRegister();
      }
    } catch (error: any) {
      console.error('Register error:', error);

      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Không thể đăng ký tài khoản'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50" />
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl" />
      </div>

      <Card className="w-full max-w-md rounded-2xl border-white/70 bg-white/90 shadow-2xl shadow-slate-200 backdrop-blur">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            {isInviteRegister ? (
              <CheckCircle2 size={26} />
            ) : (
              <UserPlus size={26} />
            )}
          </div>

          <div>
            <CardTitle className="text-2xl">
              {isInviteRegister
                ? 'Tạo tài khoản để tham gia'
                : 'Đăng ký tài khoản'}
            </CardTitle>

            <CardDescription className="mt-2">
              {isInviteRegister
                ? 'Bạn đã được mời vào một không gian học tập. Hoàn tất đăng ký để tham gia.'
                : 'Tạo tài khoản mới để bắt đầu học tập cùng nhóm.'}
            </CardDescription>
          </div>

          {isInviteRegister && (
            <div className="flex justify-center">
              <Badge variant="secondary" className="gap-1.5">
                <Mail size={13} />
                {invitedEmail || 'Email được mời'}
              </Badge>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>

              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyen Van B"
                  className="pl-9"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="pl-9"
                  disabled={loading || isInviteRegister}
                />
              </div>

              {isInviteRegister && (
                <p className="text-xs text-muted-foreground">
                  Email được lấy từ lời mời và không thể thay đổi.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="String@1"
                  className="px-9"
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="pl-9"
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="h-11 w-full gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  {isInviteRegister
                    ? 'Đăng ký và tham gia'
                    : 'Đăng ký'}
                  <ArrowRight size={16} />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Đã có tài khoản?{' '}
            <Link
              href={
                isInviteRegister
                  ? `/login?returnUrl=${encodeURIComponent(
                      `/accept-invitation?token=${inviteToken}`
                    )}`
                  : '/login'
              }
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Đăng nhập
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}