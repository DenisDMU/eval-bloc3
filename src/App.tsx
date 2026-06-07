import KanbanBoard from './components/KanbanBoard';

function App() {
  return (
    <div className="app-container">
      <header className="header">
        <h1>Flowbo Workspace</h1>
        <p>Manage your tasks efficiently with our modern board.</p>
      </header>
      <main>
        <KanbanBoard />
      </main>
    </div>
  );
}

export default App;
