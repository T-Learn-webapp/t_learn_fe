'use client';

import Link from 'next/link';
import { BookOpen, LogOut, UserRound } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar';
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

export function AppHeader() {
  const { user, logout } = useAuthContext();

  const userInitial =
    user?.fullName?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    'U';

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
            Không gian học
          </Link>
          <Link href="/subjects" className="hover:text-foreground">
            Tài liệu
          </Link>
          <Link href="/subjects" className="hover:text-foreground">
            Todo
          </Link>
        </nav>

        <div className="flex items-center gap-2">
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

              <DropdownMenuContent align="end" className="w-56">
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

                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <UserRound className="mr-2 h-4 w-4" />
                    Hồ sơ
                  </Link>
                </DropdownMenuItem>

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