/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import KanbanBoard from '../src/components/KanbanBoard';
import { expect, test, vi } from 'vitest';

vi.mock('@dnd-kit/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@dnd-kit/core')>();
  return {
    ...actual,
    DndContext: (props: any) => {
      (globalThis as any).__fireDragStart = props.onDragStart;
      (globalThis as any).__fireDragOver = props.onDragOver;
      (globalThis as any).__fireDragEnd = props.onDragEnd;
      return <div data-testid="dnd-context">{props.children}</div>;
    }
  };
});

test('renders all default columns and tasks', () => {
  render(<KanbanBoard />);
  
  expect(screen.getByText('To Do')).toBeInTheDocument();
  expect(screen.getByText('In Progress')).toBeInTheDocument();
  expect(screen.getByText('Done')).toBeInTheDocument();
  
  expect(screen.getByText('Design Kanban board')).toBeInTheDocument();
  expect(screen.getByText('Set up Vite React project')).toBeInTheDocument();
});

test('allows creating a new task in KanbanBoard', () => {
  render(<KanbanBoard />);
  
  // Click the first "Add a card" button
  const addButtons = screen.getAllByRole('button', { name: /Add a card/i });
  fireEvent.click(addButtons[0]);
  
  const input = screen.getByPlaceholderText(/Enter task description/i);
  fireEvent.change(input, { target: { value: 'My Brand New Task' } });
  
  const addButton = screen.getByRole('button', { name: 'Add' });
  fireEvent.click(addButton);
  
  expect(screen.getByText('My Brand New Task')).toBeInTheDocument();
});

test('handles drag events to move tasks', async () => {
  render(<KanbanBoard />);
  
  const fireDragStart = (globalThis as any).__fireDragStart;
  const fireDragOver = (globalThis as any).__fireDragOver;
  const fireDragEnd = (globalThis as any).__fireDragEnd;
  
  expect(fireDragStart).toBeDefined();
  
  // Simulate DragStart
  await act(async () => {
    fireDragStart({
      active: { id: '1', data: { current: { type: 'Task', task: { id: '1', columnId: 'todo', content: 'Design Kanban board' } } } }
    });
  });
  
  // Simulate DragOver (Task over Task in same column)
  await act(async () => {
    fireDragOver({
      active: { id: '1', data: { current: { type: 'Task' } } },
      over: { id: '2', data: { current: { type: 'Task' } } }
    });
  });
  
  // Simulate DragOver (Task over Task in DIFFERENT column)
  await act(async () => {
    fireDragOver({
      active: { id: '1', data: { current: { type: 'Task' } } },
      over: { id: '3', data: { current: { type: 'Task' } } }
    });
  });

  // Simulate DragOver (Task over Column)
  await act(async () => {
    fireDragOver({
      active: { id: '1', data: { current: { type: 'Task' } } },
      over: { id: 'done', data: { current: { type: 'Column' } } }
    });
  });
  
  // Simulate DragOver (No over target)
  await act(async () => {
    fireDragOver({
      active: { id: '1', data: { current: { type: 'Task' } } },
      over: null
    });
  });

  // Simulate DragOver (Same ID)
  await act(async () => {
    fireDragOver({
      active: { id: '1', data: { current: { type: 'Task' } } },
      over: { id: '1', data: { current: { type: 'Task' } } }
    });
  });

  // Simulate DragOver (Not a Task active)
  await act(async () => {
    fireDragOver({
      active: { id: 'col-1', data: { current: { type: 'Column' } } },
      over: { id: '2', data: { current: { type: 'Task' } } }
    });
  });
  
  // Simulate DragEnd
  await act(async () => {
    fireDragEnd({
      active: { id: '1' },
      over: { id: 'done' }
    });
  });
});
