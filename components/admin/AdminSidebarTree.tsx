'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ChevronRight, ChevronDown, BookOpen, Layers, LayoutDashboard, Loader2 } from 'lucide-react';

interface Topic {
  id: string;
  name: string;
  subjectId: string;
  order: number;
}

interface Subject {
  id: string;
  name: string;
  grade: number;
  order: number;
  topics?: Topic[];
}

export default function AdminSidebarTree() {
  const pathname = usePathname();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Subjects
        const subjectsQuery = query(collection(db, 'subjects'), orderBy('grade'), orderBy('order'));
        const subjectsSnap = await getDocs(subjectsQuery);
        const subjectsData = subjectsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          topics: []
        })) as unknown as Subject[];

        // Fetch all Topics (optimized for small-medium dataset)
        // For larger datasets, we should fetch on demand
        const topicsQuery = query(collection(db, 'topics'), orderBy('order'));
        const topicsSnap = await getDocs(topicsQuery);
        const topicsData = topicsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Topic[];

        // Map topics to subjects
        const subjectsWithTopics = subjectsData.map(subject => ({
          ...subject,
          topics: topicsData.filter(topic => topic.subjectId === subject.id)
        }));

        setSubjects(subjectsWithTopics);
      } catch (error) {
        console.error('Error fetching sidebar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleSubject = (subjectId: string) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId);
    } else {
      newExpanded.add(subjectId);
    }
    setExpandedSubjects(newExpanded);
  };

  // Auto-expand based on current path
  useEffect(() => {
    if (subjects.length > 0) {
      const pathParts = pathname.split('/');
      // /admin/subjects/[subjectId]/...
      if (pathParts.includes('subjects') && pathParts[3]) {
        setExpandedSubjects(prev => new Set(prev).add(pathParts[3]));
      }
    }
  }, [pathname, subjects]);

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <nav className="p-4 space-y-1">
      <Link
        href="/admin"
        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
          pathname === '/admin'
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        Dashboard
      </Link>

      <div className="pt-4 pb-2">
        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Mata Pelajaran
        </p>
      </div>

      <Link
        href="/admin/subjects"
        className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
          pathname === '/admin/subjects'
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <BookOpen className="w-4 h-4" />
        Semua Mapel
      </Link>

      <div className="space-y-1 mt-2">
        {subjects.map((subject) => {
          const isExpanded = expandedSubjects.has(subject.id);
          const isActive = pathname.includes(`/subjects/${subject.id}`);
          
          return (
            <div key={subject.id}>
              <div
                className={`flex items-center justify-between px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  isActive && !pathname.includes('/topics/') // Highlight subject only if not deep in topic
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => toggleSubject(subject.id)}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="truncate">{subject.name} <span className="text-xs text-gray-400 font-normal">(Kls {subject.grade})</span></span>
                </div>
              </div>

              {isExpanded && (
                <div className="ml-9 space-y-1 mt-1 border-l-2 border-gray-100 pl-2">
                  <Link
                    href={`/admin/subjects/${subject.id}/topics`}
                    className={`block px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      pathname === `/admin/subjects/${subject.id}/topics`
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Kelola Topik
                  </Link>
                  {subject.topics?.map((topic) => {
                    const isTopicActive = pathname.includes(`/topics/${topic.id}`);
                    return (
                      <Link
                        key={topic.id}
                        href={`/admin/subjects/${subject.id}/topics/${topic.id}/questions`}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isTopicActive
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Layers className="w-3 h-3" />
                        <span className="truncate">{topic.name}</span>
                      </Link>
                    );
                  })}
                  {subject.topics?.length === 0 && (
                    <p className="px-3 py-2 text-xs text-gray-400 italic">Belum ada topik</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
