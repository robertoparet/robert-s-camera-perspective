import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ImageProvider } from './context/ImageContext';
import Home from './pages/Home';
import { AdminPanel } from './components/AdminPanel';
import { Login } from './pages/Login';
import { ImageGrid } from './components/ImageGrid';
import './App.css';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-gray-600"></div>
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
          <Routes>
            {/* Página Home sin contenedores que añadan márgenes */}
            <Route path="/" element={<Home />} />
            
            {/* Otras páginas con estructura normal */}
            <Route path="/login" element={
              <div className="flex flex-col min-h-screen bg-gray-100">
                <main className="flex-1 w-full">
                  <Login />
                </main>
              </div>
            } />
            <Route path="/gallery" element={
              <div className="flex flex-col min-h-screen bg-gray-100">
                <main className="flex-1 w-full">
                  <ImageGrid />
                </main>
              </div>
            } />
            <Route
              path="/admin"
              element={
                <div className="flex flex-col min-h-screen bg-gray-100">
                  <main className="flex-1 w-full">
                    <PrivateRoute>
                      <AdminPanel />
                    </PrivateRoute>
                  </main>
                </div>
              }
            />
          </Routes>
        </Router>
      </ImageProvider>
    </AuthProvider>
  );
}

export default App;
