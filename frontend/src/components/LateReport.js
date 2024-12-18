import React, { useState } from "react";
import { gql, useLazyQuery } from "@apollo/client";
import moment from "moment-timezone";

const GET_LATE_REPORT = gql`
    query GetLateReport {
        getLateReport {
            transactionID
            employeeID
            clockInTime
            shiftDate
            shiftStatus
        }
    }
`;

function LateReport() {
    const [lateTransactions, setLateTransactions] = useState([]);
    const [showReport, setShowReport] = useState(false);
    const [fetchLateReport, { loading, error }] = useLazyQuery(GET_LATE_REPORT, {
        onCompleted: (data) => {
            setLateTransactions(data.getLateReport);
        },
        onError: (error) => {
            console.error("Error fetching late report:", error.message);
        },
    });

    const handleToggleReport = () => {
        if (!showReport) {
            fetchLateReport(); // Fetch the report when the button is clicked
        }
        setShowReport(!showReport); // Toggle the visibility
    };

    const styles = {
        container: {
            fontFamily: "Arial, sans-serif",
        },
        button: {
            backgroundColor: showReport ? "#f44336" : "#4CAF50",
            color: "#fff",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
        },
        table: {
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
            backgroundColor: "#fff",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        },
        th: {
            backgroundColor: "#4CAF50",
            color: "#fff",
            padding: "10px",
            textAlign: "left",
        },
        td: {
            padding: "10px",
            borderBottom: "1px solid #ddd",
        },
    };

    return (
        <div style={styles.container}>
            <button style={styles.button} onClick={handleToggleReport}>
                {showReport ? "Hide Late Report" : "View Late Report"}
            </button>

            {showReport && (
                <>
                    {loading && <p>Loading late transactions...</p>}
                    {error && <p>Error: {error.message}</p>}
                    {lateTransactions.length === 0 && !loading && <p>No late transactions found.</p>}

                    {lateTransactions.length > 0 && (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Transaction ID</th>
                                    <th style={styles.th}>Employee ID</th>
                                    <th style={styles.th}>Shift Date</th>
                                    <th style={styles.th}>Clock In Time</th>
                                    <th style={styles.th}>Shift Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lateTransactions.map((transaction) => (
                                    <tr key={transaction.transactionID}>
                                        <td style={styles.td}>{transaction.transactionID}</td>
                                        <td style={styles.td}>{transaction.employeeID}</td>
                                        <td style={styles.td}>
                                            {transaction.shiftDate
                                                ? moment(transaction.shiftDate).format("MM/DD/YYYY")
                                                : "N/A"}
                                        </td>
                                        <td style={styles.td}>
                                            {transaction.clockInTime
                                                ? moment(transaction.clockInTime).format("hh:mm:ss A")
                                                : "N/A"}
                                        </td>
                                        <td style={styles.td}>{transaction.shiftStatus || "N/A"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </>
            )}
        </div>
    );
}

export default LateReport;
