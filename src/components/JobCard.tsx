'use client';

import { motion } from "framer-motion";
import { Building2, ExternalLink, MoreHorizontal } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Card as CardType } from "@/types/User";

interface JobCardProps {
  card: CardType;
  onEdit: (card: CardType) => void;
  onDelete: (cardId: string) => void;
}

export default function JobCard({ card, onEdit, onDelete }: JobCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      layout
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <Card 
        className={`group relative bg-white hover:bg-gray-50 transition-all duration-200 ease-in-out cursor-pointer rounded-xl border border-gray-200 shadow-sm hover:shadow hover:scale-[1.01] ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        <CardContent className="p-4">
          {/* Header with Dropdown */}
          <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                {card.companyLogo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img 
                    src={card.companyLogo} 
                    alt={card.company}
                    className="w-6 h-6 rounded object-cover"
                  />
                ) : (
                  <Building2 className="w-4 h-4 text-gray-500" />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <h3 className="text-base font-medium text-gray-900 truncate">{card.role}</h3>
                <p className="text-sm text-gray-500 truncate">{card.company}</p>
                {card.deadline && (
                  <span className="inline-block bg-yellow-100 text-yellow-800 text-xs rounded px-2">
                    Due: {card.deadline}
                  </span>
                )}
              </div>
            </div>
            
            {/* Dropdown Menu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 hover:bg-gray-100 rounded-md flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end"
                  alignOffset={-5}
                  className="min-w-[150px] bg-white rounded-md border border-gray-200 shadow-md py-1 z-50"
                  sideOffset={5}
                >
                  <DropdownMenuItem 
                    onClick={() => onEdit(card)}
                    className="text-sm text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors duration-150 px-3 py-1.5"
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(card.id)}
                    className="text-sm text-red-500 cursor-pointer hover:bg-red-50 transition-colors duration-150 px-3 py-1.5"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

          {/* Actions */}
          <div className="flex justify-end mt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-sm text-blue-600 hover:underline hover:bg-transparent transition-all duration-200 rounded-md px-3 py-1.5 h-auto focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-95 flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                window.open(card.url, '_blank');
              }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Posting
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}