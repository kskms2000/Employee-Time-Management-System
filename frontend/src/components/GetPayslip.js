import React, { useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';

const GET_PAYROLL = gql`
    query getPayroll($employeeID: String!) {
        getPayroll(employeeID: $employeeID) {
            PayrollID
            EmployeeID
            ContractID
            PayPeriod
            TotalHoursWorked
            OvertimeHours
            GrossPay
            NetPay
            PaymentDate
            Status
        }
    }
`;

function GetPayslip({ employeeID }) {
    const [payroll, setPayroll] = useState(null);
    const [showPayroll, setShowPayroll] = useState(false);

    const [fetchPayroll, { loading }] = useLazyQuery(GET_PAYROLL, {
        onCompleted: (data) => setPayroll(data.getPayroll[0]),
        onError: (error) => console.error('Error fetching payroll:', error.message),
    });

    //console.log(payroll.PaymentDate);
    // console.log(new Date(payroll.PaymentDate).toLocaleDateString());

    const styles = {
        button: {
            backgroundColor: '#3498db',
            color: '#fff',
            padding: '10px 15px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
        },
    };

    return (
        <div>
            <button
                style={styles.button}
                onClick={() => {
                    if (!showPayroll) fetchPayroll({ variables: { employeeID } });
                    setShowPayroll(!showPayroll);
                }}
            >
                {showPayroll ? 'Hide Payroll' : 'View Payroll'}
            </button>
            {loading && <p>Loading payroll...</p>}
            {showPayroll && payroll && (
    <div>
        <h2>Payroll Details</h2>
        <p><strong>Pay Period:</strong> {payroll.PayPeriod || 'N/A'}</p>
        <p>
            <strong>Total Hours Worked:</strong> 
            {payroll.TotalHoursWorked !== undefined ? payroll.TotalHoursWorked.toFixed(2) : 'N/A'}
        </p>
        <p>
            <strong>Overtime Hours:</strong> 
            {payroll.OvertimeHours !== undefined ? payroll.OvertimeHours.toFixed(2) : 'N/A'}
        </p>
        <p>
            <strong>Net Pay:</strong> $
            {payroll.NetPay !== undefined ? payroll.NetPay.toFixed(2) : 'N/A'}
        </p>
        <p>
    <strong>Payment Date:</strong>
    {payroll.PaymentDate
        ? new Date(Number(payroll.PaymentDate)).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
        : 'N/A'}
</p>
    </div>
)}
        </div>
    );
}

export default GetPayslip;
