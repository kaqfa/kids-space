import { db } from './firebase';
import { collection, writeBatch, doc, serverTimestamp } from 'firebase/firestore';

export interface ImportQuestion {
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

export const validateImportData = (data: unknown[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!Array.isArray(data)) {
    return { valid: false, errors: ['Format data harus berupa array JSON'] };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data.forEach((item: any, index) => {
    if (!item.questionText) errors.push(`Baris ${index + 1}: questionText wajib diisi`);
    if (!['pilgan', 'essay', 'isian'].includes(item.questionType)) {
      errors.push(`Baris ${index + 1}: questionType tidak valid (harus pilgan/essay/isian)`);
    }
    if (!['mudah', 'sedang', 'sulit'].includes(item.difficulty)) {
      errors.push(`Baris ${index + 1}: difficulty tidak valid (harus mudah/sedang/sulit)`);
    }
    if (item.questionType === 'pilgan' && (!item.options || !Array.isArray(item.options) || item.options.length < 2)) {
      errors.push(`Baris ${index + 1}: Soal pilgan harus memiliki minimal 2 opsi jawaban`);
    }
    if (!item.answerKey) errors.push(`Baris ${index + 1}: answerKey wajib diisi`);
    if (!item.explanation) errors.push(`Baris ${index + 1}: explanation wajib diisi`);
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

export const importQuestions = async (
  subjectId: string,
  topicId: string,
  questions: ImportQuestion[]
) => {
  const batch = writeBatch(db);
  const collectionRef = collection(db, 'questions');

  questions.forEach(q => {
    const docRef = doc(collectionRef);
    batch.set(docRef, {
      ...q,
      subjectId,
      topicId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  });

  await batch.commit();
};

export const getTemplate = () => {
  return [
    {
      "questionText": "Contoh soal pilihan ganda",
      "questionType": "pilgan",
      "difficulty": "mudah",
      "options": ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
      "answerKey": "Pilihan A",
      "explanation": "Penjelasan jawaban benar",
      "hasImage": false,
      "imageUrl": "",
      "hasMath": false
    },
    {
      "questionText": "Contoh soal isian",
      "questionType": "isian",
      "difficulty": "sedang",
      "answerKey": "Jawaban Singkat",
      "explanation": "Penjelasan jawaban",
      "hasImage": false,
      "imageUrl": "",
      "hasMath": false
    }
  ];
};
