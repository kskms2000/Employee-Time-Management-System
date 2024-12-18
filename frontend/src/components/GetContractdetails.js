import React, { useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';

const GET_EMPLOYEE_CONTRACT = gql`
    query getEmployeeContract($employeeID: String!) {
        getEmployeeContract(employeeID: $employeeID) {
            ContractID
            EmployeeID
            ContractType
            HourlyRate
            PayrollFrequency
            StartDate
            EndDate
        }
    }
`;

function GetContractDetails({ employeeID }) {
    const [contract, setContract] = useState(null);
    const [showContract, setShowContract] = useState(false);

    const [fetchContract, { loading }] = useLazyQuery(GET_EMPLOYEE_CONTRACT, {
        onCompleted: (data) => setContract(data.getEmployeeContract),
        onError: (error) => console.error('Error fetching contract:', error.message),
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
    };

    return (
        <div>
            <button
                style={styles.button}
                onClick={() => {
                    if (!showContract) fetchContract({ variables: { employeeID } });
                    setShowContract(!showContract);
                }}
            >
                {showContract ? 'Hide Contract' : 'View Contract'}
            </button>
            {loading && <p>Loading contract...</p>}
            {showContract && contract && (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Contract ID</th>
                            <th style={styles.th}>Contract Type</th>
                            <th style={styles.th}>Hourly Rate</th>
                            <th style={styles.th}>Payroll Frequency</th>
                            <th style={styles.th}>Start Date</th>
                            <th style={styles.th}>End Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={styles.td}>{contract.ContractID}</td>
                            <td style={styles.td}>{contract.ContractType}</td>
                            <td style={styles.td}>{contract.HourlyRate}</td>
                            <td style={styles.td}>{contract.PayrollFrequency}</td>
                            <td style={styles.td}>{new Date(contract.StartDate).toLocaleDateString()}</td>
                            <td style={styles.td}>{new Date(contract.EndDate).toLocaleDateString()}</td>
                        </tr>
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default GetContractDetails;
