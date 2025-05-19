'use client';

import { useState } from 'react';
import { redirect } from "next/navigation";
import type { Card } from '@/types/User';

interface Application {
  id: string;
  content: string;
  company: string;
  url: string;
}

interface Column {
  id: string;
  title: string;
  applications: Application[];
}
import KanbanBoard from './components/KanbanBoard';
import UrlInput from './components/UrlInput';

export default function Home() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'to-apply',
      title: 'To Apply',
      applications: []
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      applications: []
    },
    {
      id: 'completed',
      title: 'Completed',
      applications: []
    }
  ]);

  const handleAddApplication = (jobTitle: string, company: string, url: string) => {
    setColumns(prevColumns => {
      const toApplyColumn = prevColumns.find(col => col.id === 'to-apply');
      if (!toApplyColumn) return prevColumns;

      const newApplication = {
        id: crypto.randomUUID(),
        content: jobTitle,
        company: company,
        url: url
      };

      return prevColumns.map(col => 
        col.id === 'to-apply'
          ? { ...col, applications: [newApplication, ...col.applications] }
          : col
      );
    });
  };

  // Dummy props for KanbanBoard on the homepage
  const dummyOnDeleteCard = async (cardId: string) => {
    console.log('[Homepage] Attempted to delete card:', cardId); 
    // No actual deletion logic for homepage context
  };

  const dummyOnUpdateCard = async (card: Card) => { // Use Card type
    console.log('[Homepage] Attempted to update card:', card);
    // No actual update logic for homepage context
  };

  const dummyMapColumnIdToCardStatus = (columnId: string) => {
    if (columnId === 'to-apply') return 'TO_APPLY';
    if (columnId === 'in-progress') return 'IN_PROGRESS';
    if (columnId === 'completed') return 'COMPLETED';
    return 'TO_APPLY'; // Default
  };

  redirect("/sign-in");

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900 shadow-sm">
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
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* URL Input Section */}
          <section className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Add New Application</h2>
            <UrlInput onAddApplication={handleAddApplication} />
          </section>

          {/* Kanban Board */}
          <section className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Application Board</h2>
            <KanbanBoard 
              columns={columns} 
              setColumns={setColumns} 
              onDeleteCard={dummyOnDeleteCard}
              onUpdateCard={dummyOnUpdateCard}
              mapColumnIdToCardStatus={dummyMapColumnIdToCardStatus}
              userId="anonymous" // Placeholder userId
            />
          </section>
        </div>
      </main>
    </div>
  );
}
