import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ModifyTransaction from './ModifyTransaction';
import AddEmployee from './AddEmployee';
import LateReport from './LateReport';
import AddSupervisor from './AddSupervisor';

function AdminDashboard() {
    const location = useLocation();
    const userData = location.state?.userData || {};
    const navigate = useNavigate();

    const handleSignOut = () => {
        console.log('Signing out...');
        navigate('/'); // Redirect to the user selection page
    };

    const styles = {
        container: {
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
            position: 'relative',
            maxWidth: '900px',
            margin: '0 auto',
            backgroundColor: '#f9f9f9',
            borderRadius: '10px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        },
        signOutButton: {
            position: 'absolute',
            top: '20px',
            right: '20px',
            backgroundColor: '#e74c3c',
            color: '#fff',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            zIndex: 1000,
        },
        header: {
            textAlign: 'center',
            color: '#2c3e50',
        },
        section: {
            marginTop: '20px',
            padding: '20px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 0 8px rgba(0, 0, 0, 0.1)',
        },
    };

    return (
        <div style={styles.container}>
            {/* Sign Out Button */}
            <button style={styles.signOutButton} onClick={handleSignOut}>
                Sign Out
            </button>

            {/* Admin Details */}
            <div style={styles.header}>
                <h1>Hello, Admin {userData.fullName || 'Unknown'}</h1>
                <p>Email: {userData.email || 'N/A'}</p>
                <p>Admin ID: {userData.adminID || 'N/A'}</p>
            </div>

            {/* Components */}
            <div style={styles.section}>
                <h2>Modify Transactions</h2>
                <ModifyTransaction />
            </div>

            <div style={styles.section}>
                <h2>Add New Employee</h2>
                <AddEmployee />
            </div>

            <div style={styles.section}>
                <h2>Add Supervisor</h2>
                <AddSupervisor />
            </div>

            <div style={styles.section}>
                <h2>Late Report</h2>
                <LateReport />
            </div>
        </div>
    );
}

export default AdminDashboard;
