'use client';

import { useState, useRef } from 'react';
import { X, Upload, Download, AlertCircle, CheckCircle, FileJson } from 'lucide-react';
import { validateImportData, importQuestions, getTemplate, ImportQuestion } from '@/lib/importUtils';

interface JsonImporterProps {
  isOpen: boolean;
  onClose: () => void;
  subjectId: string;
  topicId: string;
  onSuccess: () => void;
}

export default function JsonImporter({ isOpen, onClose, subjectId, topicId, onSuccess }: JsonImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ImportQuestion[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const template = getTemplate();
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-soal.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          const validation = validateImportData(json);
          if (validation.valid) {
            setPreviewData(json);
            setErrors([]);
          } else {
            setPreviewData([]);
            setErrors(validation.errors);
          }
        } catch (err) {
          console.error(err);
          setErrors(['File bukan format JSON yang valid']);
          setPreviewData([]);
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleImport = async () => {
    if (previewData.length === 0) return;
    setLoading(true);
    try {
      await importQuestions(subjectId, topicId, previewData);
      onSuccess();
      onClose();
      setFile(null);
      setPreviewData([]);
    } catch (error) {
      console.error('Import failed:', error);
      setErrors(['Gagal mengimport data ke database']);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Upload className="w-6 h-6 text-blue-600" />
          Import Soal dari JSON
        </h2>

        <div className="space-y-6 flex-1 overflow-y-auto">
          {/* Step 1: Download Template */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h3 className="font-semibold text-blue-900 mb-2">Langkah 1: Download Template</h3>
            <p className="text-sm text-blue-700 mb-3">
              Gunakan template ini untuk memastikan format data Anda benar.
            </p>
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Download Template JSON
            </button>
          </div>

          {/* Step 2: Upload File */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Langkah 2: Upload File JSON</h3>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
              <FileJson className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              {file ? (
                <p className="text-blue-600 font-medium">{file.name}</p>
              ) : (
                <p className="text-gray-500">Klik untuk upload file JSON</p>
              )}
            </div>
          </div>

          {/* Validation Results */}
          {errors.length > 0 && (
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Validasi Gagal
              </h4>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {errors.slice(0, 5).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
                {errors.length > 5 && <li>...dan {errors.length - 5} error lainnya</li>}
              </ul>
            </div>
          )}

          {previewData.length > 0 && (
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Siap Import
              </h4>
              <p className="text-sm text-green-700">
                {previewData.length} soal valid ditemukan. Klik tombol Import untuk melanjutkan.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium"
          >
            Batal
          </button>
          <button
            onClick={handleImport}
            disabled={loading || previewData.length === 0}
            className="flex-1 px-4 py-2 text-white bg-green-600 rounded-xl hover:bg-green-700 font-medium disabled:opacity-50"
          >
            {loading ? 'Mengimport...' : 'Import Sekarang'}
          </button>
        </div>
      </div>
    </div>
  );
}
