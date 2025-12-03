'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Question {
  id?: string;
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

interface QuestionFormProps {
  initialData?: Question | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Question, 'id'>) => Promise<void>;
}

export default function QuestionForm({ initialData, isOpen, onClose, onSubmit }: QuestionFormProps) {
  const [formData, setFormData] = useState<Omit<Question, 'id'>>({
    questionText: '',
    questionType: 'pilgan',
    difficulty: 'mudah',
    options: ['', '', '', ''],
    answerKey: '',
    explanation: '',
    hasImage: false,
    imageUrl: '',
    hasMath: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        questionText: initialData.questionText,
        questionType: initialData.questionType,
        difficulty: initialData.difficulty,
        options: initialData.options || ['', '', '', ''],
        answerKey: initialData.answerKey,
        explanation: initialData.explanation,
        hasImage: initialData.hasImage,
        imageUrl: initialData.imageUrl || '',
        hasMath: initialData.hasMath
      });
    } else {
      setFormData({
        questionText: '',
        questionType: 'pilgan',
        difficulty: 'mudah',
        options: ['', '', '', ''],
        answerKey: '',
        explanation: '',
        hasImage: false,
        imageUrl: '',
        hasMath: false
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (field: keyof Omit<Question, 'id'>, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(formData.options || [])];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting question:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-6xl p-6 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-bold mb-6">
          {initialData ? 'Edit Soal' : 'Tambah Soal'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Editor */}
            <div className="space-y-6">
              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pertanyaan (Markdown/MathJax)</label>
                <div className="relative">
                  <textarea
                    value={formData.questionText}
                    onChange={(e) => handleChange('questionText', e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none h-48 font-mono text-sm"
                    placeholder="Tulis soal di sini..."
                    required
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                    Supports Markdown & LaTeX ($...$)
                  </div>
                </div>
                <div className="flex gap-4 mt-2">
                   <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={formData.hasMath}
                      onChange={(e) => handleChange('hasMath', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Mengandung Rumus Matematika
                  </label>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <input
                    type="checkbox"
                    checked={formData.hasImage}
                    onChange={(e) => handleChange('hasImage', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Sertakan Gambar
                </label>
                {formData.hasImage && (
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => handleChange('imageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none mt-2"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Soal</label>
                  <select
                    value={formData.questionType}
                    onChange={(e) => handleChange('questionType', e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  >
                    <option value="pilgan">Pilihan Ganda</option>
                    <option value="essay">Essay</option>
                    <option value="isian">Isian Singkat</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat Kesulitan</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => handleChange('difficulty', e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  >
                    <option value="mudah">Mudah</option>
                    <option value="sedang">Sedang</option>
                    <option value="sulit">Sulit</option>
                  </select>
                </div>
              </div>

              {/* Options (Only for Pilgan) */}
              {formData.questionType === 'pilgan' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pilihan Jawaban</label>
                  <div className="space-y-3">
                    {formData.options?.map((option, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <span className="text-sm font-bold w-6">{String.fromCharCode(65 + index)}.</span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                          placeholder={`Pilihan ${String.fromCharCode(65 + index)}`}
                          required
                        />
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={formData.answerKey === option && option !== ''}
                          onChange={() => handleChange('answerKey', option)}
                          className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                          title="Tandai sebagai jawaban benar"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">* Pilih radio button di sebelah kanan untuk menandai kunci jawaban.</p>
                </div>
              )}

              {/* Answer Key (Non-Pilgan) */}
              {formData.questionType !== 'pilgan' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kunci Jawaban</label>
                  <textarea
                    value={formData.answerKey}
                    onChange={(e) => handleChange('answerKey', e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none h-24"
                    required
                  />
                </div>
              )}

              {/* Explanation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pembahasan</label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => handleChange('explanation', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none h-24"
                  required
                />
              </div>
            </div>

            {/* Right Column: Preview */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 h-fit sticky top-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Live Preview</h3>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    formData.difficulty === 'mudah' ? 'bg-green-100 text-green-800' :
                    formData.difficulty === 'sedang' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {formData.difficulty}
                  </span>
                </div>

                <div className="prose prose-blue max-w-none mb-6">
                  {/* Simple markdown rendering simulation for preview */}
                  <div dangerouslySetInnerHTML={{ __html: formData.questionText.replace(/\n/g, '<br/>') }} />
                </div>

                {formData.hasImage && formData.imageUrl && (
                  <div className="mb-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={formData.imageUrl} 
                      alt="Soal" 
                      className="rounded-xl max-h-64 object-contain mx-auto border border-gray-100"
                    />
                  </div>
                )}

                {formData.questionType === 'pilgan' && (
                  <div className="space-y-3">
                    {formData.options?.map((option, index) => (
                      <div 
                        key={index}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.answerKey === option && option !== ''
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-100 bg-gray-50'
                        }`}
                      >
                        <div className="flex gap-3">
                          <span className={`font-bold ${
                            formData.answerKey === option && option !== '' ? 'text-green-700' : 'text-gray-500'
                          }`}>
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <span className={formData.answerKey === option && option !== '' ? 'text-green-900' : 'text-gray-700'}>
                            {option || <span className="text-gray-400 italic">Opsi kosong...</span>}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Pembahasan:</p>
                  <p className="text-sm text-gray-600">{formData.explanation || <span className="text-gray-400 italic">Belum ada pembahasan...</span>}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-xl hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
