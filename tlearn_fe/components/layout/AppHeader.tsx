'use client';

import Link from 'next/link';
import {
  BookOpen,
  Crown,
  LogOut,
  Sparkles,
  UserRound,
  CreditCard
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useAuthContext } from '@/components/providers/AuthProvider';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';

const formatDate = (date?: string | null) => {
  if (!date) return null;

  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export function AppHeader() {
  const { user, logout } = useAuthContext();

  const userInitial =
    user?.fullName?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    'U';

  const isVip = !!user?.hasActiveSubscription;

  const planLabel = isVip
    ? user?.currentPlanName || user?.subscriptionType || 'Vip'
    : 'Free';

  const remainingVipDays = user?.remainingVipDays ?? 0;

  const aiRemainingCount = user?.aiRemainingCount ?? 0;
  const aiUsageLimit = user?.aiUsageLimit ?? 0;

  const subscriptionEndDate = formatDate(user?.subscriptionEndDate);
  const aiResetAt = formatDate(user?.aiUsageResetAt);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <Link href="/subjects" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen size={18} />
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-none">TLearn</p>
            <p className="text-[11px] text-muted-foreground">
              Study together
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
          <Link href="/subjects" className="hover:text-foreground">
            Tài liệu
          </Link>

          <Link
            href="/upgrade"
            className="inline-flex items-center gap-1.5 hover:text-foreground"
          >
            <Crown size={15} />
            {isVip ? 'Gói của tôi' : 'Nâng cấp'}
          </Link>

        </nav>

        <div className="flex items-center gap-2">
          {user && (
            <div className="hidden items-center gap-2 lg:flex">
              <Badge
                variant={isVip ? 'default' : 'secondary'}
                className="gap-1.5"
              >
                <Crown size={13} />
                {planLabel}
                {isVip && remainingVipDays > 0
                  ? ` · còn ${remainingVipDays} ngày`
                  : ''}
              </Badge>

              <Badge variant="outline" className="gap-1.5">
                <Sparkles size={13} />
                AI {aiRemainingCount}/{aiUsageLimit}
              </Badge>
            </div>
          )}

          {user && <NotificationDropdown />}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-9 gap-2 rounded-full px-2"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>

                  <span className="hidden max-w-32 truncate text-sm md:inline">
                    {user.fullName || user.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {user.fullName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <div className="px-2 py-2">
                  <div className="rounded-xl border bg-muted/40 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs text-muted-foreground">
                          Gói hiện tại
                        </p>
                        <p className="mt-0.5 truncate text-sm font-semibold">
                          {planLabel}
                        </p>
                      </div>

                      <Badge variant={isVip ? 'default' : 'secondary'}>
                        {isVip ? 'VIP' : 'FREE'}
                      </Badge>
                    </div>

                    {isVip && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Còn {remainingVipDays} ngày
                        {subscriptionEndDate
                          ? ` · hết hạn ${subscriptionEndDate}`
                          : ''}
                      </p>
                    )}

                    {!isVip && (
                      <Button asChild size="sm" className="mt-3 w-full gap-2">
                        <Link href="/upgrade">
                          <Crown size={14} />
                          Nâng cấp Premium
                        </Link>
                      </Button>
                    )}
                  </div>

                  <div className="mt-2 rounded-xl border bg-muted/40 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Lượt AI còn lại
                        </p>
                        <p className="mt-0.5 text-sm font-semibold">
                          {aiRemainingCount}/{aiUsageLimit}
                        </p>
                      </div>

                      <Sparkles size={18} className="text-primary" />
                    </div>

                    {aiResetAt && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Reset: {aiResetAt}
                      </p>
                    )}
                  </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <UserRound className="mr-2 h-4 w-4" />
                    Hồ sơ
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/payment/history" className="cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Lịch sử thanh toán
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/upgrade" className="cursor-pointer">
                    <Crown className="mr-2 h-4 w-4" />
                    {isVip ? 'Quản lý gói' : 'Nâng cấp thành viên'}
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="cursor-pointer text-destructive"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Đăng nhập</Link>
              </Button>

              <Button asChild size="sm">
                <Link href="/register">Đăng ký</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}