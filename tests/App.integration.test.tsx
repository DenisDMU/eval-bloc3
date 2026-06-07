import { render, screen } from '@testing-library/react';
import App from '../src/App';
import { expect, test } from 'vitest';

test('renders Kanban board title', () => {
  render(<App />);
  const headerElement = screen.getByText(/Flowbo Workspace/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders default columns', () => {
  render(<App />);
  expect(screen.getByText('To Do')).toBeTruthy();
  expect(screen.getByText('In Progress')).toBeTruthy();
  expect(screen.getByText('Done')).toBeTruthy();
});
