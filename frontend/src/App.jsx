import { Routes, Route, Link , Navigate, useLocation} from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import CreateEvent from './pages/CreateEvent';
import OrganizerEventDetail from './pages/OrganizerEventDetail';
import EditEvent from './pages/EditEvent';
import BrowseEvents from './pages/BrowseEvents';
import EventDetails from './pages/EventDetails';
import Profile from './pages/Profile';
import OrganizersList from './pages/OrganizersList';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import EventParticipants from './pages/EventParticipants';

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  // to trigger rerender to make sure token adn role can be used
  const location = useLocation();


  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login'; 
  };
  return (
    <div>
      <h1>Felicity Event Platform</h1>
      <nav style={{ 
        padding: '20px', 
        borderBottom: '1px solid #ccc', 
        display: 'flex', 
        gap: '20px', 
        justifyContent: 'center',
        alignItems: 'center' 
      }}>
        <Link to="/profile">My Profile</Link>
        <Link to="/browse">Browse Events</Link>
        <Link to="/organizers">Clubs</Link>

        {token ? (
          <>
            {/* dashboard based on roles */}
            {role === 'Admin' && (
              <>
                <Link to="/admin">Dashboard</Link>
                <Link to="/admin">Manage Clubs</Link>
                <Link to="/admin">Reset Requests</Link>
              </>
            )}
            {role === 'Organizer' && <Link to="/organizer-dashboard">Dashboard</Link>}
            {role === 'Participant' && <Link to="/dashboard">Dashboard</Link>}
            
            
            <button 
              onClick={handleLogout} 
              style={{ 
                background: 'none', 
                border: 'none', 
                padding: 0, 
                cursor: 'pointer', 
                color: 'inherit', 
                textDecoration: 'underline',
                fontSize: '16px' 
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<BrowseEvents />} />
        <Route path="/browse" element={<BrowseEvents />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:resettoken" element={<ResetPassword />} />
        <Route path="/organizers" element={<OrganizersList />} />


        {/* Participant Dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRole="Participant">
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute allowedRole="Admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/*Organisers */}
        <Route path="/organizer-dashboard" element={
          <ProtectedRoute allowedRole="Organizer">
            <OrganizerDashboard />
          </ProtectedRoute>
        } />

        <Route path="/create-event" element={
          <ProtectedRoute allowedRole="Organizer">
            <CreateEvent />
          </ProtectedRoute>
        } />

        <Route path="/edit-event/:id" element={
          <ProtectedRoute allowedRole="Organizer">
            <EditEvent />
          </ProtectedRoute>
        } />

        <Route path="/event-participants/:id" element={
          <ProtectedRoute allowedRole="Organizer">
            <EventParticipants />
          </ProtectedRoute>
        } />

        <Route 
          path="/organizer/event/:id" 
          element={
            <ProtectedRoute allowedRole="Organizer">
              <OrganizerEventDetail />
            </ProtectedRoute>
          } 
        />
        
        
        <Route path="/event/:id" element={<EventDetails />} />
        
        
        
      </Routes>
    </div>
  );
}

export default App;
