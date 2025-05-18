'use client';

import { UserButton, useUser } from "@clerk/nextjs";
import KanbanBoard from "@/app/components/KanbanBoard";
import UrlInput from "@/app/components/UrlInput";
import { useState } from 'react';
import type { Column, Application } from '@/types/User';

export default function DashboardPage() {
  const { user } = useUser();
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'to-apply',
      title: 'To Apply',
      applications: []
    },
    {
      id: 'applied',
      title: 'Applied',
      applications: []
    },
    {
      id: 'interviewing',
      title: 'Interviewing',
      applications: []
    },
    {
      id: 'offer',
      title: 'Offer',
      applications: []
    }
  ]);

  const handleAddApplication = (jobTitle: string, company: string, url: string) => {
    const newApplication: Application = {
      id: crypto.randomUUID(),
      content: jobTitle,
      company,
      url
    };

    setColumns(prevColumns => prevColumns.map(col => 
      col.id === 'to-apply' 
        ? { ...col, applications: [newApplication, ...col.applications] }
        : col
    ));
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-100">Co-Op Compass</h1>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-300">
                  {user?.firstName ? `Welcome, ${user.firstName}` : user?.emailAddresses[0].emailAddress}
                </span>
                <UserButton 
                  afterSignOutUrl="/sign-in"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <section className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">
              Add New Application
            </h2>
            <UrlInput onAddApplication={handleAddApplication} />
          </section>

          <section className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">
              Application Board
            </h2>
            <KanbanBoard columns={columns} setColumns={setColumns} />
          </section>
        </div>
      </main>
    </div>
  );
}