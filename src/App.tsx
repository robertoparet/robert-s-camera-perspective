import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Admin } from './pages/Admin';
import { ImageProvider } from './context/ImageContext';
import './App.css';

function App() {
  return (
    <ImageProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
          <nav className="bg-black/30 backdrop-blur-sm shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-center h-16">
                <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                  Robert's Gallery
                </h1>
              </div>
            </div>
          </nav>

          <main className="flex-1 w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ImageProvider>
  );
}

export default App;
