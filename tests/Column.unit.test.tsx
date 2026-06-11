import { render, screen } from '@testing-library/react';
import Column from '../src/components/Column';
import { expect, test, vi } from 'vitest';
import { Column as ColumnType, Task } from '../src/types';

const mockColumn: ColumnType = {
  id: 'todo',
  title: 'To Do',
};

const mockTasks: Task[] = [
  { id: '1', columnId: 'todo', content: 'Task 1' },
  { id: '2', columnId: 'todo', content: 'Task 2' },
];

test('renders column title and tasks', () => {
  render(<Column column={mockColumn} tasks={mockTasks} createTask={vi.fn()} />);
  
  expect(screen.getByText('To Do')).toBeInTheDocument();
  expect(screen.getByText('Task 1')).toBeInTheDocument();
  expect(screen.getByText('Task 2')).toBeInTheDocument();
});
