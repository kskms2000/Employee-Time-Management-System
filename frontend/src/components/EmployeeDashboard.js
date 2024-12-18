import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ClockInOut from './ClockInOut';
import GetTransactions from './GetTransactions';
import GetContractDetails from './GetContractdetails';
import GetPayslip from './GetPayslip';

function EmployeeDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const userData = location.state?.userData || {};

    const handleSignOut = () => {
        navigate('/');
    };

    const styles = {
        container: {
            maxWidth: '900px',
            margin: '20px auto',
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#f9f9f9',
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        signOutButton: {
            backgroundColor: '#e74c3c',
            color: '#fff',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>Hello, {userData.fullName || 'Employee'}</h1>
                <button style={styles.signOutButton} onClick={handleSignOut}>
                    Sign Out
                </button>
            </div>

            <p>Email: {userData.email || 'N/A'}</p>
            <p>User Id: {userData.employeeID || 'N/A'}</p>

            <ClockInOut employeeID={userData.employeeID} />
            <br></br>
            <GetTransactions employeeID={userData.employeeID} /><br></br>
            <GetContractDetails employeeID={userData.employeeID} /><br></br>
            <GetPayslip employeeID={userData.employeeID} /><br></br>
        </div>
    );
}

export default EmployeeDashboard;
