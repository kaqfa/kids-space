'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Pencil, Trash2, Layers, ArrowLeft } from 'lucide-react';
import TopicForm from '@/components/admin/TopicForm';
import InlineEdit from '@/components/admin/InlineEdit';
import Link from 'next/link';

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
}

export default function AdminTopicsPage() {
  const params = useParams();
  const subjectId = params.subjectId as string;
  
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // Fetch Subject
      const subjectDoc = await getDoc(doc(db, 'subjects', subjectId));
      if (subjectDoc.exists()) {
        setSubject({ id: subjectDoc.id, ...subjectDoc.data() } as Subject);
      }

      // Fetch Topics
      const q = query(
        collection(db, 'topics'), 
        where('subjectId', '==', subjectId),
        orderBy('order')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Topic[];
      setTopics(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = () => {
    setEditingTopic(null);
    setIsFormOpen(true);
  };

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus topik ini? Semua soal di dalamnya juga akan terhapus (secara logika).')) return;
    
    try {
      await deleteDoc(doc(db, 'topics', id));
      setTopics(topics.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting topic:', error);
      alert('Gagal menghapus topik');
    }
  };

  const handleSubmit = async (data: Omit<Topic, 'id' | 'subjectId'>) => {
    try {
      if (editingTopic) {
        await updateDoc(doc(db, 'topics', editingTopic.id), {
          ...data,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'topics'), {
          ...data,
          subjectId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      fetchData();
    } catch (error) {
      console.error('Error saving topic:', error);
      throw error;
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!subject) return <div className="p-8 text-center">Mata pelajaran tidak ditemukan</div>;

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/subjects" className="text-gray-500 hover:text-blue-600 flex items-center gap-2 mb-2">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Mata Pelajaran
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Topik: {subject.name}</h1>
            <p className="text-gray-500">Kelas {subject.grade}</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Tambah Topik
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <div key={topic.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Layers className="w-6 h-6" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(topic)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(topic.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="mb-1">
              <InlineEdit
                value={topic.name}
                onSave={async (val) => {
                  await updateDoc(doc(db, 'topics', topic.id), { name: val, updatedAt: serverTimestamp() });
                  fetchData();
                }}
                className="text-lg font-bold text-gray-900 block -ml-2"
              />
            </div>
            
            <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
              <span>Urutan:</span>
              <InlineEdit
                value={topic.order}
                type="number"
                onSave={async (val) => {
                  await updateDoc(doc(db, 'topics', topic.id), { order: val, updatedAt: serverTimestamp() });
                  fetchData();
                }}
                className="font-medium text-gray-700"
              />
            </div>
            
            <Link
              href={`/admin/subjects/${subjectId}/topics/${topic.id}/questions`}
              className="block w-full text-center px-4 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 font-medium transition-colors"
            >
              Kelola Soal
            </Link>
          </div>
        ))}
      </div>

      <TopicForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingTopic}
      />
    </div>
  );
}
