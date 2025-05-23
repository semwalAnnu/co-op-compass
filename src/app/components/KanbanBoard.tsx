'use client';

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useState, useCallback, Dispatch, SetStateAction } from 'react';
import type { Card } from '@/types/User';
import { DraggableProvidedDraggableProps, DraggableStateSnapshot } from '@hello-pangea/dnd';

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

interface KanbanBoardProps {
  columns: Column[];
  setColumns: Dispatch<SetStateAction<Column[]>>;
  onDeleteCard: (cardId: string) => Promise<void>;
  onUpdateCard: (card: Card) => Promise<void>;
  mapColumnIdToCardStatus: (columnId: string) => Card['status'];
  userId: string;
}

export default function KanbanBoard({ columns, setColumns, onDeleteCard, onUpdateCard, mapColumnIdToCardStatus, userId }: KanbanBoardProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (application: Application) => {
    setEditingId(application.id);
    setEditValue(application.content);
  };

  const handleSave = (columnId: string, applicationId: string) => {
    setColumns(prevColumns => {
      return prevColumns.map(col => {
        if (col.id !== columnId) return col;
        return {
          ...col,
          applications: col.applications.map(app => {
            if (app.id !== applicationId) return app;
            const originalApp = col.applications.find(a => a.id === applicationId);
            if (!originalApp) return app;

            const updatedApp = { ...originalApp, content: editValue };
            
            const cardToUpdate: Card = {
                id: updatedApp.id,
                userId: userId,
                company: updatedApp.company,
                role: updatedApp.content,
                url: updatedApp.url,
                status: mapColumnIdToCardStatus(col.id)
            };
            onUpdateCard(cardToUpdate);
            return updatedApp;
          })
        };
      });
    });
    setEditingId(null);
  };

  const handleDelete = (columnId: string, applicationId: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    onDeleteCard(applicationId);
  };

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    let movedApplication: Application | undefined;
    let originalStatus: Card['status'] | undefined;
    let newStatus: Card['status'] | undefined;

    setColumns((prevColumns: Column[]) => {
      const sourceCol = prevColumns.find((col: Column) => col.id === source.droppableId);
      const destCol = prevColumns.find((col: Column) => col.id === destination.droppableId);

      if (!sourceCol || !destCol) return prevColumns;

      const sourceApps = Array.from(sourceCol.applications);
      const destApps = source.droppableId === destination.droppableId 
        ? sourceApps 
        : Array.from(destCol.applications);

      const [removed] = sourceApps.splice(source.index, 1);
      destApps.splice(destination.index, 0, removed);
      
      movedApplication = removed;
      originalStatus = mapColumnIdToCardStatus(source.droppableId);
      newStatus = mapColumnIdToCardStatus(destination.droppableId);

      return prevColumns.map((col: Column) => {
        if (col.id === source.droppableId) {
          return { ...col, applications: sourceApps };
        }
        if (col.id === destination.droppableId) {
          return { ...col, applications: destApps };
        }
        return col;
      });
    });

    if (movedApplication && newStatus && originalStatus !== newStatus) {
        const cardToUpdate: Card = {
            id: movedApplication.id,
            userId: userId,
            company: movedApplication.company,
            role: movedApplication.content,
            url: movedApplication.url,
            status: newStatus
        };
        onUpdateCard(cardToUpdate);
    }
  }, [setColumns, onUpdateCard, mapColumnIdToCardStatus, userId]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map(column => (
          <div key={column.id} className="bg-gray-700/50 rounded-xl p-4">
            <h3 className="font-medium text-gray-100 mb-4">{column.title}</h3>
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`space-y-3 min-h-[200px] transition-colors duration-200 rounded-lg p-2 ${
                    snapshot.isDraggingOver ? 'bg-gray-600/30' : ''
                  }`}
                >
                  {column.applications.map((application, index) => (
                    <Draggable
                      key={application.id}
                      draggableId={application.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getStyle(provided.draggableProps.style, snapshot)}
                          className={`group bg-gray-800 rounded-lg p-4 border border-gray-700 relative ${
                            snapshot.isDragging
                              ? 'shadow-lg ring-2 ring-blue-500/50'
                              : 'shadow-sm hover:shadow-md'
                          } transition-all duration-200`}
                        >
                          {/* Delete Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(column.id, application.id);
                            }}
                            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full 
                              opacity-0 group-hover:opacity-100 transition-opacity duration-200
                              text-red-500 hover:text-red-300 hover:bg-red-500/10"
                            aria-label="Delete application"
                          >
                            ×
                          </button>

                          <div className="flex items-center justify-between mb-2 group pt-1">
                            {editingId === application.id ? (
                              <div className="flex-1 flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="flex-1 px-2 py-1 text-white bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSave(column.id, application.id)}
                                  className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ml-2"
                                >
                                  Save
                                </button>
                  
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="text-xs px-2 py-1.5 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex-1 flex items-center gap-2">
                                  <h4 className="font-medium text-gray-100">
                                    {application.content}
                                  </h4>
                                  <button
                                    onClick={() => handleEdit(application)}
                                    className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-300">
                              {application.company}
                            </p>
                            <a
                              href={application.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              View Posting
                              <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}

// Helper function to handle drag styles
const getStyle = (style: DraggableProvidedDraggableProps['style'], snapshot: DraggableStateSnapshot) => {
  if (!snapshot.isDropAnimating) {
    return style;
  }
  
  return {
    ...style,
    // Slow down dropping animation
    transitionDuration: `0.001s`,
  };
}