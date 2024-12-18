import React, { useState } from 'react';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import moment from 'moment-timezone';

const GET_TRANSACTIONS = gql`
    query getTransactions($employeeID: String!, $date: String!) {
        getTransactions(employeeID: $employeeID, date: $date) {
            TransactionID
            ShiftDate
            ClockInTime
            ClockOutTime
            ShiftStatus
            SupervisorComments
        }
    }
`;

const UPDATE_TRANSACTION = gql`
    mutation updateTransaction(
        $transactionID: String!
        $clockInTime: String
        $clockOutTime: String
        $shiftStatus: String
        $supervisorComments: String
    ) {
        updateTransaction(
            transactionID: $transactionID
            clockInTime: $clockInTime
            clockOutTime: $clockOutTime
            shiftStatus: $shiftStatus
            supervisorComments: $supervisorComments
        ) {
            message
        }
    }
`;

function ModifyTransaction() {
    const [step, setStep] = useState(1);
    const [employeeID, setEmployeeID] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [editableTransaction, setEditableTransaction] = useState(null);
    const [formData, setFormData] = useState({});
    const [showModifySection, setShowModifySection] = useState(false);

    const toggleModifySection = () => {
        setShowModifySection((prev) => !prev);
    };

    const [getTransactions, { loading: loadingTransactions }] = useLazyQuery(GET_TRANSACTIONS, {
        onCompleted: (data) => {
            setTransactions(data.getTransactions);
            setStep(3);
        },
        onError: (error) => console.error('Error fetching transactions:', error.message),
    });

    const [updateTransaction] = useMutation(UPDATE_TRANSACTION, {
        onCompleted: (data) => {
            alert(data.updateTransaction.message);
            setEditableTransaction(null);
        },
        onError: (error) => console.error('Error updating transaction:', error.message),
    });

    const handleNext = () => {
        if (step === 1) {
            if (employeeID) {
                setStep(2);
            } else {
                alert('Please enter an Employee ID.');
            }
        } else if (step === 2) {
            if (selectedDate) {
                const formattedDate = moment.tz(selectedDate, 'America/Chicago').format('YYYY-MM-DD');
                getTransactions({ variables: { employeeID, date: formattedDate } });
            } else {
                alert('Please select a date.');
            }
        }
    };

    const handleModify = (transaction) => {
        setEditableTransaction(transaction.TransactionID);

        setFormData({
            ClockInDate: transaction.ClockInTime
                ? moment(Number(transaction.ClockInTime)).tz('America/Chicago').format('YYYY-MM-DD')
                : '',
            ClockInTime: transaction.ClockInTime
                ? moment(Number(transaction.ClockInTime)).tz('America/Chicago').format('HH:mm')
                : '',
            ClockOutDate: transaction.ClockOutTime
                ? moment(Number(transaction.ClockOutTime)).tz('America/Chicago').format('YYYY-MM-DD')
                : '',
            ClockOutTime: transaction.ClockOutTime
                ? moment(Number(transaction.ClockOutTime)).tz('America/Chicago').format('HH:mm')
                : '',
            ShiftStatus: transaction.ShiftStatus || '',
            SupervisorComments: transaction.SupervisorComments || '',
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleUpdate = () => {
        const clockInTimestamp =
            formData.ClockInDate && formData.ClockInTime
                ? new Date(`${formData.ClockInDate}T${formData.ClockInTime}`).getTime()
                : null;
        const clockOutTimestamp =
            formData.ClockOutDate && formData.ClockOutTime
                ? new Date(`${formData.ClockOutDate}T${formData.ClockOutTime}`).getTime()
                : null;

        updateTransaction({
            variables: {
                transactionID: editableTransaction,
                clockInTime: clockInTimestamp ? clockInTimestamp.toString() : null,
                clockOutTime: clockOutTimestamp ? clockOutTimestamp.toString() : null,
                shiftStatus: formData.ShiftStatus,
                supervisorComments: formData.SupervisorComments,
            },
        });
    };

    const styles = {
        container: {
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
        },
        button: {
            margin: '10px 0',
            padding: '10px 20px',
            backgroundColor: "#4CAF50",
            color: '#fff',
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
            backgroundColor: '#4CAF50',
            color: '#fff',
            padding: '10px',
        },
        td: {
            padding: '10px',
            borderBottom: '1px solid #ddd',
        },
        formRow: {
            backgroundColor: '#f9f9f9',
            padding: '20px',
            borderRadius: '5px',
        },
        modifyButton: {
            margin: '10px 0',
            padding: '10px 20px',
            backgroundColor: showModifySection ? "#f44336" : "#4CAF50",
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
        }
    };

    return (
        <div style={styles.container}>
            <button style={styles.modifyButton} onClick={toggleModifySection} >
                {showModifySection ? 'Hide Modify Section' : 'Modify Transaction'}
            </button>

            {showModifySection && (
                <div>
                    {step === 1 && (
                        <div>
                            <h3>Enter Employee ID</h3>
                            <input
                                type="text"
                                placeholder="Employee ID"
                                value={employeeID}
                                onChange={(e) => setEmployeeID(e.target.value)}
                            />
                            <button style={styles.button} onClick={handleNext}>
                                Next
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h3>Select Date</h3>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                            <button style={styles.button} onClick={handleNext}>
                                Next
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <h3>Transactions on {selectedDate}</h3>
                            {loadingTransactions && <p>Loading transactions...</p>}
                            {!loadingTransactions && transactions.length === 0 && (
                                <p>No transactions found.</p>
                            )}
                            {!loadingTransactions && transactions.length > 0 && (
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Transaction ID</th>
                                            <th style={styles.th}>Clock In</th>
                                            <th style={styles.th}>Clock Out</th>
                                            <th style={styles.th}>Status</th>
                                            <th style={styles.th}>Comments</th>
                                            <th style={styles.th}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((transaction) => (
                                            <React.Fragment key={transaction.TransactionID}>
                                                <tr>
                                                    <td style={styles.td}>
                                                        {transaction.TransactionID}
                                                    </td>
                                                    <td style={styles.td}>
                                                        {transaction.ClockInTime
                                                            ? moment(Number(transaction.ClockInTime))
                                                                  .tz('America/Chicago')
                                                                  .format('MM/DD/YYYY, hh:mm:ss A')
                                                            : 'N/A'}
                                                    </td>
                                                    <td style={styles.td}>
                                                        {transaction.ClockOutTime
                                                            ? moment(Number(transaction.ClockOutTime))
                                                                  .tz('America/Chicago')
                                                                  .format('MM/DD/YYYY, hh:mm:ss A')
                                                            : 'N/A'}
                                                    </td>
                                                    <td style={styles.td}>
                                                        {transaction.ShiftStatus}
                                                    </td>
                                                    <td style={styles.td}>
                                                        {transaction.SupervisorComments || 'N/A'}
                                                    </td>
                                                    <td style={styles.td}>
                                                        <button
                                                            style={styles.button}
                                                            onClick={() =>
                                                                handleModify(transaction)
                                                            }
                                                        >
                                                            Modify
                                                        </button>
                                                    </td>
                                                </tr>
                                                {editableTransaction === transaction.TransactionID && (
                                                    <tr>
                                                        <td colSpan="6" style={styles.formRow}>
                                                            <div>
                                                                <label>
                                                                    Clock In Date:
                                                                    <input
                                                                        type="date"
                                                                        name="ClockInDate"
                                                                        value={formData.ClockInDate}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                </label>
                                                                <br />
                                                                <label>
                                                                    Clock In Time:
                                                                    <input
                                                                        type="time"
                                                                        name="ClockInTime"
                                                                        value={formData.ClockInTime}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                </label>
                                                                <br />
                                                                <label>
                                                                    Clock Out Date:
                                                                    <input
                                                                        type="date"
                                                                        name="ClockOutDate"
                                                                        value={formData.ClockOutDate}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                </label>
                                                                <br />
                                                                <label>
                                                                    Clock Out Time:
                                                                    <input
                                                                        type="time"
                                                                        name="ClockOutTime"
                                                                        value={formData.ClockOutTime}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                </label>
                                                                <br />
                                                                <label>
                                                                    Status:
                                                                    <input
                                                                        type="text"
                                                                        name="ShiftStatus"
                                                                        value={formData.ShiftStatus}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                </label>
                                                                <br />
                                                                <label>
                                                                    Comments:
                                                                    <input
                                                                        type="text"
                                                                        name="SupervisorComments"
                                                                        value={formData.SupervisorComments}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                </label>
                                                                <br />
                                                                <button
                                                                    style={styles.button}
                                                                    onClick={handleUpdate}
                                                                >
                                                                    Update
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default ModifyTransaction;
