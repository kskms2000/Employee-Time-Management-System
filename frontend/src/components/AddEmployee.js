import React, { useState, useEffect } from 'react';
import { gql, useMutation, useLazyQuery } from '@apollo/client';

const ADD_EMPLOYEE = gql`
    mutation addEmployee($employeeInput: EmployeeInput!) {
        addEmployee(employeeInput: $employeeInput) {
            EmployeeID
            FullName
            Email
            EmployeeType
            isFirstLogin
            Phone
            BankDetails {
                accountHolderName
                accountNumber
                bankName
                routingNumber
            }
            SSN
            Address
        }
    }
`;

const ADD_CONTRACT = gql`
    mutation addContract($contractInput: ContractInput!) {
        addContract(contractInput: $contractInput) {
            ContractID
            EmployeeID
            ContractType
        }
    }
`;

const GET_NEXT_IDS = gql`
    query getNextIDs {
        getNextEmployeeID
        getNextContractID
    }
`;

function AddEmployeeWithContract() {
    const [formData, setFormData] = useState({
        employeeID: '',
        fullName: '',
        email: '',
        password: '',
        employeeType: 'hourly', // Default to 'hourly'
        hireDate: '',
        contractID: '',
        ssn: '',
        address: '',
        phone: '',
        bankDetails: {
            accountHolderName: '',
            bankName: '',
            routingNumber: '',
            accountNumber: '',
        },
        isFirstLogin: true, // Default value for isFirstLogin
        payrollFrequency: 'Bi-Weekly',
    });

    const [showForm, setShowForm] = useState(false); // State to toggle form visibility

    const [addEmployee] = useMutation(ADD_EMPLOYEE);
    const [addContract] = useMutation(ADD_CONTRACT);
    const [getNextIDs] = useLazyQuery(GET_NEXT_IDS, {
        onCompleted: (data) => {
            setFormData((prev) => ({
                ...prev,
                employeeID: data.getNextEmployeeID,
                contractID: data.getNextContractID,
            }));
        },
    });

    useEffect(() => {
        getNextIDs();
    }, [getNextIDs]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('bankDetails.')) {
            const bankField = name.split('.')[1];
            setFormData((prevState) => ({
                ...prevState,
                bankDetails: {
                    ...prevState.bankDetails,
                    [bankField]: value,
                },
            }));
        } else {
            setFormData((prevState) => ({ ...prevState, [name]: value }));
        }
    };

    const handleSubmit = async () => {
        try {
            const employeeInput = {
                employeeID: formData.employeeID,
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                employeeType: formData.employeeType,
                ssn: formData.ssn,
                address: formData.address,
                phone: formData.phone,
                bankDetails: formData.bankDetails,
                isFirstLogin: formData.isFirstLogin,
                hireDate: formData.hireDate || new Date().toISOString(),
            };

            const contractInput = {
                contractID: formData.contractID,
                employeeID: formData.employeeID,
                contractType: formData.employeeType,
                hourlyRate: formData.employeeType === 'hourly' ? parseFloat(formData.hourlyRate) : null,
                payrollFrequency: formData.employeeType === 'hourly' ? formData.payrollFrequency : null,
                monthlySalary: formData.employeeType === 'monthly' ? parseFloat(formData.monthlySalary) : null,
                startDate: formData.startDate,
                endDate: formData.endDate,
            };

            console.log('Final Employee Input:', employeeInput);
            console.log('Final Contract Input', contractInput);
            await addEmployee({ variables: { employeeInput } });
            await addContract({ variables: { contractInput } });

            alert('Employee and Contract added successfully!');
        } catch (error) {
            alert('Failed to add employee or contract: ' + error.message);
        }
    };

    const styles = {
        container: {
            padding: '20px',
            maxWidth: '800px',
            margin: '0 auto',
            fontFamily: 'Arial, sans-serif',
        },
        input: {
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
        },
        select: {
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
        },
        button: {
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
        },
    };

    return (
        <div style={styles.container}>
            <h2>Add Employee and Contract</h2>
            <button
                onClick={() => setShowForm(!showForm)}
                style={styles.button}
            >
                {showForm ? 'Hide Form' : 'Show Form'}
            </button>

            {showForm && (
                <form>
                    <h3>Employee Details</h3>
                    <input
                        type="text"
                        name="employeeID"
                        value={formData.employeeID}
                        readOnly
                        style={styles.input}
                        placeholder="Employee ID"
                    />
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        style={styles.input}
                        placeholder="Full Name"
                    />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        style={styles.input}
                        placeholder="Email"
                    />
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        style={styles.input}
                        placeholder="Password"
                    />
                    <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Phone Number"
                />
                <select
                    name="employeeType"
                    value={formData.employeeType}
                    onChange={handleInputChange}
                    style={styles.select}
                >
                    <option value="hourly">Hourly Employee</option>
                    <option value="monthly">Monthly Salarized</option>
                </select>
                <input
                    type="text"
                    name="ssn"
                    value={formData.ssn}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="SSN"
                />
                <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Address"
                />
                <input
    type="date"
    name="hireDate"
    value={formData.hireDate}
    onChange={handleInputChange}
    style={{
        width: '100%',
        padding: '10px',
        marginBottom: '10px',
        borderRadius: '5px',
        border: '1px solid #ccc',
    }}
    placeholder="Hire Date"
/>
                <h3>Bank Details</h3>
                <input
                    type="text"
                    name="bankDetails.accountHolderName"
                    value={formData.bankDetails.accountHolderName}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Account Holder Name"
                />
                <input
                    type="text"
                    name="bankDetails.bankName"
                    value={formData.bankDetails.bankName}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Bank Name"
                />
                <input
                    type="text"
                    name="bankDetails.routingNumber"
                    value={formData.bankDetails.routingNumber}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Routing Number"
                />
                <input
                    type="text"
                    name="bankDetails.accountNumber"
                    value={formData.bankDetails.accountNumber}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Account Number"
                />

                <h3>Contract Details</h3>
                <input
                    type="text"
                    name="contractID"
                    value={formData.contractID}
                    readOnly
                    style={styles.input}
                    placeholder="Contract ID"
                />
                {formData.employeeType === 'hourly' ? (
                    <>
                        <input
                            type="number"
                            name="hourlyRate"
                            value={formData.hourlyRate || ''}
                            onChange={handleInputChange}
                            style={styles.input}
                            placeholder="Hourly Rate"
                        />
                        <select
                            name="payrollFrequency"
                            value={formData.payrollFrequency || ''}
                            onChange={handleInputChange}
                            style={styles.select}
                        >
                            <option value="Bi-Weekly">Bi-Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Weekly">Weekly</option>
                        </select>
                    </>
                ) : (
                    <input
                        type="number"
                        name="monthlySalary"
                        value={formData.monthlySalary || ''}
                        onChange={handleInputChange}
                        style={styles.input}
                        placeholder="Monthly Salary"
                    />
                )}
                <input
                    type="date"
                    name="startDate"
                    value={formData.startDate || ''}
                    onChange={handleInputChange}
                    style={styles.input}
                />
                <input
                    type="date"
                    name="endDate"
                    value={formData.endDate || ''}
                    onChange={handleInputChange}
                    style={styles.input}
                />
                    <button
                        type="button"
                        onClick={handleSubmit}
                        style={styles.button}
                    >
                        Submit
                    </button>
                </form>
            )}
        </div>
    );
}

export default AddEmployeeWithContract;
