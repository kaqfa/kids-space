'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BookOpen, ChevronLeft } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  grade: number;
  order: number;
}

interface Student {
  id: string;
  name: string;
  grade: number;
}

export default function StudentDashboard() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!params.studentId) return;

      try {
        // Fetch student
        const studentDoc = await getDoc(doc(db, 'students', params.studentId as string));
        if (!studentDoc.exists()) {
          router.push('/dashboard');
          return;
        }
        const studentData = { id: studentDoc.id, ...studentDoc.data() } as Student;
        setStudent(studentData);

        // Fetch subjects for student's grade
        const q = query(
          collection(db, 'subjects'),
          where('grade', '==', studentData.grade),
          orderBy('order')
        );
        const subjectSnapshot = await getDocs(q);
        const subjectData = subjectSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Subject[];
        setSubjects(subjectData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.studentId, router]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!student) return <div className="p-8 text-center">Student not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-8">
      {/* Sticky Header */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button 
            onClick={() => router.push('/dashboard')}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              {student.name}
            </h1>
            <p className="text-xs text-gray-500">Kelas {student.grade} SD</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
            {student.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto py-6 px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pilih Mata Pelajaran</h2>
          <p className="text-gray-500 text-sm">Mau belajar apa hari ini?</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {subjects.map((subject, index) => {
            // Generate distinct colors based on index
            const colors = [
              'from-blue-500 to-blue-600',
              'from-emerald-500 to-emerald-600',
              'from-purple-500 to-purple-600',
              'from-amber-500 to-amber-600',
              'from-rose-500 to-rose-600',
              'from-cyan-500 to-cyan-600',
            ];
            const colorClass = colors[index % colors.length];

            return (
              <div 
                key={subject.id}
                onClick={() => router.push(`/student/${student.id}/subject/${subject.id}`)}
                className={`group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-100 h-32 sm:h-40`}
              >
                {/* Background Gradient Accent */}
                <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${colorClass}`} />
                
                {/* Decorative Circle */}
                <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br ${colorClass} group-hover:scale-150 transition-transform duration-500`} />

                <div className="h-full p-5 flex flex-col justify-between relative z-10 pl-7">
                  <div className="flex justify-between items-start">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colorClass} text-white shadow-md`}>
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="bg-gray-50 px-2 py-1 rounded-lg text-xs font-medium text-gray-500">
                      0% Selesai
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {subject.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Klik untuk mulai belajar
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {subjects.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium">Belum ada mata pelajaran</p>
            <p className="text-sm text-gray-500 mt-1">Silakan hubungi admin untuk menambahkan.</p>
          </div>
        )}
      </main>
    </div>
  );
}
