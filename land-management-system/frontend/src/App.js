import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout Components
import Layout from './components/Layout';
import Login from './pages/Login';

// Dashboard Components
import AdminDashboard from './pages/Admin/Dashboard';
import AuditorDashboard from './pages/Auditor/Dashboard';
import FarmerDashboard from './pages/Farmer/Dashboard';

// Admin Pages
import UserManagement from './pages/Admin/UserManagement';
import SystemStatistics from './pages/Admin/SystemStatistics';

// Auditor Pages
import FarmerManagement from './pages/Auditor/FarmerManagement';
import DataEntry from './pages/Auditor/DataEntry';
import ReportGeneration from './pages/Auditor/ReportGeneration';

// Farmer Pages
import MyFarmData from './pages/Farmer/MyFarmData';
import MyReports from './pages/Farmer/MyReports';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Role-based Dashboard Router
const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'auditor':
      return <AuditorDashboard />;
    case 'farmer':
      return <FarmerDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes with Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardRouter />} />
          
          {/* Admin Routes */}
          <Route
            path="admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/statistics"
            element={
              <ProtectedRoute requiredRole="admin">
                <SystemStatistics />
              </ProtectedRoute>
            }
          />
          
          {/* Auditor Routes */}
          <Route
            path="auditor/farmers"
            element={
              <ProtectedRoute requiredRole="auditor">
                <FarmerManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="auditor/data-entry/:farmerId"
            element={
              <ProtectedRoute requiredRole="auditor">
                <DataEntry />
              </ProtectedRoute>
            }
          />
          <Route
            path="auditor/reports"
            element={
              <ProtectedRoute requiredRole="auditor">
                <ReportGeneration />
              </ProtectedRoute>
            }
          />
          
          {/* Farmer Routes */}
          <Route
            path="farmer/my-data"
            element={
              <ProtectedRoute requiredRole="farmer">
                <MyFarmData />
              </ProtectedRoute>
            }
          />
          <Route
            path="farmer/my-reports"
            element={
              <ProtectedRoute requiredRole="farmer">
                <MyReports />
              </ProtectedRoute>
            }
          />
        </Route>
        
        {/* 404 and Unauthorized Routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
