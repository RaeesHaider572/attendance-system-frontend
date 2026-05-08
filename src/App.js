import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import CheckInOut from './components/Attendance/CheckInOut';
import EmployeeList from './components/Employees/EmployeeList';
import AddEmployee from './components/Employees/AddEmployee';
import AttendanceReport from './components/Attendance/AttendanceReport';
import Layout from './components/Layout/Layout';
import 'bootstrap/dist/css/bootstrap.min.css';

// Private Route Component
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div className="text-center mt-5">Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

// Main App Component with routes
function AppRoutes() {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
                <PrivateRoute>
                    <Layout>
                        <Dashboard />
                    </Layout>
                </PrivateRoute>
            } />
            <Route path="/attendance" element={
                <PrivateRoute>
                    <Layout>
                        <CheckInOut />
                    </Layout>
                </PrivateRoute>
            } />
            <Route path="/employees" element={
                <PrivateRoute>
                    <Layout>
                        <EmployeeList />
                    </Layout>
                </PrivateRoute>
            } />
            <Route path="/add-employee" element={
                <PrivateRoute>
                    <Layout>
                        <AddEmployee />
                    </Layout>
                </PrivateRoute>
            } />
            <Route path="/reports" element={
                <PrivateRoute>
                    <Layout>
                        <AttendanceReport />
                    </Layout>
                </PrivateRoute>
            } />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    );
}

export default App;