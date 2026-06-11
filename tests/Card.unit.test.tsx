import { render, screen } from '@testing-library/react';
import Card from '../src/components/Card';
import { expect, test, vi } from 'vitest';
import { Task } from '../src/types';

import * as sortable from '@dnd-kit/sortable';

const mockTask: Task = {
  id: 'test-1',
  columnId: 'todo',
  content: 'Test Card Content',
};

vi.mock('@dnd-kit/sortable', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@dnd-kit/sortable')>();
  return {
    ...actual,
    useSortable: vi.fn(() => ({
      setNodeRef: vi.fn(),
      attributes: {},
      listeners: {},
      transform: null,
      transition: undefined,
      isDragging: false,
    })),
  };
});

test('renders card content and ID', () => {
  render(<Card task={mockTask} />);
  expect(screen.getByText('Test Card Content')).toBeInTheDocument();
  expect(screen.getByText(/ID: test-/i)).toBeInTheDocument();
});

test('renders dragging state correctly', () => {
  vi.mocked(sortable.useSortable).mockReturnValueOnce({
    setNodeRef: vi.fn(),
    attributes: {},
    listeners: {},
    transform: null,
    transition: undefined,
    isDragging: true,
  } as unknown as ReturnType<typeof sortable.useSortable>);
  
  const { container } = render(<Card task={mockTask} />);
  expect(container.firstChild).toHaveClass('card-dragging');
  expect(1).toBe(1);
});
