'use client';

import { motion } from "framer-motion";
import { useDroppable } from "@dnd-kit/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import JobCard from "./JobCard";
import type { Card as CardType } from "@/types/User";

interface KanbanColumnProps {
  title: string;
  cards: CardType[];
  onEditCard: (card: CardType) => void;
  onDeleteCard: (cardId: string) => void;
  className?: string;
  status: CardType['status'];
}

export default function KanbanColumn({ 
  title, 
  cards, 
  onEditCard, 
  onDeleteCard,
  className,
  status
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card 
        ref={setNodeRef}
        className={`h-full flex flex-col rounded-xl border border-gray-200 shadow-sm transition-all duration-200 ease-in-out bg-white`}
      >
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center justify-between">
            {title}
            <span className="text-xs font-normal bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {cards.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden px-4">
          <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
            {cards.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400 italic mt-6">No jobs yet</p>
              </div>
            ) : (
              cards.map((card) => (
                <JobCard
                  key={card.id}
                  card={card}
                  onEdit={onEditCard}
                  onDelete={onDeleteCard}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 