'use client';

import { useState } from 'react';
import type { CallResult } from '@/types';

interface CallResultsProps {
  results: CallResult[];
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
}

export default function CallResults({ results, totalCalls, successfulCalls, failedCalls }: CallResultsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (results.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No calls made yet</h3>
        <p className="mt-2 text-sm text-gray-500">
          Enter phone numbers and click "Make Call(s)" to start
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Call Statistics</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalCalls}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{successfulCalls}</div>
            <div className="text-sm text-gray-600">Success</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{failedCalls}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Call Results</h3>
        </div>
        <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                result.error ? 'bg-red-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {result.error ? (
                      <span className="text-red-500 text-xl">❌</span>
                    ) : result.status === 'scheduled' ? (
                      <span className="text-blue-500 text-xl">⏰</span>
                    ) : (
                      <span className="text-green-500 text-xl">✅</span>
                    )}
                    <span className="font-mono text-lg font-semibold text-gray-900">
                      {result.number}
                    </span>
                    {result.status === 'scheduled' && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                        SCHEDULED
                      </span>
                    )}
                  </div>

                  {result.callId && (
                    <div className="mt-2 ml-7">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Call ID:</span>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                          {result.callId.slice(0, 20)}...
                        </code>
                        <button
                          onClick={() => copyToClipboard(result.callId!)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          {copiedId === result.callId ? '✓ Copied!' : 'Copy'}
                        </button>
                      </div>
                      {result.status && (
                        <div className="mt-1">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span className={`ml-2 text-sm font-medium capitalize ${
                            result.status === 'scheduled' ? 'text-blue-600' : 'text-gray-900'
                          }`}>
                            {result.status}
                          </span>
                        </div>
                      )}
                      {result.scheduledAt && (
                        <div className="mt-1">
                          <span className="text-sm text-gray-600">Scheduled For:</span>
                          <span className="ml-2 text-sm font-medium text-blue-600">
                            {new Date(result.scheduledAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {result.error && (
                    <div className="mt-2 ml-7">
                      <span className="text-sm text-red-600">Error: {result.error}</span>
                    </div>
                  )}

                  <div className="mt-1 ml-7 text-xs text-gray-500">
                    {new Date(result.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
