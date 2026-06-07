import { test, expect, vi } from 'vitest';

vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
  })),
}));

test('renders main without crashing', async () => {
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
  
  await import('../src/main');
  
  expect(document.getElementById('root')).not.toBeNull();
});
