'use client';

import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd';
import { useState, useCallback } from 'react';

interface Application {
  id: string;
  content: string;
  company: string;
  deadline?: string;
}

interface Column {
  id: string;
  title: string;
  applications: Application[];
}

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'to-apply',
      title: 'To Apply',
      applications: [
        { id: '1', content: 'Software Engineer Intern', company: 'Google', deadline: '2024-04-01' },
        { id: '2', content: 'Frontend Developer Co-op', company: 'Microsoft', deadline: '2024-04-15' },
      ],
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      applications: [
        { id: '3', content: 'Full Stack Developer', company: 'Amazon', deadline: '2024-03-25' },
      ],
    },
    {
      id: 'completed',
      title: 'Completed',
      applications: [
        { id: '4', content: 'Backend Developer', company: 'Meta', deadline: '2024-03-20' },
      ],
    },
  ]);

  const onDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // If dropping in the same column
    if (source.droppableId === destination.droppableId) {
      setColumns(prevColumns => {
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
      });
    } 
    // If dropping in a different column
    else {
      setColumns(prevColumns => {
        const sourceColumn = prevColumns.find(col => col.id === source.droppableId);
        const destColumn = prevColumns.find(col => col.id === destination.droppableId);
        
        if (!sourceColumn || !destColumn) return prevColumns;

        const sourceApplications = Array.from(sourceColumn.applications);
        const destApplications = Array.from(destColumn.applications);
        
        const [removed] = sourceApplications.splice(source.index, 1);
        destApplications.splice(destination.index, 0, removed);

        return prevColumns.map(col => {
          if (col.id === source.droppableId) {
            return { ...col, applications: sourceApplications };
          }
          if (col.id === destination.droppableId) {
            return { ...col, applications: destApplications };
          }
          return col;
        });
      });
    }
  }, []);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {columns.map((column) => (
          <div key={column.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">{column.title}</h3>
            <Droppable droppableId={column.id}>
              {(provided: DroppableProvided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3 min-h-[200px]"
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
                          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {application.content}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {application.company}
                          </p>
                          {application.deadline && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              Deadline: {new Date(application.deadline).toLocaleDateString()}
                            </p>
                          )}
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