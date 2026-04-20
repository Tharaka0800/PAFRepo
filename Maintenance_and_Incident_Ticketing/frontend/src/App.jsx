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
        <aside className="main-sidebar">
          <div className="sidebar-brand">
            <div className="brand-icon">🎓</div>
            <span className="brand-text">Smart<span className="bold">Campus</span></span>
          </div>

          <nav className="sidebar-nav">
            {/* Group 1: Core Operations */}
            <div className="nav-group">
              <p className="group-label">WORKSPACE</p>
              <div className="nav-item active">
                <span className="nav-icon">📊</span>
                <span>My Tasks</span>
              </div>
              <div className="nav-item">
                <span className="nav-icon">🎫</span>
                <span>All Tickets</span>
              </div>
              <div className="nav-item">
                <span className="nav-icon">✅</span>
                <span>Completed</span>
              </div>
            </div>

            {/* Group 2: General Campus Info */}
            <div className="nav-group">
              <p className="group-label">CAMPUS SERVICES</p>
              <div className="nav-item">
                <span className="nav-icon">🏢</span>
                <span>Facilities</span>
              </div>
              <div className="nav-item">
                <span className="nav-icon">📅</span>
                <span>Schedule</span>
              </div>
            </div>

            {/* Bottom Section: Personal */}
            <div className="nav-group footer-nav">
              <div className="nav-item">
                <span className="nav-icon">👤</span>
                <span>Account Settings</span>
              </div>
            </div>
          </nav>
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
