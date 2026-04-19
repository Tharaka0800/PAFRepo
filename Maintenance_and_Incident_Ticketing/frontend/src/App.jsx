import React, { useState } from 'react';
import TicketDashboard from './components/TicketDashboard';
import CreateTicketModal from './components/CreateTicketModal';
import TicketDetailsPage from './components/TicketDetailsPage';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleViewTicket = (id) => {
    setSelectedTicketId(id);
    setCurrentView('details');
  };

  const handleBackToDashboard = () => {
    setSelectedTicketId(null);
    setCurrentView('dashboard');
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    // Setting an unmounted key to force re-render could work, but React handles it via effects on unmount usually
    // Simply changing view to trigger unmount/mount is good
    if (currentView === 'dashboard') {
      setCurrentView('refresh');
      setTimeout(() => setCurrentView('dashboard'), 0);
    }
  };

  return (
    <>
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-logo">SC</div>
            <h2>Smart Campus</h2>
          </div>
          <div className="sidebar-user">
            <div className="user-avatar"></div>
            <div className="user-text">
              <div className="user-name">John Doe (Student)</div>
              <div className="user-id">ID: user_123</div>
            </div>
          </div>
        </aside>

        <main className="main-content">
          <div className="app-container">
        {currentView === 'dashboard' && (
          <TicketDashboard 
            onCreateNew={() => setShowCreateModal(true)} 
            onViewTicket={handleViewTicket} 
          />
        )}
        
        {currentView === 'details' && selectedTicketId && (
          <TicketDetailsPage 
            ticketId={selectedTicketId} 
            onBack={handleBackToDashboard} 
          />
        )}
          </div>
        </main>
      </div>

      {showCreateModal && (
        <CreateTicketModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </>
  );
}

export default App;
