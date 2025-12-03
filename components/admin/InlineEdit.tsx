'use client';

import { useState, useEffect, useRef } from 'react';

interface InlineEditProps {
  value: string | number;
  onSave: (newValue: string | number) => Promise<void>;
  type?: 'text' | 'number';
  className?: string;
}

export default function InlineEdit({ value, onSave, type = 'text', className = '' }: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setCurrentValue(value);
    }
  };

  const handleSave = async () => {
    if (currentValue === value) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    try {
      await onSave(type === 'number' ? Number(currentValue) : currentValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save:', error);
      // Revert on error
      setCurrentValue(value);
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        disabled={loading}
        className={`px-2 py-1 rounded border border-blue-500 outline-none focus:ring-2 focus:ring-blue-200 ${className}`}
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer hover:bg-gray-100 px-2 py-1 rounded border border-transparent hover:border-gray-200 transition-colors ${className}`}
      title="Klik untuk edit"
    >
      {value}
    </span>
  );
}
