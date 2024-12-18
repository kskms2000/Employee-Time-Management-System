// src/components/UserSelection.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function UserSelection() {
    const navigate = useNavigate();

    const handleSelection = (userType) => {
        navigate(`/login/${userType}`);
    };

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                backgroundColor: '#f4f4f4',
                fontFamily: 'Arial, sans-serif'
            }}
        >
            <h1 style={{ marginBottom: '20px' }}>Select User Type</h1>
            <button
                onClick={() => handleSelection('admin')}
                style={{
                    width: '150px',
                    height: '50px',
                    margin: '10px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    textAlign: 'center'
                }}
            >
                Admin
            </button>
            <button
                onClick={() => handleSelection('employee')}
                style={{
                    width: '150px',
                    height: '50px',
                    margin: '10px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    textAlign: 'center'
                }}
            >
                Employee
            </button>
            <button
                onClick={() => handleSelection('supervisor')}
                style={{
                    width: '150px',
                    height: '50px',
                    margin: '10px',
                    backgroundColor: '#FF9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    textAlign: 'center'
                }}
            >
                Supervisor
            </button>
        </div>
    );
}

export default UserSelection;
