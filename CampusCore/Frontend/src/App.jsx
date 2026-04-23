import React, { useState, useEffect } from 'react';
import TicketDashboard from './components/TicketDashboard';
import TechnicianDashboard from './components/TechnicianDashboard';
import AdminDashboard from './components/AdminDashboard';
import CreateTicketModal from './components/CreateTicketModal';
import TicketDetailsPage from './components/TicketDetailsPage';
import Login from './components/Login';
import NotificationsPanel from './components/NotificationsPanel';
import FacilitiesCatalog from './components/FacilitiesCatalog';
import BookingWorkflow from './components/BookingWorkflow';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Auth state
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          username: payload.sub,
          role: payload.role
        });
        setCurrentView('dashboard');
      } catch (e) {
        handleLogout();
      }
    }
  }, [token]);

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCurrentView('home');
  };

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
    if (currentView === 'dashboard') {
      setCurrentView('refresh');
      setTimeout(() => setCurrentView('dashboard'), 0);
    }
  };

  if (!token || !user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-layout">
      {/* Main Content Area - Full width, no sidebar */}
      <main className="main-content" style={{ padding: 0, margin: 0, maxWidth: '100%', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar 
            currentView={currentView}
            onNavigate={(view) => {
                setCurrentView(view);
                setSelectedTicketId(null);
            }}
            user={user} 
            onLogout={handleLogout} 
        />
        
        <div className="app-container" style={{ padding: '0 40px 40px 40px', flex: 1 }}>
          {currentView === 'home' && (
            <HomePage onLaunchDashboard={() => setCurrentView('dashboard')} />
          )}

          {currentView === 'dashboard' && user.role !== 'TECHNICIAN' && user.role !== 'ADMIN' && (
            <TicketDashboard 
              user={user}
              onCreateNew={() => setShowCreateModal(true)} 
              onViewTicket={handleViewTicket} 
            />
          )}

          {currentView === 'dashboard' && user.role === 'TECHNICIAN' && (
            <TechnicianDashboard 
              user={user}
              onViewTicket={handleViewTicket} 
            />
          )}

          {currentView === 'dashboard' && user.role === 'ADMIN' && (
            <AdminDashboard 
              user={user}
              onViewTicket={handleViewTicket} 
            />
          )}
          
          {currentView === 'details' && selectedTicketId && (
            <TicketDetailsPage 
              ticketId={selectedTicketId} 
              onBack={handleBackToDashboard} 
            />
          )}

          {currentView === 'facilities' && (
            <FacilitiesCatalog token={token} role={user.role} />
          )}

          {currentView === 'bookings' && (
            <BookingWorkflow token={token} role={user.role} username={user.username} />
          )}

          {currentView === 'notifications' && (
            <NotificationsPanel token={token} role={user.role} />
          )}
        </div>

        <Footer />
      </main>

      {showCreateModal && (
        <CreateTicketModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}

export default App;
