'use client';

import { useEffect, useState } from 'react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BookOpen, Layers, FileQuestion } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    subjects: 0,
    topics: 0,
    questions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const subjectsColl = collection(db, 'subjects');
        const topicsColl = collection(db, 'topics');
        const questionsColl = collection(db, 'questions');

        const [subjectsSnap, topicsSnap, questionsSnap] = await Promise.all([
          getCountFromServer(subjectsColl),
          getCountFromServer(topicsColl),
          getCountFromServer(questionsColl)
        ]);

        setStats({
          subjects: subjectsSnap.data().count,
          topics: topicsSnap.data().count,
          questions: questionsSnap.data().count
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { name: 'Total Mata Pelajaran', value: stats.subjects, icon: BookOpen, color: 'bg-blue-500' },
    { name: 'Total Topik', value: stats.topics, icon: Layers, color: 'bg-purple-500' },
    { name: 'Total Soal', value: stats.questions, icon: FileQuestion, color: 'bg-green-500' },
  ];

  if (loading) {
    return <div className="p-8 text-center">Loading stats...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Admin</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <div key={card.name} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${card.color} text-white`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{card.name}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Selamat Datang di Panel Admin</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Gunakan menu di sebelah kiri untuk mengelola Mata Pelajaran, Topik, dan Soal.
          Anda juga dapat mengimport soal dalam format JSON.
        </p>
      </div>
    </div>
  );
}
