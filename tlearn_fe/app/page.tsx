import Link from 'next/link';
import {
  BookOpen,
  CheckCircle2,
  Users,
  Sparkles,
  Clock,
  FileText,
  ArrowRight,
  ListTodo,
} from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50" />
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute -right-32 top-20 h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-purple-200/30 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_75%)]" />
      </div>

      {/* Navbar */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <BookOpen size={20} />
          </div>

          <div>
            <p className="text-sm font-bold leading-none">TLearn</p>
            <p className="text-xs text-slate-500">Study together</p>
          </div>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <a href="#features" className="hover:text-indigo-600">
            Tính năng
          </a>
          <a href="#workflow" className="hover:text-indigo-600">
            Cách hoạt động
          </a>
          <a href="#preview" className="hover:text-indigo-600">
            Giao diện
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 sm:block"
          >
            Đăng nhập
          </Link>

          <Link
            href="/register"
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-200 transition hover:bg-indigo-600"
          >
            Bắt đầu
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm backdrop-blur">
            <Sparkles size={16} />
            Học nhóm, giao việc và ghi chú realtime
          </div>

          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl md:text-6xl">
            Học bài chung dễ hơn với TodoList và tài liệu realtime.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Tạo không gian học tập, viết tài liệu cùng nhau, giao việc cho từng
            thành viên và theo dõi tiến độ ngay trong một nơi.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/subjects"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 text-sm font-semibold text-white shadow-xl shadow-indigo-200 transition hover:bg-indigo-700"
            >
              Vào không gian học tập
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600"
            >
              Đăng nhập tài khoản
            </Link>
          </div>

          <div className="mt-10 grid max-w-lg grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold text-slate-950">Realtime</p>
              <p className="text-sm text-slate-500">Soạn bài chung</p>
            </div>

            <div>
              <p className="text-2xl font-bold text-slate-950">Todo</p>
              <p className="text-sm text-slate-500">Theo dõi tiến độ</p>
            </div>

            <div>
              <p className="text-2xl font-bold text-slate-950">Team</p>
              <p className="text-sm text-slate-500">Phân quyền học nhóm</p>
            </div>
          </div>
        </div>

        {/* Preview card */}
        <div id="preview" className="relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-indigo-200/60 to-cyan-200/60 blur-2xl" />

          <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-2xl shadow-slate-200 backdrop-blur">
            <div className="flex items-center justify-between border-b bg-slate-50/80 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
              </div>

              <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
                OOP trong C# · đang học chung
              </div>
            </div>

            <div className="grid min-h-[520px] md:grid-cols-[220px_1fr]">
              <aside className="border-r bg-slate-50/80 p-4">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Users size={16} />
                  Nhóm học
                </div>

                <div className="space-y-2">
                  {['An', 'Bình', 'Chi'].map((name, index) => (
                    <div
                      key={name}
                      className="flex items-center gap-2 rounded-xl bg-white p-2 shadow-sm"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                        {name[0]}
                      </div>
                      <div>
                        <p className="text-xs font-semibold">{name}</p>
                        <p className="text-[11px] text-slate-400">
                          {index === 0 ? 'Đang chỉnh sửa' : 'Online'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <ListTodo size={16} />
                  Todo
                </div>

                <div className="space-y-2">
                  <TodoPreview title="Đọc Class & Object" done />
                  <TodoPreview title="Làm ví dụ kế thừa" />
                  <TodoPreview title="Tóm tắt đa hình" />
                </div>
              </aside>

              <section className="bg-[#f1f3f4] p-6">
                <div className="mx-auto min-h-[420px] rounded-sm bg-white p-8 shadow-[0_1px_3px_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)]">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-indigo-600">
                        Tài liệu học tập
                      </p>
                      <h2 className="mt-1 text-2xl font-bold">
                        Lập trình hướng đối tượng
                      </h2>
                    </div>

                    <div className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                      Đã lưu realtime
                    </div>
                  </div>

                  <div className="space-y-4 text-sm leading-7 text-slate-600">
                    <p>
                      OOP là phương pháp lập trình dựa trên các đối tượng, giúp
                      tổ chức code rõ ràng và dễ mở rộng.
                    </p>

                    <div className="rounded-2xl border bg-slate-50 p-4">
                      <p className="mb-2 font-semibold text-slate-800">
                        Các khái niệm chính:
                      </p>

                      <ul className="space-y-2">
                        <li>• Class và Object</li>
                        <li>• Inheritance - Kế thừa</li>
                        <li>• Polymorphism - Đa hình</li>
                        <li>• Encapsulation - Đóng gói</li>
                      </ul>
                    </div>

                    <div className="h-3 w-2/3 rounded-full bg-slate-100" />
                    <div className="h-3 w-5/6 rounded-full bg-slate-100" />
                    <div className="h-3 w-1/2 rounded-full bg-slate-100" />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Tính năng chính
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Một nơi cho cả học bài, làm việc nhóm và quản lý tiến độ.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <FeatureCard
            icon={<FileText size={22} />}
            title="Tài liệu học tập realtime"
            description="Nhiều người có thể cùng chỉnh sửa nội dung bài học, lưu snapshot và theo dõi thay đổi."
          />

          <FeatureCard
            icon={<ListTodo size={22} />}
            title="TodoList theo bài học"
            description="Tạo công việc, giao cho thành viên, đặt deadline và cập nhật trạng thái học tập."
          />

          <FeatureCard
            icon={<Users size={22} />}
            title="Không gian học nhóm"
            description="Mời thành viên, phân quyền xem, bình luận, chỉnh sửa hoặc quản lý nhóm học."
          />
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-[2rem] border bg-white/80 p-8 shadow-xl shadow-slate-200/60 backdrop-blur md:p-12">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                Cách hoạt động
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight">
                Từ môn học đến todo chỉ trong vài bước.
              </h2>
              <p className="mt-4 text-slate-600">
                Tạo subject, thêm tài liệu, mời bạn học và chia nhỏ nội dung
                thành các công việc có thể theo dõi.
              </p>
            </div>

            <div className="space-y-4">
              <StepItem
                number="01"
                title="Tạo không gian học tập"
                description="Mỗi môn học hoặc nhóm học là một subject riêng."
              />
              <StepItem
                number="02"
                title="Viết tài liệu chung"
                description="Cùng nhau chỉnh sửa nội dung bài học theo thời gian thực."
              />
              <StepItem
                number="03"
                title="Giao Todo cho thành viên"
                description="Chia việc, đặt hạn nộp và cập nhật trạng thái hoàn thành."
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="overflow-hidden rounded-[2rem] bg-slate-950 px-8 py-12 text-center text-white shadow-2xl shadow-slate-300">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Sẵn sàng học nhóm hiệu quả hơn?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Bắt đầu tạo không gian học tập đầu tiên và quản lý tiến độ học của
            nhóm ngay hôm nay.
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              href="/subjects"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-slate-950 transition hover:bg-indigo-50"
            >
              Bắt đầu học ngay
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/80 p-6 shadow-lg shadow-slate-200/60 backdrop-blur transition hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        {icon}
      </div>

      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-3 leading-7 text-slate-600">{description}</p>
    </div>
  );
}

function StepItem({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border bg-slate-50 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
        {number}
      </div>

      <div>
        <h3 className="font-bold">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function TodoPreview({
  title,
  done = false,
}: {
  title: string;
  done?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white p-2 text-xs shadow-sm">
      {done ? (
        <CheckCircle2 size={16} className="text-green-500" />
      ) : (
        <Clock size={16} className="text-slate-400" />
      )}

      <span className={done ? 'text-slate-400 line-through' : 'text-slate-700'}>
        {title}
      </span>
    </div>
  );
}