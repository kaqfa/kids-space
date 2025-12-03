'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Trash2, GraduationCap, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Student {
  id: string;
  name: string;
  grade: number;
}

export default function StudentList() {
  const { user } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGrade, setNewStudentGrade] = useState(6);

  useEffect(() => {
    if (!user) return;

    const fetchStudents = async () => {
      const q = query(
        collection(db, 'students'),
        where('createdBy', '==', user.uid)
      );
      
      const snapshot = await getDocs(q);
      const studentData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      
      setStudents(studentData);
      setLoading(false);
    };

    fetchStudents();
  }, [user]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newStudentName) return;

    try {
      const docRef = await addDoc(collection(db, 'students'), {
        name: newStudentName,
        grade: newStudentGrade,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setStudents([...students, { id: docRef.id, name: newStudentName, grade: newStudentGrade }]);
      setNewStudentName('');
      setShowModal(false);
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  const handleDeleteStudent = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Apakah anda yakin ingin menghapus data anak ini?')) return;

    try {
      await deleteDoc(doc(db, 'students', id));
      setStudents(students.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end px-1">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Profil Anak</h2>
          <p className="text-sm text-gray-500">Pilih profil untuk mulai belajar</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white p-3 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:scale-105 transition-all active:scale-95"
          title="Tambah Anak"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {students.map((student, index) => (
          <div 
            key={student.id} 
            onClick={() => router.push(`/student/${student.id}`)}
            className="group relative bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8 opacity-10 transition-transform group-hover:scale-110 ${
              index % 2 === 0 ? 'bg-blue-600' : 'bg-purple-600'
            }`} />
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md ${
                  index % 2 === 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-purple-500 to-purple-600'
                }`}>
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{student.name}</h3>
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-0.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Kelas {student.grade} SD</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => handleDeleteStudent(student.id, e)}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
            
            {/* Simple Progress Bar Placeholder */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>Progress Belajar</span>
                <span>0%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full w-0" />
              </div>
            </div>
          </div>
        ))}

        {students.length === 0 && (
          <div 
            onClick={() => setShowModal(true)}
            className="col-span-full py-12 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer gap-3"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <p className="font-medium">Tambah profil anak pertama</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md p-6 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10 duration-300">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden" />
            
            <h3 className="text-xl font-bold text-gray-900 mb-6">Tambah Profil Anak</h3>
            
            <form onSubmit={handleAddStudent} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  placeholder="Contoh: Budi Santoso"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kelas</label>
                <div className="grid grid-cols-2 gap-3">
                  {[3, 6].map((grade) => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => setNewStudentGrade(grade)}
                      className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                        newStudentGrade === grade
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200'
                      }`}
                    >
                      Kelas {grade}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
