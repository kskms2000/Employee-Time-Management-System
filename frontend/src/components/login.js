import React, { useState } from 'react';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';

const LOGIN_QUERY = gql`
    query login($email: String!, $password: String!, $userType: String!) {
        login(email: $email, password: $password, userType: $userType) {
            message
            userType
            fullName
            email
            employeeType
            hireDate
            contractID
            status
            employeeID
            supervisorID
            adminID
            isFirstLogin
            IsFirstLogin
        }
    }
`;

const UPDATE_PASSWORD_MUTATION = gql`
    mutation updatePassword($userID: String!, $newPassword: String!, $userType: String!) {
        updatePassword(userID: $userID, newPassword: $newPassword, userType: $userType) {
            message
            success
        }
    }
`;

function Login() {
    const { userType } = useParams(); // Get userType from the route
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isFirstLogin, setIsFirstLogin] = useState(false);
    const [userID, setUserID] = useState('');
    const navigate = useNavigate();
    const [login, { data, loading, error }] = useLazyQuery(LOGIN_QUERY, {
        onCompleted: (data) => {
            const loginData = data.login;
            console.log("Login Data:", loginData); // Debug log

            if (userType === 'employee' && loginData.employeeType === 'monthly') {
                alert('This portal is for hourly-based employees only. Please contact your HR for assistance.');
                return; // Prevent further actions
            }

            // Check for isFirstLogin or IsFirstLogin based on userType
            const firstLogin = userType === 'employee' ? loginData.isFirstLogin : loginData.IsFirstLogin;

            if (firstLogin) {
                setIsFirstLogin(true);
                setUserID(loginData.employeeID || loginData.supervisorID);
            } else if (loginData.userType === 'employee') {
                navigate('/employee-dashboard', { state: { userData: loginData } });
            } else if (loginData.userType === 'supervisor') {
                navigate('/supervisor-dashboard', { state: { userData: loginData } });
            } else if (loginData.userType === 'admin') {
                navigate('/admin-dashboard', { state: { userData: loginData } });
            } else {
                alert('Invalid user type');
            }
        }
    });

    const [updatePassword, { loading: updatingPassword, error: updateError }] = useMutation(UPDATE_PASSWORD_MUTATION, {
        onCompleted: (data) => {
            if (data.updatePassword.success) {
                alert('Password updated successfully. Please log in again.');
                setIsFirstLogin(false);
                setEmail('');
                setPassword('');
            } else {
                alert(data.updatePassword.message);
            }
        }
    });

    const handleLogin = () => {
        login({ variables: { email, password, userType } });
    };

    const handlePasswordChange = () => {
        if (newPassword !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }
        updatePassword({ variables: { userID, newPassword, userType } });
    };

    if (isFirstLogin) {
        return (
            <div style={styles.container}>
                <h2 style={styles.header}>First-Time Login</h2>
                <p style={styles.message}>Please change your password to proceed.</p>
                <div style={styles.formContainer}>
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={styles.input}
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={styles.input}
                    />
                    <button onClick={handlePasswordChange} disabled={updatingPassword} style={styles.button}>
                        {updatingPassword ? 'Updating...' : 'Change Password'}
                    </button>
                    {updateError && <p style={styles.error}>Error: {updateError.message}</p>}
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>{userType.charAt(0).toUpperCase() + userType.slice(1)} Login</h2>
            <div style={styles.formContainer}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={styles.input}
                />
                <button onClick={handleLogin} disabled={loading} style={styles.button}>
                    {loading ? 'Logging In...' : 'Login'}
                </button>
                {error && <p style={styles.error}>Error: {error.message}</p>}
                {data && <p style={styles.message}>{data.login.message}</p>}
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
        fontFamily: 'Arial, sans-serif',
    },
    header: {
        fontSize: '2rem',
        marginBottom: '20px',
        color: '#333',
    },
    formContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '400px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    input: {
        width: '100%',
        padding: '10px',
        margin: '10px 0',
        borderRadius: '5px',
        border: '1px solid #ccc',
        fontSize: '1rem',
    },
    button: {
        width: '100%',
        padding: '10px',
        backgroundColor: '#4CAF50',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '1rem',
        marginTop: '10px',
        transition: 'background-color 0.3s',
    },
    error: {
        color: '#ff0000',
        marginTop: '10px',
        fontSize: '0.9rem',
    },
    message: {
        color: '#333',
        marginTop: '10px',
        fontSize: '0.9rem',
    },
};

export default Login;
