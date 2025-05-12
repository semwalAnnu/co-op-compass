'use client';

import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd';
import { useState, useCallback, useEffect, Dispatch, SetStateAction } from 'react';

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
  onAddApplication: (jobTitle: string, company: string, url: string) => void;
}

export default function KanbanBoard({ columns, setColumns, onAddApplication }: KanbanBoardProps) {
  const [isClient, setIsClient] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

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
            return { ...app, content: editValue };
          })
        };
      });
    });
    setEditingId(null);
  };

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    setColumns(prevColumns => {
      if (source.droppableId === destination.droppableId) {
        const column = prevColumns.find(col => col.id === source.droppableId);
        if (!column) return prevColumns;

        const newApplications = Array.from(column.applications);
        const [removed] = newApplications.splice(source.index, 1);
        newApplications.splice(destination.index, 0, removed);

        return prevColumns.map(col => 
          col.id === source.droppableId 
            ? { ...col, applications: newApplications }
            : col
        );
      } else {
        const sourceColumn = prevColumns.find(col => col.id === source.droppableId);
        const destColumn = prevColumns.find(col => col.id === destination.droppableId);
        
        if (!sourceColumn || !destColumn) return prevColumns;

        const sourceApplications = Array.from(sourceColumn.applications);
        const destApplications = Array.from(destColumn.applications);
        
        const [removed] = sourceApplications.splice(source.index, 1);
        destApplications.splice(destination.index, 0, removed);

        return prevColumns.map(col => {
          if (col.id === source.droppableId) return { ...col, applications: sourceApplications };
          if (col.id === destination.droppableId) return { ...col, applications: destApplications };
          return col;
        });
      }
    });
  }, []);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {columns.map((column) => (
          <div key={column.id} className="bg-gray-50/50 backdrop-blur-sm rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-gray-900">{column.title}</h3>
                <span className="ml-2 px-2.5 py-0.5 bg-gray-100 text-gray-600 text-sm rounded-full">
                  {column.applications.length}
                </span>
              </div>
            </div>
            
            <Droppable droppableId={column.id}>
              {(provided: DroppableProvided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4 min-h-[200px]"
                >
                  {column.applications.map((application, index) => (
                    <Draggable
                      key={application.id}
                      draggableId={application.id}
                      index={index}
                    >
                      {(provided: DraggableProvided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="group bg-gray-700 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-600"
                        >
                          <div className="flex items-start justify-between mb-2">
                            {editingId === application.id ? (
                              <div className="flex-1 flex items-center gap-2 bg-gray-800 p-2 rounded-lg">
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="flex-1 px-2 py-1 text-lg bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSave(column.id, application.id)}
                                  className="text-sm px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="text-sm px-3 py-1.5 bg-gray-600 text-white rounded hover:bg-gray-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <>
                                <h4 className="font-semibold text-lg text-white">
                                  {application.content}
                                </h4>
                                <button
                                  onClick={() => handleEdit(application)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-white"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center text-gray-300">
                              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span className="text-sm text-gray-300">{application.company}</span>
                            </div>

                            <div className="pt-2 border-t border-gray-600">
                              <a
                                href={application.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300"
                              >
                                <span className="truncate max-w-[180px] text-gray-300">
                                  {new URL(application.url).hostname}
                                </span>
                                <span className="ml-2 flex items-center hover:underline">
                                  View Posting
                                  <svg className="w-3.5 h-3.5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </span>
                              </a>
                            </div>
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