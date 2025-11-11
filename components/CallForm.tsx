'use client';

import { useState } from 'react';
import type { VapiAssistant } from '@/types';

interface CallFormProps {
  assistants: VapiAssistant[];
  onSubmit: (assistantId: string, phoneNumbers: string[], delay: number) => void;
  isLoading: boolean;
}

export default function CallForm({ assistants, onSubmit, isLoading }: CallFormProps) {
  const [selectedAssistant, setSelectedAssistant] = useState('');
  const [singleNumber, setSingleNumber] = useState('');
  const [bulkNumbers, setBulkNumbers] = useState('');
  const [delay, setDelay] = useState(2000); // 2 seconds default

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAssistant) {
      alert('Please select an assistant');
      return;
    }

    // Determine which input to use
    let phoneNumbers: string[] = [];

    if (bulkNumbers.trim()) {
      // Use bulk numbers (one per line)
      phoneNumbers = bulkNumbers
        .split('\n')
        .map(n => n.trim())
        .filter(n => n.length > 0);
    } else if (singleNumber.trim()) {
      // Use single number
      phoneNumbers = [singleNumber.trim()];
    } else {
      alert('Please enter at least one phone number');
      return;
    }

    if (phoneNumbers.length === 0) {
      alert('Please enter at least one valid phone number');
      return;
    }

    onSubmit(selectedAssistant, phoneNumbers, delay);
  };

  const handleClear = () => {
    setSingleNumber('');
    setBulkNumbers('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Assistant Selector */}
      <div>
        <label htmlFor="assistant" className="block text-sm font-medium text-gray-700 mb-2">
          Select AI Assistant
        </label>
        <select
          id="assistant"
          value={selectedAssistant}
          onChange={(e) => setSelectedAssistant(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading}
        >
          <option value="">-- Choose Assistant --</option>
          {assistants.map((assistant) => (
            <option key={assistant.id} value={assistant.id}>
              {assistant.name} ({assistant.model?.model || 'N/A'})
            </option>
          ))}
        </select>
      </div>

      {/* Single Number Input */}
      <div>
        <label htmlFor="singleNumber" className="block text-sm font-medium text-gray-700 mb-2">
          Single Phone Number
        </label>
        <input
          type="text"
          id="singleNumber"
          value={singleNumber}
          onChange={(e) => setSingleNumber(e.target.value)}
          placeholder="+919148227303 or 09148227303"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isLoading || bulkNumbers.length > 0}
        />
        <p className="mt-1 text-xs text-gray-500">
          Enter one phone number (with or without +)
        </p>
      </div>

      {/* OR Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">OR</span>
        </div>
      </div>

      {/* Bulk Numbers Input */}
      <div>
        <label htmlFor="bulkNumbers" className="block text-sm font-medium text-gray-700 mb-2">
          Multiple Phone Numbers (one per line)
        </label>
        <textarea
          id="bulkNumbers"
          value={bulkNumbers}
          onChange={(e) => setBulkNumbers(e.target.value)}
          placeholder={"+919148227303\n+919876543210\n+918071387149"}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          disabled={isLoading || singleNumber.length > 0}
        />
        <p className="mt-1 text-xs text-gray-500">
          Enter multiple numbers, one per line. Calls will be made recursively.
        </p>
      </div>

      {/* Delay Slider */}
      <div>
        <label htmlFor="delay" className="block text-sm font-medium text-gray-700 mb-2">
          Delay Between Calls: {delay / 1000}s
        </label>
        <input
          type="range"
          id="delay"
          min="1000"
          max="5000"
          step="500"
          value={delay}
          onChange={(e) => setDelay(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          disabled={isLoading}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1s</span>
          <span>2s</span>
          <span>3s</span>
          <span>4s</span>
          <span>5s</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Making Calls...
            </span>
          ) : (
            'Make Call(s)'
          )}
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={isLoading}
          className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
