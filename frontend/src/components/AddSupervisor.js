import React, { useState, useEffect } from 'react';
import { gql, useMutation, useLazyQuery } from '@apollo/client';

const ADD_SUPERVISOR = gql`
    mutation addSupervisor(
        $supervisorID: String!
        $fullName: String!
        $email: String!
        $password: String!
        $department: String!
        $address: String!
        $ssn: String!
    ) {
        addSupervisor(
            supervisorID: $supervisorID
            fullName: $fullName
            email: $email
            password: $password
            department: $department
            address: $address
            ssn: $ssn
        ) {
            SupervisorID
            FullName
            Email
            Department
            Address
            SSN
        }
    }
`;

const GET_NEXT_SUPERVISOR_ID = gql`
    query {
        getNextSupervisorID
    }
`;

const CHECK_EMAIL_EXISTS = gql`
    query checkEmail($email: String!) {
        checkEmail(email: $email)
    }
`;

function AddSupervisor() {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        supervisorID: '',
        fullName: '',
        email: '',
        password: '',
        department: '',
        address: '',
        ssn: '',
    });
    const [emailError, setEmailError] = useState('');
    const [addSupervisor, { loading, error }] = useMutation(ADD_SUPERVISOR, {
        onCompleted: () => {
            alert('Supervisor added successfully!');
            setFormData({
                supervisorID: '',
                fullName: '',
                email: '',
                password: '',
                department: '',
                address: '',
                ssn: '',
            });
            setShowForm(false);
        },
        onError: (err) => alert(`Failed to add supervisor: ${err.message}`),
    });

    const [getNextSupervisorID] = useLazyQuery(GET_NEXT_SUPERVISOR_ID, {
        onCompleted: (data) => {
            setFormData((prev) => ({ ...prev, supervisorID: data.getNextSupervisorID }));
        },
        onError: (err) => console.error(`Failed to fetch next SupervisorID: ${err.message}`),
    });

    const [checkEmail] = useLazyQuery(CHECK_EMAIL_EXISTS, {
        onCompleted: (data) => {
            if (data.checkEmail) {
                setEmailError('Email is already in use. Please use another email.');
            } else {
                setEmailError('');
            }
        },
    });

    useEffect(() => {
        if (showForm) {
            getNextSupervisorID();
        }
    }, [showForm]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'email' && value) {
            checkEmail({ variables: { email: value } });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (emailError) {
            alert('Please fix the errors before submitting.');
            return;
        }
        addSupervisor({ variables: { ...formData } });
    };

    return (
        <div>
            <button
                onClick={() => setShowForm((prev) => !prev)}
                style={{
                    marginBottom: '20px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                {showForm ? 'Cancel Adding Supervisor' : 'Add New Supervisor'}
            </button>

            {showForm && (
                <form onSubmit={handleSubmit} style={{ padding: '20px', borderRadius: '5px', border: '1px solid #ccc' }}>
                    <h3>Add Supervisor</h3>
                    <label>
                        Supervisor ID:
                        <input
                            type="text"
                            name="supervisorID"
                            value={formData.supervisorID}
                            readOnly
                        />
                    </label>
                    <br />
                    <label>
                        Full Name:
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                        />
                    </label>
                    <br />
                    <label>
                        Email:
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                        {emailError && <p style={{ color: 'red' }}>{emailError}</p>}
                    </label>
                    <br />
                    <label>
                        Password:
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />
                    </label>
                    <br />
                    <label>
                        Department:
                        <select
                            name="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select Department</option>
                            <option value="HR">HR</option>
                            <option value="Sales">Sales</option>
                            <option value="IT">IT</option>
                            <option value="Telecommunication">Telecommunication</option>
                        </select>
                    </label>
                    <br />
                    <label>
                        Address:
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                        />
                    </label>
                    <br />
                    <label>
                        SSN:
                        <input
                            type="text"
                            name="ssn"
                            value={formData.ssn}
                            onChange={handleInputChange}
                            required
                        />
                    </label>
                    <br />
                    <label>
                        Phone Number:
                    <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                />
                </label>
                <br/>
                    <button
                        type="submit"
                        style={{
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        {loading ? 'Adding...' : 'Submit'}
                    </button>
                    {error && <p style={{ color: 'red' }}>{error.message}</p>}
                </form>
            )}
        </div>
    );
}

export default AddSupervisor;
