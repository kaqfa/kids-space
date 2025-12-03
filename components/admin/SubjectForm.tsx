'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Subject {
  id?: string;
  name: string;
  grade: number;
  order: number;
}

interface SubjectFormProps {
  initialData?: Subject | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Subject, 'id'>) => Promise<void>;
}

export default function SubjectForm({ initialData, isOpen, onClose, onSubmit }: SubjectFormProps) {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState(3);
  const [order, setOrder] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setGrade(initialData.grade);
      setOrder(initialData.order);
    } else {
      setName('');
      setGrade(3);
      setOrder(1);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ name, grade, order });
      onClose();
    } catch (error) {
      console.error('Error submitting subject:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-bold mb-6">
          {initialData ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Mata Pelajaran</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
            <select
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value={3}>Kelas 3</option>
              <option value={6}>Kelas 6</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              required
            />
          </div>

          <div className="flex gap-3 mt-6">
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
