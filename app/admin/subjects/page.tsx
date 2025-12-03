'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import SubjectForm from '@/components/admin/SubjectForm';
import InlineEdit from '@/components/admin/InlineEdit';
import Link from 'next/link';

interface Subject {
  id: string;
  name: string;
  grade: number;
  order: number;
}

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const fetchSubjects = async () => {
    try {
      const q = query(collection(db, 'subjects'), orderBy('grade'), orderBy('order'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Subject[];
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleAdd = () => {
    setEditingSubject(null);
    setIsFormOpen(true);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini? Semua topik dan soal di dalamnya juga akan terhapus (secara logika).')) return;
    
    try {
      await deleteDoc(doc(db, 'subjects', id));
      setSubjects(subjects.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('Gagal menghapus mata pelajaran');
    }
  };

  const handleSubmit = async (data: Omit<Subject, 'id'>) => {
    try {
      if (editingSubject) {
        await updateDoc(doc(db, 'subjects', editingSubject.id), {
          ...data,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'subjects'), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      fetchSubjects();
    } catch (error) {
      console.error('Error saving subject:', error);
      throw error;
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Mata Pelajaran</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Tambah Mapel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <div key={subject.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(subject)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(subject.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="mb-1">
              <InlineEdit
                value={subject.name}
                onSave={async (val) => {
                  await updateDoc(doc(db, 'subjects', subject.id), { name: val, updatedAt: serverTimestamp() });
                  fetchSubjects();
                }}
                className="text-lg font-bold text-gray-900 block -ml-2"
              />
            </div>
            
            <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
              <span>Kelas {subject.grade}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <span>Urutan:</span>
                <InlineEdit
                  value={subject.order}
                  type="number"
                  onSave={async (val) => {
                    await updateDoc(doc(db, 'subjects', subject.id), { order: val, updatedAt: serverTimestamp() });
                    fetchSubjects();
                  }}
                  className="font-medium text-gray-700"
                />
              </div>
            </div>
            
            <Link
              href={`/admin/subjects/${subject.id}/topics`}
              className="block w-full text-center px-4 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 font-medium transition-colors"
            >
              Kelola Topik
            </Link>
          </div>
        ))}
      </div>

      <SubjectForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingSubject}
      />
    </div>
  );
}
