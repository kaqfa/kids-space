'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ChevronLeft, Lock, CheckCircle, Play, BookOpen, Layers } from 'lucide-react';

interface Topic {
  id: string;
  name: string;
  description: string;
  order: number;
}

interface Subject {
  id: string;
  name: string;
}

export default function TopicListPage() {
  const params = useParams();
  const router = useRouter();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!params.subjectId) return;

      try {
        // Fetch subject
        const subjectDoc = await getDoc(doc(db, 'subjects', params.subjectId as string));
        if (!subjectDoc.exists()) {
          router.push(`/student/${params.studentId}`);
          return;
        }
        setSubject({ id: subjectDoc.id, ...subjectDoc.data() } as Subject);

        // Fetch topics
        const q = query(
          collection(db, 'topics'),
          where('subjectId', '==', params.subjectId),
          orderBy('order')
        );
        const topicSnapshot = await getDocs(q);
        const topicData = topicSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Topic[];
        setTopics(topicData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.subjectId, params.studentId, router]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!subject) return <div className="p-8 text-center">Subject not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-8">
      {/* Sticky Header */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button 
            onClick={() => router.push(`/student/${params.studentId}`)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              {subject.name}
            </h1>
            <p className="text-xs text-gray-500">Pilih Topik</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto py-6 px-4">
        <div className="space-y-4">
          {topics.map((topic, index) => {
            // Mock status for now (can be real later)
            const isLocked = false; 
            const isCompleted = false;

            return (
              <div 
                key={topic.id}
                onClick={() => !isLocked && router.push(`/student/${params.studentId}/subject/${params.subjectId}/topic/${topic.id}`)}
                className={`bg-white p-5 rounded-2xl border border-gray-100 shadow-sm transition-all relative overflow-hidden ${
                  isLocked ? 'opacity-75 cursor-not-allowed bg-gray-50' : 'hover:shadow-md hover:border-blue-200 cursor-pointer active:scale-[0.98]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                    isLocked 
                      ? 'bg-gray-100 text-gray-400' 
                      : isCompleted 
                        ? 'bg-green-100 text-green-600'
                        : 'bg-blue-50 text-blue-600'
                  }`}>
                    {isLocked ? (
                      <Lock className="w-5 h-5" />
                    ) : isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <span className="font-bold text-lg">{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-gray-900 mb-1 truncate ${isLocked ? 'text-gray-500' : ''}`}>
                      {topic.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-0.5 rounded-md">
                        Latihan Soal
                      </span>
                      {isCompleted && (
                        <span className="text-green-600 font-medium">Selesai</span>
                      )}
                    </div>
                  </div>

                  {!isLocked && (
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                      <Play className="w-4 h-4 ml-0.5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {topics.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-900 font-medium">Belum ada topik</p>
            <p className="text-sm text-gray-500 mt-1">Materi sedang disiapkan.</p>
          </div>
        )}
      </main>
    </div>
  );
}
