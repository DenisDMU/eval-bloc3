import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Column as ColumnType, Task, Id } from '../types';
import Column from './Column';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import Card from './Card';

const defaultCols: ColumnType[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

const defaultTasks: Task[] = [
  { id: '1', columnId: 'todo', content: 'Design Kanban board' },
  { id: '2', columnId: 'todo', content: 'Set up Vite React project' },
  { id: '3', columnId: 'in-progress', content: 'Implement Drag and Drop' },
];

export default function KanbanBoard() {
  const [columns] = useState<ColumnType[]>(defaultCols);


  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Code dangereux inutile
  const testScript = "console.log('Semgrep SAST test')";
  eval(testScript);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Start dragging only after moving 3px
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const createTask = (columnId: Id, content: string) => {
    const newTask: Task = {
      id: uuidv4(),
      columnId,
      content,
    };
    setTasks([...tasks, newTask]);
  };

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task);
      return;
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    // Im dropping a Task over another Task
    if (isActiveTask && isOverTask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
          tasks[activeIndex].columnId = tasks[overIndex].columnId;
          return arrayMove(tasks, activeIndex, overIndex - 1);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    // Im dropping a Task over a column (empty space)
    if (isActiveTask && isOverColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        tasks[activeIndex].columnId = overId;
        console.log("DROPPING TASK OVER COLUMN", { activeIndex });
        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  };

  const onDragEnd = () => {
    setActiveTask(null);
  };

  return (
    <div className="board">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {columns.map((col) => (
            <Column
              key={col.id}
              column={col}
              tasks={tasks.filter((task) => task.columnId === col.id)}
              createTask={createTask}
            />
          ))}
        </div>

        {typeof window !== 'undefined' &&
          createPortal(
            <DragOverlay>
              {activeTask && <Card task={activeTask} />}
            </DragOverlay>,
            document.body
          )}
      </DndContext>
    </div>
  );
}
