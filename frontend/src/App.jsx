import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import Competitions from './pages/Competitions';
import LiveMatch from './pages/LiveMatch';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/competitions" element={<Competitions />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/analytics/:userId" element={<Analytics />} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/player-dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organizer-dashboard"
                  element={
                    <ProtectedRoute>
                      <OrganizerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/match/:matchId"
                  element={
                    <ProtectedRoute>
                      <LiveMatch />
                    </ProtectedRoute>
                  }
                />

                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
          
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#151934',
                color: '#fff',
                border: '1px solid rgba(34, 211, 238, 0.3)',
                borderRadius: '12px',
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: '16px',
                fontWeight: '600',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
                style: {
                  border: '1px solid rgba(34, 197, 94, 0.5)',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
                style: {
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                },
              },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
