import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserSelection from './components/UserSelection';
import Login from './components/login';
import EmployeeDashboard from './components/EmployeeDashboard';
import SupervisorDashboard from './components/SupervisorDashboard';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<UserSelection />} />
                <Route path="/login/:userType" element={<Login />} />
                <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
                <Route path="/supervisor-dashboard" element={<SupervisorDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
            </Routes>
        </Router>
    );
}

export default App;
