'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  order: number;
}

interface Topic {
  id: string;
  name: string;
  subjectId: string;
}

export default function QuestionPage() {
  const params = useParams();
  const router = useRouter();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!params.topicId || !params.studentId) return;

      try {
        // Fetch topic
        const topicDoc = await getDoc(doc(db, 'topics', params.topicId as string));
        if (!topicDoc.exists()) {
          router.push(`/student/${params.studentId}/subject/${params.subjectId}`);
          return;
        }
        setTopic({ id: topicDoc.id, ...topicDoc.data() } as Topic);

        // Fetch questions
        const q = query(
          collection(db, 'questions'),
          where('topicId', '==', params.topicId),
          orderBy('order')
        );
        const questionSnapshot = await getDocs(q);
        const questionData = questionSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Question[];
        setQuestions(questionData);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.topicId, params.studentId, params.subjectId, router]);

  // New handlers for quiz navigation and answering
  const handleAnswer = (questionId: string, selectedOption: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
  };

  const handlePrev = () => {
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1));
  };

  const handleSubmit = () => {
    // TODO: Implement submission logic, e.g., send answers to backend, calculate score.
    console.log('Quiz submitted!', answers);
    alert('Quiz submitted! Check console for answers.');
    // For demonstration, redirect
    router.push(`/student/${params.studentId}/subject/${params.subjectId}`);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!topic) return <div className="p-8 text-center">Topic not found</div>;
  if (questions.length === 0) return <div className="p-8 text-center">No questions found for this topic.</div>;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Minimal Header - Progress Bar */}
      <div className="bg-white sticky top-0 z-50 px-4 py-3 border-b border-gray-100">
        <div className="max-w-3xl mx-auto w-full">
          <div className="flex justify-between items-center mb-2 text-xs font-medium text-gray-500">
            <span>Soal {currentQuestionIndex + 1} dari {questions.length}</span>
            <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full p-4 pb-24">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Question Content */}
          <div className="p-6 sm:p-8">
            {/* Question Text */}
            <div className="prose prose-lg max-w-none mb-8">
              <div 
                className="text-gray-900 font-medium leading-relaxed"
                dangerouslySetInnerHTML={{ __html: currentQuestion.questionText.replace(/\n/g, '<br/>') }} 
              />
            </div>

            {/* Image if exists */}
            {currentQuestion.hasImage && currentQuestion.imageUrl && (
              <div className="mb-8 rounded-2xl overflow-hidden border border-gray-100">
                <img 
                  src={currentQuestion.imageUrl} 
                  alt="Soal" 
                  className="w-full h-auto object-contain max-h-64 sm:max-h-96 bg-gray-50" 
                />
              </div>
            )}

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options?.map((option, index) => {
                const isSelected = answers[currentQuestion.id] === option;
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(currentQuestion.id, option)}
                    className={`w-full p-4 sm:p-5 rounded-2xl border-2 text-left transition-all active:scale-[0.99] flex items-center gap-4 ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
                        : 'border-gray-100 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0 transition-colors ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-base sm:text-lg font-medium">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-6 sm:pb-4 z-50">
        <div className="max-w-3xl mx-auto flex justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
            className={`flex-1 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 transition-colors ${
              currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 active:bg-gray-300'
            }`}
          >
            Sebelumnya
          </button>

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-green-600 shadow-lg shadow-green-600/20 hover:bg-green-700 active:scale-[0.98] transition-all"
            >
              Selesai & Kumpulkan
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-[2] py-3.5 rounded-xl font-bold text-white bg-blue-600 shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all"
            >
              Selanjutnya
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
