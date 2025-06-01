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
        {/* Public routes */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/siwe" element={<SignApp />} />
        <Route path="/login" element={<Navigate to="/auth/siwe" replace />} />

        {/* Root/Dashboard route with special handling */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
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
