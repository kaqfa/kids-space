'use client';

import { useAuth } from '@/contexts/AuthContext';
import StudentList from '@/components/StudentList';
import { LogOut, Award, CheckCircle, LayoutDashboard } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [totalProgress, setTotalProgress] = useState(0);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'progress'),
          where('createdBy', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        setTotalProgress(snapshot.size);
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    };
    fetchProgress();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-8">
      {/* Mobile Header */}
      <nav className="bg-white sticky top-0 z-50 border-b border-gray-100 px-4 py-3 flex justify-between items-center sm:hidden">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="font-bold text-lg text-gray-900">Bank Soal</span>
        </div>
        <div className="flex gap-2">
          <Link href="/admin" className="p-2 text-gray-500 hover:bg-gray-50 rounded-full">
            <LayoutDashboard className="w-5 h-5" />
          </Link>
          <button onClick={handleLogout} className="p-2 text-gray-500 hover:bg-gray-50 rounded-full">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Desktop Header */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">Bank Soal SD</h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-900">Orang Tua</span>
                <span className="text-xs text-gray-500">{user?.email}</span>
              </div>
              <Link
                href="/admin"
                className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                title="Admin Dashboard"
              >
                <LayoutDashboard className="w-5 h-5" />
              </Link>
              <button
                onClick={handleLogout}
                className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                title="Keluar"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-10 mb-8 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Halo, Parents! 👋</h2>
            <p className="text-blue-100 text-sm sm:text-lg max-w-2xl leading-relaxed">
              Siap mendampingi buah hati belajar hari ini?
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <StudentList />
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                <Award className="w-5 h-5 text-amber-500" />
                Statistik Global
              </h2>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Soal Selesai</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-3xl font-bold text-gray-900">{totalProgress}</p>
                      <span className="text-sm text-gray-500">soal</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Tips Hari Ini</h3>
                <div className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Konsistensi adalah kunci. 15 menit setiap hari lebih baik daripada 2 jam seminggu sekali.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
