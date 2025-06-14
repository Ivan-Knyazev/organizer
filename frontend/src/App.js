import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import NotesPage from './pages/NotesPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import WeatherPage from './pages/WeatherPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <>
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/weather" element={<WeatherPage />} />

          {/* Protected Routes */}
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/notes" element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
          <Route path="/knowledge-base" element={<ProtectedRoute><KnowledgeBasePage /></ProtectedRoute>} />
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;