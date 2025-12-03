'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Pencil, Trash2, FileQuestion, ArrowLeft, Upload, Copy } from 'lucide-react';
import QuestionForm from '@/components/admin/QuestionForm';
import Link from 'next/link';
import JsonImporter from '@/components/admin/JsonImporter';

interface Question {
  id: string;
  questionText: string;
  questionType: 'pilgan' | 'essay' | 'isian';
  difficulty: 'mudah' | 'sedang' | 'sulit';
  options?: string[];
  answerKey: string;
  explanation: string;
  hasImage: boolean;
  imageUrl?: string;
  hasMath: boolean;
}

interface Topic {
  id: string;
  name: string;
  subjectId: string;
}

export default function AdminQuestionsPage() {
  const params = useParams();
  const subjectId = params.subjectId as string;
  const topicId = params.topicId as string;
  
  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // Fetch Topic
      const topicDoc = await getDoc(doc(db, 'topics', topicId));
      if (topicDoc.exists()) {
        setTopic({ id: topicDoc.id, ...topicDoc.data() } as Topic);
      }

      // Fetch Questions
      const q = query(
        collection(db, 'questions'), 
        where('topicId', '==', topicId)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Question[];
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = () => {
    setEditingQuestion(null);
    setIsFormOpen(true);
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus soal ini?')) return;
    
    try {
      await deleteDoc(doc(db, 'questions', id));
      setQuestions(questions.filter(q => q.id !== id));
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Gagal menghapus soal');
    }
  };

  const handleSubmit = async (data: Omit<Question, 'id'>) => {
    try {
      if (editingQuestion) {
        await updateDoc(doc(db, 'questions', editingQuestion.id), {
          ...data,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'questions'), {
          ...data,
          topicId,
          subjectId, // Denormalized for easier querying if needed
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      fetchData();
    } catch (error) {
      console.error('Error saving question:', error);
      throw error;
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!topic) return <div className="p-8 text-center">Topik tidak ditemukan</div>;

  return (
    <div>
      <div className="mb-6">
        <Link href={`/admin/subjects/${subjectId}/topics`} className="text-gray-500 hover:text-blue-600 flex items-center gap-2 mb-2">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Topik
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Soal: {topic.name}</h1>
            <p className="text-gray-500">{questions.length} Soal Tersedia</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsImportOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
            >
              <Upload className="w-5 h-5" />
              Import JSON
            </button>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Tambah Soal
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold text-sm">
                  {index + 1}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  question.difficulty === 'mudah' ? 'bg-green-100 text-green-800' :
                  question.difficulty === 'sedang' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {question.difficulty}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {question.questionType}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // Create a copy of the question
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { id, ...rest } = question;
                    const copy = {
                      ...rest,
                      questionText: `${rest.questionText} (Copy)`,
                    };
                    setEditingQuestion(copy as Question); // Cast to Question to satisfy type, though id is undefined which is fine for "Add" mode
                    setIsFormOpen(true);
                  }}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Duplikat Soal"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEdit(question)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(question.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <p className="text-gray-900 mb-4 line-clamp-2">{question.questionText}</p>
            
            <div className="text-sm text-gray-500">
              <span className="font-medium">Kunci:</span> {question.answerKey}
            </div>
          </div>
        ))}

        {questions.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <FileQuestion className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada soal di topik ini.</p>
            <p className="text-sm text-gray-400">Tambahkan manual atau import dari JSON.</p>
          </div>
        )}
      </div>

      <QuestionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingQuestion}
      />

      <JsonImporter
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        subjectId={subjectId}
        topicId={topicId}
        onSuccess={fetchData}
      />
    </div>
  );
}
