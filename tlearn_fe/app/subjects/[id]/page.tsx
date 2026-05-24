import { FileText } from 'lucide-react';

export default function SubjectMainDefaultPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-500 mb-4 border">
        <FileText size={32} />
      </div>
      <h3 className="text-lg font-semibold text-gray-800">Chưa chọn bài học</h3>
      <p className="text-sm text-gray-500 max-w-sm mt-1">
        Vui lòng bấm chọn một bài học từ danh mục bên trái hoặc tạo mới để bắt đầu viết nội dung thời gian thực.
      </p>
    </div>
  );
}