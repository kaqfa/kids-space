import Link from 'next/link';
import { LayoutDashboard, ArrowLeft } from 'lucide-react';
import AdminSidebarTree from './AdminSidebarTree';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col fixed h-full overflow-y-auto">
        <div className="p-6 border-b border-gray-200 shrink-0">
          <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6" />
            Admin Panel
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <AdminSidebarTree />
        </div>

        <div className="p-4 border-t border-gray-100 shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke App
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
