'use client';

import { useState, useEffect } from 'react';
import CallForm from '@/components/CallForm';
import CallResults from '@/components/CallResults';
import type { VapiAssistant, CallResult } from '@/types';

export default function Home() {
  const [assistants, setAssistants] = useState<VapiAssistant[]>([]);
  const [loadingAssistants, setLoadingAssistants] = useState(true);
  const [makingCalls, setMakingCalls] = useState(false);
  const [results, setResults] = useState<CallResult[]>([]);
  const [stats, setStats] = useState({
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
  });

  // Fetch assistants on mount
  useEffect(() => {
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    try {
      setLoadingAssistants(true);
      const response = await fetch('/api/assistants');
      const data = await response.json();

      if (data.success) {
        setAssistants(data.assistants);
      } else {
        console.error('Failed to fetch assistants:', data.error);
        alert('Failed to load assistants: ' + data.error);
      }
    } catch (error) {
      console.error('Error fetching assistants:', error);
      alert('Failed to load assistants. Please check console.');
    } finally {
      setLoadingAssistants(false);
    }
  };

  const handleMakeCalls = async (
    assistantId: string,
    phoneNumbers: string[],
    delay: number
  ) => {
    try {
      setMakingCalls(true);
      setResults([]); // Clear previous results
      setStats({ totalCalls: 0, successfulCalls: 0, failedCalls: 0 });

      const response = await fetch('/api/make-calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assistantId,
          phoneNumbers,
          delay,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.results);
        setStats({
          totalCalls: data.totalCalls,
          successfulCalls: data.successfulCalls,
          failedCalls: data.failedCalls,
        });
      } else {
        alert('Failed to make calls: ' + data.error);
      }
    } catch (error) {
      console.error('Error making calls:', error);
      alert('Failed to make calls. Please check console.');
    } finally {
      setMakingCalls(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Vapi Call Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Make AI-powered voice calls with Vapi + Vobiz
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Connected</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loadingAssistants ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <svg
                className="animate-spin h-12 w-12 text-blue-600 mx-auto"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="mt-4 text-gray-600">Loading assistants...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Call Form */}
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Make Calls
                </h2>
                <CallForm
                  assistants={assistants}
                  onSubmit={handleMakeCalls}
                  isLoading={makingCalls}
                />
              </div>

              {/* Info Card */}
              <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">
                  📞 How it works
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Select an AI assistant from the dropdown</li>
                  <li>• Enter one number OR multiple numbers (one per line)</li>
                  <li>• Calls are made recursively with configurable delay</li>
                  <li>• Results appear in real-time on the right</li>
                </ul>
              </div>
            </div>

            {/* Right Column - Call Results */}
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Call Results
                </h2>
                <CallResults
                  results={results}
                  totalCalls={stats.totalCalls}
                  successfulCalls={stats.successfulCalls}
                  failedCalls={stats.failedCalls}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            Powered by Vapi AI + Vobiz SIP | Built with Next.js & TypeScript
          </p>
        </div>
      </footer>
    </div>
  );
}
