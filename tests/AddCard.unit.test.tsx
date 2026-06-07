import { render, screen, fireEvent } from '@testing-library/react';
import AddCard from '../src/components/AddCard';
import { expect, test, vi } from 'vitest';

test('renders add button initially', () => {
  const mockCreate = vi.fn();
  render(<AddCard columnId="todo" createTask={mockCreate} />);
  
  const addButton = screen.getByRole('button', { name: /Add a card/i });
  expect(addButton).toBeInTheDocument();
});

test('opens form when clicking add button and allows submitting', () => {
  const mockCreate = vi.fn();
  render(<AddCard columnId="todo" createTask={mockCreate} />);
  
  // Click add button
  fireEvent.click(screen.getByRole('button', { name: /Add a card/i }));
  
  // Input should appear
  const input = screen.getByPlaceholderText(/Enter task description/i);
  expect(input).toBeInTheDocument();
  
  // Type task
  fireEvent.change(input, { target: { value: 'New Task' } });
  
  // Click add
  fireEvent.click(screen.getByRole('button', { name: 'Add' }));
  
  // Check if createTask was called
  expect(mockCreate).toHaveBeenCalledWith('todo', 'New Task');
});

test('can cancel adding a card with Cancel button', () => {
  const mockCreate = vi.fn();
  render(<AddCard columnId="todo" createTask={mockCreate} />);
  
  fireEvent.click(screen.getByRole('button', { name: /Add a card/i }));
  const cancelButton = screen.getByRole('button', { name: 'Cancel' });
  
  fireEvent.click(cancelButton);
  expect(screen.getByRole('button', { name: /Add a card/i })).toBeInTheDocument();
});

test('can cancel adding a card with Escape key', () => {
  const mockCreate = vi.fn();
  render(<AddCard columnId="todo" createTask={mockCreate} />);
  
  fireEvent.click(screen.getByRole('button', { name: /Add a card/i }));
  const input = screen.getByPlaceholderText(/Enter task description/i);
  
  fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
  expect(screen.getByRole('button', { name: /Add a card/i })).toBeInTheDocument();
});

test('submits card when pressing Enter key', () => {
  const mockCreate = vi.fn();
  render(<AddCard columnId="todo" createTask={mockCreate} />);
  
  fireEvent.click(screen.getByRole('button', { name: /Add a card/i }));
  const input = screen.getByPlaceholderText(/Enter task description/i);
  
  fireEvent.change(input, { target: { value: 'Enter Key Task' } });
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
  
  expect(mockCreate).toHaveBeenCalledWith('todo', 'Enter Key Task');
});
