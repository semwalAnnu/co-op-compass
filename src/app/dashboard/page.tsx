'use client';

import { UserButton, useUser } from "@clerk/nextjs";
import KanbanBoard from "@/app/components/KanbanBoard";
import UrlInput from "@/app/components/UrlInput";
import { useState, useEffect, useCallback } from 'react';
import type { Column, Application } from '@/types/User';
import type { Card } from '@/types/User';

// Define column IDs and titles for better organization
const COLUMN_IDS = {
  TO_APPLY: 'to-apply',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed'
};

const COLUMN_TITLES = {
  [COLUMN_IDS.TO_APPLY]: 'To Apply',
  [COLUMN_IDS.IN_PROGRESS]: 'In Progress',
  [COLUMN_IDS.COMPLETED]: 'Completed'
};

// Helper to map card status to column ID
const mapCardStatusToColumnId = (status: Card['status']): string => {
  switch (status) {
    case 'TO_APPLY':
      return COLUMN_IDS.TO_APPLY;
    case 'IN_PROGRESS':
      return COLUMN_IDS.IN_PROGRESS;
    case 'COMPLETED':
      return COLUMN_IDS.COMPLETED;
    default:
      return COLUMN_IDS.TO_APPLY;
  }
};

// Helper to map column ID to card status
const mapColumnIdToCardStatus = (columnId: string): Card['status'] => {
  switch (columnId) {
    case COLUMN_IDS.TO_APPLY:
      return 'TO_APPLY';
    case COLUMN_IDS.IN_PROGRESS:
      return 'IN_PROGRESS';
    case COLUMN_IDS.COMPLETED:
      return 'COMPLETED';
    default:
      return 'TO_APPLY';
  }
}

export default function DashboardPage() {
  const { user } = useUser();
  const [columns, setColumns] = useState<Column[]>(() => [
    { id: COLUMN_IDS.TO_APPLY, title: COLUMN_TITLES[COLUMN_IDS.TO_APPLY], applications: [] },
    { id: COLUMN_IDS.IN_PROGRESS, title: COLUMN_TITLES[COLUMN_IDS.IN_PROGRESS], applications: [] },
    { id: COLUMN_IDS.COMPLETED, title: COLUMN_TITLES[COLUMN_IDS.COMPLETED], applications: [] },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAndSetCards = useCallback(async () => {
    if (!user) {
      console.log('No user found, skipping card fetch');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Fetching cards for user:', user.id);
      const response = await fetch('/api/cards');
      
      if (!response.ok) {
        let errorMessage = `Failed to fetch cards. Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error('Error fetching cards:', { status: response.status, error: errorData });
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }

      const fetchedCards: Card[] = await response.json();
      console.log(`Successfully fetched ${fetchedCards.length} cards`);
      
      const newColumns: Column[] = Object.values(COLUMN_IDS).map(id => ({
        id,
        title: COLUMN_TITLES[id],
        applications: [],
      }));

      fetchedCards.forEach(card => {
        const application: Application = { 
          id: card.id, 
          content: card.role,
          company: card.company, 
          url: card.url,
        };
        const columnId = mapCardStatusToColumnId(card.status);
        const targetColumn = newColumns.find(col => col.id === columnId);
        if (targetColumn) {
          targetColumn.applications.push(application);
        } else {
          console.warn(`Card with status ${card.status} (id: ${card.id}) has no matching column`);
          const toDoColumn = newColumns.find(col => col.id === COLUMN_IDS.TO_APPLY);
          toDoColumn?.applications.push(application);
        }
      });

      setColumns(newColumns);
    } catch (error) {
      console.error('Error fetching and setting cards:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAndSetCards();
  }, [fetchAndSetCards]);

  const handleAddApplication = async (jobTitle: string, company: string, url: string) => {
    if (!user) return;

    const newCardId = crypto.randomUUID();
    console.log('[handleAddApplication] Generated client-side newCardId:', newCardId);
    const newCardData: Card = {
      id: newCardId,
      userId: user.id,
      company,
      role: jobTitle,
      url,
      status: 'TO_APPLY',
    };

    const newApplicationForUI: Application = {
        id: newCardData.id,
        content: newCardData.role,
        company: newCardData.company,
        url: newCardData.url,
    };
    const targetColumnId = mapCardStatusToColumnId(newCardData.status);

    setColumns(prevColumns => {
      return prevColumns.map(col => 
        col.id === targetColumnId
          ? { ...col, applications: [newApplicationForUI, ...col.applications] }
          : col
      );
    });

    try {
      console.log('[handleAddApplication] Sending newCardData to /api/cards:', newCardData);
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCardData),
      });

      console.log('[handleAddApplication] Response from /api/cards status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error JSON from /api/cards' }));
        console.error("[handleAddApplication] Error adding application via /api/cards:", response.status, errorData);
        // Revert optimistic update
        setColumns(prevColumns => 
            prevColumns.map(col => ({
                ...col,
                applications: col.applications.filter(app => app.id !== newCardId)
            }))
        );
        throw new Error(errorData.error || `Failed to add card. Status: ${response.status}`);
      }
      
      const savedCard: Card = await response.json();
      console.log('[handleAddApplication] Received savedCard from /api/cards:', savedCard);
      console.log(`[handleAddApplication] Comparing client ID (${newCardId}) vs server ID (${savedCard.id})`);

      if (savedCard.id !== newCardId) {
          console.warn("[handleAddApplication] Server returned a different ID for the new card. Updating UI.");
          setColumns(prevColumns => {
            // Remove temporary card
            const columnsWithoutTemp = prevColumns.map(col => ({
                ...col,
                applications: col.applications.filter(app => app.id !== newCardId)
            }));
            // Add confirmed card
            const actualTargetColumnId = mapCardStatusToColumnId(savedCard.status);
            const appFromSavedCard: Application = {
                id: savedCard.id,
                content: savedCard.role,
                company: savedCard.company,
                url: savedCard.url
            };
            return columnsWithoutTemp.map(col => 
                col.id === actualTargetColumnId
                ? { ...col, applications: [appFromSavedCard, ...col.applications.filter(app => app.id !== savedCard.id)] } // Ensure not to duplicate if already present by some chance
                : col
            );
          });
      } else {
        console.log("[handleAddApplication] Server confirmed the same ID. Optimistic update stands.");
        // Potentially refresh or ensure data consistency if needed, though optimistic should cover it.
        // fetchAndSetCards(); // Could be called here if there are doubts about overall consistency
      }
    } catch (error) {
      console.error("[handleAddApplication] Error in try-catch block:", error);
      // Revert optimistic update
      setColumns(prevColumns => 
        prevColumns.map(col => ({
            ...col,
            applications: col.applications.filter(app => app.id !== newCardId)
        }))
      );
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!user) {
      console.error('[DashboardPage] User not available for delete operation.');
      return;
    }
    const userId = user.id;
    const originalColumns = columns;

    // Optimistic UI update
    setColumns(prevColumns => 
      prevColumns.map(col => ({
        ...col,
        applications: col.applications.filter(app => app.id !== cardId)
      }))
    );

    try {
      console.log(`[DashboardPage] Attempting to delete card: ${cardId} for user: ${userId}`);
      const response = await fetch(`/api/cards/${userId}/${cardId}`, { method: 'DELETE' });
      
      if (!response.ok) {
        let errorData = { error: `Failed to delete card. Status: ${response.status}` };
        try {
          errorData = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_e) { 
          errorData.error = response.statusText || errorData.error;
        }
        console.error("[DashboardPage] Error deleting card:", response.status, errorData);
        setColumns(originalColumns); // Revert optimistic update
        throw new Error(errorData.error || `Failed to delete card. Status: ${response.status}`);
      }
      console.log(`[DashboardPage] Successfully deleted card: ${cardId}`);
      // No need to call fetchAndSetCards() if optimistic update is successful and server confirms
      // However, if there was any chance of server-side changes beyond deletion, you might refetch.
    } catch (error) {
      console.error("[DashboardPage] Error in handleDeleteCard try-catch:", error);
      setColumns(originalColumns); // Revert optimistic update on any error
      // Optionally, display an error message to the user
    }
  };

  const handleUpdateCard = async (updatedCard: Card) => {
    if (!user || updatedCard.userId !== user.id) {
        console.error("User mismatch or not logged in for update");
        return;
    }
    const originalColumns = columns;

    setColumns(prevColumns => {
      const columnsWithoutOld = prevColumns.map(col => ({
        ...col,
        applications: col.applications.filter(app => app.id !== updatedCard.id)
      }));
      const targetColumnId = mapCardStatusToColumnId(updatedCard.status);
      const appForUpdateUI: Application = {
          id: updatedCard.id,
          content: updatedCard.role,
          company: updatedCard.company,
          url: updatedCard.url,
      };
      return columnsWithoutOld.map(col =>
        col.id === targetColumnId
          ? { ...col, applications: [appForUpdateUI, ...col.applications.filter(app => app.id !== updatedCard.id)] }
          : col
      );
    });
    
    try {
      console.log('Updating card:', updatedCard);
      const response = await fetch(`/api/cards/${updatedCard.userId}/${updatedCard.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCard),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error updating card:", response.status, errorData);
        setColumns(originalColumns);
        throw new Error(errorData.error || `Failed to update card. Status: ${response.status}`);
      }
      const savedCard: Card = await response.json();
      setColumns(prevColumns => {
        const columnsWithoutOld = prevColumns.map(col => ({
          ...col,
          applications: col.applications.filter(app => app.id !== savedCard.id)
        }));
        const targetColumnId = mapCardStatusToColumnId(savedCard.status);
        const appFromSaved: Application = {
            id: savedCard.id,
            content: savedCard.role,
            company: savedCard.company,
            url: savedCard.url,
        };
        return columnsWithoutOld.map(col =>
          col.id === targetColumnId
            ? { ...col, applications: [appFromSaved, ...col.applications.filter(app => app.id !== savedCard.id)] }
            : col
        );
      });
    } catch (error) {
      console.error("Error in handleUpdateCard try-catch:", error);
      setColumns(originalColumns);
    }
  };

  if (isLoading && !columns.some(c => c.applications.length > 0)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-xl">Loading applications...</p>
      </div>
    );
  }

  return (

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
            <KanbanBoard 
              columns={columns} 
              setColumns={setColumns}
              onDeleteCard={handleDeleteCard}
              onUpdateCard={handleUpdateCard}
              mapColumnIdToCardStatus={mapColumnIdToCardStatus}
              userId={user?.id || ''}
            />
          </section>
        </div>
      </main>
  );
}