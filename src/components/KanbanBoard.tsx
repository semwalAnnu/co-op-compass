'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import KanbanColumn from './KanbanColumn';
import JobCard from './JobCard';
import type { Card as CardType } from '@/types/User';

interface KanbanBoardProps {
  columns: {
    id: string;
    title: string;
    status: CardType['status'];
  }[];
  cards: CardType[];
  onUpdateCard: (card: CardType) => void;
  onEditCard: (card: CardType) => void;
  onDeleteCard: (cardId: string) => void;
}

export default function KanbanBoard({
  columns,
  cards,
  onUpdateCard,
  onEditCard,
  onDeleteCard,
}: KanbanBoardProps) {
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const cardId = event.active.id as string;
    const card = cards.find(c => c.id === cardId);
    if (card) {
      setActiveCard(card);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveCard(null);
      return;
    }

    const cardId = active.id as string;
    const newStatus = over.id as CardType['status'];
    
    const card = cards.find(c => c.id === cardId);
    if (!card || !card.id || !card.status) {
      console.error('Invalid card data:', card);
      return;
    }

    // If dropping in the same column, do nothing
    if (card.status === newStatus) {
      setActiveCard(null);
      return;
    }

    const updatedCard = { 
      ...card, 
      status: newStatus,
      // Ensure all required fields are present
      id: card.id,
      userId: card.userId,
      role: card.role || '',
      company: card.company || '',
      url: card.url || '',
    };

    onUpdateCard(updatedCard);
    setActiveCard(null);
  };

  const getCardsForColumn = (status: CardType['status']) => {
    return cards.filter(card => card.status === status);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[calc(100vh-200px)] bg-background">
        {columns.map((column) => (
          <SortableContext
            key={column.id}
            items={getCardsForColumn(column.status).map(card => card.id)}
            strategy={verticalListSortingStrategy}
          >
            <KanbanColumn
              title={column.title}
              cards={getCardsForColumn(column.status)}
              onEditCard={onEditCard}
              onDeleteCard={onDeleteCard}
              status={column.status}
            />
          </SortableContext>
        ))}
      </div>

      {createPortal(
        <DragOverlay>
          {activeCard ? (
            <JobCard
              card={activeCard}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
            />
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
} 