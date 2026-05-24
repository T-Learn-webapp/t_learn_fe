'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Loader2,
  MailCheck,
  TriangleAlert,
  ArrowRight,
  LogIn,
} from 'lucide-react';

import { inviteApi } from '@/services/modules/invite';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type AcceptStatus = 'idle' | 'loading' | 'success' | 'error';

export default function AcceptInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = useMemo(() => {
    return searchParams.get('token') || '';
  }, [searchParams]);

  const [status, setStatus] = useState<AcceptStatus>('idle');
  const [message, setMessage] = useState('');
  const [subjectId, setSubjectId] = useState<string | null>(null);

  useEffect(() => {
    const acceptInvitation = async () => {
                console.log('Đang gửi yêu cầu chấp nhận lời mời với token:', token);

      if (!token) {
        setStatus('error');
        setMessage('Link lời mời không hợp lệ hoặc thiếu token.');
        return;
      }

      setStatus('loading');

      try {
        console.log('Đang gửi yêu cầu chấp nhận lời mời với token:', token);
        const res = await inviteApi.acceptInvitation({
          token,
        });

        if (res.data?.isSuccess) {
          const data: any = res.data.data;

          setStatus('success');
          setSubjectId(data?.subjectId || null);
          setMessage(
            data?.message ||
              'Bạn đã tham gia không gian học tập thành công.'
          );

          toast.success('Chấp nhận lời mời thành công');
          return;
        }

        setStatus('error');
        setMessage(res.data?.error || 'Không thể chấp nhận lời mời.');
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Không thể chấp nhận lời mời. Vui lòng đăng nhập hoặc thử lại.';

        setStatus('error');
        setMessage(errorMessage);
      }
    };

    acceptInvitation();
  }, [token]);

  const goToSubject = () => {
    if (subjectId) {
      router.push(`/subjects/${subjectId}`);
      return;
    }

    router.push('/subjects');
  };

  const goToLogin = () => {
    router.push(`/login?returnUrl=${encodeURIComponent(`/accept-invitation?token=${token}`)}`);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardContent className="p-8">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {status === 'loading' ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : status === 'success' ? (
              <CheckCircle2 className="h-7 w-7 text-green-600" />
            ) : status === 'error' ? (
              <TriangleAlert className="h-7 w-7 text-destructive" />
            ) : (
              <MailCheck className="h-7 w-7" />
            )}
          </div>

          <div className="text-center">
            <h1 className="text-xl font-bold">
              {status === 'loading' && 'Đang chấp nhận lời mời...'}
              {status === 'success' && 'Tham gia thành công'}
              {status === 'error' && 'Không thể chấp nhận lời mời'}
              {status === 'idle' && 'Xác nhận lời mời'}
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {status === 'loading'
                ? 'Hệ thống đang kiểm tra lời mời của bạn.'
                : message}
            </p>
          </div>

          <div className="mt-8 space-y-3">
            {status === 'success' && (
              <Button className="w-full gap-2" onClick={goToSubject}>
                Vào không gian học tập
                <ArrowRight size={16} />
              </Button>
            )}

            {status === 'error' && (
              <>
                <Button className="w-full gap-2" onClick={goToLogin}>
                  Đăng nhập rồi thử lại
                  <LogIn size={16} />
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/subjects')}
                >
                  Về trang chủ
                </Button>
              </>
            )}

            {status === 'loading' && (
              <Button disabled className="w-full">
                Đang xử lý...
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}