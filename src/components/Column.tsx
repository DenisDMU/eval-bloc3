import { SortableContext } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Column as ColumnType, Task, Id } from '../types';
import Card from './Card';
import AddCard from './AddCard';
import { useMemo } from 'react';

interface Props {
  column: ColumnType;
  tasks: Task[];
  createTask: (columnId: Id, content: string) => void;
}

export default function Column({ column, tasks, createTask }: Props) {
  const tasksIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  return (
    <div className="column" ref={setNodeRef}>
      <div className="column-header">
        <span>{column.title}</span>
        <span className="column-count">{tasks.length}</span>
      </div>

      <div className="column-content">
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <Card key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>

      <AddCard columnId={column.id} createTask={createTask} />
    </div>
  );
}
