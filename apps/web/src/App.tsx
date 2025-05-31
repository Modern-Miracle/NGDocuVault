import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import DashboardLayout from './components/layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import RegisterDocument from './pages/RegisterDocument';
import VerifyDocument from './pages/VerifyDocument';
import SharedDocuments from './pages/SharedDocuments';
import DocumentDetails from './pages/DocumentDetails';
import UserManagement from './pages/UserManagement';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import LandingPage from './pages/LandingPage';
import RootRedirect from './components/routing/RootRedirect';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import AuthPage from './pages/Auth';
import SignApp from './pages/SignUp';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#323232',
            color: '#fff',
            borderRadius: '8px',
          },
        }}
      />
      <Routes>
        {/* Root route with smart redirect */}
        <Route path="/" element={<RootRedirect />} />
        
        {/* Public routes */}
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/siwe" element={<SignApp />} />
        <Route path="/login" element={<Navigate to="/auth/siwe" replace />} />

        {/* Protected Dashboard routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/documents/:id" element={<DocumentDetails />} />
          <Route path="/register-document" element={<RegisterDocument />} />
          <Route path="/verify-document" element={<VerifyDocument />} />
          <Route path="/shared" element={<SharedDocuments />} />
          <Route path="/users-management" element={<UserManagement />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;

/*





*/
