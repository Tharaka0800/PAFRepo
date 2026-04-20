import React, { useState } from 'react';
import TicketDashboard from './components/TicketDashboard';
import CreateTicketModal from './components/CreateTicketModal';
import TicketDetailsPage from './components/TicketDetailsPage';
import './index.css';
import { GraduationCap, LayoutDashboard, Ticket as TicketIcon, CheckSquare, Building, Calendar, Settings } from 'lucide-react';


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
            <div className="brand-icon"><GraduationCap size={28} /></div>
            <span className="brand-text">Smart<span className="bold">Campus</span></span>
          </div>

          <nav className="sidebar-nav">
            {/* Group 1: Core Operations */}
            <div className="nav-group">
              <p className="group-label">WORKSPACE</p>
              <div className={`nav-item ${currentView === 'tasks' ? 'active' : ''}`} onClick={() => setCurrentView('tasks')}>
                <span className="nav-icon"><LayoutDashboard size={20} /></span>
                <span>My Tasks</span>
              </div>
              <div className={`nav-item ${(currentView === 'dashboard' || currentView === 'details' || currentView === 'refresh') ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>
                <span className="nav-icon"><TicketIcon size={20} /></span>
                <span>All Tickets</span>
              </div>
              <div className={`nav-item ${currentView === 'completed' ? 'active' : ''}`} onClick={() => setCurrentView('completed')}>
                <span className="nav-icon"><CheckSquare size={20} /></span>
                <span>Completed</span>
              </div>
            </div>

            {/* Group 2: General Campus Info */}
            <div className="nav-group">
              <p className="group-label">CAMPUS SERVICES</p>
              <div className="nav-item">
                <span className="nav-icon"><Building size={20} /></span>
                <span>Facilities</span>
              </div>
              <div className="nav-item">
                <span className="nav-icon"><Calendar size={20} /></span>
                <span>Schedule</span>
              </div>
            </div>

            {/* Bottom Section: Personal */}
            <div className="nav-group footer-nav">
              <div className="nav-item">
                <span className="nav-icon"><Settings size={20} /></span>
                <span>Account Settings</span>
              </div>
            </div>
          </nav>
        </aside>

        <main className="main-content">
          <div className="app-container">
        {(currentView === 'dashboard' || currentView === 'tasks') && (
          <TicketDashboard 
            activeView={currentView === 'tasks' ? 'MY_TASKS' : 'ALL'}
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
