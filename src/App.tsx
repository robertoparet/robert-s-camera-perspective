import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ImageProvider } from './context/ImageContext';
import { Home } from './pages/Home';
import { AdminPanel } from './components/AdminPanel';
import { Login } from './pages/Login';
import './App.css';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <ImageProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-gradient-to-b from-mono-950 to-mono-900">
            <main className="flex-1 w-full">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/admin"
                  element={
                    <PrivateRoute>
                      <AdminPanel />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </Router>
      </ImageProvider>
    </AuthProvider>
  );
}

export default App;
