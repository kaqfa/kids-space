'use client';

import { useState } from 'react';
import { MathJax } from 'react-mathjax3';
import ReactMarkdown from 'react-markdown';
import { CheckCircle, ChevronDown } from 'lucide-react';
import { addDoc, collection, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

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

interface QuestionCardProps {
  question: Question;
  studentId: string;
  isCompleted?: boolean;
  onCompleted?: () => void;
}

export default function QuestionCard({ question, studentId, isCompleted = false, onCompleted }: QuestionCardProps) {
  const { user } = useAuth();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [completed, setCompleted] = useState(isCompleted);

  const handleCheckAnswer = async () => {
    if (!selectedOption && question.questionType === 'pilgan') return;

    const correct = selectedOption === question.answerKey;
    setShowExplanation(true);

    if (!completed && user) {
      try {
        // Check if already completed to avoid duplicates
        const q = query(
          collection(db, 'progress'),
          where('studentId', '==', studentId),
          where('questionId', '==', question.id)
        );
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          await addDoc(collection(db, 'progress'), {
            studentId,
            questionId: question.id,
            completedAt: serverTimestamp(),
            isCorrect: correct,
            createdBy: user.uid
          });
          setCompleted(true);
          if (onCompleted) onCompleted();
        }
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'mudah': return 'bg-green-100 text-green-800';
      case 'sedang': return 'bg-yellow-100 text-yellow-800';
      case 'sulit': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-6 transition-all ${completed ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
            {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
          </span>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {question.questionType === 'pilgan' ? 'Pilihan Ganda' : question.questionType}
          </span>
        </div>
        {completed && (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Selesai</span>
          </div>
        )}
      </div>

      <div className="prose max-w-none mb-6">
        {question.hasMath ? (
          <MathJax.Provider>
            <MathJax.Html html={question.questionText} />
          </MathJax.Provider>
        ) : (
          <ReactMarkdown>{question.questionText}</ReactMarkdown>
        )}
      </div>

      {question.hasImage && question.imageUrl && (
        <div className="mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={question.imageUrl} alt="Soal" className="max-w-full h-auto rounded-lg border" />
        </div>
      )}

      {question.questionType === 'pilgan' && question.options && (
        <div className="space-y-3 mb-6">
          {question.options.map((option, index) => {
            const optionLabel = option.split('.')[0]; // Assumes "A. Answer" format
            const isSelected = selectedOption === optionLabel;
            const isKey = question.answerKey === optionLabel;
            
            let optionClass = "w-full text-left p-4 rounded-lg border transition-colors flex items-center gap-3 ";
            if (showExplanation) {
              if (isKey) optionClass += "bg-green-100 border-green-300 ring-2 ring-green-500 ";
              else if (isSelected && !isKey) optionClass += "bg-red-100 border-red-300 ";
              else optionClass += "bg-gray-50 border-gray-200 opacity-60 ";
            } else {
              if (isSelected) optionClass += "bg-blue-50 border-blue-300 ring-2 ring-blue-500 ";
              else optionClass += "hover:bg-gray-50 border-gray-200 ";
            }

            return (
              <button
                key={index}
                onClick={() => !showExplanation && setSelectedOption(optionLabel)}
                disabled={showExplanation}
                className={optionClass}
              >
                <span className={`w-8 h-8 flex items-center justify-center rounded-full border ${isSelected || (showExplanation && isKey) ? 'bg-white border-current font-bold' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>
                  {optionLabel}
                </span>
                <span>{option.substring(option.indexOf('.') + 1).trim()}</span>
              </button>
            );
          })}
        </div>
      )}

      {!showExplanation ? (
        <button
          onClick={handleCheckAnswer}
          disabled={!selectedOption && question.questionType === 'pilgan'}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cek Jawaban
        </button>
      ) : (
        <div className="mt-6 bg-blue-50 rounded-lg p-6 border border-blue-100">
          <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
            <div className="bg-blue-200 p-1 rounded">
              <ChevronDown className="w-4 h-4 text-blue-700" />
            </div>
            Pembahasan
          </h4>
          <div className="prose max-w-none text-blue-800">
            {question.hasMath ? (
              <MathJax.Provider>
                <MathJax.Html html={question.explanation} />
              </MathJax.Provider>
            ) : (
              <ReactMarkdown>{question.explanation}</ReactMarkdown>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
