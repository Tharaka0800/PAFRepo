import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import TicketDashboard from './components/TicketDashboard';
import TechnicianDashboard from './components/TechnicianDashboard';
import AdminDashboard from './components/AdminDashboard';
import CreateTicketModal from './components/CreateTicketModal';
import TicketDetailsPage from './components/TicketDetailsPage';
import Login from './components/Login';
import NotificationsPanel from './components/NotificationsPanel';
import FacilitiesCatalog from './components/FacilitiesCatalog';
import BookingWorkflow from './components/BookingWorkflow';
import ProfilePage from './components/ProfilePage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import './index.css';

const decodeToken = (token) => {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return {
    username: payload.sub,
    role: payload.role,
  };
};

const getDashboardPath = (role) => {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'TECHNICIAN':
      return '/technician/dashboard';
    default:
      return '/student/dashboard';
  }
};

const getLoginPath = (role) => {
  switch (role) {
    case 'ADMIN':
      return '/admin/login';
    case 'TECHNICIAN':
      return '/technician/login';
    default:
      return '/student/login';
  }
};

const ProtectedRoute = ({ user, requiredRole, authReady, children }) => {
  if (!authReady) {
    return null;
  }

  if (!user) {
    return <Navigate to={requiredRole ? getLoginPath(requiredRole) : '/student/login'} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return children;
};

const PublicRoute = ({ user, authReady, children }) => {
  if (!authReady) {
    return null;
  }

  if (user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }
  return children;
};

const TicketDetailsRoute = ({ user }) => {
  const navigate = useNavigate();
  const { ticketId } = useParams();

  return (
    <TicketDetailsPage
      ticketId={ticketId}
      user={user}
      onBack={() => navigate(getDashboardPath(user.role))}
    />
  );
};

const AuthenticatedLayout = ({
  user,
  token,
  onLogout,
  onCreateTicket,
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentSection = useMemo(() => {
    if (location.pathname.includes('/dashboard')) return 'dashboard';
    if (location.pathname.startsWith('/facilities')) return 'facilities';
    if (location.pathname.startsWith('/bookings')) return 'bookings';
    if (location.pathname.startsWith('/notifications')) return 'notifications';
    if (location.pathname.startsWith('/profile')) return 'profile';
    return 'dashboard';
  }, [location.pathname]);

  const handleNavigate = (target) => {
    switch (target) {
      case 'dashboard':
        navigate(getDashboardPath(user.role));
        break;
      case 'facilities':
        navigate('/facilities');
        break;
      case 'bookings':
        navigate('/bookings');
        break;
      case 'notifications':
        navigate('/notifications');
        break;
      case 'profile':
        navigate('/profile');
        break;
      default:
        navigate('/');
        break;
    }
  };

  return (
    <div className="app-layout">
      <main
        className="main-content"
        style={{
          padding: 0,
          margin: 0,
          maxWidth: '100%',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <Navbar
          currentView={currentSection}
          onNavigate={handleNavigate}
          user={user}
          onLogout={onLogout}
        />

        <div className="app-container" style={{ padding: '0 40px 40px 40px', flex: 1 }}>
          {children}
        </div>

        <Footer />
      </main>

      {user.role === 'STUDENT' && onCreateTicket}
    </div>
  );
};

function App() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setAuthReady(true);
      return;
    }

    try {
      setUser(decodeToken(token));
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setAuthReady(true);
    }
  }, [token]);

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const decodedUser = decodeToken(newToken);
    setUser(decodedUser);
    navigate(getDashboardPath(decodedUser.role), { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/', { replace: true });
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    navigate('/student/dashboard', { replace: true });
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/student/login"
          element={
            <PublicRoute user={user} authReady={authReady}>
              <Login
                title="Student Portal Access"
                subtitle="Sign in to your student workspace or create a new account."
                allowRegister
                defaultRole="STUDENT"
                roleHint="Student"
                onLoginSuccess={handleLoginSuccess}
              />
            </PublicRoute>
          }
        />
        <Route
          path="/admin/login"
          element={
            <PublicRoute user={user} authReady={authReady}>
              <Login
                title="Administrator Access"
                subtitle="Secure sign in for authorized campus administrators."
                allowRegister={false}
                defaultRole="ADMIN"
                roleHint="Admin"
                onLoginSuccess={handleLoginSuccess}
              />
            </PublicRoute>
          }
        />
        <Route
          path="/technician/login"
          element={
            <PublicRoute user={user} authReady={authReady}>
              <Login
                title="Technician Access"
                subtitle="Sign in to manage assigned operational tickets and service requests."
                allowRegister={false}
                defaultRole="TECHNICIAN"
                roleHint="Technician"
                onLoginSuccess={handleLoginSuccess}
              />
            </PublicRoute>
          }
        />

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute user={user} requiredRole="STUDENT" authReady={authReady}>
              <AuthenticatedLayout
                user={user}
                token={token}
                onLogout={handleLogout}
                onCreateTicket={
                  showCreateModal && (
                    <CreateTicketModal
                      onClose={() => setShowCreateModal(false)}
                      onSuccess={handleCreateSuccess}
                    />
                  )
                }
              >
                <TicketDashboard
                  user={user}
                  onCreateNew={() => setShowCreateModal(true)}
                  onViewTicket={(id) => navigate(`/tickets/${id}`)}
                />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute user={user} requiredRole="ADMIN" authReady={authReady}>
              <AuthenticatedLayout user={user} token={token} onLogout={handleLogout}>
                <AdminDashboard user={user} onViewTicket={(id) => navigate(`/tickets/${id}`)} />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/technician/dashboard"
          element={
            <ProtectedRoute user={user} requiredRole="TECHNICIAN" authReady={authReady}>
              <AuthenticatedLayout user={user} token={token} onLogout={handleLogout}>
                <TechnicianDashboard user={user} onViewTicket={(id) => navigate(`/tickets/${id}`)} />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tickets/:ticketId"
          element={
            <ProtectedRoute user={user} authReady={authReady}>
              <AuthenticatedLayout user={user} token={token} onLogout={handleLogout}>
                <TicketDetailsRoute user={user} />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/facilities"
          element={
            <ProtectedRoute user={user} authReady={authReady}>
              <AuthenticatedLayout user={user} token={token} onLogout={handleLogout}>
                <FacilitiesCatalog token={token} role={user?.role} />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings"
          element={
            <ProtectedRoute user={user} authReady={authReady}>
              <AuthenticatedLayout user={user} token={token} onLogout={handleLogout}>
                <BookingWorkflow token={token} role={user?.role} username={user?.username} />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute user={user} authReady={authReady}>
              <AuthenticatedLayout user={user} token={token} onLogout={handleLogout}>
                <NotificationsPanel token={token} role={user?.role} user={user} />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user} authReady={authReady}>
              <AuthenticatedLayout user={user} token={token} onLogout={handleLogout}>
                <ProfilePage token={token} user={user} />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to={user ? getDashboardPath(user.role) : '/'} replace />}
        />
      </Routes>
    </>
  );
}

export default App;
