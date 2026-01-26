import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Layout from './components/layout/Layout';
import { Toaster } from 'react-hot-toast';

import Drive from './pages/admin/Drive';
import Profile from './pages/admin/Profile';

const ProtectedRoute = ({ children, role }: { children: any, role?: string }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) {
    if (user.role === 'admin') return <Navigate to="/admin/drive" />;
    return <Navigate to="/login" />;
  }
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" toastOptions={{
          className: 'bg-background text-foreground border border-border shadow-lg',
          duration: 4000
        }} />
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Admin Routes - The Core System */}
          <Route path="/admin/drive" element={
            <ProtectedRoute role="admin"><Drive /></ProtectedRoute>
          } />
          <Route path="/admin/profile" element={
            <ProtectedRoute role="admin"><Profile /></ProtectedRoute>
          } />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/admin/drive" />} />
          <Route path="*" element={<Navigate to="/admin/drive" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
