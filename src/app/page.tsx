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
    <div className="min-h-screen bg-black/80">
      <main className="container mx-auto px-4 py-16">
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
