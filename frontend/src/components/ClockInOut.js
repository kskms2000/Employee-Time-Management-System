import React, { useState, useEffect } from 'react';
import { gql, useMutation, useLazyQuery } from '@apollo/client';

const CLOCK_IN_MUTATION = gql`
    mutation clockIn($employeeID: String!) {
        clockIn(employeeID: $employeeID) {
            TransactionID
            ShiftDate
            ClockInTime
            ShiftStatus
        }
    }
`;

const CLOCK_OUT_MUTATION = gql`
    mutation clockOut($employeeID: String!) {
        clockOut(employeeID: $employeeID) {
            TransactionID
            ShiftDate
            ClockInTime
            ClockOutTime
            ShiftStatus
        }
    }
`;

const GET_LATEST_TRANSACTION = gql`
    query getLatestTransaction($employeeID: String!) {
        getLatestTransaction(employeeID: $employeeID) {
            TransactionID
            ClockInTime
            ClockOutTime
            ShiftStatus
        }
    }
`;

function ClockInOut({ employeeID }) {
    const isReload = localStorage.getItem('reload');
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    const [getLatestTransaction] = useLazyQuery(GET_LATEST_TRANSACTION, {
        variables: { employeeID },
        onCompleted: (data) => {
            if (data.getLatestTransaction && !data.getLatestTransaction.ClockOutTime) {
                setIsClockedIn(true); // User is clocked in
            } else {
                setIsClockedIn(false); // User is not clocked in
            }
            if (isReload == 1) {
                localStorage.setItem('reload', 2);
                window.location.reload();
            }
        },
        onError: (error) => {
            console.error('Error fetching latest transaction:', error.message); // Log errors
        }
    });

    const [clockIn, { loading: clockInLoading }] = useMutation(CLOCK_IN_MUTATION, {
        onCompleted: () => setIsClockedIn(true),
        onError: (error) => console.error('Clock In Error:', error.message)
    });

    const [clockOut, { loading: clockOutLoading }] = useMutation(CLOCK_OUT_MUTATION, {
        onCompleted: (data) => {
            console.log('Clock Out Successful:', data);
            setIsClockedIn(false);
            getLatestTransaction(); // Fetch latest transaction after clock-out
        },
        onError: (error) => {
            console.error('Clock Out Error:', error.message);
        }
    });

    useEffect(() => {
        console.log('Fetching latest transaction for employeeID:', employeeID); // Debug
        getLatestTransaction({ fetchPolicy: 'network-only' }); // Always fetch fresh data from the server
    }, [employeeID]);

    // Update the clock every second
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const handleClockIn = async () => {
        await clockIn({ variables: { employeeID } });
    };

    const handleClockOut = async () => {
        await clockOut({ variables: { employeeID } });
    };

    const buttonStyles = {
        base: {
            border: 'none',
            borderRadius: '50%',
            width: '100px',
            height: '100px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            color: '#fff',
            transition: 'background-color 0.3s',
        },
        clockIn: {
            backgroundColor: '#4CAF50',
        },
        clockOut: {
            backgroundColor: '#f44336',
        }
    };

    return (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
            {/* Display the current system time */}
            <div style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>
                {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
            </div>

            {isClockedIn ? (
                <button
                    onClick={handleClockOut}
                    disabled={clockOutLoading}
                    style={{
                        ...buttonStyles.base,
                        ...buttonStyles.clockOut
                    }}
                >
                    {clockOutLoading ? 'Clocking Out...' : 'Clock Out'}
                </button>
            ) : (
                <button
                    onClick={handleClockIn}
                    disabled={clockInLoading}
                    style={{
                        ...buttonStyles.base,
                        ...buttonStyles.clockIn
                    }}
                >
                    {clockInLoading ? 'Clocking In...' : 'Clock In'}
                </button>
            )}
        </div>
    );
}

export default ClockInOut;
