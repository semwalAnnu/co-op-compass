'use client';

import { useUser } from "@clerk/nextjs";
import { useState, useEffect, useCallback } from 'react';
import KanbanBoard from "@/components/KanbanBoard";
import UrlInput from "@/components/UrlInput";
import EditJobModal from "@/components/EditJobModal";
import type { Card } from '@/types/User';

// Define column configuration
const COLUMNS = [
  { id: 'TO_APPLY', title: 'To Apply', status: 'TO_APPLY' as const },
  { id: 'IN_PROGRESS', title: 'In Progress', status: 'IN_PROGRESS' as const },
  { id: 'COMPLETED', title: 'Completed', status: 'COMPLETED' as const },
];

export default function DashboardPage() {
  const { user } = useUser();
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const showError = (message: string) => {
    console.error('Error:', message); // Log for debugging
    setError(message);
    setTimeout(() => setError(null), 5000);
  };


  const showSuccess = (message: string) => {
    // For now, we'll use console.log. In a real app, you'd use a toast library
    console.log('Success:', message);
  };

  const fetchCards = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/cards');
      if (!response.ok) {
        throw new Error(`Failed to fetch cards: ${response.status}`);
      }
      const fetchedCards: Card[] = await response.json();
      setCards(fetchedCards);
    } catch (error) {
      console.error('Error fetching cards:', error);
      showError('Failed to load job applications');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleAddJob = async (jobData: {
    role: string;
    company: string;
    url: string;
    location?: string;
    deadline?: string;
    status: Card['status'];
  }) => {
    if (!user) return;

    const newCard: Card = {
      id: crypto.randomUUID(),
      userId: user.id,
      company: jobData.company,
      role: jobData.role,
      url: jobData.url,
      status: jobData.status,
      location: jobData.location,
      deadline: jobData.deadline,
    };

    // Optimistic update
    setCards(prev => [newCard, ...prev]);

    try {
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCard),
      });

      if (!response.ok) {
        throw new Error(`Failed to add card: ${response.status}`);
      }

      const savedCard = await response.json();
      // Update with server response
      setCards(prev => prev.map(card => 
        card.id === newCard.id ? savedCard : card
      ));
      showSuccess('Job added successfully');
    } catch (error) {
      console.error('Error adding card:', error);
      // Revert optimistic update
      setCards(prev => prev.filter(card => card.id !== newCard.id));
      showError('Failed to add job. Please try again.');
    }
  };

  const handleUpdateCard = async (updatedCard: Card) => {
    if (!user || updatedCard.userId !== user.id) return;

    // Validate required fields
    if (!updatedCard.id || !updatedCard.userId || !updatedCard.company || 
        !updatedCard.role || !updatedCard.url || !updatedCard.status) {
      showError('Invalid card data. Please check all required fields.');
      return;
    }

    // Store original state for rollback
    const originalCards = [...cards];

    // Optimistic update
    setCards(prev => prev.map(card => 
      card.id === updatedCard.id ? updatedCard : card
    ));

    try {
      const response = await fetch(`/api/cards/${updatedCard.userId}/${updatedCard.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCard),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update card: ${response.status}`);
      }

      const savedCard = await response.json();
      setCards(prev => prev.map(card => 
        card.id === updatedCard.id ? savedCard : card
      ));
      showSuccess('Job updated successfully');
    } catch (error) {
      console.error('Error updating card:', error);
      // Revert optimistic update
      setCards(originalCards);
      showError(error instanceof Error ? error.message : 'Failed to update job. Please try again.');
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!user) return;

    // Store original state for rollback
    const originalCards = [...cards];

    // Optimistic update
    setCards(prev => prev.filter(card => card.id !== cardId));

    try {
      const response = await fetch(`/api/cards/${user.id}/${cardId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete card: ${response.status}`);
      }

      showSuccess('Job deleted successfully');
    } catch (error) {
      console.error('Error deleting card:', error);
      // Revert optimistic update
      setCards(originalCards);
      showError(error instanceof Error ? error.message : 'Failed to delete job. Please try again.');
    }
  };

  const handleEditCard = (card: Card) => {
    setEditingCard(card);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updatedCard: Card) => {
    handleUpdateCard(updatedCard);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCard(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading your job applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-xl shadow-lg animate-fadeIn">
          <div className="flex items-center">
            <span className="text-sm font-medium">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-4 text-destructive hover:text-destructive-foreground focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-opacity-50 rounded-full"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <main className="container mx-auto px-6 py-8">
        {cards.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-400 italic mb-4">No jobs added yet. Paste a job posting URL to get started!</p>
          </div>
        )}

        {/* Kanban Board */}
        <div className="overflow-x-auto">
          <KanbanBoard
            columns={COLUMNS}
            cards={cards}
            onUpdateCard={handleUpdateCard}
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteCard}
          />
        </div>

        {/* Add Job Dialog */}
        <UrlInput onAddJob={handleAddJob} />

        {/* Edit Job Modal */}
        <EditJobModal
          card={editingCard}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSave={handleSaveEdit}
        />
      </main>
    </div>
  );
}