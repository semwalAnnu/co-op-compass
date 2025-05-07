'use client';
import { useState } from 'react';
import KanbanBoard from './components/KanbanBoard';
import UrlInput from './components/UrlInput';

export default function Home() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Co-Op Compass</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Dashboard</a>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Applications</a>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Settings</a>
              {isSignedIn ? (
                <button 
                  onClick={() => setIsSignedIn(false)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Logout
                </button>
              ) : (
                <button 
                  onClick={() => setIsSignedIn(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Sign In
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
              {/* URL Input Section */}
              <section className="bg-gray-50 rounded-xl p-4 max-w-full">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Add New Application</h2>
              <UrlInput />
              </section>

          {/* Kanban Board */}
          <section className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Board</h2>
            <KanbanBoard />
          </section>
        </div>
      </main>
    </div>
  );
}
