import React, { useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';

const GET_EMPLOYEE_TRANSACTIONS = gql`
    query getEmployeeTransactions($employeeID: String!) {
        getEmployeeTransactions(employeeID: $employeeID) {
            TransactionID
            ShiftDate
            ClockInTime
            ClockOutTime
            ShiftStatus
            SupervisorComments
        }
    }
`;

function GetTransactions({ employeeID }) {
    const [transactions, setTransactions] = useState([]);
    const [showTransactions, setShowTransactions] = useState(false);

    const [fetchTransactions, { loading }] = useLazyQuery(GET_EMPLOYEE_TRANSACTIONS, {
        onCompleted: (data) => setTransactions(data.getEmployeeTransactions),
        onError: (error) => console.error('Error fetching transactions:', error.message),
    });

    const styles = {
        button: {
            backgroundColor: '#3498db',
            color: '#fff',
            padding: '10px 15px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '20px',
        },
        th: {
            backgroundColor: '#2980b9',
            color: '#fff',
            padding: '10px',
        },
        td: {
            padding: '10px',
            border: '1px solid #ddd',
        },
        issueRow: {
            color: 'red',
        },
    };

    const calculateTimeDifference = (clockIn, clockOut) => {
        if (!clockIn || !clockOut) return 0;
        const diffInMilliseconds = new Date(clockOut) - new Date(clockIn);
        return diffInMilliseconds / (1000 * 60 * 60); // Convert to hours
    };

    return (
        <div>
            <button
                style={styles.button}
                onClick={() => {
                    if (!showTransactions) fetchTransactions({ variables: { employeeID } });
                    setShowTransactions(!showTransactions);
                }}
            >
                {showTransactions ? 'Hide Transactions' : 'View Transactions'}
            </button>
            {loading && <p>Loading transactions...</p>}
            {showTransactions && transactions.length > 0 && (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Transaction ID</th>
                            <th style={styles.th}>Shift Date</th>
                            <th style={styles.th}>Clock In</th>
                            <th style={styles.th}>Clock Out</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Comments</th>
                            <th style={styles.th}>Issue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction) => {
                            const timeDiff = calculateTimeDifference(transaction.ClockInTime, transaction.ClockOutTime);
                            const hasIssue = timeDiff > 10;
                            return (
                                <tr
                                    key={transaction.TransactionID}
                                    style={hasIssue ? styles.issueRow : {}}
                                >
                                    <td style={styles.td}>{transaction.TransactionID}</td>
                                    <td style={styles.td}>{new Date(transaction.ShiftDate).toLocaleDateString()}</td>
                                    <td style={styles.td}>
                                        {transaction.ClockInTime
                                            ? new Date(transaction.ClockInTime).toLocaleString(undefined, {
                                                  year: 'numeric',
                                                  month: '2-digit',
                                                  day: '2-digit',
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                                  second: '2-digit',
                                              })
                                            : 'N/A'}
                                    </td>
                                    <td style={styles.td}>
                                        {transaction.ClockOutTime
                                            ? new Date(transaction.ClockOutTime).toLocaleString(undefined, {
                                                  year: 'numeric',
                                                  month: '2-digit',
                                                  day: '2-digit',
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                                  second: '2-digit',
                                              })
                                            : 'N/A'}
                                    </td>
                                    <td style={styles.td}>{transaction.ShiftStatus}</td>
                                    <td style={styles.td}>{transaction.SupervisorComments}</td>
                                    <td style={styles.td}>{hasIssue ? 'Yes' : 'No'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default GetTransactions;
